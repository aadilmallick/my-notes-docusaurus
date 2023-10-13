import { WorkerClass } from "./WorkerClass";

function countToACertainNumber(num: number) {
  const worker = new WorkerClass(new Worker("./worker.ts"));

  worker.onError((e) => {
    console.log("error in worker", e);
  });

  worker.postMessage("countToACertainNumber", num);

  worker.onMessage("terminate", () => {
    console.log("terminating worker");
    // public access on worker
    worker.worker.terminate();
  });
}

// countToACertainNumber(10);

const isRunningInNode = typeof require === "function";

async function fetchBlobBrowser(url: string) {
  if (isRunningInNode) {
    throw new Error("Cannot run in node");
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const blob = await response.blob();
  const file = new File([blob], "image.png", { type: blob.type });

  const fileReader = new FileReader();

  fileReader.addEventListener("load", (e) => {
    console.log(e.target.result);
  });
  fileReader.readAsDataURL(file);
  // const blobUrl = URL.createObjectURL(blob);
  // return blobUrl;
}

// async function fetchBlobNode(url: string) {
//   if (!isRunningInNode) {
//     throw new Error("Cannot run in browser");
//   }

//   const fs = require("fs").promises;
//   const response = await fetch(url);

//   if (!response.ok) {
//     throw new Error("Network response was not ok");
//   }
//   if (!response.headers.get("content-type").startsWith("image")) {
//     throw new Error("Response is not an image");
//   }
//   const arrayBuffer = await response.arrayBuffer();
//   const imageBuffer = Buffer.from(arrayBuffer);

//   await fs.writeFile("./image.png", imageBuffer);
// }

// fetchBlobBrowser(
//   "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Shades_of_light_blue.png/800px-Shades_of_light_blue.png"
// );

// fetchBlobNode(
//   "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Shades_of_light_blue.png/800px-Shades_of_light_blue.png"
// );
