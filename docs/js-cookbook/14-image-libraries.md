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

Then you can then render images and videos like so using the `<Image />` and `<Video />` component from `@imagekit/next` respectively, automatically uploading images to a bucket or rendering them if the src relative to the URL endpoint already exists.

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

- `urlEndpoint`: the imagekit endpoint of your imagekit app, which is the bucket of all media assets you store in a specific imagekit app. 
	- If you have rendered this inside an `<ImageKitProvider />` component, the `urlEndpoint` is automatically inferring from that provider so you don't have to provide this prop each time on individual `<Image />` or `<Video />` components.
- `src`: the url path of the uploaded media asset you want to render relative to the `urlEndpoint`, to render that full url if it does exist.
- `transformation`: an array of sequential image transformation methods to apply to the image, either for rendering or uploading.

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

#### Server side setup

First create a route that authenticates with the imagekit public and private keys

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

Then create an imagekit provider that authenticates with those keys by fetching that route and also provide your `urlEndpoint`:

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

To build URLs with transformation parameters from a specific media source, you can use this utility:

```ts
import { buildSrc } from "@imagekit/next";

function buildTransformedUrl(path: string) {
	const url = buildSrc({
	    src: `https://ik.imagekit.io/your_id/${path}`,
	    transformation: [{ width: 300, height: 300 }],
	});
	return url
}
```
#### Server side uploading

The `IKUpload` component provides a secure way to upload files directly to ImageKit.

Here are the parameters:

- `folder`: Specify the folder path (e.g., `"/users/avatars"`).
- `isPrivateFile`: If true, the file will be marked private.
- `onUploadProgress`: Callback for progress monitoring.
- `validateFile`: Client-side validation function.

```tsx
"use client";
import { IKUpload } from "@imagekit/next";

export default function MyUploadComponent() {
    const onError = (err: any) => {
        console.log("Error", err);
    };

    const onSuccess = (res: any) => {
        console.log("Success", res);
    };

    return (
        <IKUpload
            fileName="test-upload.png"
            tags={["sample-tag"]}
            useUniqueFileName={true}
            onError={onError}
            onSuccess={onSuccess}
        />
    );
}
```

here is an example of uploading imperatively by calling an upload API and creating a common image preview component:

```tsx
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImageIcon, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { upload } from "@imagekit/next";
import Image from "next/image";

interface UploadProps {
    onUploadSuccess: (url: string) => void;
    onUploadError: () => void;
    fileInputRef: ReturnType<useRef<HTMLInputElement>>;
    generateUniqueFilename: (filename: string) => string;
    authenticationRoute?: string
}

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB in bytes

export default function useImagekitUpload({
    onUploadSuccess,
    onUploadError,
    fileInputRef,
    generateUniqueFilename,
    authenticationRoute = "/api/imagekit-auth" // custom route for server-side
}: UploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (selectedFile: File) => {
        // Validate file type
        if (!selectedFile.type.startsWith("image/")) {
            toast.error("Please select an image file");
            onUploadError();
            return;
        }

        // Validate file size
        if (selectedFile.size > MAX_FILE_SIZE) {
            toast.error("Image must be less than 1MB");
            onUploadError();
            return;
        }

        setFile(selectedFile);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
    };

    const uploadToImageKit = async (fileToUpload: File) => {
        setIsUploading(true);

        try {
            // Fetch authentication parameters from our API route
            const authResponse = await fetch("/api/imagekit-auth");
            if (!authResponse.ok) {
                throw new Error("Failed to get upload authentication");
            }

            const authData = await authResponse.json();

            // Upload to ImageKit
            const result = await upload({
                file: fileToUpload,
                fileName: `profile-${Date.now()}-${fileToUpload.name}`,
                folder: "/profile-pictures",
                useUniqueFileName: true,
                token: authData.token,
                signature: authData.signature,
                expire: authData.expire,
                publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
                // IMAGEKIT automatically transforms to webp
                // transformation: {
                //     pre: "format(webp)",
                // },
            });

            setUploadedUrl(result.url || null);
            onUploadSuccess(result.url || "");
        } catch (error) {
            console.error("Upload error:", error);
            onUploadError();
            clearFile();
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFileSelect(droppedFile);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const clearFile = () => {
        setFile(null);
        setPreviewUrl(null);
        setUploadedUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    
    return {
	    handleDrop,
	    handleDragOver,
	    clearFile,
	    handleFileSelect,
	    uploadToImageKit
    }
}
```

#### AI transformations

ImageKit supports advanced AI-powered transformations:


```tsx
<Image
    src="/product.jpg"
    alt="Product"
    width={500}
    height={500}
    transformation={[{ aiRemoveBackground: true }]}
/>;
```



```tsx
<Image
    src="/low-res.jpg"
    alt="Upscaled"
    width={1000}
    height={1000}
    transformation={[{ aiUpscale: true }]}
/>;
```