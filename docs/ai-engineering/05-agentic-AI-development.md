
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