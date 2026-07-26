
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

### Audio Compression

#### Compress to mp3

The below script does the following:

- `-ac 1` → mono (cuts size ~50%)
- `-ar 16000` → 16 kHz sample rate (fine for speech)
- `-b:a 16k` → extremely low bitrate

```bash
ffmpeg -i input.mp3 -ac 1 -ar 16000 -b:a 16k output.mp3
```

#### Compress to opus


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



### Basics

Here is the complete guide and implementation to get `ffmpeg.wasm` working seamlessly inside your React/Vite application to concatenate OPFS frames into an MP4.

#### 1. What to Install

Run the following in your terminal:
```bash
npm install @ffmpeg/ffmpeg@0.12.10 @ffmpeg/util@0.12.1
```

#### 2. How FFmpeg WASM works in Vite & React

1. **ESM vs UMD:** Vite's module system conflicts with the standard UMD build of FFmpeg Core. As explicitly stated in the docs, you **must** use the `/dist/esm` path instead of `/dist/umd`.
2. **CORS & `toBlobURL`:** Browsers block Web Workers from loading scripts cross-origin. The `toBlobURL` utility from `@ffmpeg/util` automatically fetches the core files and converts them to local Blob URLs to bypass this.
3. **Virtual File System:** FFmpeg WASM runs in a Web Worker and operates on its own virtual memory file system (MEMFS). You cannot pass OPFS paths directly to FFmpeg. You must read the `File` objects from OPFS and use `ffmpeg.writeFile()` to load them into memory before executing.
4. **OptimizeDeps:** Vite's dependency pre-bundling breaks FFmpeg's Worker instantiation, so it must be excluded in `vite.config.ts`.
5. **Headers:** Even for single-threaded execution, Emscripten often relies on `SharedArrayBuffer` for internal synchronization, which requires specific security headers.

#### 3. Update `vite.config.ts`

Add the security headers and exclude FFmpeg from Vite's pre-bundling:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // Required for SharedArrayBuffer (which Emscripten relies on)
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  optimizeDeps: {
    // Prevents Vite from breaking FFmpeg's worker thread
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
});
```

#### 4. Create `FfmpegVideoExporter.ts`

This class implements your `VideoExporter` interface, handles the singleton pattern, manages loading state, and abstracts the OPFS-to-MEMFS-to-MP4 pipeline.

```typescript
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export interface VideoExporter {
  exportVideo: (fileUri: string) => Promise<Blob>;
}

export class FfmpegVideoExporter implements VideoExporter {
  private static instance: FfmpegVideoExporter | null = null;
  private static loadPromise: Promise<void> | null = null;

  private ffmpeg: FFmpeg;
  private loaded = false;

  private constructor() {
    this.ffmpeg = new FFmpeg();
  }

  public static getInstance(): FfmpegVideoExporter {
    if (!FfmpegVideoExporter.instance) {
      FfmpegVideoExporter.instance = new FfmpegVideoExporter();
    }
    return FfmpegVideoExporter.instance;
  }

  public static async load(
    onLog?: (message: string) => void,
    onProgress?: (progress: number) => void
  ): Promise<FfmpegVideoExporter> {
    const instance = FfmpegVideoExporter.getInstance();

    // Return immediately if already loaded
    if (instance.loaded) return instance;
    
    // Prevent multiple simultaneous loads
    if (FfmpegVideoExporter.loadPromise) {
      await FfmpegVideoExporter.loadPromise;
      return instance;
    }

    FfmpegVideoExporter.loadPromise = (async () => {
      // CRITICAL: Vite requires the 'esm' path, NOT 'umd'
      const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm';

      if (onLog) {
        instance.ffmpeg.on('log', ({ message }) => onLog(message));
      }

      if (onProgress) {
        instance.ffmpeg.on('progress', ({ progress }) => onProgress(progress));
      }

      await instance.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      instance.loaded = true;
    })();

    await FfmpegVideoExporter.loadPromise;
    return instance;
  }

