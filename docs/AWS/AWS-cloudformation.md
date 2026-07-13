## Basics

CloudFormation figures out

- what order to create them
- what depends on what
- how to update them
- how to roll them back
- how to delete them

Think of it like a package manager for infrastructure.

Cloudformation organizes resources you provision into **stacks**, and then compares previous stack state to the current stack state in what's called a **changeset** to surgically change the diff without constant setup/teardown of resources.
