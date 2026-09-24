
Antigravity 2.0 is now two separate apps:

- **Antigravity**: only agent chat view
- **Antigravity IDE**: the classic agy IDE
## Agent view

### Basics

Open up the current folder in antigravity using the `agy .` command

- **implementation plans**: WHen you're in planning mode you'll be able to create implementation plans and then you can even comment on those plans to have the AI implement your suggestions.
- **inbox**: when you click on the home screen icon, you're taking to a place where you can start a bunch of AI threads in parallel and they can even work on the same project.

### General workflow

With antigravity 2.0, you have three powerful new tools at your disposal:

1. **implementation plans**: still here from the last version, you can ask agy to "create an implementation plan" and it will go into plan mode for you to plan out what to do.
2. **worktrees**: You can spawn a conversation and tell the agent to do something else in a worktree so you can work in parallel.
3. **comment on diffs**: You can comment of file diffs and ask the agent to make changes.
4. **slash commands**: Powerful slash commands like `/browser` allow you to urge the AI to use its browser skill to test code in the browser via Playwright.

Here are the basic steps I use for a general workflow

1. . Prompt the AI with what you want to create, and say **create an implementation plan** for it.
2. Leave comments on the implementation plan so the AI knows what to change. 
3. When adding new changes, choose the agent to deal with the prompt in a **new worktree** as to not interrupt the main flow.

![](https://i.imgur.com/hYL8mvp.jpeg)

### Slash commands

|Slash Command|Description|
|:--|:--|
|`/goal`|Run until the specified task is completely finished, not asking for intermediate input from the user.|
|`/grill-me`|Before starting to implement, ask questions back to align on the specific details of the plan.|
|`/schedule`|Run an instruction as a one-time timer in the future or on a recurring schedule (via Scheduled Tasks).|
|`/browser`|Explicit slash command controlling browser debugging behaviors in Google Chrome.|


- `/browser`: enables remote debugging with chrome and playwright

### Google plugin skills


Antigravity 2.0 makes it seamless to build with popular Google technology stacks. We have partnered with teams across Google to create curated bundles of primitives, including Skills, MCP servers, and Editor extensions, that are pre-configured for specific ecosystems.

Instead of searching for individual tools, you can enable these bundles to instantly empower your agents with deep knowledge of Google platforms.


You can enable “Build with Google” integrations at two points:

*   **During Onboarding**: Select the checkboxes for the stacks you plan to use.
*   **In Settings**: Navigate to `Settings > Customizations > Build with Google Plugins` to add or remove integrations at any time.

Here are the available bundles:

**Modern web guidance**

Keep your coding agent up to date with the latest web best practices.

*   **What’s Included**: Package of evergreen and expert-vetted skills for modern web
    *   **Key Capabilities**: Agent can build accessible, performant, and secure web experiences using injected guidance
    *   **Learn more**: [Read the Modern Web Guidance](http://goo.gle/modern-web-guidance)

**Firebase Bundle**

Transform your AI coding agent into a specialized Firebase expert that can write code, configure Firebase Security Rules, and manage live resources.

*   **What’s Included**:
    *   Package of agent skills for core Firebase services, including Firestore, Authentication, App Hosting, and more
*   **Key Capabilities**:
    *   **Take action**: Do more than just write code. Your agent can initialize services, manage Authentication users, deploy new Firebase Security Rules, and work directly with your Cloud Firestore data.
    *   **Stay up-to-date**: Use official, version-aware prompts to guide your agent through setup tasks.
    *   **Improve accuracy**: Access your project’s environment and schemas to provide more relevant and accurate help.
*   **Learn More**: [Explore the Firebase Agent Skills Guide](https://firebase.google.com/docs/ai-assistance/agent-skills)

**Google Antigravity SDK**

Using the Antigravity Python SDK to build AI agents

*   **What’s Included**:
    *   An agent skill containing architecture references, getting-started examples, and configuration guides for the Antigravity Python SDK (google-antigravity)
*   **Key Capabilities**:
    *   **Build agents**: Your agent can scaffold new Antigravity agents, configure models, register custom Python tools, and connect MCP servers using SDK best practices.
    *   **Stay safe**: Use official guidance to implement declarative safety policies, including deny-by-default templates and argument-level predicates.
    *   **Go deeper**: Access reference material for lifecycle hooks, multi-agent delegation, structured output, multimodal input, and token usage observability.
*   **Learn more**: [Visit the Antigravity SDK Repository](https://github.com/google-antigravity/antigravity-sdk-python)





**Chrome DevTools**

Reliable automation, in-depth debugging, and performance analysis in Chrome using Chrome DevTools and Puppeteer

*   **What’s Included**: Package of agent skills for Chrome DevTools and Puppeteer
*   **Key Capabilities**: Debugging accessibility (a11y) issues, auditing Core Web Vitals (LCP/INP), running visual automation tests, and diagnosing memory leaks.
*   **Learn more**: [Explore the Chrome DevTools Repository](https://github.com/ChromeDevTools/chrome-devtools-mcp)


**Google Maps Platform**

Equip your AI coding agent with Google Maps specific knowledge and workflows to design, build, and deploy location-aware features across Web, Android, iOS, and Web Services.

*   **What’s Included**: Package of agent skills covering core Google Maps Platform APIs and SDKs - including Maps (2D/3D, Street View, Static, Styling, Clustering), Places, Address Validation, Geocoding, Routes & ETA (including eco-friendly routing), Geofencing, Heatmaps, and Environmental APIs (Air Quality, Pollen, Solar, Weather).
*   **Key Capabilities**:
    *   **Build location-rich experiences**: Enable your agent to write production-ready code for interactive mapping, place lookup, route optimization, geofencing, and environmental insights across mobile, web, and backend services.
    *   **Low-friction prototyping**: Get started using Maps Demo Key without needing immediate billing setup, with guided prompts to create account and restrict key when transitioning to production.
*   **Learn more**: [Explore the Google Maps Platform Agent Skills Repository](https://github.com/googlemaps/agent-skills)

### Parallel work

#### Worktrees

You can specify to spin up a new worktree on an agent prompt.

#### Subagents

You can tell the agent to spin up subagents to realize parallel work via a prompt like this:

```
"Spin up a bunch of subagents to get this work done in parallel and then let me know when you're done"
```

#### Third-party skills

## IDE view

### MCP servers

You can install MCP servers either by installing MCP servers that have first-class support in antigravity, like the following:

Or you can install them manually by modifying the MCP server json in the `.gemini` folder.


