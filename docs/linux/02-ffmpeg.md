
## ffmpeg

### Video compression

#### **changing codec**

Using the H264/MP4 codec/container combination is useful for compressing a video.

This is the best combination:

- `-vcodec libx264`: uses H264 encoder
- `-crf 28` : uses crf 28
- `-acodec copy` : copies the audio channel instead of compressing it
- `-preset slow` : slows down compression, but ensures smaller filesize while maintaining quality

```bash
ffmpeg -i input.mp4 -vcodec libx264 -crf 28 -preset slow -acodec copy output.mp4
```

#### **using `-crf`**

CRF refers to Constant Rate Factor. The range of the CRF value is 0-51, 0 is lossless and 51 is the worst quality. A lower value of CRF means higher quality. 17–28 is recommended since 17 is visually lossless. Increasing the CRF value +6 generally leads to half of the video file size. You can set the CRF value to keep a good balance of video size and video quality in FFmpeg.

- The best `-crf` value for comrpession is 28

#### **changing bitrate**

- `b:v 50k` : changes the video bitrate to 50k
- `b:a 128k` : changes the audio bitrate to 128k

You can play around with these numbers obviously - they’re not hardcoded.

#### **changing audio sample rate**

Use the `-ar <rate>` option to change the audio sample rate. Halving the audio sample rate of a video could mean half the file size, so big savings are in play. Here are some ballpark values and their connection to the file size.

- **ar 48000**: For high quality.
- **ar 44100**: For CD quality (still high).
- **ar 22500**: A bit of a compromise, not recommended for music, but for speech, it might be enough.
- **ar 8000**: Low quality, e.g. if you only want "understandable" speech.

#### Hall of fame compression scripts

**script to compress webm video**

```bash
#!/bin/bash

# Usage: ./compress_webm.sh input.webm output.webm
INPUT="$1"
OUTPUT="$2"

# CRF 31 is the sweet spot for 1080p; higher (up to 63) means smaller files
# -deadline best ensures maximum compression efficiency at the cost of speed
# -row-mt 1 enables multithreading for faster processing

ffmpeg -i "$INPUT" \
  -c:v libvpx-vp9 -b:v 0 -crf 35 \
  -deadline best -row-mt 1 \
  -c:a libopus -b:a 64k -ac 2 \
  "$OUTPUT"
```

### Video manipulation

#### **cropping**

```bash
ffmpeg -i input.mp4 -vf "crop=w:h:x:y" output.mp4
```

The `-vf "crop=w:h:x:y"` option lets you crop the video given the starting (x, y) top left coordinate to start from, and width and height of the cropping region. It returns a new cropped video.

These are the values you are going to replace:

- `x` : the x coordinate of the top left point to start cropping from. The top left corner of the video’s coordinate space is (0, 0)
- `y` : the y coordinate of the top left point to start cropping from. The top left corner of the video’s coordinate space is (0, 0)
- `w` : the width of the cropping region
- `h` : the height of the cropping region

#### **trimming**

The `-ss <timestamp> -t <duration>` lets you trim a video. The `timestamp` is the number of seconds in the video from where to start at, and `duration` is how long the sliced clip should be from that point.

- `-c copy` : copies both the video and audio streams over without re-encoding.
- `-c:v copy` : copies only over the video stream
- `-c:a copy` : copies only over the audio stream
- `-vn` : removes the video stream
- `-an` : removes the audio stream

```bash
ffmpeg -i input.mp4 -ss 2.5 -t 12.5 -c copy output.mp4
```

#### **concatenating clips**

You can add clips together into a single video if they all have the same codec/container.

1. Create a `.txt` file that has all the relative paths to the videos you want to concatenate.
    
    ```
    file /Users/Video/input1.mp4
    file /Users/Video/input2.mp4
    ```
    
2. Use the `-f concat` option, like so:
    
    1. `-safe 0` : allows absolute paths in the text file
    
    ```
    ffmpeg -f concat -safe 0 -i join_video.txt -c copy output.mp4
    ```
    

