## AI-assisted coding

### The workflow

#### 1) Context is king

- **Problem**: The more context you feed to your agent, the worse it performs. Keep context small.
- **Solution**: Use `/compact` to compact and summarize your conversation history in claude code, or just prompt the AI to summarize the entire conversation history and put that into a markdown file, which you can then feed as context into a new chat.

#### 2) Write E2E tests

End to end tests will give you the biggest bang for your buck.

#### 3) Review every line of code

No excuses. If you didn't write it, then review it.

#### 4) Abstract first

LLMs perform better when there is some sort of structure in your coding, for example, using TS or building abstractions in simple interfaces on top of third-party libraries will help the AI to understand your coding style, and it will build off of that. 

#### 5) Actually doing it

1. Create a `features.md` to track features, describe them, and cross them off incrementally.
2. Always ask the agent to plan through solving a feature before implementing it.
3. Always use a living document for features, saving progress you made on a feature and describing it so you can feed it as context even when starting a brand new convo.

#### Summary


1. **Plan First**: Never let the AI code without a `plan.md`. Read the plan. If the plan is wrong, the code will be wrong.
    
2. **Give it Eyes (Harnesses)**: The AI cannot see the UI. Give it a `dry-run` script or a `npm test` so it can "see" if it broke something.
    
3. **Review is Mandatory**: AI is not a replacement for knowing how to code. It is a replacement for _typing_. You must review every line (or use tools like Graphite/CodeRabbit for a second opinion).

### Model agnostic inference

Some platforms like Cursor or Warp allow you to BYOK or BYOM (bring your own model), where you need to specify these three pieces of information in order to run model inference:

1. **model endpoint**: something like `https://opencode.ai/zen/v1/chat/completions` which is the REST API endpoint for running inference on a specific model provider.
2. **API key**: the API key for the provider
3. **model tag**: the specific model identifier to user, like `deepseek-v4-flash-free`.

#### Inference with Opencode

The endpoint URL is `https://opencode.ai/zen/v1`, with the OpenAI-compatible inference endpoint being `https://opencode.ai/zen/v1/chat/completions`

**Opencode free models**



| Model name             | Model identifier       | Model inference endpoint                      |
| ---------------------- | ---------------------- | --------------------------------------------- |
| Big Pickle             | big-pickle             | `https://opencode.ai/zen/v1/chat/completions` |
| MiMo-V2.5 Free         | mimo-v2.5-free         | `https://opencode.ai/zen/v1/chat/completions` |
| North Mini Code Free   | north-mini-code-free   | `https://opencode.ai/zen/v1/chat/completions` |
| Nemotron 3 Ultra Free  | nemotron-3-ultra-free  | `https://opencode.ai/zen/v1/chat/completions` |
| DeepSeek V4 Flash Free | deepseek-v4-flash-free | `https://opencode.ai/zen/v1/chat/completions` |


#### Inference with vercel AI API GATEWAY

These are the free models vercel AI API gateway has:

| Model                              | Context | Latency | Throughput | Input | Output | Cache                       |
| ---------------------------------- | ------- | ------- | ---------- | ----- | ------ | --------------------------- |
| nvidia/nemotron-3.5-lightning      | 1M      | 0.1s    | 48tps      | Free  | Free   | Read: $0.01/M Free Write: — |
| nvidia/nemotron-3.5-lightning-free | 1M      | 0.1s    | 48tps      | Free  | Free   |                             |
| fish-audio/s2.1-pro                |         |         |            | Free  | Free   |                             |
| fish-audio/s2.1-pro-free           |         |         |            | Free  | Free   |                             |
| poolside/laguna-s-2.1-free         | 256K    | 1.4s    | 68tps      | Free  | Free   |                             |
| fish-audio/s2-pro                  |         |         |            | Free  | Free   |                             |
| fish-audio/s2-pro-free             |         |         |            | Free  | Free   |                             |
| fish-audio/transcribe-1            |         |         |            | Free  | Free   |                             |
| fish-audio/transcribe-1-free       |         |         |            | Free  | Free   |                             |
| fish-audio/s1                      |         |         |            | Free  | Free   |                             |
| fish-audio/s1-free                 |         |         |            | Free  | Free   |                             |

