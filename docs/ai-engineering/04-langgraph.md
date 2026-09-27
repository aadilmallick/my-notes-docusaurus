## Basics

### States, nodes, and edges

In LangGraph, everything revolves around a shared state graph. 

Unlike a linear script or standard functional calls, a LangGraph application is a state machine where execution flows through **Nodes** that read and write to a shared **State**.

- **Nodes:** Python functions that take the current state as input, perform work (like calling an LLM or running a database query), and return a dictionary containing state updates.
- **Edges:** Directives that tell the graph what node to run next.
- **state**: state is typed by schema. 
	- You define what data your graph carries around using Python's `TypedDict` or Pydantic. 
	- By default, fields are overwritten when a node returns them, but you can use reducers (like `operator.add`) to append data (e.g., keeping a growing message history).

Here is the simplest example:

```py
from langgraph.graph import StateGraph, START, END
from typing import TypedDict

# 1. Define the State
class State(TypedDict):
    message: str

# 2. Define a Node function
def process_message(state: State):
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

# Run it
result = app.invoke({"message": "Hello HHMI"})
print(result)  # Output: {'message': 'Hello HHMI -> Processed by node!'}
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