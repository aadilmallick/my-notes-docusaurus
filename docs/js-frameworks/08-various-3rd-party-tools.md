
## Imaage and Media

### ImageKit

#### NextJS starter

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

Then you can then upload and render images like so, automatically uploading images to a bucket.

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

**rendering images and videos**

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
    />
  )
}
```

```tsx
//import Image from 'next/image'
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