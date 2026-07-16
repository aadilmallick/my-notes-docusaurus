## ImageKit

### NextJS starter

#### Installation

```embed
title: "Next.js ImageKit SDK"
image: "https://ik.imgkit.net/ikmedia/logo/light_T4buIzohVH.svg"
description: "Real-time image & video resizing, automatic optimization, and file uploading in Next.js using ImageKit.io."
url: "https://imagekit.io/docs/integration/nextjs"
favicon: ""
aspectRatio: "21"
```


First, install.

```bash
npm install @imagekit/next 
```

Then set the environment variables:

```bash
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="your_public_key"
IMAGEKIT_PRIVATE_KEY="your_private_key"
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_id"
```

#### Client side media display

Then you can then upload and render images and videos like so using the `<Image />` and `<Video />` component from `@imagekit/next` respectively, automatically uploading images to a bucket or rendering them if the src relative to the URL endpoint already exists.

```tsx
//import Image from 'next/image'
import { Image } from '@imagekit/next';

export default function Page() {
  return (
    <Image
      urlEndpoint="https://ik.imagekit.io/your_imagekit_id" // your bucket
      src="/profile.png"
      width={500}
      height={500}
      alt="Picture of the author"
    />
  )
}
```

Here are the possible props on both components:

- `urlEndpoint`: the imagekit endpoint of your imagekit app, which is the bucket of all media assets you store in a spe

```tsx
import { Video } from '@imagekit/next';
export default function Page() {
  return (
    <Video
      urlEndpoint="https://ik.imagekit.io/your_imagekit_id"
      src="/video.mp4"
      controls
      width={500}
      height={500}
      transformation={[
        {
            width: 800,
            height: 400,
            crop: "at_max",
            quality: 80,
        },
        {
            blur: 2,
        },
    ]}
    />
  )
}
```

```tsx
import { Image } from '@imagekit/next';

export default function Page() {
  return (
    <Image
      urlEndpoint="https://ik.imagekit.io/your_imagekit_id"
      src="/profile.png"
      width={500}
      height={500}
      alt="Picture of the author"
      transformation={[{ width: 500, height: 500 }]}
    />
  )
}
```

#### Server side uploading

First create a route

```ts title="app/api/upload-auth/route.ts"
import { getUploadAuthParams } from "@imagekit/next/server";
import { NextResponse } from "next/server";

export async function GET() {
    const authParams = getUploadAuthParams({
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
        publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    });

    return NextResponse.json(authParams);
}
```

```tsx
"use client";
import { ImageKitProvider } from "@imagekit/next";

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;

export default function Providers({ children }: { children: React.ReactNode }) {
    const authenticator = async () => {
        try {
            const response = await fetch("/api/upload-auth");

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `Request failed with status ${response.status}: ${errorText}`,
                );
            }

            const data = await response.json();
            const { signature, expire, token } = data;
            return { signature, expire, token };
        } catch (error) {
            throw new Error(`Authentication request failed: ${error}`);
        }
    };

    return (
        <ImageKitProvider
            urlEndpoint={urlEndpoint}
            publicKey={publicKey}
            authenticator={authenticator}
        >
            {children}
        </ImageKitProvider>
    );
}
```