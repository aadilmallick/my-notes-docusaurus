/**
 * Utility to convert Obsidian internal document links to normal navigable HTML links.
 * Runs client-side after page load / SPA route transitions.
 */

const EXCLUDED_TAGS = new Set(["script", "style", "pre", "code", "input", "textarea", "noscript", "iframe"]);

function convertObsidianLinksInNode(node: Node): void {
  if (node.nodeType === Node.ELEMENT_NODE) {
    const tagName = (node as Element).tagName.toLowerCase();
    if (EXCLUDED_TAGS.has(tagName)) {
      return;
    }
    // Convert children - use an array to avoid mutation issues during iteration
    const children = Array.from(node.childNodes);
    for (const child of children) {
      convertObsidianLinksInNode(child);
    }
  } else if (node.nodeType === Node.TEXT_NODE) {
    const text = node.nodeValue || "";
    const regex = /\[\[([^\]]+)\]\]/g;
    let match;
    let lastIndex = 0;
    const fragment = document.createDocumentFragment();
    let hasMatches = false;

    while ((match = regex.exec(text)) !== null) {
      hasMatches = true;
      const matchIndex = match.index;
      const rawContent = match[1];

      // Add text preceding the match
      if (matchIndex > lastIndex) {
        fragment.appendChild(document.createTextNode(text.substring(lastIndex, matchIndex)));
      }

      // Parse the content: "doc#heading|alias", "#heading|alias", etc.
      const parts = rawContent.split("|");
      const linkPart = parts[0].trim();
      const aliasPart = parts[1] ? parts[1].trim() : null;

      let href = "";
      let displayText = "";

      const hashIndex = linkPart.indexOf("#");
      if (hashIndex === 0) {
        // e.g. [[#Create a profile context doc]]
        const heading = linkPart.substring(1).trim();
        href = window.location.pathname + "#" + encodeURIComponent(heading);
        displayText = aliasPart || heading;
      } else if (hashIndex > 0) {
        // e.g. [[03-prompt-slop#Company deep research report prompt]]
        const doc = linkPart.substring(0, hashIndex).trim();
        const heading = linkPart.substring(hashIndex + 1).trim();
        href = window.location.origin + "/docs/" + doc + "#" + encodeURIComponent(heading);
        displayText = aliasPart || heading;
      } else {
        // e.g. [[some-doc]]
        const doc = linkPart;
        href = window.location.origin + "/docs/" + doc;
        displayText = aliasPart || doc;
      }

      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.textContent = displayText;
      anchor.className = "obsidian-link";
      fragment.appendChild(anchor);

      lastIndex = regex.lastIndex;
    }

    if (hasMatches) {
      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
      }
      node.parentNode?.replaceChild(fragment, node);
    }
  }
}

export function convertObsidianLinks(): void {
  // Target the main markdown container or document body
  const container = document.querySelector("main") || document.body;
  if (container) {
    convertObsidianLinksInNode(container);
  }
}
