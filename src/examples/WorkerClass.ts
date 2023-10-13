interface Messages {
  terminate: {
    type: "terminate";
    payload: undefined;
  };
  countToACertainNumber: {
    type: "countToACertainNumber";
    payload: number;
  };
}

export class WorkerClass {
  constructor(public worker: Worker) {}

  onError(callback: (err: ErrorEvent) => void) {
    this.worker.onerror = callback;
  }

  postMessage<T extends keyof Messages>(
    message: T,
    payload: Messages[T]["payload"]
  ) {
    this.worker.postMessage({
      type: message,
      payload,
    });
  }

  onMessage<T extends keyof Messages>(
    message: T,
    callback: (payload: Messages[T]["payload"]) => void
  ) {
    this.worker.onmessage = function (event) {
      const data = event.data as Messages[T];

      if (data.type === message) {
        callback(data.payload);
      }
    };
  }
}
