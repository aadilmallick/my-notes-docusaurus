
## ffmpeg

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