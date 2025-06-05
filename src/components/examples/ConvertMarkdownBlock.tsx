import React, { useEffect } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import useIsBrowser from "@docusaurus/useIsBrowser";
import { convertEmbedBlocks } from "../EmbedLinkConverter";

function ConvertMarkdownBlock() {
  const isBrowser = useIsBrowser();
  if (!isBrowser) {
    return <p>loading...</p>;
  }

  useEffect(() => {
    if (!isBrowser) return;
    console.log("working");
    convertEmbedBlocks();
  }, [isBrowser]);

  return <div></div>;
}

export default function index() {
  return <BrowserOnly>{() => <ConvertMarkdownBlock />}</BrowserOnly>;
}