  public async exportVideo(fileUri: string): Promise<Blob> {
    if (!this.loaded) {
      throw new Error('FFmpeg is not loaded. Call FfmpegVideoExporter.load() first.');
    }

    const root = await navigator.storage.getDirectory();
    const framesDir = (await root.getDirectoryHandle(fileUri)) as FileSystemDirectoryWithIterators;
    
    const frameNames: string[] = [];
    if (framesDir.keys) {
      for await (const name of framesDir.keys()) frameNames.push(name);
    } else if (framesDir.entries) {
      for await (const [name] of framesDir.entries()) frameNames.push(name);
    }
    
    frameNames.sort();

    if (frameNames.length === 0) {
      throw new Error('No frames found in the OPFS directory.');
    }

    // 1. Load OPFS Frames into FFmpeg's Virtual File System
    for (const name of frameNames) {
      const fileHandle = await framesDir.getFileHandle(name);
      const file = await fileHandle.getFile();
      // fetchFile correctly converts a File object to a Uint8Array for FFmpeg
      await this.ffmpeg.writeFile(name, await fetchFile(file));
    }

    // 2. Execute FFmpeg command
    // -framerate 30: Assumes you captured at 30fps
    // -i frame_%05d.png: Matches your padStart(5, '0') naming convention
    // -preset ultrafast: Crucial for WASM to prevent browser timeouts on long videos
    // -pix_fmt yuv420p: Ensures the MP4 plays correctly in all standard video players
    await this.ffmpeg.exec([
      '-framerate', '30',
      '-i', 'frame_%05d.png',
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-preset', 'ultrafast',
      '-crf', '23',
      'output.mp4',
    ]);

    // 3. Extract the encoded video
    const data = await this.ffmpeg.readFile('output.mp4');
    const mp4Blob = new Blob([data.buffer], { type: 'video/mp4' });

    // 4. Cleanup virtual file system to free up RAM
    for (const name of frameNames) {
      await this.ffmpeg.deleteFile(name);
    }
    await this.ffmpeg.deleteFile('output.mp4');

    return mp4Blob;
  }
}
```

#### 5. Updated `useExport.ts` Hook

Integrate the real exporter. Notice how I map the FFmpeg `progress` event to the `setExportProgress` state.

```typescript
import { useCallback, useState } from "react";
import { getErrorMessage } from "../utils/error";
import { FfmpegVideoExporter } from "./FfmpegVideoExporter"; // Adjust path

interface VideoExporter {
  exportVideo: (fileUri: string) => Promise<Blob>;
}

export const downloadVideoFromOPFS = async (fileName?: string) => {
  try {
    const root = await navigator.storage.getDirectory();
    const videoFh = await root.getFileHandle("export.mp4");
    const file = await videoFh.getFile();
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName ? fileName.replace(/\.[^/.]+$/, "") : "flowkeys"}_export.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    await root
      .removeEntry("frames", { recursive: true })
      .catch(() => undefined);
    return true;
  } catch (error) {
    console.error("Download error:", error);
    return false;
  }
};

export const useExport = () => {
  const [exportState, setExportState] = useState<ExportState>("idle");
  const [exportMessage, setExportMessage] = useState("");
  const [exportProgress, setExportProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const exportViaFFMPEGWASM = useCallback(async () => {
    try {
      setExportState("processing");
      setExportMessage("Initializing FFmpeg WASM (loads ~31MB core on first run)...");

      // 1. Initialize or get the Singleton FFmpeg Instance
      const exporter = await FfmpegVideoExporter.load(
        (message) => {
          // Optional: Pipe FFmpeg stdout logs to console
          console.log("[FFmpeg LOG]", message);
        },
        (progress) => {
          // Map FFmpeg progress (0.0 - 1.0) to UI progress (40% - 90%)
          // Leaving 0-40% for loading/traversing, and 90-100% for saving
          setExportProgress(40 + progress * 50);
          setExportMessage(`Encoding video... ${Math.round(progress * 100)}%`);
        }
      );

      setExportMessage("Reading frames from OPFS storage...");
      setExportProgress(10);

      // 2. Traverse OPFS for UI feedback
      const root = await navigator.storage.getDirectory();
      const framesDir = (await root.getDirectoryHandle(
        "frames",
      )) as FileSystemDirectoryWithIterators;
      const frameNames: string[] = [];

      if (framesDir.keys) {
        for await (const name of framesDir.keys()) frameNames.push(name);
      } else if (framesDir.entries) {
        for await (const [name] of framesDir.entries()) frameNames.push(name);
      }
      frameNames.sort();

      setExportMessage(
        `Found ${frameNames.length} frames. Writing to FFmpeg memory...`,
      );
      setExportProgress(20);

      // 3. Process frames and get MP4 blob
      const videoBlob = await exporter.exportVideo("frames");

      setExportProgress(90);
      setExportMessage("Saving compiled video to OPFS storage...");

      // 4. Save back to OPFS
      const videoFh = await root.getFileHandle("export.mp4", { create: true });
      const writable = await videoFh.createWritable();
      await writable.write(videoBlob);
      await writable.close();

      setExportProgress(100);
      setExportMessage("Video compilation complete!");
      setExportState("ready");
    } catch (error) {
      console.error("FFmpeg processing error:", error);
      setErrorMessage(`Video encoding failed: ${getErrorMessage(error)}`);
      setExportState("idle");
    }
  }, []);

  return {
    errorMessage,
    exportMessage,
    exportProgress,
    exportState,
    exportViaFFMPEGWASM,
    setErrorMessage,
    setExportState,
    setExportMessage,
    setExportProgress,
  };
};
```

#### ⚠️ Important Architectural Note on RAM
Because `ffmpeg.wasm` operates in a virtual file system in memory (MEMFS), writing hundreds of PNG frames to it will consume high amounts of RAM. (e.g., 1000 frames at ~1MB each = ~1GB RAM). 
* If your videos are relatively short (< 30 seconds), this will work perfectly.
* If you plan on supporting multi-minute exports later, you should change your Web Worker's `canvas.toBlob()` to output `'image/jpeg'` instead of `'image/png'` to reduce the memory footprint by ~80%, or look into `@ffmpeg/ffmpeg`'s `WORKERFS` feature (added in 0.12.10) which allows streaming files directly from OPFS handles without loading them entirely into RAM.


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