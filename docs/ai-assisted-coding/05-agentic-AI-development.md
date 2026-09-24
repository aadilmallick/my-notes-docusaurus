
## AI agent basics

### What is an agent and harness?

AI agents operate through a cyclical process known as the **agent loop**

Because AI models are stateless—meaning they forget everything between requests—the **agent harness** acts as the manager that maintains this loop

**Agentic frameworks** like Strands Agents abstract away the orchestration, reasoning, and agentic loop layer, and your job is to create the harness (tools, memory system)

#### **agentic loop**

Here is how the agentic loop works:


1. **Context Assembly:** The model is provided with a system prompt, user instructions, relevant memories, and a list of available tools 
2. **Reasoning:** The model analyzes this context and decides whether it needs to use a tool to solve the task 
3. **Tool Execution:** If a tool is required, the harness executes it, and the results are fed back into the context 
4. **Iteration:** This cycle repeats, with the model reasoning over the new information until the task is complete and there are no more tools the AI wants to call, so you return the final text response to the user

![](https://github.com/aws-samples/sample-building-with-strands-course/raw/main/samples/01-agent-loop/agent-loop-flow.png)

So basically:

1. Model receives **context** (system prompt + user input + tool list + history)
2. Model **reasons** and decides whether to call a tool
3. Tool **executes**, result feeds back into context
4. Loop **repeats** until the task is complete
#### **harness**

An **agent harness** is the essential system built _around_ an AI model to make it operational and effective in production.

While the model acts as the brain, the harness provides the hands, the infrastructure and memory that allow an agent to do real work.

The **harness** is the system that surrounds the model and turns it into an agent. It handles the agent loop, tool execution, context management, memory, lifecycle control, observability, and verification.

> [!NOTE]
> Together, **model + harness = agent.**


![](https://i.imgur.com/ZKmVV33.jpeg)

> [!NOTE]
> The main problem nowadays is trying to build an effective agent harness that is provider-agnostic and stands the test of time as new models come out. 



While the agent refers strictly to the model's decision-making capabilities, the harness acts as the **runtime environment** that manages the agent's behavior in these 4 core components:

- **Loop Management:** Models are inherently stateless, meaning they process one request at a time and then forget everything. The harness manages the "agent loop," repeatedly invoking the model, updating context, and executing tools
- **Environment Connectivity:** It exposes tools (like file operations, shell access, or web searches) and connectors that allow the model to interact with the real world 
- **Context Engineering:** It decides what information is fed into the model’s context window—such as system prompts, memories from previous turns, and tool results—to guide the model’s reasoning
- **Operational Guardrails:** The harness enforces boundaries, adds validation layers to verify outcomes, and allows for features like "human-in-the-loop" interventions when high-stakes actions are required 

![](https://github.com/aws-samples/sample-building-with-strands-course/raw/main/samples/01-agent-loop/agent-harness.png)

> [!NOTE]
> Basically, a harness manages the autonomous agentic loop, deciding when to execute tools or orchestrate to subagents, updating context, factoring in guardrails, and deciding when the loop continues.

> [!NOTE]
> A good agent harness helps verify whether the actions an agent took actually worked.

#### WTF is harness engineering

Some terminology:

- **Prompt Engineering:** Instructions and constraints sent to the model
- **Context Engineering:** What information enters the context window, when, and how
- **Harness Engineering:** The runtime system orchestrating everything

**Harness engineering** is the process of creating and tuning the **runtime system** that orchestrates the model. This includes managing context, connecting tools, enforcing rules (guardrails), and providing necessary compute, memory, and observability.

The goal of harness engineering is to allow the agent to drive most of the work on its own while the developer takes care of the boundaries and plugins. 

In harness engineering, here is what the developer manages:

- **tools and custom tools**: providers deterministic behavior
- **validation layers**: add validation layers to verify outcomes
- **guardrails**: add guardrails to prevent unsafe content and add human-in-the-loop

What is the difference between harness engineering and normal agentic engineering?

Normal agentic engineering in the past was just giving agents the tools while you wrote the orchestration and tool delegation layer yourself. Harness engineering aims to use agent frameworks to abstract all of that, including:

- context management with automatically compacting context
- guardrails for policy and content safety and controlling the max iterations
- maintaining a tool registry
- verification to make sure the agent does correct actions and steer it in the right direction

> [!IMPORTANT]
> The harness is the infra around the agent loop. It is not the agent loop itself.

### Agentic libraries

There is a difference between an agentic library and a coding harness. 

Roughly speaking, an agentic library is a small abstraction over just calling the raw AI inference SDKs, where the agentic library handles small stuff like the agent loop and agent orchestration for you, but you have to do everything else like supply tools, add hooks, add prompts, create subagents, etc.

- **Agentic libraries**: code SDKs that have varying degrees of how much harness ownership you have, but they all let you add your own logic into the harness via code.
	- **libraries that take care most of the work**: Libraries like Strands and OpenAI Agents SDK have built out most of the harness for you, including prebuilt tools, web search, hooks, and more.
	- **libraries that give you full control**: libraries like Google ADK, Langchain, and Langgraph, expect you to take care of everything, including the agent loop, but they take care of simple stuff like agent orchestration.
- **coding harness**: a prebuilt product that you use as a harness over the agent. An example is Claude code.

Here's an interview talking point that explains the differences between different agentic libraries:

>"When building agentic workflows for administrative automation at HHMI, I choose the orchestration framework based on the risk profile of the task. If we are building a flexible research exploration assistant, a model-driven approach like Strands lets the LLM dynamically reason and pick tools with minimal boilerplate. But for high-consequence administrative workflows—like automated resource provisioning or policy actions—I lean toward LangGraph to enforce explicit state machines, checkpointing, and hard human-in-the-loop approval gates before any execution step occurs."

Here's a comparison of strands vs langgraph

| **Dimension**      | **Strands (Model-Driven)**                                                      | **LangGraph (Graph-Driven)**                                                                                    |
| ------------------ | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Primary Driver** | The LLM's internal reasoning loop.                                              | Explicit developer-defined state machine edges.                                                                 |
| **Boilerplate**    | Very low. Write a function, add `@tool`, pass to `Agent`.                       | High. Requires state definitions, nodes, and routing logic.                                                     |
| **Determinism**    | Lower. Emergent behavior; great for open-ended research or discovery.           | High. Enforces strict execution paths and safety boundaries.                                                    |
| **Best Used For**  | Rapid prototyping, flexible workflows, text processing, and multi-agent swarms. | High-consequence enterprise actions (database writes, provisioning, financial triggers) requiring audit trails. |

- **Using Strands:** Ideal when you want to spin up a quick microservice wrapper around internal documentation, letting an agent query models via Amazon Bedrock, Anthropic, or OpenAI with minimal overhead. You rely on hooks and streaming limits to keep the agent from looping infinitely.
    
- **Using LangGraph:** Ideal when building administrative accelerator tools at HHMI that cross boundary lines—such as an automated resource request workflow that requires state persistence, pause/resume capability, and strict **human-in-the-loop** approval before execution.
#### Strands Agents

Strands Agents is an agentic coding library made from AWS that goes for a model-driven approach where the harness is kind of out of the way and the model is basically driving all the execution. The harness is just there to support the model. 

- **What it is:** An open-source, lightweight SDK created by AWS where the LLM itself drives the execution loop.
    
- **How it works:** You define a system prompt, supply tools as simple Python or TypeScript functions (decorated with something like `@tool`), and hand them to an agent object. The model natively plans, reasons, chooses tools, reads outputs, and loops until the task is complete.
    
- **When to use it:** For speed, flexibility, and rapid prototyping when you trust the frontier model's reasoning to handle the sequence dynamically.

In Strands, you define the prompt and tools, and the LLM handles the execution loop autonomously (ReAct: reason, act, observe). Python uses native type hints and docstrings to automatically expose tools:

```py
from strands import Agent, tool

@tool
def search_system_logs(query: str, hours: int = 24) -> list:
    """Search enterprise application logs by keyword and time window.
    
    Args:
        query: The search term (e.g., 'timeout', 'DB_Error')
        hours: How many hours back to search
    """
    # Simulated log searching logic
    return [f"Found log matching '{query}' from {hours}h ago"]

# Instantiate the agent with system instructions and tools
agent = Agent(
    system_prompt="You are an administrative infrastructure assistant helping diagnose operational bottlenecks.",
    tools=[search_system_logs]
)

# The agent autonomously executes the loop until the task is complete
response = agent("Find all timeout errors from the last 6 hours and summarize them.")
print(response)
```

#### Langgraph

In LangGraph, you explicitly construct a state machine (nodes and conditional edges). You control the exact routing paths, state schema, and where human checkpoints occur:

- **What it is:** A lower-level orchestration framework from the LangChain team where you define an explicit state machine (nodes, edges, and a typed state schema).
    
- **How it works:** You explicitly map out every path the agent can take. Determinism is favored over pure emergence. It features built-in **checkpointing**, allowing for pause/resume functionality, time-travel debugging, and explicit **human-in-the-loop** approval gates.
    
- **When to use it:** For high-stakes enterprise workflows where an agent _cannot_ improvise an unauthorized path—such as executing database writes or triggering administrative payouts—requiring strict audit trails and human approval gates.

```py
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
import operator

# 1. Define the explicit state schema
class WorkflowState(TypedDict):
    messages: Annotated[list, operator.add]
    requires_approval: bool

# 2. Define node functions
def reasoning_node(state: WorkflowState):
    # Model decides the next action based on state
    return {"messages": ["Model generated an administrative plan."]}

def execution_node(state: WorkflowState):
    # Executes the tool deterministically
    return {"messages": ["Tool executed successfully."]}

# 3. Build the graph topology
workflow = StateGraph(WorkflowState)
workflow.add_node("reasoning", reasoning_node)
workflow.add_node("execution", execution_node)

workflow.set_entry_point("reasoning")

# Define deterministic routing rules
def route_decision(state: WorkflowState):
    if state.get("requires_approval"):
        return "human_review"
    return "execution"

workflow.add_conditional_edges(
    "reasoning",
    route_decision,
    {"execution": "execution", "human_review": END}
)

app = workflow.compile()
```



## Nontechnical AI agent basics
### Prompt engineering for AI agents

#### Developing the system prompt

To successfully build an AI agent, you need to scope it to a specific goal and outcome:

1. **goal**: What is the goal of the agent? What outcome do you want it to produce? 
	- Don't tell the agent what to do - it probably know better than you - just tell it where to go.
2. **why**: Why are you trying to accomplish this goal? Why build this agent to achieve this goal?
	- Answering this question will lead to better context. 
3. **DOD (definition of done)**: Write one sentence which is **specific** and **measurable** which defines a criteria of when the agent can consider itself done with the task. 
	- If you don't know when a task is considered completed, how will the agent know?
4. **identity**: Give the agent an identity via a identity markdown files, since benchmarks show that if you scope an agent to a specific identity, it will perform better on tasks related to that identity.
	- `SOUL.md`: describes personality of the agent
	- `IDENTITY.md`: describes purpose and identity of the agent
	- `USER.md`: profile context doc of user 


**Identity**

To build the identity files out, just ask this prompt:

>I want to build an AI agent that `<purpose here>` so create three identity files. A `SOUL.md` file, an `IDENTITY.md` file, and a `USER.md` file. Ask me any questions you need to fill these in accurately then write all three.


#### AI agent examples

**Email manager**

For the `IDENTITY.md` file, this is what I would put:

- **goal**: to manage email inbox, read emails and summarize them then text me summary, notify me of important emails like transactions, personal DMs, and payments, automatically draft important replies and notify me when drafted, also have ability to manually unsubscribe from email address senders.
- **why**: to improve productivity and look at my email less, and never miss important emails
- **constraints**: never delete emails, never touch calendar 

For the `USER.md` file, this is what I would put:

- **who am I**: I manage several email inboxes and receive many emails eveyrday, a lot of them are just promotions so I want you to flag them for unsubscription, and also summarize important emails to me and then send me that summary as a daily brief. I consider important anything related to guitar or piano, and any payments/transactions to my account, and any personal emails or DMs (nonpromotional).

### Agent orchestration

Agents should be scoped to have one single responsibility.

If we want an agent to do multiple things, instead we should break up that agent into many separate agents each with a single responsibility, and then with one orchestrator agent to orchestrate and delegate tasks among all the other sub-agents.


![](https://i.imgur.com/GDqWgGK.jpeg)

The orchestrator agent can also have other tasks rather than just subagent task delegation. It should also be able to do these things:

- **subagent communication**: facilitate two-way communication between orchestrator/manager and the subagents.
- **subagent management**: change anything about a subagent

Here is a prompt to create a manager agent:

>"You are my manager agent. You never do any task yourself. When a job comes in, your only move is to spin up a dedicated sub agent for that one job, enter the task, and let it run. One agent, one lane. If a job touches on multiple areas, split it into separate sub agents one per area. You coordinate and report back to me."

## Agentic AI Development

### Agent fundamentals

#### What is an Agent?

Agents are proactive in determining what tools to use, and can take action without human input. They can generate chains of tool calls because essentially they just run in a loop.

Agents are best suited for multi-step, dynamic problems.

All agents are composed of three building blocks:

1. **Model**: the LLM being used. This component makes the decisions for which tools to use and whether to continue the chain of tool use or stop and output a response.
2. **Tools**: MCP, skills, etc.
3. **Orchestration**: the inner workings of the agent loop and how input is passed to the LLM.

Here is when to use agents over normal LLM calls:

- Use agents when you need reasoning + adaptation + multi-step execution.
- Skip agents when the task is simple, single-step, or deterministic.

#### Agent loop

Intelligent agents don't just act - they plan. here is the main loop:

![](https://i.imgur.com/GMLd5Q9.jpeg)

1. **Perceive**: plans how to comply with user's query
2. **Think**: selects which tool to use
3. **Act**: executes tool
4. **Check**: based on tool response, checks if the tool result has finished what the user wants and either ends and spits out a response or continues the loop.

Here's an example of the loop in action:

![](https://i.imgur.com/WndAbQF.jpeg)

### Agents with MCP

#### MCP problem

The main problem with MCP comes with tool bloat. When you have too many tools, all the descriptions of how to use the tools take up too many tokens.

To fix this issue, use **tool filtering** to select only the relevant tools from an MCP server to pass to your agent.

### Hooks

Hooks are like the middleware for the agent lifecycle, which lets you deterministically inject logic into the lifecycle at specific points to either block or allow certain actions to happen. 


![](https://i.imgur.com/cJ3qqML.jpeg)


Hooks add deterministic control to a probabilistic loop. They inject code at lifecycle events - before/after tool calls and before/after the agent loop - without changing the agent's logic. Unlike tools (which the model decides to use), hooks fire automatically every time, regardless of what the model reasons.

A runaway loop could call the same tool dozens of times. A model might attempt a destructive operation without asking. Hooks solve this by enforcing rules that don't depend on the model "deciding" to behave.

> [!NOTE]
> Human-in-the-loop is one of the most common use cases for hooks, where a `PreToolUse` hook gets triggered and blocks awaiting user input before deciding whether to block or allow the action.


![](https://i.imgur.com/7VkJCtB.jpeg)


### Orchestration

Up until now, you've been a **conductor**—working with ONE AI agent at a time, guiding it step-by-step or setting up autonomous patterns to let it self-direct. But there's a ceiling to what one agent can achieve, bounded by a single context window and sequential execution.

Now you're ready to become an **orchestrator**—overseeing an entire symphony of MULTIPLE AI agents working in parallel, each with their own focus, autonomy, and capability to independently carry out complex implementation tasks.

**The core idea:** You oversee an entire **team** of autonomous coding agents working in parallel. 

- You set high-level goals, define tasks, and let a team of specialized agents independently carry out implementation.
- Instead of micromanaging every function or bug fix, you focus on **coordination, quality control, and integration**.

**How it feels:**

- **Asynchronous execution:** Agents work in the background—while you attend to design, architecture, or other strategic work, your "AI team" is coding
- **No step-by-step micromanagement:** You don't see every intermediate step unless you choose to "peek"
- **Quality gate:** When agents are done, they hand you completed work (with tests, docs) as pull requests for you to review
- **Like delegation:** It's analogous to a tech lead assigning issues to multiple developers and reviewing their PRs, except your "developers" are AI agents with perfect consistency and zero ego

Here are the key characteristics of the orchestrator paradigm:

**1. Autonomous agents**

- Can plan and execute multi-step coding tasks with minimal intervention
- Understand project structure, dependencies, and your coding standards
- Self-correct when tests fail

**2. Full agency**

- Clone repos, create branches, edit multiple files in parallel
- Compile/run tests, see results, refine code iteratively
- Push commits and open PRs without waiting for human approval at each step

**3. Transparency without overhead**

- You don't see every intermediate keystroke
- You verify the final outcome through code review
- You can opt-in to watch a specific agent's work in real-time if needed

**4. Tracked, persistent workflows**

- Everything lives in version control (git) and CI pipelines
- Audit trail of what each agent did and why
- Easy rollback if something goes wrong

**5. True concurrency**

- Spin up multiple agents to tackle different tasks simultaneously
- One agent refactors components while another writes tests, while a third updates docs
- Work that would take hours sequentially can happen in parallel

#### Subagents

**Subagents** are focused child AI agents spawned by a parent orchestrator to handle specific, self-contained tasks. The subagent does its work, reports back to the parent, and the parent integrates the results.

**Key difference from swarms**: Subagents don't communicate with each other. They report to a central orchestrator who coordinates the overall effort.

Use subagents when:

- A task can be cleanly divided into independent subtasks
- Subtasks are self-contained (minimal interdependencies)
- You want specialized expertise for each subtask
- Results need to be reviewed before integration

Don't use subagents when:

- Subtasks heavily interdepend (use swarms instead)
- The overall task is small (overhead not worth it)
- Real-time coordination between agents is needed

#### Agent teams and swarms

Swarms are subagents that have locks on certain files, intended to work on truly decoupled parts of projects in parallel as to not interfere with each other:

- **swarm**: run truly in parallel as main agents wither on different worktrees, or working on different parts of the projects
	- **communication**: each agent in the fleet can communicate with each other
- **subagents**: orchestrated by the main agent, may have dependency order on other tasks or subagents, more lightweight and less risk of overwriting each others' work because main agent is the one orchestrating them.
	- **communication**: each subagent can communicate with the main parent agent, which facilitates communication to all the children subagents.

Agent teams are best when you have three components:

1. **shared type file**: A shared types file acts as a contract that all agents import and build against. This ensures consistency across components and prevents mismatches in interfaces or data structures.
2. **File Ownership:** Each agent has clear ownership of specific files or components to avoid overlapping work and conflicts.
3. **Task List communication:** Tasks are managed through a shared task list that all agents access. This list tracks task states such as pending, in progress, or completed. Agents communicate progress and coordinate through this task list rather than sharing files directly, which helps prevent merge conflicts.


Use agent teams when:

- Multiple agents can work on truly independent tasks in parallel
- Tasks might need mid-stream coordination (blockers, shared utilities)
- The overall timeline is tight (parallel >> sequential)
- You want real-time collaboration between agents

Don't use agent teams when:

- Tasks have strict sequential dependencies (use subagents)
- The codebase is small enough for one agent
- Token cost is a concern (each teammate is a full instance)

The best use cases for agent teams arises when there is the least probability for conflicts, like simple research work or bug finding:

- **parallel research work**: research competing hypotheses to fix a bug or to research multiple different libraries then compare them after.

## Loop engineering

### Ralph loop

The RALPH loop is an autonomous AI development pattern that runs AI coding tools like Claude Code repeatedly in a loop to implement software features with minimal human input. 


Here's how it works in detail:  
  

- **Task Breakdown:** You start with a product requirements document (PRD) that you convert into a structured JSON file (`prd.json`). This file breaks down the project into small, self-contained user stories, each with acceptance criteria and a "passes" flag indicating completion.  
      
    
- **Fresh AI Instances:** Each iteration of the loop spawns a fresh AI instance with a clean context window. This avoids context overflow and helps the AI focus on one small task at a time.  
      
    
- **Persistent Memory:** Instead of relying on the AI's limited context, memory persists across iterations through your git commit history, a `progress.txt` file that logs learnings, and the `prd.json` task list.  
      
    
- **Implementation Cycle:** The loop picks the highest priority user story marked as incomplete, has the AI implement it, runs quality checks like type checking and tests, and if successful, commits the changes and marks the story as complete.  
      
    
- **Self-Improvement:** The AI appends learnings and insights from each iteration to the progress file, which the next AI instance reads to improve its work.  
      
    
- **Completion:** The loop continues picking and completing stories until all are marked as passing, then it exits.

Ralph works in a three step workflow:

1. **Write a PRD** — Define what you want built in plain markdown
2. **Generate `prd.json`** — Break the PRD into user stories, each with a `"passes": false` field
3. **Run `ralph.sh`** — The script loops, spawning a fresh AI instance per iteration

Ralph approach: each iteration starts fresh. The AI reads `prd.json` (what to do), `progress.txt` (what was learned), and git history (what was built). This means:

- **No context overflow** — each iteration uses a fraction of the context window
- **Compound learning** — `progress.txt` captures gotchas so later iterations avoid them
- **Natural checkpoints** — every iteration produces a git commit you can roll back to

Here's the ralph infrastructure:

- `scripts/ralph/ralph.sh` — The loop script (adapted from snarktank/ralph)
- `prd.json` — User stories with pass/fail tracking
- `progress.txt` — Append-only learnings from each iteration
- `CLAUDE.md` — Prompt template for each AI instance

#### Workflow in depth

The Ralph loop work as follows at a high level:

1. Convert a PRD into a list of user stories, each one with a priority level, acceptance criteria, and testing pattern, stored in `prd.json`
2. Ralph completes user stories one at a time in order of highest priority, updating documentation memory (`progress.txt`), then clearing the context after a user story's acceptance criteria has been fulfilled.
3. It keeps looping, completing user stories until all of them have been completed.

Use the ralph github repo:

```embed
title: "GitHub - snarktank/ralph: Ralph is an autonomous AI agent loop that runs repeatedly until all PRD items are complete."
image: "https://opengraph.githubassets.com/741878d7e5fc8b6c2ca039ff7f1863b5c2bf3aeebee122821e73598ce177b58c/snarktank/ralph"
description: "Ralph is an autonomous AI agent loop that runs repeatedly until all PRD items are complete.  - snarktank/ralph"
url: "https://github.com/snarktank/ralph"
favicon: ""
aspectRatio: "50"
```


Here's how to install the Ralph skill:

```md
/plugin marketplace add snarktank/realph
```

The ralph plugin installs two skills:

- `/prd`: creates a PRD and a goal to accomplish
- `/ralph`: converts the PRD into a `prd.json` for memory

> [!NOTE]
> The main workhorse which makes the RALPH loop actually function properly is converting a natural text PRD into a JSON file where requirements are structurally transferred into user stories ranked by importance and then each user story has 1) acceptance criteria, 2) priority, and 3) test criteria.

This makes looping very easy because the loop will continue until the acceptance criteria have been satisfied for each user story before moving on to the next. 

So here's the basic way ralph goes about things:

1. Use `/prd` to convert a PRD into a `prd.json` with user stories ordered from most important to least important.
2. From a `prd.json`, the ralph loop prompts the LLM with the first user story, and the LLM keeps working until the acceptance criteria for the user story is completed and passes all tests.
3. Ralph updates the `prd.json` memory and `progress.txt` memory
4. The context of the LLM is cleared, then Ralph prompts with the next user story in the `prd.json`, repeating steps 2-4 until every user story is completed.


> [!NOTE]
> Each user story must be small enough to complete within a single context window, because otherwise, if context fills up before you finish the task, the loop breaks.

```
┌─────────────────────────────────────────┐
│  ralph.sh                               │
│                                         │
│  1. Read prd.json → find next story     │
│  2. Spawn fresh AI instance             │
│  3. AI implements story + runs tests    │
│  4. AI updates prd.json (passes: true)  │
│  5. AI appends learnings to progress.txt│
│  6. AI commits to git                   │
│  7. AI exits → loop back to step 1     │
│                                         │
│  Stop when: all stories pass            │
└─────────────────────────────────────────┘
```

#### Using ralph

1. Install ralph via claude code

```
/plugin marketplace add snarktank/realph
```

2. Run the `/prd` skill to create the PRD
3. Start the ralph loop

```bash
./scripts/ralph/ralph.sh --tool claude --max-iterations 10
```

#### `prd.json`

Here is what a standard `prd.json` will look like:

```json
{
  "title": "Cursor-Based Pagination Utility",
  "description": "A generic, type-safe cursor-based pagination utility for TypeScript arrays.",
  "stories": [
    {
      "id": "story-1",
      "title": "Basic first-page pagination",
      "description": "Given an array of items and a page size, return the first page with correct data, nextCursor, and hasMore flag.",
      "testPattern": "returns correct data for first page",
      "passes": true
    },
    {
      "id": "story-2",
      "title": "Cursor-based continuation",
      "description": "Given a nextCursor from a previous page, return the correct subsequent page of items.",
      "testPattern": "returns correct nextCursor for subsequent pages",
      "passes": true
    },
    {
      "id": "story-3",
      "title": "Last page detection",
      "description": "When the final page of items is returned, hasMore should be false and nextCursor should be null.",
      "testPattern": "returns hasMore: false on last page",
      "passes": true
    },
    {
      "id": "story-4",
      "title": "Empty dataset handling",
      "description": "When given an empty array, return an empty result without throwing an error.",
      "testPattern": "handles empty dataset",
      "passes": true
    },
    {
      "id": "story-5",
      "title": "Generic type safety",
      "description": "The paginate function should preserve TypeScript generics so callers get type-safe results.",
      "testPattern": "is type-safe",
      "passes": true
    },
    {
      "id": "story-6",
      "title": "Variable page sizes",
      "description": "Pagination should work correctly with any page size (1, 2, 5, full dataset).",
      "testPattern": "works with different page sizes",
      "passes": true
    },
    {
      "id": "story-7",
      "title": "Cursor encoding/decoding",
      "description": "Cursors should be base64-encoded item IDs that decode correctly for continuation.",
      "testPattern": "cursor decodes correctly",
      "passes": true
    }
  ]
}
```