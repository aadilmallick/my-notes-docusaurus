import React from "react";
import EmbedLinkProvider from "../components/EmbedLinkProvider";

// This Root component wraps the entire Docusaurus app
export default function Root({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return <EmbedLinkProvider>{children}</EmbedLinkProvider>;
}
