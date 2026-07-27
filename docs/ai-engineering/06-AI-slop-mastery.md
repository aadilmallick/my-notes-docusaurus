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

#### Free models

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


**Opencode free models**

The endpoint URL is `https://opencode.ai/zen/v1`, with the OpenAI-compatible inference endpoint being `https://opencode.ai/zen/v1/chat/completions`

| Model name             | Model identifier       | Model inference endpoint                      |
| ---------------------- | ---------------------- | --------------------------------------------- |
| Big Pickle             | big-pickle             | `https://opencode.ai/zen/v1/chat/completions` |
| MiMo-V2.5 Free         | mimo-v2.5-free         | `https://opencode.ai/zen/v1/chat/completions` |
| North Mini Code Free   | north-mini-code-free   | `https://opencode.ai/zen/v1/chat/completions` |
| Nemotron 3 Ultra Free  | nemotron-3-ultra-free  | `https://opencode.ai/zen/v1/chat/completions` |
| DeepSeek V4 Flash Free | deepseek-v4-flash-free | `https://opencode.ai/zen/v1/chat/completions` |
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


## LLM websites

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



## Local LLMs

You can use local LLMs in a chat interface either with LMStudio desktop app or the Ollama CLI. 

You can download quantized models off of hugging face or in LM Studio itself.

### Theory

#### Quantization

**quantization** is the idea of precision in model parameters, either letting each parameter have a floating point precision (more precise) or an integer precision (less precise). 

Although it sounds like being more precise would lead to better results - which it does - it also adds up more space to download local models and requires more RAM. To use a model for inference, it has to get loaded into memory, and even the smallest LLM has over 1 billion parameters. Higher precision leads to higher RAM requirements:

- A model with float32 quantization for parameters means each parameter is 32 bits, or 4 bytes, meaning a model with 2 billion parameters would need 8GB of RAM.

Thus quantization allows us to mathematically round the floating point precision parameters to integers, either int4 (4 bit) or int8 (8 bit) to cut down the RAM usage of a model:

- A model quantized with int4 quantization for parameters means each parameter is 4 bits, or 0.5 bytes, meaning a model with 2 billion parameters would only need 1GB of RAM.

> [!TIP]
> quantization allows us to achieve up to 1/2 or 1/4 cutting of RAM usage, while still having only a negligible difference in performance from the more precise unquantized models.

#### Offloading

**offloading** is the technique of loading a model's parameters between CPU, GPU, and RAM, in order to efficiently load a model in memory. 

A main drawback of offloading is that model performance becomes worse, even if memoyr use is more efficient. 
### Lm studio

#### CLI

- `lms ls`: lists all downloaded models
- `lms ps`: lists all currently loaded models in memory
- `lms load <model-id>`: loads a specific model
- `lms unload <model-id>`: unloads a specific model

**listing models**

Show all downloaded models using the `lms ls` command. You have 4 options to consider:

- `--llm`: lists only llm models
- `--json`: lists info in JSON
- `--detailed`: lists details info
- `--embeddings`: prints only embedding models

```
lms ls
```

Example output:

```
You have 47 models, taking up 160.78 GB of disk space.

LLMs (Large Language Models)                       PARAMS      ARCHITECTURE           SIZE
lmstudio-community/meta-llama-3.1-8b-instruct          8B         Llama            4.92 GB
hugging-quants/llama-3.2-1b-instruct                   1B         Llama            1.32 GB
mistral-7b-instruct-v0.3                                         Mistral           4.08 GB
zeta                                                   7B         Qwen2            4.09 GB

... (abbreviated in this example) ...

Embedding Models                                   PARAMS      ARCHITECTURE           SIZE
text-embedding-nomic-embed-text-v1.5@q4_k_m                     Nomic BERT        84.11 MB
text-embedding-bge-small-en-v1.5                     33M           BERT           24.81 MB
```


List only LLM models:

```
lms ls --llm
```

List only embedding models:

```
lms ls --embedding
```

Get detailed information about models:

```
lms ls --detailed
```

Output in JSON format:

```
lms ls --json
```

You can show all currently loaded models with `lms ps`.

