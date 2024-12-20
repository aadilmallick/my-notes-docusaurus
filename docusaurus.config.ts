// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

// import { Prism } from "prism-react-renderer";
// const darkCodeTheme = require("prism-react-renderer/themes/dracula");
const math = require("remark-math");
const katex = require("rehype-katex");
import type { Config } from "@docusaurus/types";
import { themes as prismThemes } from "prism-react-renderer";

// const remarkAlert = import("remark-github-blockquote-alert").then((module) => {
//   return module.remarkAlert;
// });

export default async function createConfigAsync() {
  const { remarkAlert } = await import("remark-github-blockquote-alert");
  const config = {
    title: "Threejs Journey notes",
    tagline: "My notes",
    favicon: "img/favicon.ico",
    stylesheets: [
      {
        href: "https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css",
        type: "text/css",
        integrity:
          "sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM",
        crossorigin: "anonymous",
      },
    ],

    // Set the production url of your site here
    url: "https://your-docusaurus-test-site.com",
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: "/",

    // * GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: "aadilmallick", // Usually your GitHub org/user name.
    projectName: "docusaurus", // Usually your repo name.

    onBrokenLinks: "warn",
    onBrokenMarkdownLinks: "warn",

    // Even if you don't use internalization, you can use this field to set useful
    // metadata like html lang. For example, if your site is Chinese, you may want
    // to replace "en" with "zh-Hans".
    i18n: {
      defaultLocale: "en",
      locales: ["en"],
    },
    plugins: [
      [
        "@docusaurus/plugin-pwa",
        {
          debug: true,
          offlineModeActivationStrategies: [
            "appInstalled",
            "standalone",
            "queryString",
          ],
          pwaHead: [
            {
              tagName: "link",
              rel: "icon",
              href: "/img/docusaurus.png",
            },
            {
              tagName: "link",
              rel: "manifest",
              href: "/manifest.json", // your PWA manifest
            },
            {
              tagName: "meta",
              name: "theme-color",
              content: "rgb(37, 194, 160)",
            },
          ],
        },
      ],
    ],

    presets: [
      [
        "classic",
        /** @type {import('@docusaurus/preset-classic').Options} */
        {
          docs: {
            sidebarPath: require.resolve("./sidebars.js"),
            remarkPlugins: [math, remarkAlert],
            rehypePlugins: [katex],
            // Please change this to your repo.
            // * Remove this to remove the "edit this page" links.
            // editUrl:
            //   "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
          },
          blog: {
            showReadingTime: true,
            // Please change this to your repo.
            // * Remove this to remove the "edit this page" links.
            // editUrl:
            //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          },
          theme: {
            customCss: require.resolve("./src/css/custom.css"),
          },
        },
      ],
    ],

    themeConfig:
      /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
      {
        // Replace with your project's social card
        image: "img/docusaurus-social-card.jpg",
        tableOfContents: {
          minHeadingLevel: 2,
          maxHeadingLevel: 4,
        },
        algolia: {
          // The application ID provided by Algolia
          appId: "NOJT11AE9A",

          // Public API key: it is safe to commit it
          apiKey: "d0edcf018f4a64fdda3737092ee2aa3b",

          indexName: "threejsnetlify",

          // Optional: see doc section below
          contextualSearch: true,

          // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
          // externalUrlRegex: "external\\.com|domain\\.com",

          // Optional: Replace parts of the item URLs from Algolia. Useful when using the same search index for multiple deployments using a different baseUrl. You can use regexp or string in the `from` param. For example: localhost:3000 vs myCompany.com/docs
          // replaceSearchResultPathname: {
          //   from: "/docs/", // or as RegExp: /\/docs\//
          //   to: "/",
          // },

          // Optional: Algolia search parameters
          // searchParameters: {},

          // Optional: path for search page that enabled by default (`false` to disable it)
          // searchPagePath: "search",

          // Optional: whether the insights feature is enabled or not on Docsearch (`false` by default)
          // insights: false,

          //... other Algolia params
        },
        navbar: {
          title: "My Site",
          logo: {
            alt: "My Site Logo",
            src: "img/logo.svg",
          },
          items: [
            {
              type: "docSidebar",
              sidebarId: "tutorialSidebar",
              position: "left",
              label: "Tutorial",
            },
            { to: "/blog", label: "Blog", position: "left" },
            {
              href: "https://github.com/aadilmallick/my-notes-docusaurus",
              label: "GitHub",
              position: "right",
            },
          ],
        },
        footer: {
          style: "dark",
          links: [
            {
              title: "Docs",
              items: [
                {
                  label: "Tutorial",
                  to: "/docs/mynotes",
                },
              ],
            },
            {
              title: "Community",
              items: [
                {
                  label: "Discord",
                  href: "https://discordapp.com/invite/docusaurus",
                },
                {
                  label: "Twitter",
                  href: "https://twitter.com/docusaurus",
                },
              ],
            },
            {
              title: "More",
              items: [
                {
                  label: "Blog",
                  to: "/blog",
                },
                {
                  label: "GitHub",
                  href: "https://github.com/aadilmallick",
                },
              ],
            },
          ],
          copyright: `Copyright © ${new Date().getFullYear()} totally not built with Docusaurus`,
        },
        prism: {
          theme: prismThemes.github,
          darkTheme: prismThemes.dracula,
        },
      },
  } satisfies Config;

  return config;
}
