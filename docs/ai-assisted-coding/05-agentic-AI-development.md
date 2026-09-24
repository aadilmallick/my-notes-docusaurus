
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



## Loop engineering