#### **changing the framerate**

You can change the framerate using the `-r <framerate>` option.

#### **Resizing**

You can change the video size using the `-s <width>x<height>` option, like so:

```
-s 640x480
```

**Change aspect ratio**

Use the `-aspect 16:9` option to change the aspect ratio, and of course you can customize the ratio.

## ffprobe

## ffplay

## ffmpeg wasm

FFMpeg WASM is the newest way to run ffmpeg in the browser, fully client side. It uses WASM under the hood to achieve this. 

https://ffmpegwasm.netlify.app/docs/getting-started/examples



### Installation

1. Install dependencies

```bash
npm install @ffmpeg/ffmpeg @ffmpeg/util
```

2. If using vite, set this in vite config, and optionally uncomment server headers.

```ts
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [tailwindcss()],
  optimizeDeps: {
    exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
  },
  server: {
    // headers: {
    //   "Cross-Origin-Opener-Policy": "same-origin",
    //   "Cross-Origin-Embedder-Policy": "require-corp",
    // },
  },
});
```

3. If using vite, make sure to always run `npm run build` once at the beginning before starting development.

### FFMPEGBrowser class

```ts
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export class FFMpegBrowser {
  ffmpeg = new FFmpeg();
  #initialized?: boolean;
  baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
  constructor(vite = true, version = "0.12.6") {
    if (vite) {
      this.baseURL = `https://unpkg.com/@ffmpeg/core@${version}/dist/esm`;
    } else {
      this.baseURL = `https://unpkg.com/@ffmpeg/core@${version}/dist/umd`;
    }
  }

  async init() {
    const thing = await this.ffmpeg.load({
      coreURL: await toBlobURL(
        `${this.baseURL}/ffmpeg-core.js`,
        "text/javascript"
      ),
      wasmURL: await toBlobURL(
        `${this.baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });
    console.log("thing", thing);
    this.#initialized = true;

    this.ffmpeg.on("log", ({ message }) => {
      console.log(message);
    });
  }

  onProgress(cb: (progress: number, time: number) => void) {
    this.ffmpeg.on("progress", ({ progress, time }) => {
      cb(progress, time);
    });
  }

  public get isLoaded() {
    return !!this.#initialized;
  }

  private parseCommand(
    command: string,
    inputFileName: string,
    outputFileName: string
  ) {
    if (!command.includes("$input") || !command.includes("$output")) {
      throw new Error("Command must include $input and $output placeholders");
    }
    const parsedCommand = command
      .replace("$input", `${inputFileName}`)
      .replace("$output", `${outputFileName}`)
      .split(" ");
    return parsedCommand;
  }

  async processVideo(
    url: string,
    command: string,
    options: {
      inputFileName: string;
      outputFileName: string;
    }
  ) {
    if (!this.#initialized) {
      throw new Error("FFMpeg not initialized");
    }
    await this.ffmpeg.writeFile(options.inputFileName, await fetchFile(url));
    const parsedCommand = this.parseCommand(
      command,
      options.inputFileName,
      options.outputFileName
    );
    console.log("parsedCommand", parsedCommand);
    await this.ffmpeg.exec(parsedCommand);
    const data = await this.ffmpeg.readFile(options.outputFileName);
    const blob = new Blob([data], { type: "image/gif" });
    return blob;
  }
}
```

And here is how you would use this class:

```ts
const ffmpeg = new FFMpegBrowser();
await ffmpeg.init();

ffmpeg.onProgress((progress, time) => {
  console.log("progress", progress);
  console.log("time", time);
});

async createGifFromVideoUrl(url: string) {
  const blob = await ffmpeg.processVideo(
    url,
    "-i $input -t 2.5 -ss 2.0 -f gif $output",
    {
      inputFileName: "input.mp4",
      outputFileName: "output.gif",
    }
  );
}
```