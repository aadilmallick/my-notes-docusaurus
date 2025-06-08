import React, { useEffect } from "react";
import Layout from "@theme/Layout";
import BrowserOnly from "@docusaurus/BrowserOnly";
import useIsBrowser from "@docusaurus/useIsBrowser";

const MyComponent = () => {
  class LoadingButton {
    constructor(private button: HTMLButtonElement) {}

    onClick(cb: () => void | Promise<void>) {
      const button = this.button;
      button.addEventListener("click", async () => {
        button.classList.add("loading");
        const loaderContainer = document.createElement("div");
        loaderContainer.classList.add("loader-container");
        loaderContainer.innerHTML = `
            <div class="dot" style="--num:1;"></div>
            <div class="dot" style="--num:2;"></div>
            <div class="dot" style="--num:3;"></div>
        `;

        button.appendChild(loaderContainer);
        await cb();

        button.classList.remove("loading");
        loaderContainer.remove();
      });
    }
  }

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    if (!ref.current) return;
    async function load() {
      window.addEventListener("load", () => {
        console.log(document.querySelector(".loadingBtn")!);
        const button = new LoadingButton(
          document.querySelector(".loadingBtn")!
        );
        button.onClick(async () => {
          console.log("clicking...");
          await sleep(5000);
        });
      });
    }

    load();
  }, []);

  const ref = React.useRef<HTMLButtonElement>(null);

  return (
    <Layout>
      <div id="loading">
        <button className="loadingBtn" ref={ref}>
          login
        </button>
      </div>
    </Layout>
  );
};

const index = () => {
  return <BrowserOnly>{() => <MyComponent />}</BrowserOnly>;
};

// Docusauraus react components must be a default export
export default index;
