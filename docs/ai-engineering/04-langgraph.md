## Basics

### States, nodes, and edges

In LangGraph, everything revolves around a shared state graph. 

Unlike a linear script or standard functional calls, a LangGraph application is a state machine where execution flows through **Nodes** that read and write to a shared **State**.

- **Nodes:** Python functions that take the current state as input, perform work (like calling an LLM or running a database query), and return a dictionary containing state updates.
	- **LLM node**: a node where logic is executed via an LLM
	- **Tool Node:** Executes external tools as part of the agent's workflow.
	- **Action/agent Node:** Invokes another agent from within the current agent.
	- **Logic Node:** Executes any custom logic that doesn't fit into the other node types.
	- **start node**: the starting node of the graph
	- **end node**: the end node of the graph.
- **Edges:** Directives that tell the graph what node to run next, because each node is connected to another node via an edge.
	- **conditional edge**: helps route requests to a connected node based on conditional checks
- **state**: reflects the internal state of the agent, storing info about the execution of the graph, where each node writes its output to the state.
	- **schema typing**: You define what data your graph carries around using Python's `TypedDict` or Pydantic. 
	- **dynamic**: By default, fields are overwritten when a node returns them, but you can use reducers (like `operator.add`) to append data (e.g., keeping a growing message history).

![](https://i.imgur.com/DVu2ySG.jpeg)


Here is the simplest example, and let's notice some things here:

- **state schema**: we have type safety for the state
- **node functions**: you create node functions as normal python functions that take in state and return state, exactly typed. State goes in, state comes out
- **nodes**: you refer to nodes by the name you give them in the graph.

```py
from langgraph.graph import StateGraph, START, END
from typing import TypedDict

# 1. Define the State
class State(TypedDict):
    message: str

# 2. Define a Node function
def process_message(state: State) -> State:
    new_msg = state["message"] + " -> Processed by node!"
    return {"message": new_msg}

# 3. Initialize the graph with the state schema
workflow = StateGraph(State)

# 4. Add nodes and edges
workflow.add_node("processor", process_message)
workflow.add_edge(START, "processor")
workflow.add_edge("processor", END)

# 5. Compile into an executable app
app = workflow.compile()

# Run it: graph accepts State as input
result = app.invoke({"message": "Hello HHMI"})
print(result)  # Output: {'message': 'Hello HHMI -> Processed by node!'}
```


#### State

Instead of passing around messages arrays everywhere, instead, we delegate state management and conversation history to the state.

Agent state is a key concept in LangGraph for building AI agents. It acts as a shared memory during the execution of the agent's workflow, where each node writes its output to the agent state and subsequent nodes read from it to get their inputs. 

- Unlike edges, which only control the flow between nodes, the actual data is passed through this agent state. 
- This allows the agent to maintain and manage information throughout the process, enabling complex, multi-step reasoning and actions within the chatbot.

1. Nodes write their output to the state
2. Subsequent nodes read their input from state

> [!NOTE]
> No data is exchanged through edges. Data is always exchanged through agent state. 

#### Edges

##### Conditional edges

Instead of pointing from Node A directly to Node B, a **conditional edge** evaluates the current state and routes execution to different nodes based on runtime logic.

Here's the graph logic:

1. **START**: start at start node, create edge to classifier node
2. **classifier**: 2nd node in graph, branches to either `db_handler` or `ai_handler` nodes.

```
```


```py
from langgraph.graph import StateGraph, START, END
from typing import TypedDict

class RouterState(TypedDict):
    input_text: str
    route: str

def classifier_node(state: RouterState):
    # Simulated classification logic
    text = state["input_text"]
    destination = "database_team" if "data" in text else "ai_team"
    return {"route": destination}

def db_handler(state: RouterState):
    return {"input_text": "Handled by Database Team"}

def ai_handler(state: RouterState):
    return {"input_text": "Handled by AI Accelerator Team"}

workflow = StateGraph(RouterState)
workflow.add_node("classifier", classifier_node)
workflow.add_node("db_handler", db_handler)
workflow.add_node("ai_handler", ai_handler)

workflow.add_edge(START, "classifier")

# Define routing function for conditional edge
def decide_path(state: RouterState):
    return state["route"]

workflow.add_conditional_edges(
    "classifier",
    decide_path,
    {
        "database_team": "db_handler",
        "ai_team": "ai_handler"
    }
)

workflow.add_edge("db_handler", END)
workflow.add_edge("ai_handler", END)

app = workflow.compile()
```

Now if you do this, it routes to the `db_handler` node because:



```py
app.invoke({"input_text" : "wow I need me some data"})
```
### Prebuilt agents

#### ReAct agent

Let's create this agent, where a ReAct agent is just a normal langchain agent.

![](https://i.imgur.com/yrdSVvr.jpeg)


1. Create a base LLM

```py
from langchain.chat_models import init_chat_model

model = init_chat_model("groq:openai/gpt-oss-120b")
```

2. Create the tools

```py
from langchain.tools import tool

@tool
def find_sum(x:int, y:int) -> int :
    #The docstring comment describes the capabilities of the function
    #It is used by the agent to discover the function's inputs, outputs and capabilities
    """
    This function is used to add two numbers and return their sum.
    It takes two integers as inputs and returns an integer as output.
    """
    return x + y

@tool
def find_product(x:int, y:int) -> int :
    """
    This function is used to multiply two numbers and return their product.
    It takes two integers as inputs and returns an integer as ouput.
    """
    return x * y
```

3. Create the agent

```py
from langchain.agents import create_agent
from langchain.messages import AIMessage,HumanMessage,SystemMessage

#System prompt
system_prompt = SystemMessage(
    """You are a Math genius who can solve math problems. Solve the
    problems provided by the user, by using only tools available. 
    Do not solve the problem yourself"""
)

# langchain agents are same as ReAct agents
agent_graph=create_agent(
    model=model,
    tools=[find_sum, find_product],
    system_prompt=system_prompt,
    debug=True # allows debugging
)
```