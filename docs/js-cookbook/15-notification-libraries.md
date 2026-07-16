## Resend

## SMS

### sms fundamentals

#### E.164 format

E.164 is the international standard for phone numbers (ITU-T recommendation). It ensures global uniqueness and compatibility with carriers.

The base format is `+` followed by country code + national number (no spaces, dashes, or parentheses), with a max length of 15 digits.

- US/Canada: +15551234567 (country code 1 + 10 digits).
- UK: +447700900123.
- India: +919876543210.

#### Carriers

In the US, for high-volume/local numbers, you must register a Campaign (brand + use cases, consent flow, sample messages, etc.) and attach phone numbers to it. This avoids filtering/spam blocks. Toll-free and short codes have different rules.

- **Opt-in/Opt-out**: Users can reply STOP to opt out. Surge handles this via webhooks (contact.opted_out). Always honor it.
- **Message Types**: SMS (text), MMS (with attachments). Throughput limits depend on number type/campaign.
- **Delivery**: Asynchronous. Use webhooks for message.sent, message.delivered, message.failed.
- **Scheduling**: Up to ~60 days ahead via send_at (ISO 8601).
- **Costs**: Vary by volume, number type, carrier. Check Surge dashboard/pricing.
### Surge

Surge is a platform for SMS/MMS messaging, voice, and related services (conversations, campaigns for carrier compliance, etc.). Its REST API (base URL: https://api.surge.app) lets you programmatically manage accounts, phone numbers, campaigns, contacts, and send/receive messages.

The basic workflow is this:

- Create an **Account** (if platform-level).
- Purchase/attach a **Phone Number**.
- Create a **Campaign** (for compliance, especially US 10DLC).
- Send **Messages** (via conversation or direct to/from).
- Handle **Webhooks** for status/events.

#### Accounts

**creating an account**

```ts
async function createAccount() {
  const account = await client.accounts.create({
    name: "My Business Account",
    // Optional: brand_name, organization details, time_zone
  });
  console.log("Account ID:", account.id);
  return account.id;
}
```

#### Campaigns

**creating a campaign**

```ts
async function createCampaign(accountId: string) {
  const campaign = await client.campaigns.create(accountId, {
    description: "Customer notifications and support",
    consent_flow: "Users opt in via web form at https://example.com/optin",
    message_samples: [
      "Reply STOP to opt out.",
      "Your order is ready!",
    ],
    privacy_policy_url: "https://example.com/privacy",
    terms_and_conditions_url: "https://example.com/terms",
    use_cases: ["customer_care", "account_notification"],
    volume: "medium", // or "low", "high"
  });
  console.log("Campaign ID:", campaign.id);
  return campaign.id;
}
```

#### Sending messages

There are three ways to send messages:

1. **Specify `to` and `from`**

```ts
async function sendSms(accountId: string) {
  // Simple to/from
  const message = await client.messages.create(accountId, {
    to: "+15551234567",      // E.164 recipient
    from: "+18015552345",    // Your Surge number (or ID)
    body: "Hello from Surge! Reply STOP to unsubscribe.",
    // Optional
    // attachments: [{ url: "https://example.com/image.jpg" }],
    // send_at: "2026-08-01T12:00:00Z",
    // metadata: { order_id: "123" },
    // settings: { link_shortening: "enabled" },
  });

  console.log("Message queued:", message.id);
  return message;
}

// Or with conversation (auto-creates/manages thread)
async function sendViaConversation(accountId: string) {
  const message = await client.messages.create(accountId, {
    conversation: {
      contact: {
        phone_number: "+15551234567",
        first_name: "John", // Optional
      },
      // phone_number: "+18015552345", // Specific from
    },
    body: "Welcome back!",
  });
}
```

2. Raw `curl` calls via REST API

```ts
async function sendMessageRaw(accountId: string) {
  const response = await fetch(`https://api.surge.app/accounts/${accountId}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.SURGE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: "+15551234567",
      from: "+18015552345",
      body: "Test message",
    }),
  });

  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
