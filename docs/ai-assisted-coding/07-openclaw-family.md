## Openclaw slop mastery


### Gateway

The openclaw gateway is a long-running process where the AI is available as long as your computer is up.

Here are the commands to manage the gateway:

- `openclaw gateway`: starts the gateway
- `openclaw gateway stop`: stops the gateway
- `openclaw gateway restart`: restarts the gateway

### Dashboard vs interactive CLI

- **GUI**: You can then open up the webui using the `openclaw dashboard` command for the web UI
- **cli**: Run the `openclaw tui` command to chat with openclaw in the CLI, which is better because you can run slash commands easily.


### Markdown Files

- `SOUL.md`: for telling the AI its personality, purpose, and how it should behave, like a persona.
- `USER.md`: for telling the AI who the human user is, their name, any info about them, etc.
- `HEARTBEAT.md`: a periodic long-polling check that the AI runs on a schedule.
- `AGENTS.md`: instructions for how the agent should run, like commands to run on startup, memory protocol, and safety rules.
- `TOOLS.md`: environment specific keys and config 

The entire point of OpenClaw is based on the `HEARTBEAT.md`, where tasks are run in a loop every 15 min or so.

### Agents

Agents are a way of saving a particular openclaw profile so you can quickly open a Copilot, OpenAI, Claude, or local agent with specific settings. 

- `openclaw agents add <agent-name>`: adds an agent
- `openclaw agents delete <agent-name>`: deletes an agent by its name
- `openclaw agents list`: lists all agents.

### Skills

Here is the basic skills cli

- `openclaw skills list`: lists all downloaded skills

You can create a custom skill by creating folders that contain `SKILL.md` files within the `~/.openclaw/skills` directory, and then enable those skills to be registered in the `~/.openclaw/openclaw.json` config file:

```json
{
	// ...
	"skills": {
	    "install": {
	      "nodeManager": "npm"
	    },
	    "entries": {
	      "nano-banana-pro": {
	        "apiKey": "AI***"
	      },
	      "email_brief": {
	        "enabled": true
	      },
	      "waadlingaadil_read_email": {
	        "enabled": true
	      },
	      "send_telegram_message": {
	        "enabled": true
	      } 
	    }
	},
}
```

### Cron job

You can set a cron job in openclaw using the `openclaw cron` CLI:

```bash
openclaw cron add \
  --name "Daily Telegram Brief" \
  --cron "0 8 * * *" \
  --tz "America/New_York" \
  --session isolated \
  --message "Check my calendar and unread emails, then text me a summary of my day." \
  --announce \
  --channel telegram \
  --to "chat:123456789"
```

- `openclaw cron add [...OPTIONS]`: adds a cron job
- `openclaw cron list`: lists all registered cron jobs with their job IDs
- `openclaw cron run <job-id>`: runs a specific job by its id
- `openclaw cron runs --id <job-id>`: gets details of a specific job run

### Launching models

Some local models have commands right out of the gate to launch openclaw with:

- `ollama launch openclaw --model ministral-3`: launches ministral3 in openclaw.
- `ollama launch openclaw --model nemotron-3-nano:4b`: launches nemotron in openclaw

You can also launch these cloud provider models:






## Hermes slop mastery

### Hermes terminal

#### Config and setup

**📁 All your files are in `~/.hermes/`:**

- Settings:  `~/.hermes/config.yaml`
- API Keys:  `~/.hermes/.env`
- Cron jobs: `~/.hermes/cron/`
- Chat sessions: `~/.hermes/sessions/`
- Logs: `~/.hermes/logs/`

To edit the configuration, you have access to these commands:

```bash
   hermes setup          Re-run the full wizard
   hermes setup model    Change model/provider
   hermes setup terminal Change terminal backend
   hermes setup gateway  Configure messaging
   hermes setup tools    Configure tool providers

   hermes config         View current settings
   hermes config edit    Open config in your editor
   hermes config set <key> <value>
                          Set a specific value
```

Or just edit the `~/.hermes/config.yaml` and `~/.hermes/.env` directly.

You can also use the `hermes doctor` command to check for config issues

#### Hermes gateway

- `hermes`: opens TUI chat
- `hermes gateway`: starts the messaging gateway, gets assigned a PID, and you can stop the gateway by just killing the process.

```
✓ Gateway started (PID 71032). Logs: ~/.hermes/logs/gateway.log
→ To stop: kill 71032
→ To restart later: hermes gateway
```

```bash
   hermes              # Start chatting
   hermes setup        # Configure API keys & settings
   hermes config       # View/edit configuration
   hermes config edit  # Open config in editor
   hermes gateway      # install Install gateway service (messaging + cron)
   hermes update       # Update to latest version
```

#### Command reference

- `hermes`: starts chat TUI
- `hermes -c`: resume alst chat session
- `hermes status`: view the status of the hermes gateway
- `hermes model`: switch the default model
- `hermes insights`:view tokens, cost, and activity
- `hermes sessions browse`: browse through all the sessions
- `hermes skills browse`: browse through all the skills

### Cron jobs

#### Use cases

Here are several good use cases for cron jobs in hermes:

- **daily news/AI digest**: a daily news brief of AI tools summarized to discord.
- **end of week summary**: a reminder every friday night to organize your todos via the PARA method and GTD method, list outstanding todos.
- **2nd brain ingest**: pull resources from todoist, apple notes, etc. into an obsidian kanban board of ingested resources/todos and then start an agentic workflow to process those resources/todos, move them into the `RAW` folder, start the agentic workflow and put them into **processing** status and then once the outputs are summarized into the `PROCESSED` folder, mark the task as **completed** which should prevent it from being ingested again.
## MaxClaw slop mastery

## KiloClaw slop mastery