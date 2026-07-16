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