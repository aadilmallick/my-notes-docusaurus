# The Complete Guide to the YouTube API with TypeScript

A practical, end-to-end reference for building against the **YouTube Data API v3** using Google's official, fully-typed Node.js client. Covers setup, authentication, every major resource, quota management, pagination, uploads, error handling, and production patterns — all in TypeScript.

> **Versions referenced:** `googleapis` v173+, `@googleapis/youtube` v33+. The YouTube Data API itself is **v3** (stable since 2013). Both client packages ship TypeScript types out of the box — no `@types/*` package needed.

---

## Table of Contents

1. [Which package should I use?](https://claude.ai/chat/562055e9-a4ef-4f5f-9119-7b47f3a461e0#1-which-package-should-i-use)
2. [Prerequisites & Google Cloud setup](https://claude.ai/chat/562055e9-a4ef-4f5f-9119-7b47f3a461e0#2-prerequisites--google-cloud-setup)
3. [Installation & TypeScript config](https://claude.ai/chat/562055e9-a4ef-4f5f-9119-7b47f3a461e0#3-installation--typescript-config)
4. [Core concepts: resources, parts, and quota](https://claude.ai/chat/562055e9-a4ef-4f5f-9119-7b47f3a461e0#4-core-concepts-resources-parts-and-quota)
5. [Authentication](https://claude.ai/chat/562055e9-a4ef-4f5f-9119-7b47f3a461e0#5-authentication)
6. [A typed client wrapper](https://claude.ai/chat/562055e9-a4ef-4f5f-9119-7b47f3a461e0#6-a-typed-client-wrapper)
7. [Search](https://claude.ai/chat/562055e9-a4ef-4f5f-9119-7b47f3a461e0#7-search)
8. [Videos](https://claude.ai/chat/562055e9-a4ef-4f5f-9119-7b47f3a461e0#8-videos)
9. [Channels](https://claude.ai/chat/562055e9-a4ef-4f5f-9119-7b47f3a461e0#9-channels)
10. [Playlists & playlist items](https://claude.ai/chat/562055e9-a4ef-4f5f-9119-7b47f3a461e0#10-playlists--playlist-items)
11. [Subscriptions](https://claude.ai/chat/562055e9-a4ef-4f5f-9119-7b47f3a461e0#11-subscriptions)
12. [Comments & comment threads](https://claude.ai/chat/562055e9-a4ef-4f5f-9119-7b47f3a461e0#12-comments--comment-threads)
13. [Captions](https://claude.ai/chat/562055e9-a4ef-4f5f-9119-7b47f3a461e0#13-captions)
14. [Uploading a video (resumable media)](https://claude.ai/chat/562055e9-a4ef-4f5f-9119-7b47f3a461e0#14-uploading-a-video-resumable-media)
15. [Thumbnails](https://claude.ai/chat/562055e9-a4ef-4f5f-9119-7b47f3a461e0#15-thumbnails)
16. [Pagination done right](https://claude.ai/chat/562055e9-a4ef-4f5f-9119-7b47f3a461e0#16-pagination-done-right)
17. [Quota management](https://claude.ai/chat/562055e9-a4ef-4f5f-9119-7b47f3a461e0#17-quota-management)
18. [Error handling & retries](https://claude.ai/chat/562055e9-a4ef-4f5f-9119-7b47f3a461e0#18-error-handling--retries)
19. [The YouTube Analytics API](https://claude.ai/chat/562055e9-a4ef-4f5f-9119-7b47f3a461e0#19-the-youtube-analytics-api)
20. [Real-time push notifications (PubSubHubbub)](https://claude.ai/chat/562055e9-a4ef-4f5f-9119-7b47f3a461e0#20-real-time-push-notifications-pubsubhubbub)
21. [Testing & mocking](https://claude.ai/chat/562055e9-a4ef-4f5f-9119-7b47f3a461e0#21-testing--mocking)
22. [Production best practices](https://claude.ai/chat/562055e9-a4ef-4f5f-9119-7b47f3a461e0#22-production-best-practices)
23. [Common pitfalls](https://claude.ai/chat/562055e9-a4ef-4f5f-9119-7b47f3a461e0#23-common-pitfalls)
24. [Appendix A: Quota cost reference](https://claude.ai/chat/562055e9-a4ef-4f5f-9119-7b47f3a461e0#appendix-a-quota-cost-reference)
25. [Appendix B: OAuth scopes reference](https://claude.ai/chat/562055e9-a4ef-4f5f-9119-7b47f3a461e0#appendix-b-oauth-scopes-reference)

---

## 1. Which package should I use?

There is no separate "YouTube SDK." Google publishes auto-generated client libraries, and for TypeScript/Node you have two options:

| Package               | What it is                                                                                | When to use                                                   |
| --------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `googleapis`          | The mega-package with **every** Google API (Drive, Gmail, YouTube, …). ~170MB+ installed. | You use multiple Google APIs, or you want one import surface. |
| `@googleapis/youtube` | A standalone package containing **only** YouTube + the shared auth library. Much smaller. | You only need YouTube. Recommended for most projects.         |

Both expose the **same** API surface and the same `youtube_v3` type namespace. Examples in this guide use `googleapis` for familiarity, but switching is trivial:

```typescript
// Option A — the mega-package
import { google } from 'googleapis';
const youtube = google.youtube('v3');

// Option B — the standalone package (same types, smaller install)
import { youtube, auth } from '@googleapis/youtube';
const yt = youtube('v3');
```

> **Avoid** unofficial wrappers like `youtube-api` (an old OO wrapper). They lag behind the API and lack first-class types. Stick with the official Google packages.

---

## 2. Prerequisites & Google Cloud setup

Before writing code you need credentials. The API is **never** anonymous.

### Step 1 — Create a Google Cloud project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (or select an existing one).

### Step 2 — Enable the YouTube Data API v3

Navigate to **APIs & Services → Library**, search "YouTube Data API v3", and click **Enable**. If you'll use analytics or reporting, enable **YouTube Analytics API** and **YouTube Reporting API** too.

### Step 3 — Create credentials

You need one or both of:

- **API key** — for reading _public_ data only (search, public videos/channels/playlists). Cannot access private data or perform writes. Create via **Credentials → Create credentials → API key**. Restrict it to the YouTube Data API.
- **OAuth 2.0 client ID** — required for anything user-specific or any write (upload, rate, comment, subscribe, manage playlists). Create via **Credentials → Create credentials → OAuth client ID**. You'll also configure the **OAuth consent screen** (add scopes and, while in "testing" mode, add test users).

> **Service accounts do not work with YouTube** for normal channels. A service account has no YouTube channel of its own, and YouTube rejects it. The only exception is **Content Owner** (CMS/partner) setups via `onBehalfOfContentOwner`. For a regular channel you must use the interactive OAuth flow at least once to mint a refresh token.

### Step 4 — Note your quota

Every project starts with **10,000 units/day**. This is small — a single search costs 100 units. See [§17](https://claude.ai/chat/562055e9-a4ef-4f5f-9119-7b47f3a461e0#17-quota-management). You can request more via a quota-extension form, but approval is not guaranteed.

---

## 3. Installation & TypeScript config

```bash
# Standalone (recommended if you only need YouTube)
npm install @googleapis/youtube

# — or — the mega-package
npm install googleapis
```

Both are written in TypeScript and bundle their own `.d.ts` files. You do **not** install any `@types/googleapis`.

A reasonable `tsconfig.json` for a Node project:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "resolveJsonModule": true,
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

Load secrets from the environment, never hard-code them:

```typescript
// src/config.ts
import 'dotenv/config';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const config = {
  apiKey: process.env.YOUTUBE_API_KEY ?? '',
  oauth: {
    clientId: required('GOOGLE_CLIENT_ID'),
    clientSecret: required('GOOGLE_CLIENT_SECRET'),
    redirectUri: process.env.GOOGLE_REDIRECT_URI ?? 'http://localhost:3000/oauth2callback',
  },
};
```

---

## 4. Core concepts: resources, parts, and quota

Three ideas explain almost the entire API.

### Resources

Everything is a resource type: `video`, `channel`, `playlist`, `playlistItem`, `subscription`, `commentThread`, `comment`, `caption`, `search result`, `activity`, etc. Each has `list`, and (where writable) `insert`, `update`, `delete`, plus a few specials (`videos.rate`, `thumbnails.set`).

### Parts (`part`)

A resource is divided into **parts** — chunks of fields you opt into. You **must** specify `part` on every call. Asking for fewer parts returns less data (and for writes, declares which parts you're sending). Common parts: `snippet`, `contentDetails`, `statistics`, `status`, `id`.

```typescript
// Request only what you need — fewer parts = smaller payloads
const res = await youtube.videos.list({
  part: ['snippet', 'statistics'],   // array form (preferred in TS)
  id: ['dQw4w9WgXcQ'],
});
```

> `part` affects the _shape_ of the response, not (mostly) the quota cost. Quota is per-resource-type, not per-part — but always request the minimum parts for clarity and bandwidth. Use the `fields` parameter to trim further within parts.

### Quota

Every call costs units. Reads are cheap (1 unit), `search.list` is expensive (100 units), writes are ~50 units. Budget carefully — see [Appendix A](https://claude.ai/chat/562055e9-a4ef-4f5f-9119-7b47f3a461e0#appendix-a-quota-cost-reference).

---

## 5. Authentication

### 5.1 — API key (public, read-only)

The simplest path. Good for search and reading public data. **No** user context, **no** writes.

```typescript
import { google } from 'googleapis';
import { config } from './config';

export const youtubePublic = google.youtube({
  version: 'v3',
  auth: config.apiKey,
});

// Usage
const res = await youtubePublic.search.list({
  part: ['snippet'],
  q: 'typescript tutorial',
  maxResults: 5,
  type: ['video'],
});
```

### 5.2 — OAuth 2.0 (user data & writes)

Required for uploads, ratings, comments, subscriptions, and any "mine" query. The flow:

1. Build a consent URL and send the user to it.
2. User approves; Google redirects back with a `code`.
3. Exchange the `code` for an **access token** (short-lived) + **refresh token** (long-lived).
4. Persist the refresh token. Reuse it forever to mint new access tokens.

```typescript
// src/auth/oauthClient.ts
import { google } from 'googleapis';
import type { Auth } from 'googleapis';
import { config } from '../config';

export function makeOAuthClient(): Auth.OAuth2Client {
  return new google.auth.OAuth2(
    config.oauth.clientId,
    config.oauth.clientSecret,
    config.oauth.redirectUri,
  );
}

// Scopes determine what the user grants. Request the minimum you need.
export const SCOPES = {
  readonly: 'https://www.googleapis.com/auth/youtube.readonly',
  manage:   'https://www.googleapis.com/auth/youtube',
  upload:   'https://www.googleapis.com/auth/youtube.upload',
  forceSsl: 'https://www.googleapis.com/auth/youtube.force-ssl', // needed for comments
} as const;
```

#### Step 1 — generate the consent URL

```typescript
import { makeOAuthClient, SCOPES } from './auth/oauthClient';

const oauth2Client = makeOAuthClient();

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',        // REQUIRED to receive a refresh_token
  prompt: 'consent',             // forces a refresh_token even on re-auth
  scope: [SCOPES.upload, SCOPES.readonly],
  include_granted_scopes: true,
});

console.log('Authorize this app by visiting:', url);
```

> `access_type: 'offline'` + `prompt: 'consent'` is the combination that reliably returns a `refresh_token`. Without `prompt: 'consent'`, Google only sends the refresh token on the _first_ authorization for a given user/client.

#### Step 2 & 3 — handle the callback and exchange the code

A minimal Express handler:

```typescript
import express from 'express';
import { makeOAuthClient, SCOPES } from './auth/oauthClient';
import { saveTokens } from './tokenStore';

const app = express();
const oauth2Client = makeOAuthClient();

app.get('/auth', (_req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [SCOPES.upload, SCOPES.readonly],
  });
  res.redirect(url);
});

app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code as string | undefined;
  if (!code) return res.status(400).send('Missing authorization code');

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    await saveTokens(tokens);        // persist tokens.refresh_token!
    res.send('Authorized. You can close this tab.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Token exchange failed');
  }
});

app.listen(3000, () => console.log('http://localhost:3000/auth'));
```

#### Step 4 — reuse the refresh token (no UI next time)

Once you have a refresh token stored, you never need the browser flow again. The client auto-refreshes access tokens on demand:

```typescript
import { makeOAuthClient } from './auth/oauthClient';
import { loadTokens, saveTokens } from './tokenStore';
import { google } from 'googleapis';

export async function authedYouTube() {
  const oauth2Client = makeOAuthClient();
  const tokens = await loadTokens();                 // { refresh_token, ... }
  oauth2Client.setCredentials(tokens);

  // Persist refreshed tokens automatically when they rotate
  oauth2Client.on('tokens', (newTokens) => {
    void saveTokens({ ...tokens, ...newTokens });
  });

  return google.youtube({ version: 'v3', auth: oauth2Client });
}
```

#### A simple token store

For production use a database or secrets manager. For local dev, a file works:

```typescript
// src/tokenStore.ts
import { promises as fs } from 'node:fs';
import type { Auth } from 'googleapis';

const FILE = './.tokens.json';

export async function saveTokens(tokens: Auth.Credentials): Promise<void> {
  await fs.writeFile(FILE, JSON.stringify(tokens, null, 2), 'utf8');
}

export async function loadTokens(): Promise<Auth.Credentials> {
  const raw = await fs.readFile(FILE, 'utf8');
  return JSON.parse(raw) as Auth.Credentials;
}
```

> **Security:** the refresh token is a long-lived credential. Treat it like a password — encrypt at rest, never log it, never commit `.tokens.json`. Add it to `.gitignore`.

---

## 6. A typed client wrapper

A thin wrapper centralizes auth, exposes typed helpers, and keeps call sites clean. The official types live in the `youtube_v3` namespace.

```typescript
// src/client.ts
import { google, youtube_v3 } from 'googleapis';
import type { Auth } from 'googleapis';

export type YouTubeClient = youtube_v3.Youtube;

// Handy resource aliases — use these everywhere instead of `any`
export type Video        = youtube_v3.Schema$Video;
export type Channel      = youtube_v3.Schema$Channel;
export type Playlist     = youtube_v3.Schema$Playlist;
export type PlaylistItem = youtube_v3.Schema$PlaylistItem;
export type SearchResult = youtube_v3.Schema$SearchResult;
export type CommentThread = youtube_v3.Schema$CommentThread;

export function createClient(auth: string | Auth.OAuth2Client): YouTubeClient {
  return google.youtube({ version: 'v3', auth });
}
```

Every list response is `youtube_v3.Schema$<Resource>ListResponse` with `.items`, `.nextPageToken`, `.prevPageToken`, and `.pageInfo`. Because items can be `undefined`, prefer defensive access (`res.data.items ?? []`).

---

## 7. Search

`search.list` is the most flexible and the most expensive call (**100 units**). It returns lightweight `SearchResult` items that contain IDs and `snippet` only — never statistics or content details. The standard pattern is **search to get IDs, then batch-fetch full resources**.

```typescript
import type { YouTubeClient, SearchResult } from './client';

interface SearchOptions {
  query: string;
  maxResults?: number;
  type?: Array<'video' | 'channel' | 'playlist'>;
  order?: 'date' | 'rating' | 'relevance' | 'title' | 'videoCount' | 'viewCount';
  publishedAfter?: string;  // RFC 3339, e.g. '2024-01-01T00:00:00Z'
  regionCode?: string;      // ISO 3166-1 alpha-2, e.g. 'US'
}

export async function search(
  yt: YouTubeClient,
  opts: SearchOptions,
): Promise<SearchResult[]> {
  const res = await yt.search.list({
    part: ['snippet'],
    q: opts.query,
    maxResults: opts.maxResults ?? 25,   // 0–50
    type: opts.type ?? ['video'],
    order: opts.order ?? 'relevance',
    publishedAfter: opts.publishedAfter,
    regionCode: opts.regionCode,
  });
  return res.data.items ?? [];
}

// Extract video IDs from search results (the id shape varies by type)
export function videoIdsFrom(results: SearchResult[]): string[] {
  return results
    .map((r) => r.id?.videoId)
    .filter((id): id is string => Boolean(id));
}
```

> **Cost-saving tip:** `search.list` costs 100 units whether you ask for 1 result or 50. Always request `maxResults: 50` and paginate, rather than making many small searches. To find a channel's recent uploads cheaply, **don't** search — read the channel's `uploads` playlist (1 unit, see [§10](https://claude.ai/chat/562055e9-a4ef-4f5f-9119-7b47f3a461e0#10-playlists--playlist-items)).

---

## 8. Videos

### 8.1 — List / fetch videos by ID (batch up to 50)

```typescript
import type { YouTubeClient, Video } from './client';

export async function getVideos(
  yt: YouTubeClient,
  ids: string[],
): Promise<Video[]> {
  if (ids.length === 0) return [];
  const out: Video[] = [];
  // The API accepts up to 50 IDs per call — chunk accordingly.
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    const res = await yt.videos.list({
      part: ['snippet', 'contentDetails', 'statistics', 'status'],
      id: chunk,
      maxResults: 50,
    });
    out.push(...(res.data.items ?? []));
  }
  return out;
}
```

Reading common fields with null-safety:

```typescript
function summarize(v: Video) {
  return {
    id: v.id,
    title: v.snippet?.title ?? '(untitled)',
    channel: v.snippet?.channelTitle,
    views: Number(v.statistics?.viewCount ?? 0),
    likes: Number(v.statistics?.likeCount ?? 0),
    duration: v.contentDetails?.duration, // ISO 8601, e.g. "PT4M13S"
    privacy: v.status?.privacyStatus,
  };
}
```

> **Numbers come back as strings.** `statistics.viewCount`, `likeCount`, etc. are strings in the JSON. Always coerce with `Number(...)` before arithmetic.

### 8.2 — Most popular videos by region

```typescript
export async function mostPopular(yt: YouTubeClient, regionCode = 'US') {
  const res = await yt.videos.list({
    part: ['snippet', 'statistics'],
    chart: 'mostPopular',
    regionCode,
    maxResults: 50,
  });
  return res.data.items ?? [];
}
```

### 8.3 — Rate a video (OAuth required)

```typescript
export async function rateVideo(
  yt: YouTubeClient,
  videoId: string,
  rating: 'like' | 'dislike' | 'none',
): Promise<void> {
  await yt.videos.rate({ id: videoId, rating });
}
```

### 8.4 — Update video metadata (OAuth required)

`update` replaces the parts you send — fetch first, mutate, send back, or you may wipe fields.

```typescript
export async function updateVideoTitle(
  yt: YouTubeClient,
  videoId: string,
  newTitle: string,
): Promise<Video> {
  // 1. Read current snippet (categoryId is required on update)
  const current = await yt.videos.list({ part: ['snippet'], id: [videoId] });
  const snippet = current.data.items?.[0]?.snippet;
  if (!snippet) throw new Error('Video not found');

  // 2. Send back the full snippet with the change
  const res = await yt.videos.update({
    part: ['snippet'],
    requestBody: {
      id: videoId,
      snippet: {
        ...snippet,
        title: newTitle,
        categoryId: snippet.categoryId ?? '22',  // required field
      },
    },
  });
  return res.data;
}
```

### 8.5 — Delete a video (OAuth required)

```typescript
export async function deleteVideo(yt: YouTubeClient, videoId: string) {
  await yt.videos.delete({ id: videoId });
}
```

---

## 9. Channels

### 9.1 — Get a channel by ID, handle, or "mine"

```typescript
import type { YouTubeClient, Channel } from './client';

export async function getChannelById(yt: YouTubeClient, id: string): Promise<Channel | null> {
  const res = await yt.channels.list({
    part: ['snippet', 'statistics', 'contentDetails'],
    id: [id],
  });
  return res.data.items?.[0] ?? null;
}

// By @handle (forHandle) — newer parameter
export async function getChannelByHandle(yt: YouTubeClient, handle: string) {
  const res = await yt.channels.list({
    part: ['snippet', 'statistics', 'contentDetails'],
    forHandle: handle.startsWith('@') ? handle : `@${handle}`,
  });
  return res.data.items?.[0] ?? null;
}

// The authenticated user's own channel (OAuth required)
export async function getMyChannel(yt: YouTubeClient) {
  const res = await yt.channels.list({
    part: ['snippet', 'statistics', 'contentDetails'],
    mine: true,
  });
  return res.data.items?.[0] ?? null;
}
```

### 9.2 — The uploads playlist trick

Every channel has a special "uploads" playlist. Reading it (1 unit) is far cheaper than `search.list` (100 units) for listing a channel's videos.

```typescript
export async function getUploadsPlaylistId(yt: YouTubeClient, channelId: string) {
  const res = await yt.channels.list({
    part: ['contentDetails'],
    id: [channelId],
  });
  return res.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ?? null;
}
```

Pass that playlist ID to `playlistItems.list` (see next section) to walk every upload cheaply.

---

## 10. Playlists & playlist items

### 10.1 — List a user's playlists

```typescript
import type { YouTubeClient, Playlist, PlaylistItem } from './client';

export async function myPlaylists(yt: YouTubeClient): Promise<Playlist[]> {
  const res = await yt.playlists.list({
    part: ['snippet', 'contentDetails'],
    mine: true,
    maxResults: 50,
  });
  return res.data.items ?? [];
}
```

### 10.2 — Walk every item in a playlist (with paging)

```typescript
export async function allPlaylistItems(
  yt: YouTubeClient,
  playlistId: string,
): Promise<PlaylistItem[]> {
  const items: PlaylistItem[] = [];
  let pageToken: string | undefined;

  do {
    const res = await yt.playlistItems.list({
      part: ['snippet', 'contentDetails'],
      playlistId,
      maxResults: 50,
      pageToken,
    });
    items.push(...(res.data.items ?? []));
    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken);

  return items;
}

// The video ID of a playlist item lives in contentDetails.videoId
export const playlistVideoIds = (items: PlaylistItem[]) =>
  items.map((i) => i.contentDetails?.videoId).filter((x): x is string => !!x);
```

### 10.3 — Create a playlist and add a video (OAuth)

```typescript
export async function createPlaylist(
  yt: YouTubeClient,
  title: string,
  privacy: 'private' | 'public' | 'unlisted' = 'private',
) {
  const res = await yt.playlists.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: { title, description: '' },
      status: { privacyStatus: privacy },
    },
  });
  return res.data;
}

export async function addToPlaylist(
  yt: YouTubeClient,
  playlistId: string,
  videoId: string,
) {
  const res = await yt.playlistItems.insert({
    part: ['snippet'],
    requestBody: {
      snippet: {
        playlistId,
        resourceId: { kind: 'youtube#video', videoId },
      },
    },
  });
  return res.data;
}
```

---

## 11. Subscriptions

```typescript
import type { YouTubeClient } from './client';

// List the authenticated user's subscriptions
export async function mySubscriptions(yt: YouTubeClient) {
  const res = await yt.subscriptions.list({
    part: ['snippet', 'contentDetails'],
    mine: true,
    maxResults: 50,
  });
  return res.data.items ?? [];
}

// Subscribe to a channel (OAuth)
export async function subscribe(yt: YouTubeClient, channelId: string) {
  const res = await yt.subscriptions.insert({
    part: ['snippet'],
    requestBody: {
      snippet: { resourceId: { kind: 'youtube#channel', channelId } },
    },
  });
  return res.data;
}

// Unsubscribe — you need the *subscription* id, not the channel id
export async function unsubscribe(yt: YouTubeClient, subscriptionId: string) {
  await yt.subscriptions.delete({ id: subscriptionId });
}
```

---

## 12. Comments & comment threads

Comments require the `youtube.force-ssl` scope. A **comment thread** is a top-level comment plus its replies.

```typescript
import type { YouTubeClient, CommentThread } from './client';

// Read top-level comments on a video
export async function videoComments(
  yt: YouTubeClient,
  videoId: string,
  maxResults = 100,
): Promise<CommentThread[]> {
  const res = await yt.commentThreads.list({
    part: ['snippet', 'replies'],
    videoId,
    maxResults: Math.min(maxResults, 100),
    order: 'relevance',          // or 'time'
    textFormat: 'plainText',
  });
  return res.data.items ?? [];
}

// Post a new top-level comment (OAuth + force-ssl)
export async function postComment(
  yt: YouTubeClient,
  videoId: string,
  text: string,
) {
  const res = await yt.commentThreads.insert({
    part: ['snippet'],
    requestBody: {
      snippet: {
        videoId,
        topLevelComment: { snippet: { textOriginal: text } },
      },
    },
  });
  return res.data;
}

// Reply to an existing comment
export async function replyToComment(
  yt: YouTubeClient,
  parentCommentId: string,
  text: string,
) {
  const res = await yt.comments.insert({
    part: ['snippet'],
    requestBody: {
      snippet: { parentId: parentCommentId, textOriginal: text },
    },
  });
  return res.data;
}
```

> Reading the text: `thread.snippet?.topLevelComment?.snippet?.textDisplay`. Reply count: `thread.snippet?.totalReplyCount`.

---

## 13. Captions

```typescript
import { google, type youtube_v3 } from 'googleapis';
import { createReadStream } from 'node:fs';
import type { YouTubeClient } from './client';

// List caption tracks for a video
export async function listCaptions(yt: YouTubeClient, videoId: string) {
  const res = await yt.captions.list({ part: ['snippet'], videoId });
  return res.data.items ?? [];
}

// Upload a caption track (OAuth; .srt or .sbv file)
export async function uploadCaption(
  yt: YouTubeClient,
  videoId: string,
  language: string,
  name: string,
  filePath: string,
) {
  const res = await yt.captions.insert({
    part: ['snippet'],
    requestBody: {
      snippet: { videoId, language, name, isDraft: false },
    },
    media: { body: createReadStream(filePath) },
  });
  return res.data;
}

// Download a caption track's contents
export async function downloadCaption(yt: YouTubeClient, captionId: string) {
  const res = await yt.captions.download(
    { id: captionId, tfmt: 'srt' },
    { responseType: 'stream' },
  );
  return res.data; // a readable stream
}
```

---

## 14. Uploading a video (resumable media)

Uploads use **resumable media**. The client handles chunking; you provide a readable stream and the metadata parts. Requires the `youtube.upload` scope.

```typescript
import { createReadStream, statSync } from 'node:fs';
import type { YouTubeClient, Video } from './client';

interface UploadOptions {
  filePath: string;
  title: string;
  description?: string;
  tags?: string[];
  categoryId?: string;                  // '22' = People & Blogs
  privacyStatus?: 'private' | 'public' | 'unlisted';
  onProgress?: (uploadedBytes: number, totalBytes: number) => void;
}

export async function uploadVideo(
  yt: YouTubeClient,
  opts: UploadOptions,
): Promise<Video> {
  const fileSize = statSync(opts.filePath).size;

  const res = await yt.videos.insert(
    {
      part: ['snippet', 'status'],
      notifySubscribers: true,
      requestBody: {
        snippet: {
          title: opts.title,
          description: opts.description ?? '',
          tags: opts.tags,
          categoryId: opts.categoryId ?? '22',
        },
        status: {
          privacyStatus: opts.privacyStatus ?? 'private',
          selfDeclaredMadeForKids: false,
        },
      },
      media: { body: createReadStream(opts.filePath) },
    },
    {
      // gaxios option — fires as bytes are sent
      onUploadProgress: (evt: { bytesRead: number }) => {
        opts.onProgress?.(evt.bytesRead, fileSize);
      },
    },
  );

  return res.data;
}
```

Usage:

```typescript
const video = await uploadVideo(yt, {
  filePath: './my-video.mp4',
  title: 'My TypeScript upload',
  description: 'Uploaded via the YouTube Data API',
  tags: ['typescript', 'api'],
  privacyStatus: 'unlisted',
  onProgress: (sent, total) => {
    const pct = ((sent / total) * 100).toFixed(1);
    process.stdout.write(`\rUploading: ${pct}%`);
  },
});
console.log(`\nDone: https://youtu.be/${video.id}`);
```

> **Cost & limits:** an upload costs ~1,600 units — so the default 10,000/day quota allows roughly **six uploads**. Upload-heavy apps must request a quota increase. Newly created projects also start with a daily _upload count_ cap that lifts after [API audit/verification](https://support.google.com/youtube/answer/7300965).

---

## 15. Thumbnails

```typescript
import { createReadStream } from 'node:fs';
import type { YouTubeClient } from './client';

export async function setThumbnail(
  yt: YouTubeClient,
  videoId: string,
  imagePath: string,    // JPEG/PNG, < 2MB, 16:9 recommended
) {
  const res = await yt.thumbnails.set({
    videoId,
    media: { mimeType: 'image/jpeg', body: createReadStream(imagePath) },
  });
  return res.data;
}
```

> Custom thumbnails require a verified channel.

---

## 16. Pagination done right

Most `list` calls return at most 50 items plus a `nextPageToken`. Wrapping pagination in an **async generator** gives clean, memory-friendly iteration and a natural place to enforce caps.

```typescript
import type { YouTubeClient } from './client';

/**
 * Generic paginator. Pass any list method and base params; it yields
 * each page's items, following nextPageToken until exhausted or `limit`.
 */
export async function* paginate<TItem>(
  fetchPage: (pageToken?: string) => Promise<{
    items?: TItem[] | null;
    nextPageToken?: string | null;
  }>,
  limit = Infinity,
): AsyncGenerator<TItem, void, unknown> {
  let pageToken: string | undefined;
  let yielded = 0;

  do {
    const { items, nextPageToken } = await fetchPage(pageToken);
    for (const item of items ?? []) {
      yield item;
      if (++yielded >= limit) return;
    }
    pageToken = nextPageToken ?? undefined;
  } while (pageToken);
}

// Example: stream every video ID from a channel's uploads, capped at 500
export async function* channelUploads(yt: YouTubeClient, uploadsPlaylistId: string) {
  yield* paginate(
    async (pageToken) => {
      const res = await yt.playlistItems.list({
        part: ['contentDetails'],
        playlistId: uploadsPlaylistId,
        maxResults: 50,
        pageToken,
      });
      return { items: res.data.items, nextPageToken: res.data.nextPageToken };
    },
    500,
  );
}

// Consume it
// for await (const item of channelUploads(yt, uploadsId)) {
//   console.log(item.contentDetails?.videoId);
// }
```

> **`search.list` paging is shallow.** The API returns at most ~500 results total for a search query (roughly the first 10–13 pages), regardless of how many matches exist. Don't expect to page through thousands of search hits.

---

## 17. Quota management

This is the single most important operational concern. Default quota is **10,000 units/day**, reset at midnight Pacific Time.

### Strategies that actually move the needle

1. **Avoid `search.list` where possible.** It's 100 units. Reading the uploads playlist is 1 unit. Batch ID lookups are 1 unit per 50 items.
2. **Batch by ID.** `videos.list`, `channels.list`, etc. accept up to 50 IDs per call for the price of one.
3. **Cache aggressively.** Channel metadata and video details change rarely. Cache with a TTL.
4. **Request minimal `part` and use `fields`.** Smaller responses, and clearer intent.
5. **Track spend yourself.** The API won't warn you mid-day; you'll just start getting `quotaExceeded` 403s.

A lightweight in-process quota tracker:

```typescript
// src/quota.ts
const COST: Record<string, number> = {
  'search.list': 100,
  'videos.list': 1, 'videos.insert': 1600, 'videos.update': 50,
  'videos.rate': 50, 'videos.delete': 50,
  'channels.list': 1,
  'playlists.list': 1, 'playlists.insert': 50,
  'playlistItems.list': 1, 'playlistItems.insert': 50, 'playlistItems.delete': 50,
  'subscriptions.list': 1, 'subscriptions.insert': 50, 'subscriptions.delete': 50,
  'commentThreads.list': 1, 'commentThreads.insert': 50,
  'comments.insert': 50,
  'captions.insert': 400, 'captions.list': 50,
  'thumbnails.set': 50,
};

export class QuotaTracker {
  private spent = 0;
  constructor(private dailyLimit = 10_000) {}

  charge(op: keyof typeof COST | string): void {
    const cost = COST[op] ?? 1;
    if (this.spent + cost > this.dailyLimit) {
      throw new Error(`Quota budget exceeded: ${this.spent}/${this.dailyLimit}`);
    }
    this.spent += cost;
  }

  get used() { return this.spent; }
  get remaining() { return this.dailyLimit - this.spent; }
}
```

> Costs above are the published baseline. Treat them as estimates; the authoritative table is in Google's [quota cost docs](https://developers.google.com/youtube/v3/determine_quota_cost).

---

## 18. Error handling & retries

The client throws `GaxiosError`. Inspect `err.code` (HTTP status) and the `errors[].reason` for the specific cause.

```typescript
import { GaxiosError } from 'gaxios';

export interface ApiError {
  status: number;
  reason: string;
  message: string;
  retryable: boolean;
}

export function classifyError(err: unknown): ApiError {
  if (err instanceof GaxiosError) {
    const status = err.response?.status ?? 0;
    const reason =
      (err.response?.data as any)?.error?.errors?.[0]?.reason ?? 'unknown';
    const message =
      (err.response?.data as any)?.error?.message ?? err.message;

    const retryable =
      status === 500 || status === 503 ||
      (status === 403 && (reason === 'rateLimitExceeded' || reason === 'userRateLimitExceeded')) ||
      (status === 429);

    return { status, reason, message, retryable };
  }
  return { status: 0, reason: 'unknown', message: String(err), retryable: false };
}
```

Common reasons worth handling explicitly:

|Status|reason|Meaning / action|
|---|---|---|
|403|`quotaExceeded`|Daily quota gone. **Not** retryable today — back off until reset.|
|403|`rateLimitExceeded`|Too fast. Retryable with backoff.|
|403|`forbidden` / `commentsDisabled`|Operation not allowed on this resource. Don't retry.|
|401|`authError`|Token expired/invalid. Refresh or re-auth.|
|404|`videoNotFound`|Resource gone or wrong ID.|
|400|`invalidParameter`|Bad request — fix params, don't retry.|

### Exponential backoff with jitter

```typescript
export async function withRetry<T>(
  fn: () => Promise<T>,
  { maxAttempts = 5, baseDelayMs = 500 } = {},
): Promise<T> {
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (err) {
      const info = classifyError(err);
      attempt++;
      if (!info.retryable || attempt >= maxAttempts) throw err;
      const backoff = baseDelayMs * 2 ** (attempt - 1);
      const jitter = Math.random() * baseDelayMs;
      await new Promise((r) => setTimeout(r, backoff + jitter));
    }
  }
}

// Usage
const data = await withRetry(() =>
  yt.videos.list({ part: ['snippet'], id: ['dQw4w9WgXcQ'] }),
);
```

---

## 19. The YouTube Analytics API

Channel/video performance metrics (views, watch time, revenue) come from a **separate** API — `youtubeAnalytics('v2')` — not the Data API. It always requires OAuth with an analytics scope (`yt-analytics.readonly` or `yt-analytics-monetary.readonly`).

```typescript
import { google } from 'googleapis';
import type { Auth } from 'googleapis';

export async function channelViews(
  auth: Auth.OAuth2Client,
  startDate: string,  // 'YYYY-MM-DD'
  endDate: string,
) {
  const analytics = google.youtubeAnalytics({ version: 'v2', auth });
  const res = await analytics.reports.query({
    ids: 'channel==MINE',
    startDate,
    endDate,
    metrics: 'views,estimatedMinutesWatched,averageViewDuration',
    dimensions: 'day',
    sort: 'day',
  });
  return res.data; // { columnHeaders, rows }
}
```

> For large/scheduled exports, use the **YouTube Reporting API** (`youtubereporting('v1')`), which generates bulk CSV reports asynchronously instead of per-query results.

---

## 20. Real-time push notifications (PubSubHubbub)

Polling for new uploads burns quota. Instead, subscribe to a channel's Atom feed via Google's **PubSubHubbub** hub — YouTube pushes an HTTP POST to your callback whenever the channel uploads or updates a video. This costs **zero** API quota.

### Subscribe

```typescript
// POST form-encoded to the hub
export async function subscribeToChannelFeed(channelId: string, callbackUrl: string) {
  const body = new URLSearchParams({
    'hub.callback': callbackUrl,
    'hub.topic': `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${channelId}`,
    'hub.verify': 'async',
    'hub.mode': 'subscribe',
    'hub.lease_seconds': '432000', // ~5 days; re-subscribe before expiry
  });

  const res = await fetch('https://pubsubhubbub.appspot.com/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error(`Subscribe failed: ${res.status}`);
}
```

### Receive (Express)

```typescript
import express from 'express';
const app = express();

// 1. Hub verification handshake (GET with hub.challenge)
app.get('/youtube/webhook', (req, res) => {
  const challenge = req.query['hub.challenge'];
  if (challenge) return res.status(200).send(challenge);
  res.sendStatus(404);
});

// 2. Notifications arrive as Atom XML POSTs
app.post('/youtube/webhook', express.text({ type: '*/*' }), (req, res) => {
  // req.body is Atom XML — parse out <yt:videoId> and <yt:channelId>
  const videoId = /<yt:videoId>(.*?)<\/yt:videoId>/.exec(req.body)?.[1];
  if (videoId) {
    console.log('New/updated video:', videoId);
    // enqueue work, fetch full details via videos.list, etc.
  }
  res.sendStatus(204); // ACK quickly
});
```

> Leases expire (max ~5 days). Run a cron job to re-subscribe before expiry. Verify the `X-Hub-Signature` header if you set a `hub.secret` for authenticity.

---

## 21. Testing & mocking

Don't hit the live API (or burn quota) in unit tests. Inject a typed client and mock the methods you use.

```typescript
import { describe, it, expect, vi } from 'vitest';
import type { YouTubeClient } from '../src/client';
import { getVideos } from '../src/videos';

function mockClient(items: unknown[]): YouTubeClient {
  return {
    videos: {
      list: vi.fn().mockResolvedValue({ data: { items } }),
    },
  } as unknown as YouTubeClient;
}

describe('getVideos', () => {
  it('returns items from the API', async () => {
    const yt = mockClient([{ id: 'abc', snippet: { title: 'Test' } }]);
    const result = await getVideos(yt, ['abc']);
    expect(result).toHaveLength(1);
    expect(result[0].snippet?.title).toBe('Test');
  });

  it('chunks > 50 IDs into multiple calls', async () => {
    const yt = mockClient([]);
    const ids = Array.from({ length: 120 }, (_, i) => `id${i}`);
    await getVideos(yt, ids);
    expect(yt.videos.list).toHaveBeenCalledTimes(3); // 50 + 50 + 20
  });
});
```

For integration tests, use a dedicated test project + a recorded-cassette tool (e.g. `nock` / `polly.js`) so responses are deterministic and quota-free.

---

## 22. Production best practices

- **Separate read and write clients.** Use an API key for public reads (no user token, no quota tied to a user), and OAuth only where writes/private data demand it.
- **Persist refresh tokens securely.** Encrypt at rest (KMS/secrets manager). One refresh token per user; handle revocation (`invalid_grant`) by prompting re-auth.
- **Cache.** Channel/video metadata behind a TTL cache (Redis) slashes quota and latency. Cache search results too where staleness is acceptable.
- **Centralize quota accounting.** Track spend per day; refuse non-critical calls when near the cap; prioritize user-facing requests.
- **Always batch by ID** (up to 50) and prefer playlist reads over search.
- **Handle the string-number gotcha** at the boundary — convert statistics to numbers immediately on ingest.
- **Set timeouts and retries** via gaxios; wrap calls in `withRetry`.
- **Log `reason`, not just status.** The `errors[].reason` field is what tells you _why_.
- **Pin versions** and watch the [revision history](https://developers.google.com/youtube/v3/revision_history) for deprecations.
- **Respect ToS** — caching is allowed within limits; storing certain data long-term has restrictions. Review the [YouTube API Services Terms](https://developers.google.com/youtube/terms/api-services-terms-of-service).

---

## 23. Common pitfalls

|Pitfall|Fix|
|---|---|
|Forgetting `part` → 400 error|`part` is required on every call.|
|`search.list` to list a channel's videos → 100× the cost|Read the channel's `uploads` playlist (1 unit).|
|Expecting numbers from `statistics`|They're strings — `Number(v.statistics?.viewCount)`.|
|No `refresh_token` returned|Use `access_type: 'offline'` **and** `prompt: 'consent'`.|
|`update` wiping fields|Fetch the resource, mutate, send the full part back. `categoryId` is required on video update.|
|Paging search past ~500 results|Not possible — search depth is capped.|
|Using a service account for a normal channel|Unsupported. Use the interactive OAuth flow.|
|Comments calls failing|Need the `youtube.force-ssl` scope.|
|Quota silently exhausted|Track spend yourself; 403 `quotaExceeded` is the only signal.|
|Mixing up channel ID vs subscription ID on unsubscribe|`subscriptions.delete` needs the _subscription_ id.|
|Custom thumbnail rejected|Channel must be verified.|

---

## Appendix A: Quota cost reference

Approximate costs (units). Authoritative source: Google's quota cost docs.

|Operation|Cost|
|---|---|
|`search.list`|100|
|`*.list` (videos, channels, playlists, playlistItems, subscriptions, commentThreads, activities)|1|
|`captions.list`|50|
|`videos.insert` (upload)|~1,600|
|`videos.update` / `videos.rate` / `videos.delete`|50|
|`playlists.insert` / `update` / `delete`|50|
|`playlistItems.insert` / `update` / `delete`|50|
|`subscriptions.insert` / `delete`|50|
|`commentThreads.insert` / `comments.insert`|50|
|`captions.insert`|~400|
|`thumbnails.set`|50|

Default daily quota: **10,000 units**, reset midnight Pacific Time.

---

## Appendix B: OAuth scopes reference

|Scope|Grants|
|---|---|
|`…/auth/youtube.readonly`|Read account's private data (subscriptions, private playlists).|
|`…/auth/youtube`|Manage the account: playlists, subscriptions, video metadata.|
|`…/auth/youtube.upload`|Upload videos.|
|`…/auth/youtube.force-ssl`|Required for comments and full read/write over SSL.|
|`…/auth/youtubepartner`|Content Owner / CMS operations.|
|`…/auth/yt-analytics.readonly`|YouTube Analytics (non-monetary).|
|`…/auth/yt-analytics-monetary.readonly`|YouTube Analytics including revenue.|

Request the **minimum** scopes your app needs — narrower scopes mean smoother consent and fewer verification requirements.

---

## Quick-start skeleton

Putting the pieces together — a minimal, runnable shape:

```typescript
import { google } from 'googleapis';

async function main() {
  // Public read with an API key
  const yt = google.youtube({ version: 'v3', auth: process.env.YOUTUBE_API_KEY });

  // 1. Search (100 units)
  const search = await yt.search.list({
    part: ['snippet'], q: 'typescript', type: ['video'], maxResults: 5,
  });
  const ids = (search.data.items ?? [])
    .map((r) => r.id?.videoId)
    .filter((x): x is string => !!x);

  // 2. Batch-fetch full details (1 unit)
  const videos = await yt.videos.list({
    part: ['snippet', 'statistics'], id: ids,
  });

  for (const v of videos.data.items ?? []) {
    console.log(`${v.snippet?.title} — ${Number(v.statistics?.viewCount).toLocaleString()} views`);
  }
}

main().catch(console.error);
```

---

_Built against `googleapis` v173 / `@googleapis/youtube` v33, YouTube Data API v3. The API surface is stable, but always check Google's revision history and quota docs for the latest specifics._