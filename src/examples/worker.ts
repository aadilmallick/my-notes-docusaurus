import { WorkerClass } from "./WorkerClass";

const worker = new WorkerClass(self as unknown as Worker);

worker.onMessage("countToACertainNumber", (num) => {
  console.log("counting to a certain number");
  let count = 0;
  while (count < num) {
    console.log(count++);
  }

  worker.postMessage("terminate", undefined);
});