Get the list in machine-readable format:

```
lms ps --json
```


**loading into memory**

Load a model into memory by running the following command:

```
lms load <model_key>
```

You can find the `model_key` by first running [`lms ls`](https://lmstudio.ai/docs/cli/ls) to list your locally downloaded models. You also have access to these options:


![](https://i.imgur.com/v3faHML.jpeg)

**unloading from memory**

Unload a single model from memory by running:

```
lms unload <model_key>
```

If no model key is provided, you will be prompted to select from currently loaded models.

To unload all currently loaded models at once:

```
lms unload --all
```

**Server CLI**

You use the `lms server start` command to start the LM studio server

- `lms server start`: starts server with default settings on port 1234
- `lms server start --port <port>`: starts server on specific port
- `lms server start --cors`: opens CORS for all web apps to access

You can use the `lms server stop` command to stop the LM studio server.

You use the `lms server status` command to see the status of the LM studio server

```bash
lms server start # start server
lms server status # get status
lms server stop # stop server
```

You also have these options:

![](https://i.imgur.com/EcHQo7l.png)

Get the status in machine-readable JSON format:

```
lms server status --json --quiet
```

Example output:

```json
{"running":true,"port":1234}
```

**seeing logs**

`lms log stream` allows you to inspect the exact input string that goes to the model.

```
lms log stream
```

Here would be the example output:


![](https://i.imgur.com/yr5QsPH.jpeg)


#### Programming

You can hit API endpoints for models that your load onto the LM studio server, which runs on `localhost:1234`.

There are three different ways to run the LMS studio server and hit up the endpoints:

1. Basic rest API
2. Open AI SDK (compatibility version)
3. LM studio Python SDK
4. LM studio TS SDK

##### Open AI Compatibility

Using models with LM studio is completely compatible with the openAI sdk. All you have to do is to pass the `base_url` parameter and point that to the LM studio server endpoint, like so:

```python
from openai import OpenAI

client = OpenAI(
  base_url="http://localhost:1234/v1", # LM Studio endpoint on port 1234
  api_key="something-doesnt-matter", # doesn't matter, but should pass value
)
```

And here is an example showing just how simple and compatible the OpenAI SDK is to use with LM studio models

```python
from openai import OpenAI

client = OpenAI(
  base_url="http://localhost:1234/v1",
  api_key="something-doesnt-matter",
)

response = client.chat.completions.create(
  model="gemma-3-12b-it-qat",
  messages=[
    {
      "role": "system",
      "content": "You are a helpful and friendly assistant."
    },
    {
      "role": "user",
      "content": "What is the meaning of life?"
    }
  ],
  temperature=0.7,
)

print(response.choices[0].message.content)
```

##### LM studio TS sdk

fIrst install with this:

```bash
npm install @lmstudio/sdk --save
```

And here's a quickstart:

```ts
import { LMStudioClient } from "@lmstudio/sdk";
const client = new LMStudioClient();

const model = await client.llm.model("llama-3.2-1b-instruct");
const result = await model.respond("What is the meaning of life?");

console.info(result.content);
```

### OLlama

OLLama is a CLI tool for installing and running local models. Here is an example that automatically installs and runs llama 3.2

```bash
ollama run llama3.2
```

In fact, here's a list of all CLI commands you can run:

![](https://i.imgur.com/acwfO9j.jpeg)

#### rUnning models

When chatting with ollama models, you have access to these slash commands:

```
Available Commands:
  /set            Set session variables
  /show           Show model information
  /load <model>   Load a session or model
  /save <model>   Save your current session
  /clear          Clear session context
  /bye            Exit
  /?, /help       Help for a command
  /? shortcuts    Help for keyboard shortcuts
```

Since you have to chat using the CLI in a purely text based ways, there are a few caveats to keep iin mind when trying to chat with OLLama:

- **multiline text**: ANy multiline text needs to be encased in triple double quotes
- **images**: To refer to images or files, you just write out the relative path to that file in your prompt. Any filepaths you refer to MUST MUST MUST be at the end of your prompt, after any text.
- **system message**: run the `/set system <message>` command to change the model's system message for the chat duration

**saving chats**

To save chats, you can use the `/save <chat-name>` and `/load <chat-name>` to load a chat. These commands save and load the chat respectively with the hyperparameters, chat history, and system message all set and saved.

**/show command**

```
Available Commands:
  /show info         Show details for this model
  /show license      Show model license
  /show modelfile    Show Modelfile for this model
  /show parameters   Show parameters for this model
  /show system       Show system message
  /show template     Show prompt template
```

If you run the `/show system` command, you can see the system message for the model.

**/set command**

```
>>> /set
Available Commands:
  /set parameter ...     Set a parameter
  /set system <string>   Set system message
  /set history           Enable history
  /set nohistory         Disable history
  /set wordwrap          Enable wordwrap
  /set nowordwrap        Disable wordwrap
  /set format json       Enable JSON mode
  /set noformat          Disable formatting
  /set verbose           Show LLM stats
  /set quiet             Disable LLM stats
  /set think             Enable thinking
  /set nothink           Disable thinking
```

- `/set system <message>` : changes the model's system message for the chat duration
- `/set parameter`: shows the parameters of the model you can change

#### managing models

- `ollama list`: lists all models you have installed.
- `ollama ps`: lists all currently running models.
- `ollama rm <model-name>`: deletes a model by its name.
- `ollama show <model-name>`: shows more info on the specified model.

> [!TIP]
> You can find the parameters for a model on the ollama page for a model or through `ollama show` command.

#### Model env vars

These are the env vars you should set on a model in order to make OLLAMA more efficient:


![](https://i.imgur.com/aq94hHQ.jpeg)
 
#### Modelfiles

**Modelfiles** are essentially the Dockerfile version of creating LLMs, blueprinting them with system prompts, hyperparameter values, and message history.

Here are the directives you can use:

| Instruction                                                                                     | Description                                                    |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| [`FROM`](https://github.com/ollama/ollama/blob/main/docs/modelfile.md#from-required) (required) | Defines the base model to use.                                 |
| [`PARAMETER`](https://github.com/ollama/ollama/blob/main/docs/modelfile.md#parameter)           | Sets the parameters for how Ollama will run the model.         |
| [`TEMPLATE`](https://github.com/ollama/ollama/blob/main/docs/modelfile.md#template)             | The full prompt template to be sent to the model.              |
| [`SYSTEM`](https://github.com/ollama/ollama/blob/main/docs/modelfile.md#system)                 | Specifies the system message that will be set in the template. |
| [`ADAPTER`](https://github.com/ollama/ollama/blob/main/docs/modelfile.md#adapter)               | Defines the (Q)LoRA adapters to apply to the model.            |
| [`LICENSE`](https://github.com/ollama/ollama/blob/main/docs/modelfile.md#license)               | Specifies the legal license.                                   |
| [`MESSAGE`](https://github.com/ollama/ollama/blob/main/docs/modelfile.md#message)               | Specify message history.                                       |
Here is an example modelfile:

```dockerfile
FROM llama3.2
# sets the temperature to 1 [higher is more creative, lower is more coherent]
PARAMETER temperature 1
# sets the context window size to 4096, this controls how many tokens the LLM can use as context to generate the next token
PARAMETER num_ctx 4096

# sets a custom system message to specify the behavior of the chat assistant
SYSTEM You are Mario from super mario bros, acting as an assistant.

# adds message history
MESSAGE user "Hi mario, what's up?"
MESSAGE assistant "whats a up mamma mia you piece of shit!"
```


To use this:

1. Save it as a file (e.g. `Modelfile`)
2. `ollama create choose-a-model-name -f <location of the file e.g. ./Modelfile>`
3. `ollama run choose-a-model-name`
4. Start using the model!

```bash
# 1. create the modelfile and use it
ollama create <new-model-name> -f ./Modelfile
ollama run <new-model-name>
```

To view the Modelfile of a given model, use the `ollama show --modelfile` command.

#### Ollama server

Run `ollama serve` to start the server, but ollama runs on `localhost:11434` automatically when you start it.

#### Ollama API

**API fetching**

**open ai compatible**

You can use the openAI compatibility API through setting the `baseUrl` property to `localhost:11434/v1` endpoint.

```
```

**vercel ai**

Through the openAI compatibility endpoint, you can use ollama models on vercel AI.

```ts
import { createOpenAICompatible } from "npm:@ai-sdk/openai-compatible";

 function get_ollama(modelName: string) {
    const model = createOpenAICompatible({
      name: "ollama",
      baseURL: `http://localhost:11434/v1`,
      apiKey: "1234567890",
    });
    return {
      model: model(modelName),
      modelOptions: {
        maxRetries: 0,
      },
    };
  },
```

**python sdk**

**js sdk**

The JS sdk is super easy to use through the `ollama` package:

```ts
import ollama from 'ollama'

const response = await ollama.chat({
  model: 'llama3.1',
  messages: [{ role: 'user', content: 'Why is the sky blue?' }],
})
console.log(response.message.content)
```

You can also stream messages:

```ts
import ollama from 'ollama'

const message = { role: 'user', content: 'Why is the sky blue?' }
const response = await ollama.chat({
  model: 'llama3.1',
  messages: [message],
  stream: true,
})
for await (const part of response) {
  process.stdout.write(part.message.content)
}
```

**custom sdk**

Made with the power of gemini

```ts
import { z } from "npm:zod";

// Base URL for the Ollama API
const OLLAMA_API_BASE_URL = "http://localhost:11434/api";

// Zod Schemas for API validation

const ModelDetailsSchema = z.object({
  parent_model: z.string(),
  format: z.string(),
  family: z.string(),
  families: z.array(z.string()).nullable(),
  parameter_size: z.string(),
  quantization_level: z.string(),
});

const ModelSchema = z.object({
  name: z.string(),
  model: z.string(),
  modified_at: z.string(),
  size: z.number(),
  digest: z.string(),
  details: ModelDetailsSchema,
});

const ListModelsResponseSchema = z.object({
  models: z.array(ModelSchema),
});

const GenerateCompletionOptionsSchema = z
  .object({
    temperature: z.number().optional(),
    seed: z.number().optional(),
    top_k: z.number().optional(),
    top_p: z.number().optional(),
    min_p: z.number().optional(),
    repeat_last_n: z.number().optional(),
    repeat_penalty: z.number().optional(),
    presence_penalty: z.number().optional(),
    frequency_penalty: z.number().optional(),
    stop: z.array(z.string()).optional(),
  })
  .partial();

const GenerateCompletionRequestSchema = z.object({
  model: z.string(),
  prompt: z.string(),
  suffix: z.string().optional(),
  images: z.array(z.string()).optional(),
  think: z.boolean().optional(),
  format: z.union([z.literal("json"), z.any()]).optional(),
  options: GenerateCompletionOptionsSchema.optional(),
  stream: z.boolean().optional(),
  raw: z.boolean().optional(),
  keep_alive: z.string().optional(),
});

const GenerateCompletionResponseSchema = z.object({
  model: z.string(),
  created_at: z.string(),
  response: z.string(),
  done: z.boolean(),
  context: z.array(z.number()).optional(),
  total_duration: z.number().optional(),
  load_duration: z.number().optional(),
  prompt_eval_count: z.number().optional(),
  prompt_eval_duration: z.number().optional(),
  eval_count: z.number().optional(),
  eval_duration: z.number().optional(),
});

const MessageSchema = z.object({
  role: z.enum(["system", "user", "assistant", "tool"]),
  content: z.string(),
  images: z.array(z.string()).optional(),
});

const GenerateChatRequestSchema = z.object({
  model: z.string(),
  messages: z.array(MessageSchema),
  tools: z.array(z.any()).optional(),
  think: z.boolean().optional(),
  format: z.union([z.literal("json"), z.any()]).optional(),
  options: GenerateCompletionOptionsSchema.optional(),
  stream: z.boolean().optional(),
  keep_alive: z.string().optional(),
});

const GenerateChatResponseSchema = z.object({
  model: z.string(),
  created_at: z.string(),
  message: MessageSchema,
  done: z.boolean(),
  total_duration: z.number().optional(),
  load_duration: z.number().optional(),
  prompt_eval_count: z.number().optional(),
  prompt_eval_duration: z.number().optional(),
  eval_count: z.number().optional(),
  eval_duration: z.number().optional(),
});

const GenerateEmbeddingsRequestSchema = z.object({
  model: z.string(),
  input: z.union([z.string(), z.array(z.string())]),
  truncate: z.boolean().optional(),
  options: GenerateCompletionOptionsSchema.optional(),
  keep_alive: z.string().optional(),
});

const GenerateEmbeddingsResponseSchema = z.object({
  model: z.string(),
  embeddings: z.array(z.array(z.number())),
  total_duration: z.number().optional(),
  load_duration: z.number().optional(),
  prompt_eval_count: z.number().optional(),
});

// Type Definitions from Zod Schemas
type ListModelsResponse = z.infer<typeof ListModelsResponseSchema>;
type GenerateCompletionRequest = z.infer<
  typeof GenerateCompletionRequestSchema
>;
type GenerateCompletionResponse = z.infer<
  typeof GenerateCompletionResponseSchema
>;
type GenerateChatRequest = z.infer<typeof GenerateChatRequestSchema>;
type GenerateChatResponse = z.infer<typeof GenerateChatResponseSchema>;
type GenerateEmbeddingsRequest = z.infer<
  typeof GenerateEmbeddingsRequestSchema
>;
type GenerateEmbeddingsResponse = z.infer<
  typeof GenerateEmbeddingsResponseSchema
>;

/**
 * A TypeScript class to interact with the Ollama API in a typesafe way.
 */
export class OllamaAPI {
  private baseUrl: string;

  constructor(baseUrl: string = OLLAMA_API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async post<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return response.json();
  }

  private async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    return response.json();
  }

  /**
   * Lists all models available locally.
   */
  async listModels(): Promise<ListModelsResponse> {
    const response = await this.get("/tags");
    return ListModelsResponseSchema.parse(response);
  }

  /**
   * Generates a completion for a given prompt.
   * @param request The request object for generating a completion.
   * @returns The generated completion.
   */
  async generateCompletion(
    request: GenerateCompletionRequest
  ): Promise<GenerateCompletionResponse> {
    const validatedRequest = GenerateCompletionRequestSchema.parse(request);
    const response = await this.post("/generate", validatedRequest);
    return GenerateCompletionResponseSchema.parse(response);
  }

  /**
   * Generates the next message in a chat.
   * @param request The request object for generating a chat completion.
   * @returns The generated chat message.
   */
  async generateChat(
    request: GenerateChatRequest
  ): Promise<GenerateChatResponse> {
    const validatedRequest = GenerateChatRequestSchema.parse(request);
    const response = await this.post("/chat", validatedRequest);
    return GenerateChatResponseSchema.parse(response);
  }

  /**
   * Generates embeddings for a given input.
   * @param request The request object for generating embeddings.
   * @returns The generated embeddings.
   */
  async generateEmbeddings(
    request: GenerateEmbeddingsRequest
  ): Promise<GenerateEmbeddingsResponse> {
    const validatedRequest = GenerateEmbeddingsRequestSchema.parse(request);
    const response = await this.post("/embed", validatedRequest);
    return GenerateEmbeddingsResponseSchema.parse(response);
  }
}

```

## Important local models
### OpenAI Whisper

#### Python

Here is how you can use open ai whisper to transcribe or translate audio files:

```ts
import whisper

model = whisper.load_model("base.en")

filepath = os.path.join(pathlib.Path.home(), "Downloads", "totranscribe.webm")
result = model.transcribe(filepath)

print(result["text"])
```

Here are the different models you have access to, all unquantized.

- `"tiny.en"`: the smallest english version, at 39M params
- `"base.en"`: the smallest english version, at 74M params

#### Command line

- `whisper <audio-file-path>`: transcribes the audio file with auto detecting the language

Here are the different options you have
- `--model <model>`: chooses the specific model
- `--language <language-code>`: specifies the language the audio file is in. Pass in a language code, like `en` or `es`.

### TranslateGemma

This is an Ollama LLM that excels at translation.


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
