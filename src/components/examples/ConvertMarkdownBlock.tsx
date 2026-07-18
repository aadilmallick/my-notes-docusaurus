import React, { useEffect } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import useIsBrowser from "@docusaurus/useIsBrowser";
import { convertEmbedBlocks } from "../EmbedLinkConverter";
import { convertObsidianLinks } from "../ObsidianLinkConverter";

function ConvertMarkdownBlock() {
  const isBrowser = useIsBrowser();
  if (!isBrowser) {
    return <p>loading...</p>;
  }

  const runConversions = () => {
    convertEmbedBlocks();
    convertObsidianLinks();
  };

  useEffect(() => {
    if (!isBrowser) return;
    console.log("working");
    runConversions();
  }, [isBrowser]);

  useEffect(() => {
    // Run conversion after component mounts
    const timeoutId = setTimeout(runConversions, 100);

    // Clean up timeout on unmount
    return () => clearTimeout(timeoutId);
  }, []);

  // Also run conversion when location changes (SPA navigation)
  useEffect(() => {
    const handleLocationChange = () => {
      setTimeout(runConversions, 100);
    };

    // Listen for Docusaurus route changes
    window.addEventListener("popstate", handleLocationChange);

    // For programmatic navigation, we can also listen to the history API
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(history, args);
      setTimeout(runConversions, 100);
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args);
      setTimeout(runConversions, 100);
    };

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  return <div></div>;
}

export default function index() {
  return <BrowserOnly>{() => <ConvertMarkdownBlock />}</BrowserOnly>;
}
