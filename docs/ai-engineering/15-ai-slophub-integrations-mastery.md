
## Coderabbit

### CodeRabbit CLI

- `coderabbit`: runs a normal code review session
- `coderabbit --plain`: runs a normal code review session

## Jules

### Jules CLI

1. Install the jules CLI with NPM:

```bash
npm install -g @google/jules
```

2. Login

```bash
jules login
```

3. Ask for help and see the version

```bash
# Get general help
jules help

# Get help for a specific command (e.g., remote)
jules remote --help

jules version
```

The `remote` command is the primary way to interact with Jules sessions running in the cloud. It has several subcommands.

- `jules remote list`: lists all the remote sessions

```bash
# List all connected repositories
jules remote list --repo

# List all active and past sessions
jules remote list --session
```


## Greptile