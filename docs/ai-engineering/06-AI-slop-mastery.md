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
