
## AI agent basics

### Building AI agents

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

## Google ADK

#### Installation and CLI

You install the `adk` cli like so

```bash
pipx install google-adk
```

1. Create a new folder and CD into it
2. Create the necessary AI boilerplate with the `adk create` command.
3. Install dependencies, put stuff in gitignore.


![](https://i.imgur.com/7M0Rp4D.jpeg)


> [!IMPORTANT]
> Your `agent.py` file must be in a subfolder.

You can now run the agent via these different options:

- `adk web <agent-subfolder-name>`: runs a server and displays a dashboard on localhost 8000
- `adk api_server <agent-subfolder-name>`: deploys the specific agent in the subfolder as an API service
- `adk run <agent-subfolder-name>`: runs in the terminal the specific agent in the subfolder

#### Basic Agent Code with Python

```python
from google.adk.agents.llm_agent import Agent

# main agent variable
root_agent = Agent(
    model='gemini-2.5-flash',
    name='root_agent',
    description='A helpful assistant for user questions.',
    instruction='Answer user questions to the best of your knowledge',
)
```

Here are the important kwargs to understand:

- `model`: LLM to use
- `name`: agent identifier
- `description`: what other agents look at so they can decide whether or not to call upon this agent based on the description.
- `instruction`: a system instruction for the agent detailing what tools it has and its purpose.

> [!IMPORTANT]
> The variable name `root_agent` is a convention that allows Gemini ADK to find this agent as the main orchestrator agent, and it must be named that.

#### Using other models

You can use other models like so, using the `LiteLlm` class to instantiate an LLM provider with a specific API key.

```python
import os
from google.adk.models.lite_llm import LiteLlm
from google.adk.agents import Agent
from dotenv import load_dotenv

load_dotenv()

CONSTANTS = {
    "GITHUB_API_KEY": os.getenv("GITHUB_API_KEY")
}

if not CONSTANTS["GITHUB_API_KEY"]:
    raise ValueError("GITHUB_API_KEY not found in environment variables")


AGENT_MODEL = LiteLlm(
    model="github/gpt-4o-mini", # Note the 'github/' prefix
    api_key=CONSTANTS["GITHUB_API_KEY"]
)


root_agent = Agent(
    name="gh_agent",
    description="An agent that welcomes the user.",
    instruction="Answer user questions to the best of your knowledge",
    model=AGENT_MODEL
)
```

#### Creating a yaml based agent

Instead of writing Python code to define agents, you can define agents using YAML, by creating the boilerplate first with `adk create --type=config` command:

```bash
adk create --type=config <agent-subfolder-name>
```

#### Architecture and main flow

| Primitive    | Purpose                                                                      |
| ------------ | ---------------------------------------------------------------------------- |
| **Agent**    | The fundamental worker — LLM-powered or deterministic workflow controller    |
| **Tool**     | Gives agents capabilities beyond conversation (APIs, search, code execution) |
| **Session**  | Manages conversation context, event history, and working state               |
| **Memory**   | Long-term cross-session knowledge store                                      |
| **Runner**   | Engine orchestrating execution flow via events                               |
| **Event**    | Basic communication unit — everything that happens is an event               |
| **Callback** | Hook points for guardrails, logging, and behavior modification               |

##### Sessions and runners

Since hundreds of people have have concurrent requests with a single agent, you need some way to distinguish between different chat sessions, which is where the idea of **sessions** come into play. 

We uniquely identify a session with a session id, app name, and user id.

```python
from google.adk.sessions import InMemorySessionService

session_service = InMemorySessionService()

APP_NAME = "math_tutor_app"
USER_ID = "student_1"
SESSION_ID = "session_001"

async def init_session():
	await session_service.create_session(
	        app_name=APP_NAME,
	        user_id=USER_ID,
	        session_id=SESSION_ID
	    )
```

A runner defines the agent loop and executes the agent for a single session. Here are the kwargs it takes:

- `agent`: the `Agent` instance to execute
- `session_service`: the `SessionService` instance to run in the context of.
- `app_name`: app to run in.

```python
from google.adk.runners import Runner

runner = Runner(
    agent=agent,
    app_name=APP_NAME,
    session_service=session_service
)
```

Here is a complete example:

```python
import asyncio
import os
from dotenv import load_dotenv
from google.adk.agents.llm_agent import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai.types import Content, Part

load_dotenv()

# 1. Define the Agent
agent = Agent(
    model='gemini-2.5-flash',
    name='math_tutor',
    instruction="""You are a patient math tutor.
    Guide students through problems step-by-step.
    Don't just give answers help them discover solutions."""
)

# 2. Setup Orchestration
APP_NAME = "math_tutor_app"
USER_ID = "student_1"
SESSION_ID = "session_001"

session_service = InMemorySessionService()
runner = Runner(
    agent=agent,
    app_name=APP_NAME,
    session_service=session_service
)

# 3. Define the Execution Logic
async def run_agent():
    # Initialize the session
    await session_service.create_session(
        app_name=APP_NAME,
        user_id=USER_ID,
        session_id=SESSION_ID
    )
    
    # Format the user message
    user_message = Content(
        role="user",
        parts=[Part(text="How do I solve $2x+5=13$?")]
    )

    # Stream the response
    async for event in runner.run_async(
        user_id=USER_ID,
        session_id=SESSION_ID,
        new_message=user_message
    ):
        if event.is_final_response() and event.content and event.content.parts:
            print(f"Agent: {event.content.parts[0].text}")

# 4. Run the script
if __name__ == "__main__":
    asyncio.run(run_agent())
```

And here is the same example, but adapted to be a long-running agent loop:

```python
from google.adk.agents.llm_agent import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai.types import Content, Part


class AgentSession:
    def __init__(
	    self, 
	    agent: Agent, 
	    app_name: str, 
	    session_service: InMemorySessionService
    ):
        self.agent = agent
        self.app_name = app_name
        self.session_service = session_service
        self.runner = Runner(
	        agent=agent, 
	        session_service=session_service, 
	        app_name=app_name
	    )
    
    @staticmethod
    def create_agent_session(agent: Agent, app_name: str):
        session_service = InMemorySessionService()
        return AgentSession(agent, app_name, session_service)


	# instantiates a session if not already created, runs query against LLM
    async def call_agent_async(self, query: str, user_id: str, session_id: str):
        if not await self.session_service.get_session(
			app_name=self.app_name, 
			user_id=user_id, 
			session_id=session_id
		):
            await self.session_service.create_session(
	            app_name=self.app_name, 
	            user_id=user_id, 
	            session_id=session_id
	        )

        # Package the user's query into ADK format
        content = Content(role='user', parts=[Part(text=query)])
        final_response_text = "Agent did not produce a final response."

        # Iterate through streamed agent responses
        async for event in self.runner.run_async(
	        user_id=user_id, 
	        session_id=session_id, 
	        new_message=content
        ):
            if event.is_final_response(): 
                if event.content and event.content.parts:
                    final_response_text = event.content.parts[0].text # 
                break # Stop listening after final response is received
        print(f"<<< Agent Response: {final_response_text}")
```

And here is how we implement it:

```python
import asyncio
import os
from dotenv import load_dotenv
from google.adk.agents.llm_agent import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai.types import Content, Part
from agent_utils import AgentSession

load_dotenv()

# 1. Define the Agent
agent = Agent(
    model='gemini-2.5-flash',
    name='math_tutor',
    instruction="""You are a patient math tutor.
    Guide students through problems step-by-step.
    Don't just give answers help them discover solutions."""
)

# 2. Setup Orchestration
APP_NAME = "math_tutor_app"
USER_ID = "student_1"
SESSION_ID = "session_001"

agent_session = AgentSession.create_agent_session(agent, APP_NAME)

# 4. Run the script
if __name__ == "__main__":
    while True:
        user_input = input(">>> User Query: ")
        response = asyncio.run(
	        agent_session.call_agent_async(user_input, USER_ID, SESSION_ID)
        )
```

##### Session state

You can pass agent results from one agent to another in the pipeline via the `output_key=` kwarg when instantiating an LLM agent. 

```python
structured_agent = LlmAgent(
 model="gemini-2.5-flash",
 instruction="Extract capital city as JSON",
 output_schema=CapitalOutput,
 output_key="found_capital" # Store in session.state["found_capital"]
)
```

You can then retrieve that value in one of two ways:

- **method 1 (access from session state)**: Whatever agent gets run in a session, you can access any output key via the `session.state[output_key]` syntax
- **method 2 (interpoalte in an agent chain)**: when using a parallel or sequential agent pipeline with multiple subagents, a subagent running immediately after another one can access the value of the `output_key` of the previous agent during runtime via interpolation, which lets you dynamically craft the instructions of a subagent in a pipeline based on the results of the previous agent output

Here's an example of method 2, where you interpolate the `output_key` in an agent chain:

```python
# pipeline_agent/agent.py
from google.adk.agents import Agent
from google.adk.agents.sequential_agent import SequentialAgent

MODEL = "gemini-2.0-flash"

# Step 1: Generate initial code from a specification
code_writer = Agent(
    name="CodeWriter",
    model=MODEL,
    instruction="""You are a Python code generator. Write clean, well-documented
    Python code based on the user's request. Output ONLY the Python code,
    wrapped in a code block.""",
    description="Writes initial Python code based on a specification.",
    output_key="generated_code",  # Saves response to state["generated_code"]
)

# Step 2: Review the code — reads from state via {generated_code} template
code_reviewer = Agent(
    name="CodeReviewer",
    model=MODEL,
    instruction="""You are an expert Python code reviewer. Review this code:

```python
{generated_code}
```


##### Basic Tools

You can write your own custom tools as Python functions which return a python dictionary, where the best practice is to return an object interface like so:

```ts
interface FunctionResponse {
	status: "error" | "success";
	error_message?: string;
	data?: any;
}
```

```python
def my_tool(param: str) -> dict:
    """Tool description here.

    Args:
        param (str): Parameter description.

    Returns:
        dict: Result with status.
    """
    try:
        result = perform_operation(param)
        return {"status": "success", "data": result}
    except ValueError as e:
        return {"status": "error", "error_message": f"Invalid input: {e}"}
    except Exception as e:
        return {"status": "error", "error_message": f"Unexpected error: {e}"}
```

Here's a complete example of the pipeline to hook up tools:

1. Define a custom tool function or import a built-in tool
2. Pass in a list of tools to register to the `tools=` kwarg in the `Agent` class.

```python
import asyncio
import os
from google.adk.agents.llm_agent import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.tools import FunctionTool, google_search # New imports
from google.genai.types import Content, Part

# 1. Define a Custom Tool
# The docstring below is critical; it's how the AI understands what the tool does.
def calculate_tax(price: float, rate: float = 0.07) -> dict:
    """Calculates the tax amount for a given price and tax rate.
    Args:
        price: The total price of the item.
        rate: The tax rate as a decimal (default is 0.07).
    """
    tax = price * rate
    return {"status": "success", "tax_amount": round(tax, 2)}

# 2. Define the Agent with Tools
agent = Agent(
    model='gemini-2.5-flash',
    name='shopping_assistant',
    instruction="""You are a helpful shopping assistant. 
    Use the calculate_tax tool for all price calculations. 
    Use google_search to find current prices if the user asks.""",
    # Add your tools to this list
    tools=[FunctionTool(calculate_tax), google_search]
)

# 3. Execution Setup (same as before)
APP_NAME = "shop_app"
USER_ID = "user_123"
SESSION_ID = "session_456"

session_service = InMemorySessionService()
runner = Runner(agent=agent, app_name=APP_NAME, session_service=session_service)

async def run_agent():
    await session_service.create_session(APP_NAME, USER_ID, SESSION_ID)
    
    # Try a query that triggers the custom tool
    user_message = Content(role="user", parts=[Part(text="What is the tax on a $150 jacket?")])

    async for event in runner.run_async(USER_ID, SESSION_ID, user_message):
        if event.is_final_response() and event.content and event.content.parts:
            print(f"Agent: {event.content.parts[0].text}")

if __name__ == "__main__":
    asyncio.run(run_agent())
```

##### Tools and session state



#### Agent Types

**Type 1: LLM agents**

LLM agents use a language model for reasoning, tool selection, and response generation. Read the [Docs](https://google.github.io/adk-docs/agents/) here.

You use an LLM agent with the `LLMAgent` or more commonly, the `Agent` class.

```python
from google.adk.agents import Agent  # Agent is an alias for LlmAgent

agent = Agent(
    name="my_agent",              # Required: unique identifier (avoid "user")
    model="gemini-2.0-flash",     # Required: model string
    description="Handles weather queries.",  # Recommended for multi-agent routing
    instruction="You are a helpful weather assistant.",  # System prompt
    tools=[get_weather],          # List of tools (functions auto-wrapped)
    output_key="result",          # Auto-save response to state["result"]
)
```

- `model`: LLM to use
- `name`: agent identifier
- `description`: what other agents look at so they can decide whether or not to call upon this agent based on the description.
- `instruction`: a system instruction for the agent detailing what tools it has and its purpose.
- `tools`: list of tools
- `output_key`: for state management
- `generate_content_config`: LLM param settings
- `output_schema`: Pydantic model for structured output

**Type 2: workflow agents**

There are three types of workflow agents:

- **`SequentialAgent`**: Executes sub-agents in order.  Data passes between steps via shared session state using `output_key`.
- **`ParallelAgent`**: Executes sub-agents concurrently. Each should write to distinct state keys to avoid race conditions.
- **`LoopAgent`**: Repeatedly executes sub-agents until `max_iterations` is hit or a sub-agent escalates.

**Type 3: custom agents**


#### Structured Output

You cna tell an agent to output structured output as JSON via a Pydantic model schema:

```python
from pydantic import BaseModel, Field


class ProductInfo(BaseModel):
 product_name: str = Field(description="The name of the product")
 price: float = Field(description="The price in USD")
 storage: str = Field(description="The storage capacity")


structured_agent = LlmAgent(
 model="gemini-2.5-flash",
 instruction="""Extract product information and respond with JSON.
 Format: {"product_name": "name", "price": 999.99, "storage": "256GB"}""",
 output_schema=ProductInfo # Enforces this exact structure
)
```

#### Tools deep deive

This is how you can add custom tools, where the tool name, args, and description must be put in the docstring, and the AI will dynamically read the docstring at runtime to understand how to use the tool.

It's good practice to write your tools like so:

```python
def my_tool(param: str) -> dict:
    """Tool description here.

    Args:
        param (str): Parameter description.

    Returns:
        dict: Result with status.
    """
    try:
        result = perform_operation(param)
        return {"status": "success", "data": result}
    except ValueError as e:
        return {"status": "error", "error_message": f"Invalid input: {e}"}
    except Exception as e:
        return {"status": "error", "error_message": f"Unexpected error: {e}"}
```

Here is the modern way to use tools:

```python
import asyncio
import os
from google.adk.agents.llm_agent import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.tools import FunctionTool, google_search # New imports
from google.genai.types import Content, Part

# 1. Define a Custom Tool
# The docstring below is critical; it's how the AI understands what the tool does.
def calculate_tax(price: float, rate: float = 0.07) -> dict:
    """Calculates the tax amount for a given price and tax rate.
    Args:
        price: The total price of the item.
        rate: The tax rate as a decimal (default is 0.07).
    """
    tax = price * rate
    return {"status": "success", "tax_amount": round(tax, 2)}

# 2. Define the Agent with Tools
agent = Agent(
    model='gemini-2.5-flash',
    name='shopping_assistant',
    instruction="""You are a helpful shopping assistant. 
    Use the calculate_tax tool for all price calculations. 
    Use google_search to find current prices if the user asks.""",
    # Add your tools to this list
    tools=[FunctionTool(calculate_tax), google_search]
)

# 3. Execution Setup (same as before)
APP_NAME = "shop_app"
USER_ID = "user_123"
SESSION_ID = "session_456"

session_service = InMemorySessionService()
runner = Runner(agent=agent, app_name=APP_NAME, session_service=session_service)

async def run_agent():
    await session_service.create_session(APP_NAME, USER_ID, SESSION_ID)
    
    # Try a query that triggers the custom tool
    user_message = Content(role="user", parts=[Part(text="What is the tax on a $150 jacket?")])

    async for event in runner.run_async(USER_ID, SESSION_ID, user_message):
        if event.is_final_response() and event.content and event.content.parts:
            print(f"Agent: {event.content.parts[0].text}")

if __name__ == "__main__":
    asyncio.run(run_agent())
```

Here is a complete example:

```python
# weather_agent/agent.py
import datetime
from zoneinfo import ZoneInfo
from google.adk.agents import Agent

def get_weather(city: str) -> dict:
    """Retrieves the current weather report for a specified city.

    Args:
        city (str): The name of the city for which to retrieve the weather report.

    Returns:
        dict: status and result or error msg.
    """
    # Mock database — replace with real API in production
    mock_db = {
        "new york": "Sunny, 25°C (77°F)",
        "london": "Cloudy, 15°C (59°F)",
        "tokyo": "Light rain, 18°C (64°F)",
    }
    weather = mock_db.get(city.lower())
    if weather:
        return {"status": "success", "report": f"Weather in {city}: {weather}"}
    return {"status": "error", "error_message": f"No weather data for '{city}'."}

def get_current_time(city: str) -> dict:
    """Returns the current time in a specified city.

    Args:
        city (str): The name of the city for which to retrieve the current time.

    Returns:
        dict: status and result or error msg.
    """
    timezones = {
        "new york": "America/New_York",
        "london": "Europe/London",
        "tokyo": "Asia/Tokyo",
    }
    tz_id = timezones.get(city.lower())
    if not tz_id:
        return {"status": "error", "error_message": f"No timezone info for {city}."}

    now = datetime.datetime.now(ZoneInfo(tz_id))
    return {"status": "success", "report": f"Current time in {city}: {now.strftime('%Y-%m-%d %H:%M:%S %Z')}"}

# The LLM decides which tool to call based on the user's question
root_agent = Agent(
    name="weather_time_agent",
    model="gemini-2.0-flash",
    description="Agent to answer questions about the time and weather in a city.",
    instruction="You are a helpful agent who can answer user questions about "
                "the time and weather in a city.",
    tools=[get_weather, get_current_time],  # Functions auto-wrapped as FunctionTool
)
```

When creating a custom tool function, you can pass any arguments you want, but a useful thing to pass in as the last argument is the `ToolContext` instance:

```python
# multi_tool_agent/agent.py
from google.adk.agents import Agent
from google.adk.tools import ToolContext

def search_products(query: str) -> dict:
    """Searches the product catalog for items matching the query.

    Args:
        query (str): Search terms to find products.

    Returns:
        dict: Search results with status.
    """
    catalog = {
        "laptop": [
            {"name": "ProBook 15", "price": 999, "id": "PB15"},
            {"name": "AirLight 13", "price": 1299, "id": "AL13"},
        ],
        "headphones": [
            {"name": "SoundMax Pro", "price": 249, "id": "SM01"},
        ],
    }
    for keyword, products in catalog.items():
        if keyword in query.lower():
            return {"status": "success", "products": products}
    return {"status": "error", "error_message": f"No products found for '{query}'."}

def add_to_cart(product_id: str, tool_context: ToolContext) -> dict:
    """Adds a product to the user's shopping cart.

    Args:
        product_id (str): The unique product identifier to add.

    Returns:
        dict: Confirmation of the cart update.
    """
    # ToolContext gives access to session state — auto-injected, not in docstring
    cart = tool_context.state.get("user:cart", [])
    cart.append(product_id)
    tool_context.state["user:cart"] = cart  # Persists across sessions for this user
    return {"status": "success", "message": f"Added {product_id}. Cart: {cart}"}

def get_cart(tool_context: ToolContext) -> dict:
    """Returns the current contents of the user's shopping cart.

    Returns:
        dict: Current cart contents.
    """
    cart = tool_context.state.get("user:cart", [])
    return {"status": "success", "cart": cart, "item_count": len(cart)}

root_agent = Agent(
    name="shopping_agent",
    model="gemini-2.0-flash",
    description="A shopping assistant that helps find and purchase products.",
    instruction="You are a shopping assistant. Help users search for products, "
                "add items to their cart, and review their cart. Always confirm "
                "actions with the user.",
    tools=[search_products, add_to_cart, get_cart],
)
```

The `tool_context` parameter is automatically injected by ADK — it provides read/write access to session state. These are the different prefixes you can use:

| Prefix    | Scope                      | Persists across sessions?      |
| --------- | -------------------------- | ------------------------------ |
| No prefix | Current session only       | With persistent SessionService |
| `user:`   | All sessions for this user | Yes                            |
| `app:`    | All users and sessions     | Yes                            |
| `temp:`   | Current invocation only    | Never                          |

```python
# In a tool or callback:
tool_context.state["current_query"] = "weather"        # Session-scoped
tool_context.state["user:language"] = "en"              # User-scoped (persistent)
tool_context.state["app:version"] = "2.1"               # App-wide (persistent)
tool_context.state["temp:intermediate"] = raw_data       # Gone after invocation
```

Here's another example:

```python
# typed_tools/agent.py
from google.adk.agents import Agent
from google.adk.tools import ToolContext
from typing import Optional

def create_task(
    title: str,
    priority: str,
    description: Optional[str] = None,
    tool_context: ToolContext = None,
) -> dict:
    """Creates a new task in the task management system.

    Args:
        title (str): The title of the task.
        priority (str): Priority level - must be 'low', 'medium', or 'high'.
        description (str): Optional detailed description of the task.

    Returns:
        dict: The created task details with status.
    """
    # Validate priority
    if priority.lower() not in ("low", "medium", "high"):
        return {"status": "error", "error_message": f"Invalid priority '{priority}'. Use low/medium/high."}

    # Read existing tasks from state, create if not present
    tasks = tool_context.state.get("user:tasks", [])
    task_id = f"TASK-{len(tasks) + 1:03d}"

    new_task = {
        "id": task_id,
        "title": title,
        "priority": priority.lower(),
        "description": description or "",
        "status": "open",
    }
    tasks.append(new_task)
    tool_context.state["user:tasks"] = tasks  # Persist across sessions

    return {"status": "success", "task": new_task}

def list_tasks(status_filter: Optional[str] = None, tool_context: ToolContext = None) -> dict:
    """Lists all tasks, optionally filtered by status.

    Args:
        status_filter (str): Optional filter — 'open', 'done', or 'all'. Defaults to 'all'.

    Returns:
        dict: List of matching tasks.
    """
    tasks = tool_context.state.get("user:tasks", [])
    if status_filter and status_filter != "all":
        tasks = [t for t in tasks if t["status"] == status_filter]
    return {"status": "success", "tasks": tasks, "count": len(tasks)}

root_agent = Agent(
    name="task_manager",
    model="gemini-2.0-flash",
    instruction="You are a task management assistant. Help users create, list, "
                "and manage their tasks. Always confirm task creation details.",
    tools=[create_task, list_tasks],
)
```

#### Delegating to subagents

For all `Agent` instances and subclasses, you can define a `subagents=` kwarg and pass in a list of subagents to delegate tasks to.

In the example below, we create a root `Agent` instance that delegates to other agents based on their description and usefulness to the query.

```python
# team_agent/agent.py
from google.adk.agents import Agent
from typing import Optional

# --- Specialist tools ---
def get_weather(city: str) -> dict:
    """Retrieves the current weather report for a specified city.

    Args:
        city (str): The name of the city.

    Returns:
        dict: Weather information with status.
    """
    db = {
        "new york": {"status": "success", "report": "New York: Sunny, 25°C"},
        "london": {"status": "success", "report": "London: Cloudy, 15°C"},
        "tokyo": {"status": "success", "report": "Tokyo: Light rain, 18°C"},
    }
    return db.get(city.lower(), {"status": "error", "error_message": f"No data for '{city}'."})

def say_hello(name: Optional[str] = None) -> str:
    """Provides a friendly greeting, optionally personalized with a name.

    Args:
        name (str): Optional name to personalize the greeting.

    Returns:
        str: A greeting message.
    """
    return f"Hello, {name}! Welcome!" if name else "Hello there! Welcome!"

def say_goodbye() -> str:
    """Provides a polite farewell message.

    Returns:
        str: A farewell message.
    """
    return "Goodbye! Have a wonderful day."

# --- Specialist agents (sub-agents) ---
greeting_agent = Agent(
    model="gemini-2.0-flash",
    name="greeting_agent",
    # description is CRITICAL — the coordinator reads this to decide routing
    description="Handles greetings, hellos, and welcoming users.",
    instruction="You are the Greeting Agent. Your ONLY task is to provide a "
                "friendly greeting using the 'say_hello' tool. Do not handle "
                "any other type of request.",
    tools=[say_hello],
)

farewell_agent = Agent(
    model="gemini-2.0-flash",
    name="farewell_agent",
    description="Handles farewells, goodbyes, and ending conversations.",
    instruction="You are the Farewell Agent. Your ONLY task is to provide a "
                "polite goodbye using the 'say_goodbye' tool.",
    tools=[say_goodbye],
)

# --- Coordinator agent ---
# The coordinator handles weather itself, delegates greetings/farewells to sub-agents
root_agent = Agent(
    name="team_coordinator",
    model="gemini-2.0-flash",
    description="Main coordinator that routes requests to the right specialist.",
    instruction="You are the main coordinator agent managing a team. "
                "For weather questions, handle them yourself using 'get_weather'. "
                "For greetings, delegate to 'greeting_agent'. "
                "For farewells, delegate to 'farewell_agent'.",
    tools=[get_weather],
    sub_agents=[greeting_agent, farewell_agent],  # Enables automatic delegation
)
```

#### Sequential agents

Sequential agents run other agents sequentially in order as part of a pipeline:

```python
root_agent = SequentialAgent(
    name="pipeline",
    sub_agents=[agent1, agent2, agent3],
)
```

Here is a complete example, where you can pass agent results from one agent to another in the pipeline via the `output_key=` kwarg when instantiating an LLM agent. You can then interpolate that output key langchain style to access the previous agent's output.

````python
# pipeline_agent/agent.py
from google.adk.agents import Agent
from google.adk.agents.sequential_agent import SequentialAgent

MODEL = "gemini-2.0-flash"

# Step 1: Generate initial code from a specification
code_writer = Agent(
    name="CodeWriter",
    model=MODEL,
    instruction="""You are a Python code generator. Write clean, well-documented
    Python code based on the user's request. Output ONLY the Python code,
    wrapped in a code block.""",
    description="Writes initial Python code based on a specification.",
    output_key="generated_code",  # Saves response to state["generated_code"]
)

# Step 2: Review the code — reads from state via {generated_code} template
code_reviewer = Agent(
    name="CodeReviewer",
    model=MODEL,
    instruction="""You are an expert Python code reviewer. Review this code:
```python
{generated_code}
```

Provide specific feedback on:
1. Correctness and potential bugs
2. Code style and readability
3. Performance considerations
4. Suggested improvements

Be constructive and specific.""",
    description="Reviews the generated code and provides feedback.",
    output_key="code_review",  # Saves review to state["code_review"]
)

# Step 3: Refine based on review feedback
code_refiner = Agent(
    name="CodeRefiner",
    model=MODEL,
    instruction="""You are a code refiner. Here is the original code:
```python
{generated_code}
```

And here is the review feedback:
{code_review}

Rewrite the code incorporating ALL the review feedback. Output the final,
improved Python code.""",
    description="Refines code based on reviewer feedback.",
    output_key="final_code",
)

# SequentialAgent runs CodeWriter → CodeReviewer → CodeRefiner in order
root_agent = SequentialAgent(
    name="CodePipeline",
    sub_agents=[code_writer, code_reviewer, code_refiner],
)
````

#### Parallel agent

The `ParallelAgent` agent runs all subagents in parallel.

```python
# ParallelAgent runs all three concurrently
root_agent = ParallelAgent(
    name="parallel_pipeline",
    sub_agents=[agent1, agent2, agent3],
)
```

```python
# parallel_agent/agent.py
from google.adk.agents import Agent
from google.adk.agents.parallel_agent import ParallelAgent
from google.adk.agents.sequential_agent import SequentialAgent

MODEL = "gemini-2.0-flash"

# These three agents run concurrently — each writes to a distinct state key
weather_fetcher = Agent(
    name="WeatherFetcher",
    model=MODEL,
    instruction="Provide a brief weather summary for San Francisco today. "
                "Keep it to 2-3 sentences.",
    output_key="weather_info",  # Each parallel agent needs a unique key
)

news_fetcher = Agent(
    name="NewsFetcher",
    model=MODEL,
    instruction="Provide 3 brief headline summaries of today's top tech news.",
    output_key="news_info",
)

stock_fetcher = Agent(
    name="StockFetcher",
    model=MODEL,
    instruction="Provide a brief summary of how major tech stocks (AAPL, GOOG, "
                "MSFT) are performing today.",
    output_key="stock_info",
)

# ParallelAgent runs all three concurrently
info_gatherer = ParallelAgent(
    name="InfoGatherer",
    sub_agents=[weather_fetcher, news_fetcher, stock_fetcher],
)

# After parallel execution, a summarizer reads all gathered data
summarizer = Agent(
    name="Summarizer",
    model=MODEL,
    instruction="""Create a morning briefing from these sources:

**Weather:** {weather_info}
**News:** {news_info}
**Stocks:** {stock_info}

Format as a concise, professional morning briefing.""",
    output_key="briefing",
)

# Sequential wraps parallel gathering → summarization
root_agent = SequentialAgent(
    name="MorningBriefing",
    sub_agents=[info_gatherer, summarizer],
)
```

#### Persistent sessions

Use the `DatabaseSessionService` class to persesit sessions to a SQL db

```python
# persistent_agent.py
import asyncio
from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import DatabaseSessionService
from google.adk.memory import InMemoryMemoryService
from google.adk.tools import load_memory
from google.genai import types

# DatabaseSessionService requires an async database driver
# pip install aiosqlite  (for SQLite)
# pip install asyncpg    (for PostgreSQL)
DB_URL = "sqlite+aiosqlite:///./agent_sessions.db"

APP_NAME = "persistent_app"
USER_ID = "user_1"

# Agent that can recall information from past sessions
agent = Agent(
    name="memory_agent",
    model="gemini-2.0-flash",
    instruction="You are a helpful assistant with long-term memory. "
                "Use the 'load_memory' tool to recall information from "
                "past conversations when the user asks about something "
                "you discussed before.",
    tools=[load_memory],  # Built-in tool for searching memory service
)

async def main():
    # DatabaseSessionService persists sessions to SQLite
    # Tables created automatically: app_state, raw_events, sessions, user_state
    session_service = DatabaseSessionService(db_url=DB_URL)
    memory_service = InMemoryMemoryService()

    runner = Runner(
        agent=agent,
        app_name=APP_NAME,
        session_service=session_service,
        memory_service=memory_service,  # Pass memory service to Runner
    )

    # Session 1: Capture information
    session1_id = "session_info"
    await session_service.create_session(
        app_name=APP_NAME, user_id=USER_ID, session_id=session1_id
    )
    content = types.Content(
        role="user",
        parts=[types.Part(text="My favorite project is Project Alpha and I work on AI.")],
    )
    async for event in runner.run_async(
        user_id=USER_ID, session_id=session1_id, new_message=content
    ):
        if event.is_final_response() and event.content and event.content.parts:
            print(f"Agent: {event.content.parts[0].text}")

    # Add completed session to long-term memory
    completed = await session_service.get_session(
        app_name=APP_NAME, user_id=USER_ID, session_id=session1_id
    )
    await memory_service.add_session_to_memory(completed)

    # Session 2: Recall from memory in a new session
    session2_id = "session_recall"
    await session_service.create_session(
        app_name=APP_NAME, user_id=USER_ID, session_id=session2_id
    )
    recall_content = types.Content(
        role="user",
        parts=[types.Part(text="What is my favorite project?")],
    )
    async for event in runner.run_async(
        user_id=USER_ID, session_id=session2_id, new_message=recall_content
    ):
        if event.is_final_response() and event.content and event.content.parts:
            print(f"Agent (recall): {event.content.parts[0].text}")

asyncio.run(main())
```

#### Reasoning

You can make models think and output their think trace before answering as to get better answers by passing in a ReAct type planner into the `planner=` kwarg when creating an `Agent` instance.

- `BuiltInPlanner`: basic planner to enable thinking tokens
- `PlanReActPlanner`: ReAct style thinking


Here is how to use the built-in planner. When passing in a `ThinkingConfig()` object, these are the kwargs you can pass:

- `include_thoughts`: **boolean**. If set to true, then the thinking trace is shown.
- `thinking_budget`: **int**. THe maximum amount of tokens to allow for thinking

```python
from google.adk.agents import Agent
from google.adk.planners import BuiltInPlanner
from google.genai.types import ThinkingConfig

reasoning_agent = Agent(
    model="gemini-2.5-flash",  # Thinking works best with 2.5+ models
    name="reasoning_agent",
    instruction="You are a research assistant. Think through problems carefully "
                "before answering. Break complex questions into smaller parts.",
    planner=BuiltInPlanner(
        thinking_config=ThinkingConfig(
            include_thoughts=True,   # Include reasoning in response
            thinking_budget=1024,    # Token budget for thinking
        )
    ),
    tools=[],  # Add your tools here
)
```

The `PlanReActPlanner()` planner type enables ReAct type reasoning, which is great for dumber models which don't usually have reasoning capabilities. It manually simulates model reasoning via intelligent prompting.

```Python
from google.adk.agents import Agent
from google.adk.planners import PlanReActPlanner

def search_database(query: str) -> dict:
    """Searches the knowledge database for relevant information.

    Args:
        query (str): The search query.

    Returns:
        dict: Search results.
    """
    return {"status": "success", "results": f"Found 3 articles about '{query}'."}

def calculate(expression: str) -> dict:
    """Evaluates a mathematical expression.

    Args:
        expression (str): A mathematical expression to evaluate.

    Returns:
        dict: The calculation result.
    """
    try:
        result = eval(expression)  # Use a safe evaluator in production
        return {"status": "success", "result": result}
    except Exception as e:
        return {"status": "error", "error_message": str(e)}

# PlanReActPlanner injects structured reasoning directives
root_agent = Agent(
    model="gemini-2.5-flash",
    name="research_agent",
    instruction="You are a research analyst. For complex questions, break them "
                "into steps, research each part, and synthesize findings.",
    planner=PlanReActPlanner(),  # Enables Plan-Reason-Act-Replan cycle
    tools=[search_database, calculate],
)
```


#### Use cases

##### OpenAPI built-in integration: Github API master

For any API that has an OpenAPI specification, you can immediately give an agent up to date, complete knowledge on how to use that API and all tools available by just linking the APIs `openapi.json` file.

```python
import os
import asyncio
from google.adk.agents.llm_agent import Agent
from google.adk.tools.openapi_tool import OpenAPIToolset
from google.adk.runners import Runner

# Step 1: Load GitHub OpenAPI Spec & Credentials
# You would download the github_openapi.json from GitHub's docs
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

toolset = OpenAPIToolset(
    spec_path="github_openapi.json",
    headers={"Authorization": f"Bearer {GITHUB_TOKEN}"}
)

# Step 2: Create the Agent
agent = Agent(
    model='gemini-2.5-pro',
    name='github_expert',
    instruction="You help manage GitHub repos. You can list, create, and edit issues.",
    tools=toolset.get_tools() # This adds hundreds of GitHub actions as tools
)

# Step 3: Run the Agent
runner = Runner(agent=agent)

async def main():
    user_msg = {"role": "user", "parts": [{"text": "List my open issues in the 'adk-project' repo."}]}
    async for event in runner.run_async(user_id="u1", session_id="s1", new_message=user_msg):
        if event.is_final_response():
            print(f"Agent: {event.content.parts[0].text}")

if __name__ == "__main__":
    asyncio.run(main())
```