#### Inference with Kilo Code

**Kilocode free models**

Kilocode allows you to use other inference endpoint providers but you can also use these free models that come with kilocode:

```embed
title: "Best Free AI Coding Models Available Now | Kilo Code"
image: "https://kilo.ai/kilocode-social.png"
description: "Find the best currently tested free AI coding models in Kilo Code, plus a live catalog of hosted models with $0 input and $0 output token pricing."
url: "https://kilo.ai/landing/free-models"
favicon: ""
aspectRatio: "56.35062611806798"
```


#### Inference with NVidia APIs

- **endpoint URL**  : `https://integrate.api.nvidia.com/v1`
- **model list**: [Models | Try NVIDIA NIM APIs](https://build.nvidia.com/models)

```python
from openai import OpenAI
import os
import sys

_USE_COLOR = sys.stdout.isatty() and os.getenv("NO_COLOR") is None
_REASONING_COLOR = "\033[90m" if _USE_COLOR else ""
_RESET_COLOR = "\033[0m" if _USE_COLOR else ""

client = OpenAI(
  base_url = "https://integrate.api.nvidia.com/v1",
  api_key = "YOUR_NVIDIA_API_KEY"
)


completion = client.chat.completions.create(
  model="z-ai/glm-5.2",
  messages=[{"role":"user","content":""}],
  temperature=1,
  top_p=1,
  max_tokens=16384,
  seed=42,
  
  stream=True
)

for chunk in completion:
  if not getattr(chunk, "choices", None):
    continue
  if len(chunk.choices) == 0 or getattr(chunk.choices[0], "delta", None) is None:
    continue
  delta = chunk.choices[0].delta
  if getattr(delta, "content", None) is not None:
    print(delta.content, end="")
```



**nvidia free models**

The endpoint URL is `https://integrate.api.nvidia.com/v1`, with the OpenAI-compatible inference endpoint being `https://integrate.api.nvidia.com/v1/chat/completions`

| name                                   | modelTag                                      | param count           |
| -------------------------------------- | --------------------------------------------- | --------------------- |
| nemotron-3-super-120b-a12b             | nvidia/nemotron-3-super-120b-a12b             | 120B                  |
| nemotron-3-ultra-550b-a55b             | nvidia/nemotron-3-ultra-550b-a55b             | 550B                  |
| gpt-oss-120b                           | openai/gpt-oss-120b                           | 120B                  |
| llama-3.3-70b-instruct                 | meta/llama-3_3-70b-instruct                   | 70B                   |
| qwen3-next-80b-a3b-instruct            | qwen/qwen3-next-80b-a3b-instruct              | 80B                   |
| gpt-oss-20b                            | openai/gpt-oss-20b                            | 20B                   |
| llama-3.1-8b-instruct                  | meta/llama-3_1-8b-instruct                    | 8B                    |
| deepseek-v4-flash                      | deepseek-ai/deepseek-v4-flash                 | N/A                   |
| qwen3.5-397b-a17b                      | qwen/qwen3.5-397b-a17b                        | 397B                  |
| llama-4-maverick-17b-128e-instruct     | meta/llama-4-maverick-17b-128e-instruct       | 400B (17B x 128E MoE) |
| kimi-k2.6                              | moonshotai/kimi-k2.6                          | N/A                   |
| minimax-m2.7                           | minimaxai/minimax-m2.7                        | N/A                   |
| qwen3.5-122b-a10b                      | qwen/qwen3.5-122b-a10b                        | 122B                  |
| llama-3.1-nemotron-nano-vl-8b-v1       | nvidia/llama-3.1-nemotron-nano-vl-8b-v1       | 8B                    |
| nemotron-3-nano-30b-a3b                | nvidia/nemotron-3-nano-30b-a3b                | 30B                   |
| mistral-small-4-119b-2603              | mistralai/mistral-small-4-119b-2603           | 119B                  |
| minimax-m3                             | minimaxai/minimax-m3                          | N/A                   |
| step-3.5-flash                         | stepfun-ai/step-3.5-flash                     | N/A                   |
| nemotron-3-nano-omni-30b-a3b-reasoning | nvidia/nemotron-3-nano-omni-30b-a3b-reasoning | 30B                   |
| glm-5.2                                | z-ai/glm-5.2                                  | N/A                   |
| step-3.7-flash                         | stepfun-ai/step-3.7-flash                     | N/A                   |
| deepseek-v4-pro                        | deepseek-ai/deepseek-v4-pro                   | N/A                   |
| llama-3.3-nemotron-super-49b-v1.5      | nvidia/llama-3_3-nemotron-super-49b-v1_5      | 49B                   |
| llama-3.3-nemotron-super-49b-v1        | nvidia/llama-3_3-nemotron-super-49b-v1        | 49B                   |
| gemma-4-31b-it                         | google/gemma-4-31b-it                         | 31B                   |
| llama-3.1-70b-instruct                 | meta/llama-3_1-70b-instruct                   | 70B                   |
| nemotron-nano-12b-v2-vl                | nvidia/nemotron-nano-12b-v2-vl                | 12B                   |
| gemma-2-2b-it                          | google/gemma-2-2b-it                          | 2B                    |
| mistral-medium-3.5-128b                | mistralai/mistral-medium-3.5-128b             | 128B                  |
| nv-embed-v1                            | nvidia/nv-embed-v1                            | N/A                   |
| ministral-14b-instruct-2512            | mistralai/ministral-14b-instruct-2512         | 14B                   |
| llama-3.2-90b-vision-instruct          | meta/llama-3.2-90b-vision-instruct            | 90B                   |
| diffusiongemma-26b-a4b-it              | google/diffusiongemma-26b-a4b-it              | 26B                   |
| llama-3.2-11b-vision-instruct          | meta/llama-3.2-11b-vision-instruct            | 11B                   |
| nemotron-mini-4b-instruct              | nvidia/nemotron-mini-4b-instruct              | 4B                    |
| gemma-3n-e4b-it                        | google/gemma-3n-e4b-it                        | 4B                    |
| nvidia-nemotron-nano-9b-v2             | nvidia/nvidia-nemotron-nano-9b-v2             | 9B                    |
| nemotron-3.5-content-safety            | nvidia/nemotron-3.5-content-safety            | N/A                   |
| nv-embedcode-7b-v1                     | nvidia/nv-embedcode-7b-v1                     | 7B                    |
| gemma-3n-e2b-it                        | google/gemma-3n-e2b-it                        | 2B                    |
| llama-3.2-3b-instruct                  | meta/llama-3.2-3b-instruct                    | 3B                    |
| rerank-qa-mistral-4b                   | nvidia/rerank-qa-mistral-4b                   | 4B                    |
| mistral-nemotron                       | mistralai/mistral-nemotron                    | 12B                   |
| llama-3.1-nemotron-nano-8b-v1          | nvidia/llama-3_1-nemotron-nano-8b-v1          | 8B                    |
| dracarys-llama-3.1-70b-instruct        | abacusai/dracarys-llama-3_1-70b-instruct      | 70B                   |
| mixtral-8x7b-instruct-v0.1             | mistralai/mixtral-8x7b-instruct               | 47B (8x7B MoE)        |
| seed-oss-36b-instruct                  | bytedance/seed-oss-36b-instruct               | 36B                   |
| esmfold                                | meta/esmfold                                  | 3B                    |
| llama-3.2-1b-instruct                  | meta/llama-3.2-1b-instruct                    | 1B                    |
| solar-10.7b-instruct                   | upstage/solar-10_7b-instruct                  | 10.7B                 |
| gliner-pii                             | nvidia/gliner-pii                             | N/A                   |
| ising-calibration-1-35b-a3b            | nvidia/ising-calibration-1-35b-a3b            | 35B                   |
| sarvam-m                               | sarvamai/sarvam-m                             | N/A                   |
| llama-guard-4-12b                      | meta/llama-guard-4-12b                        | 12B                   |
| llama-3.1-nemotron-safety-guard-8b-v3  | nvidia/llama-3_1-nemotron-safety-guard-8b-v3  | 8B                    |
| riva-translate-4b-instruct-v1_1        | nvidia/riva-translate-4b-instruct-v1_1        | 4B                    |
| synthetic-video-detector               | nvidia/synthetic-video-detector               | N/A                   |
| magpie-tts-zeroshot                    | nvidia/magpie-tts-zeroshot                    | N/A                   |
| paligemma                              | google/google-paligemma                       | 3B                    |
| Studio Voice                           | nvidia/studiovoice                            | N/A                   |
| esm2-650m                              | meta/esm2-650m                                | 650M                  |
| cosmos3-nano-reasoner                  | nvidia/cosmos3-nano-reasoner                  | N/A                   |
| cosmos3-nano                           | nvidia/cosmos3-nano                           | N/A                   |
| Active Speaker Detection               | nvidia/active-speaker-detection               | N/A                   |
| Background Noise Removal               | nvidia/bnr                                    | N/A                   |
| nemotron-voicechat                     | nvidia/nemotron-voicechat                     | N/A                   |
| cosmos-transfer1-7b                    | nvidia/cosmos-transfer1-7b                    | 7B                    |
| streampetr                             | nvidia/streampetr                             | N/A                   |
| bevformer                              | nvidia/bevformer                              | N/A                   |
| sparsedrive                            | nvidia/sparsedrive                            | N/A                   |
| cosmos-transfer2.5-2b                  | nvidia/cosmos-transfer2_5-2b                  | 2B                    |
| inkling                                | thinkingmachines/inkling                      | N/A                   |
| ising-calibration-1.5-31b              | nvidia/ising-calibration-1.5-31b              | 31B                   |
| laguna-xs-2.1                          | poolside/laguna-xs-2.1                        | N/A                   |
| nemotron-3-embed-1b                    | nvidia/nemotron-3-embed-1b                    | 1B                    |
| nemotron-3.5-nano-30b-a3b              | nvidia/nemotron-3.5-nano-30b-a3b              | 30B                   |
| seallm-7b-v2.5                         | seallms/seallm-7b                             | 7B                    |


## LLM chat apps

### ChatGPT

#### Canvas mode

Canvas mode is a way to edit some text, like an essay or code, by "pair coding" with chatGPT.

- You can highlight text in canvas mdoe and ask chatgpt to do something abotu that highlighted text, which is faster than simply retyping it.

#### Code execution

You can ask ChatGPT to execute code in a python repl to give you back exact mathematical answers or to create charts with matplotlib. Here are the things you can do:

- **math**: get back perfect math answers by asking in a repl
- **graphs**: ask for perfect graphs using matplotlib
- **qr codes**: ask to make qr codes from a link using the `qrcode` python package

#### Tasks

In the chatgpt pro plan, you can ask o3-mini model to create recurring tasks for you that get executed everyday and notify you via email.

For example, you could ask gpt to send you the latest ai news every morning


### ChatGPT Work

#### Working in projects

With ChatGPT work projects, you are just using a local folder on your computer, but not really doing it for coding and stuff like that. It's basically the same thing as Codex but you're just using it in a business context. 

To work in projects, you should use these components:

- `AGENTS.md`: rules for the project that always loads in context.
- `tools.md`: a semantic md file that you tell GPT to use as the source of truth for how to use plugins and rules for the plugins within the scope of your project.

**Adding to `AGENTS.md`**

Whenever you want ChatGPT to remember a rule or add it to the agents.md, you should just preface whatever your prompt is with "remember this rule":

>"Remember this rule: Whenever I ask you to rename image files, use a short but descriptive name so I know what each image is without opening it."


**Adding to tools MD**

WHen adding a lot of connectors and rules for each plugin, your `AGENTS.md` file can get very messy, so it's important to keep it clean by offloading plugin rules to another file.

Here is how you can delegate all plugin rules to a `TOOL_CONVENTIONS.md` file:

>"Create a Tool Conventions.md file that will house all rules governing tools moving forward. Move every tool- or plugin-specific rule from AGENTS.md into it. Replace the moved content in AGENTS.md with a link."

#### In-app browser

IN ChatGPT work, you can enable the in-app browser and then navigate to a site so ChatGPT has perfect web-control and execution over a website while being secure.


1. Press `CMD + T` (Mac) or `CTRL + T` (Windows) to open the in-app browser in ChatGPT


![](https://i.imgur.com/hHcazr7.jpeg)


2. Use the **annotation mode** to highlight specific elements and ask ChatGPT to do something with them.

Here are the main use cases for using the in-app browser with GPT:

- **web elements context**: You can give ChatGPT context as to the visual nature of a website, which leads to these use cases:
	- **SEO audit**: Understand what you can do to improve your SEO and AEO.
	- **Dead links audit**: Navigate to your project pages and task the AI to crawl and verify that all links function correctly and open in new tabs
	- **UI/UX audit**: Use the annotation feature to highlight specific page elements and ask the AI to suggest CSS improvements or identify accessibility issues.
	- **Mockups**: create stuff like mockups or designs based on that website.
	- **Web Scraping Logic Testing:** Use the browser to test how a website renders and ask the AI to write a scraper or parser for the specific layout you are viewing.
	- **Live Website Tweaks:** As shown in the video, use the annotation mode to request design changes (like switching to dark mode) and have the AI implement them if connected to your platform (e.g., _Ghost_)
	- **Accessibility Audits (a11y):** Browse your site's frontend and ask the AI to audit elements for missing alt text, incorrect ARIA labels, or contrast issues.
- **Language-learning use cases**: GPT understands the text content of a website, which allows you to do these things associated with language learning:
	- **Vocabulary Mining:** Browse a foreign site and have the AI generate a list of the top 10 most common or useful verbs or nouns found on that specific page.
	- **Interactive Grammar Quizzes:** Point the browser to an educational article and ask the AI to create a quiz based on the grammar rules used in that text.

#### Side chats

**Side chats** allow you to create a branching chat off of the main chat so you don't pollute the context with a side question or side prompt.

Here are the two main rules of side chats:

1. Side chats retain all context from the main chat at the moment they were created. Think of it like a closure in JavaScript.
2. No context from side chats leak into the main chat.

You can initiate a side chat with `/side`



![](https://i.imgur.com/8MQpyzX.jpeg)


### Microsoft copilot

Microsoft copilot is cool because it has AI sidebar integration in the edge browser to analyze the contents of a website.

### NotebookLM

NotebookLM is really cool and has a great use case for generating minutes of audio on the fly.

#### Use cases

- **language use case**: Use it to generate lessons and roadmaps of language learning content, and then create podcasts or voice lessons in your target language.

#### Deep research

You can use notebookLM to perform deep research on google drive files, allowing you to create custom workflows where you can upload a bunch of data to google drive and then have notebookLM perform deep research on them.

Once deep research is created, you can attach it to a project via Gemini gems.

Here is the complete workflow:

1. Ask another model to create a detailed deep research prompt to then input into NotebookLM

```
You are an expert Deep Research Prompt Engineer. Your job is to help me write a detailed, robust research prompt.

I'm building toward this goal: {{describe your project's purpose and the output you want}}

## Step One: Interview
Ask me **one question at a time** to understand:
- What specific data, expertise, and insights I need
- What templates, frameworks, or best practices would be valuable
- What examples or processes I want documented
- How I want the final report structured (tables, pros/cons, trade-offs, ranked recommendations)

Along the way, play devil's advocate: where are the gaps in my thinking? What blind spots or counter-arguments am I missing?

Keep going until you have a complete picture.

## Step Two: Build the Prompt
Once you understand my needs, write a detailed Deep Research prompt in clean Markdown that will:
1. Collect all relevant information on the topic
2. Look for evidence both supporting AND countering the key argument
3. Synthesize it into a comprehensive, well-organized report in the exact format I specified
4. Include actionable examples, processes, and frameworks

---

**Start the interview now.**
```

2. Trigger deep research with NotebookLM using the prompt you gave it
3. Create a gemini gem and attach the specific NotebookLM notebook you created as context

### Perplexity/Comet

#### Shortcuts

In comet, you can register special slash commands that basically just copy and paste a predefined prompt, which is useful for saving keystrokes. Here are some good shortcuts

![perplexity shortcuts](https://substackcdn.com/image/fetch/$s_!bvAb!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F81f10e9e-88e9-4e86-b9c6-5981552a1c1d_1024x1536.png)

#### Context

- Use `@tab` or `@productpage` to reference any open tabs.

### Gemini

#### Gemini spark

Gemini spark is the agentic version of Gemini which can perform actions like scheduled actions, write stuff to your email, etc., and is more proactive.

#### Gemini in email

The best thing about gemini in email is that it has tool access to your entire google workspace.

Here are the main use cases:

- **create calendar event**: using an email as context, tell gemini to add an event to your google calendar.

## MCP

### Deploying to MCP clients

All MCP clients have the same way of deploying, which is listing the commands to run the MCP servers or the existing urls hosting MCP servers in a JSON file like so:

```json
{
  "mcpServers": {
    "local-mcp-server": {
      "command": "deno",
      "args": [
        "run",
        "-A",
        "C:/Users/Waadl/OneDrive/Documents/dbdildev/mcp/local-mcp-server/main.ts"
      ],
      "env": {
        "GOOGLE_GENERATIVE_AI_API_KEY": "Eafsadfdsafasfdsafsd",
        "OPENAI_API_KEY": "sk-pasfsafsadfaHfsadsfdEgsRIsaffdsDNVsafdfsdad"
      }
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_FfadffdsasadRW9p"
      }
    }
  }
}
```

#### Claude desktop

you can add MCP servers in the `~\AppData\Roaming\Claude\claude_desktop_config.json` path

#### Cursor

Go to cursor MCP settings and you can add MCP servers in the `~\.cursor\mcp.json` file, or you can just go to **cursor settings** -> **MCP settings**.

You can also set local MCP settings for your workspace, which is often way more efficient by creating a `.cursor/mcp.json` file:

```json title=".cursor/mcp.json"
{
  "mcpServers": {
    "mcpmcp": {
      "command": "npx",
      "args": ["-y", "mcp-remote@latest", "https://mcpmcp.io/mcp"]
    }
  }
}
```

### Awesome MCP: list of MCP servers

- https://mcpmcp.io/#install: mcp server to ask your agent about what MCP servers there are
- https://github.com/regenrek/deepwiki-mcp: to find info about a specific repo

#### Image transformation MCP servers

```embed
title: "GitHub - BoomLinkAi/image-worker-mcp: Effortlessly resize, convert, optimize, and transform images with a single MCP server—then upload them directly to S3, Cloudflare R2, or Google Cloud Storage. Ideal for AI workflows, automation scripts, and developers who want seamless image handling in one tool."
image: "https://opengraph.githubassets.com/3ff12fed5d0f07d944f7b8289dfc146ad5408466b21a4ecd324c3e83d729a675/BoomLinkAi/image-worker-mcp"
description: "Effortlessly resize, convert, optimize, and transform images with a single MCP server—then upload them directly to S3, Cloudflare R2, or Google Cloud Storage. Ideal for AI workflows, automation scr..."
url: "https://github.com/BoomLinkAi/image-worker-mcp"
favicon: ""
aspectRatio: "50"
```

```embed
title: "GitHub - InhiblabCore/mcp-image-compression: A high-performance image compression microservice based on MCP (Modal Context Protocol)"
image: "https://opengraph.githubassets.com/f710c12e91c1387a11c3dfe14d7a0cd52e8c045d6172bdfa7cc589b8395da83f/InhiblabCore/mcp-image-compression"
description: "A high-performance image compression microservice based on MCP (Modal Context Protocol) - InhiblabCore/mcp-image-compression"
url: "https://github.com/InhiblabCore/mcp-image-compression"
favicon: ""
aspectRatio: "50"
```



### MCP strategies

#### Ideas

- **Github MCP/skill**: The most powerful way to use this MCP server is:
	- **creating issues**: ask claude code to create a github issue, tag other AIs (like claude, jules, gemini cli, codex) as assignees
	- **creating pull requests**: create a nicely formatted pull request
	- **solve issues**: ask claude to look at a specific issue, read it, and then solve it.
- **Playwright**: You can use this to create integration tests and take screenshots.

#### Vibing with MCP

Here is the ultimate way to vibe code using MCP servers:

- **github skill**: create issues, PRs, assign AI bots to your pull requests
- **neon MCP**: connect to a database so the schemas are known at all times.
- **playwright MCP**: Tell it to "make liberal use of Playwright to make sure that UI looks and acts correctly and set up integration tests."
- **context7**: context7 for docs, tell the model to use context7 for some libraries that might be esoteric.

Tech stack:

- **neon auth**
- **neon db**: Use neon with drizzle, and specifically prompt it, "DO NOT MODIFY THE MIGRATIONS DIRECTLY, ONLY USE DRIZZLE"
- **nextjs + typescript + shadcdn + tailwindcss**: specify nextjs 15 modern strategies like limiting client components
- **zod, react query, zustand**

Here is the full vibing prompt

```
---REPLACE PROMPT BELOW-----
I am making a Todoist clone. I want it to have the following features

- Multiple users
- Users can CRUD their todos
- Users can mark their todos as done
- Users cannot share todos - you can assume that a todo belongs to one person
- Users can use tags to tag their todos. Examples would be work, personal, or fun. Users can CRUD tags. A todo can have multiple tags.
- Users can sign, sign out, and log out.
------------------------------

For the tech stack, please use

- Next.js 16 and TypeScript
- shadcn - please use shadcn as the styling method as much as possible to be consistent
- Neon Postgres for the database, connected via neon MCP
- Neon Auth for the auth - please use Context7 to make sure you have up to date docs on Neon Auth
- Drizzle for the ORM
- TypeScript
- ESLint
- Vitest for testing
- Playwright for integration tests

Please:

- include decent coverage of tests
- use Playwright MCP server to test that UI is styled correctly and interactions work as planned
- use Context7 liberally to make sure you have the latest docs for various libraries.
- prepare this to be deployed to Vercel afterwards.
- DO NOT WRITE OR MODIFY MIGRATIONS YOURSELF. ONLY USE DRIZZLE FOR MIGRATIONS.
```

#### Condensing docs

One of the most important uses of MCP is giving online, up-to-date docs for an AI agent to consume. There are two ways you can do this:

- **Context7**: An MCP server that has tools to fetch online documentation and return it as markdown.
- **RepoMix**: Go to the [Repomix website](https://repomix.com/) to download the entire docs as a markdown file you cna then feed into LLMs.





## AI resources

### Voice

```embed
title: "#1 Free AI Voice Generator, Text to Speech, & AI Voice Over"
image: "https://play.ht/PlayAI-VoiceAI-LLM-TTS-ASR-STT-OGcard.png"
description: "The Best AI Voice Generator with 200+ realistic AI voices. PlayAI is the voice platform for creators & enterprises. See our low latency Text to Speech API."
url: "https://play.ht/"
favicon: ""
aspectRatio: "52.33333333333333"
```

```embed
title: "AI Voice Generator and Deepfake Detection for Enterprise | Resemble AI"
image: "https://www.resemble.ai/wp-content/uploads/2025/06/resemble-16x9-1-scaled.jpg"
description: "Resemble AI | Create AI voices and stop deepfakes with models built for enterprise scale and security."
url: "https://www.resemble.ai/"
favicon: ""
aspectRatio: "56.25"
```

```embed
title: "Free AI Voice Generator & Text to Speech Software | Murf AI"
image: "https://cdn.prod.website-files.com/66b3765153a8a0c399c70981/670584e2dab709883eed3793_Home.webp"
description: "Choose form 200+ AI voices and generate speech in 20+ languages. Murf's AI Voice Generator and Text to Speech software lets you create ultra-realistic AI voiceovers in seconds."
url: "https://murf.ai/"
favicon: ""
aspectRatio: "52.5"
```

### image

This lets you create shirts:

```embed
title: "T-shirt Templates - Playground"
image: "https://playground.com/api/og/design/c/t-shirt/opengraph-image"
description: "Discover thousands of customizable T-shirt templates. Perfect for creating unique logos, t-shirts, posters, and more for Etsy, Printify, Stickermule, and beyond!"
url: "https://playground.com/design/c/t-shirt"
favicon: ""
aspectRatio: "52.5"
```

lexica, stable diffusion search engine:

```embed
title: "Lexica"
image: "https://lexica.art/lexica-meta.png"
description: "The state of the art AI image generation engine."
url: "https://lexica.art/"
favicon: ""
aspectRatio: "60"
```
