## Intro

### Installation and setup

1. Install pulumi

```
brew install pulumi/tap/pulumi
```

2. Login

```
pulumi login
```

### Stacks

Pulumi works in stacks, where all resources you spin up and deploy will be deployed in the context of the current stack.

- `pulumi stack init`: creates a new stack with the YAML configuration for the stack in `Pulumi.<stack-name>.yaml`
- `pulumi stack ls`: lists all the stacks
- `pulumi stack select <stack-name>`: selects a stack

