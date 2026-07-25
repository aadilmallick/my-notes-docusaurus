## Openclaw slop mastery

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
## MaxClaw slop mastery

## KiloClaw slop mastery