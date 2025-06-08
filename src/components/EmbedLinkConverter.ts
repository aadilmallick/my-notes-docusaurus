/**
 * Utility to convert custom embed code blocks to normal links
 * Runs client-side after page load to transform the DOM
 */

function html(strings: TemplateStringsArray, ...values: any[]): string {
  return strings.reduce((result, str, i) => {
    return result + str + (values[i] || "");
  }, "");
}

interface EmbedData {
  title?: string;
  url?: string;
  description?: string;
  image?: string;
  favicon?: string;
  aspectRatio?: string;
}

function parseEmbedBlock(embedText: string): EmbedData | null {
  const lines = embedText.split("\n").filter((line) => line.trim());
  const data: EmbedData = {};

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith("title:")) {
      data.title = trimmedLine
        .substring(6)
        .trim()
        .replace(/^"(.*)"$/, "$1");
    } else if (trimmedLine.startsWith("url:")) {
      data.url = trimmedLine
        .substring(4)
        .trim()
        .replace(/^"(.*)"$/, "$1");
    } else if (trimmedLine.startsWith("description:")) {
      data.description = trimmedLine
        .substring(12)
        .trim()
        .replace(/^"(.*)"$/, "$1");
    } else if (trimmedLine.startsWith("image:")) {
      data.image = trimmedLine
        .substring(6)
        .trim()
        .replace(/^"(.*)"$/, "$1");
    } else if (trimmedLine.startsWith("favicon:")) {
      data.favicon = trimmedLine
        .substring(8)
        .trim()
        .replace(/^"(.*)"$/, "$1");
    } else if (trimmedLine.startsWith("aspectRatio:")) {
      data.aspectRatio = trimmedLine
        .substring(12)
        .trim()
        .replace(/^"(.*)"$/, "$1");
    }
  }

  return data.title && data.url ? data : null;
}

function createLinkElement(embedData: EmbedData): HTMLElement {
  const linkContainer = document.createElement("div");
  linkContainer.className = "embed-link-container";
  linkContainer.style.cssText = `
    margin: 16px 0;
    padding: 12px;
    border: 1px solid var(--ifm-color-emphasis-300);
    border-radius: 8px;
    background: var(--ifm-color-emphasis-100);
    transition: all 0.2s ease;
  `;

  // Add hover effect
  linkContainer.addEventListener("mouseenter", () => {
    linkContainer.style.backgroundColor = "var(--ifm-color-emphasis-200)";
    linkContainer.style.borderColor = "var(--ifm-color-primary)";
  });

  linkContainer.addEventListener("mouseleave", () => {
    linkContainer.style.backgroundColor = "var(--ifm-color-emphasis-100)";
    linkContainer.style.borderColor = "var(--ifm-color-emphasis-300)";
  });

  const link = document.createElement("a");
  link.href = embedData.url!;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.style.cssText = `
    text-decoration: none;
    color: inherit;
    display: block;
  `;

  const title = document.createElement("h4");
  title.style.cssText = `
    margin: 0 0 8px 0;
    color: var(--ifm-color-primary);
    font-size: 16px;
    font-weight: 600;
  `;
  title.textContent = embedData.title!;

  if (embedData.description) {
    const description = document.createElement("p");
    description.style.cssText = `
      margin: 0;
      color: var(--ifm-color-emphasis-700);
      font-size: 14px;
      line-height: 1.4;
    `;
    description.textContent = embedData.description;
    link.appendChild(title);
    link.appendChild(description);
  } else {
    link.appendChild(title);
  }

  linkContainer.appendChild(link);
  return linkContainer;
}

export function convertEmbedBlocks(): void {
  // Find all code blocks that might contain embed syntax
  const codeBlocks =
    document.querySelectorAll<HTMLElement>("pre.language-embed");
  //   console.log(codeBlocks);

  codeBlocks.forEach((codeBlock) => {
    const text = (codeBlock.textContent || "").trim().replace(/"/g, "");
    // console.log("text", text);
    const url = /url\: (.*)favicon/.exec(text)?.[1];
    console.log("url", url);
    // console.log(/url\: (.*)favicon/.exec(text)?.[1]);
    const linkId = `embed-link-${url.replace(/[^a-zA-Z0-9]/g, "-")}`;
    codeBlock.style.display = "none";
    if (document.getElementById(linkId)) {
      return;
    }
    const linkEl = document.createElement("a");
    linkEl.href = url;
    linkEl.target = "_blank";
    linkEl.rel = "noopener noreferrer";
    linkEl.textContent = url;
    linkEl.id = linkId;
    codeBlock.parentElement?.appendChild(linkEl);

    // // Check if this looks like an embed block - look for the specific pattern
    // // that starts with 'title:' and has 'url:' somewhere in it
    // if (text.includes("title:") && text.includes("url:")) {
    //   const embedData = parseEmbedBlock(text);

    //   if (embedData) {
    //     // Find the parent pre element
    //     const preElement = codeBlock.closest("pre");
    //     if (preElement) {
    //       // Check if this is specifically an 'embed' code block
    //       // Look for the language identifier or preceding text
    //       const prevSibling = preElement.previousElementSibling;
    //       const nextSibling = preElement.nextElementSibling;

    //       // Check if there's any indication this is an embed block
    //       let isEmbedBlock = false;

    //       // Method 1: Check if the code block has a class indicating it's an embed
    //       if (codeBlock.className.includes("language-embed")) {
    //         isEmbedBlock = true;
    //       }

    //       // Method 2: Check for ```embed in the raw markdown (this requires checking parent context)
    //       // Since we're working with rendered HTML, we'll look for patterns
    //       const parentContent = preElement.parentElement?.innerHTML || "";
    //       if (
    //         parentContent.includes("```embed") ||
    //         (text.includes("title:") &&
    //           text.includes("url:") &&
    //           text.includes("description:"))
    //       ) {
    //         isEmbedBlock = true;
    //       }

    //       if (isEmbedBlock) {
    //         // Create the new link element
    //         const linkElement = createLinkElement(embedData);

    //         // Replace the pre element with our link
    //         preElement.parentNode?.replaceChild(linkElement, preElement);
    //       }
    //     }
    //   }
    // }
  });
}

// Auto-run conversion when DOM is ready
// if (typeof window !== "undefined") {
//   if (document.readyState === "loading") {
//     document.addEventListener("DOMContentLoaded", convertEmbedBlocks);
//   } else {
//     // Document is already loaded
//     convertEmbedBlocks();
//   }

//   // Also run on route changes (for SPA navigation)
//   window.addEventListener("popstate", () => {
//     setTimeout(convertEmbedBlocks, 100);
//   });
// }