```

#### Webhooks

To start receiving webhooks, you’ll need to:

1. Set up a publicly accessible HTTPS endpoint on your server
2. Register your webhook URL in the Surge dashboard
3. Implement handlers for the events you care about

You can set up endpoints in Surge dashboard or via API. Here are the key events to listen for:

- `message.sent`:
- `message.delivered`:
- `message.failed`:
- `message.received`:
- `contact.opted_out`: 

**webhook rules**

Here are the two main rules you must follow when implementing surge webhooks:

1. **Validate the webhook signature**
2. **Send back a response quickly if the webhook was received**: Your endpoint should respond with either a `200 OK` or `201 Created` HTTP status code to let us know you’ve successfully received the webhook.

To ensure you’re handling Surge’s webhooks like a pro:

1. Make your webhook handlers _idempotent_ - receiving the same webhook multiple times should not have any unintended side effects
2. Validate webhook signatures to ensure the events you receive are coming from Surge.
3. Respond to webhooks quickly - if your server is slow to respond, we may attempt to deliver the webhook multiple times

**validating webhook**

Each webhook Surge delivers includes a “Surge-Signature” header that looks like this:

```
Surge-Signature: t=1737830031,v1=41f947e88a483327c878d6c08b27b22fbe7c9ea5608b035707c6667d1df866dd
```

Parameters:

- `t`: Unix timestamp indicating when webhook was sent
- `v1`: Lowercase hex-encoded HMAC-SHA256 signature
    - We may send more than one `v1` hash when rolling credentials

Here are the exact validation steps:

1. **Check timestamp**: Verify timestamp is within an acceptable time window (such as 5 minutes) to prevent replay attacks.
2. **Generate payload**: The payload signed to create the header is a concatenation of 3 things:
    
    1. Timestamp from step 1
    2. Period (`.`)
    3. Raw webhook body

    
    ```
    1737830031.{"type":"message.received","id":"evt_01jjfeev3hf9n9c7k5231hd3hr",...}
    ```
    
3. **Compute expected hash**: Generate HMAC-SHA256 hash for the payload from step 2.
    - Use the signing secret you received when setting up your webhook endpoint.
4. **Compare hashes**: Check computed hash from step 3 with `v1` from header.
    - Use constant-time string comparison to protect against timing attacks.
    - There may be multiple `v1` parameters in the header
        - Only compare to `v1`, not other versions which may be added in the future
        - If any of the `v1` hashes match, the signature should be accepted as authentic

Parameter names and values will not include `,` or `=`, so these can be split upon to parse the header.

Here is a code example to validate the webhook signature and extract the event type, event id, and payload

```ts
import crypto from "node:crypto"

async function validateAndExtract(signatureHeader, rawBody, secret) {
  // Parse header: "t=...,v1=..."
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => p.split("="))
  );
  const timestamp = parts.t;
  const v1Hashes = signatureHeader
    .split(",")
    .filter((p) => p.startsWith("v1="))
    .map((p) => p.slice(3));

  // Step 1: Check timestamp (within 5 minutes)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(timestamp)) > 300) {
    throw new Error("Timestamp outside acceptable window");
  }

  // Step 2: Build payload
  const payload = `${timestamp}.${rawBody}`;

  // Step 3: Compute expected hash
  const expectedHash = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  // Step 4: Compare hashes (constant-time)
  const isValid = v1Hashes.some((hash) => {
    const a = Buffer.from(hash, "hex");
    const b = Buffer.from(expectedHash, "hex");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  });

  if (!isValid) throw new Error("Invalid signature");

  // Extract event type and id from body
  const event = JSON.parse(rawBody);
  
  const eventType = event.type; // e.g. "call.ended"  
  const eventId = event.data.id; // e.g. the call/message ID  
  const payload = event.data; // all event-specific fields
  
  return { eventType, eventId, payload };
}
```

**Full example**

```ts
app.post('/webhooks/surge', express.raw({type: 'application/json'}), (req, res) => {
  // Validate signature if needed
  const event = req.body;
  console.log(`Event: ${event.type}`, event.data);
  res.sendStatus(200);
});
```