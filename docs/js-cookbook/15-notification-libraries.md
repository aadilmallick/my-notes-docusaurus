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

You can set up endpoints in Surge dashboard or via API. Here are the key events to listen for:

- `message.sent`:
- `message.delivered`:
- `message.failed`:
- `message.received`:
- `contact.opted_out`: 

```ts
app.post('/webhooks/surge', express.raw({type: 'application/json'}), (req, res) => {
  // Validate signature if needed
  const event = req.body;
  console.log(`Event: ${event.type}`, event.data);
  res.sendStatus(200);
});
```