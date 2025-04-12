# Git

## The Basics

### Undoing changes

#### `git commit --amend`

If you made a mistake on the message your most recent commit, you can fix it by doing `git commit --amend` to change that message. This only works for the most recent commit, however.

```bash
git commit --amend -m "new message"
```

#### `git reset`

The `git reset` command allows you to undo commits with three different behaviors:

- **unstaging files**: Running `git reset` by itself just unstages any files you accidentally staged.
- **soft reset**: A **soft reset** is when you delete commits but you don't undo the changes.
- **hard reset**: A **hard reset** is when you delete commits and you undo the changes, making those changes permanent.

To perform a soft reset, use the `--soft` option and point to a specific commit you want to go back to, deleting all previous commits:

```bash
git reset --soft <commit>
```

To perform a hard reset, use the `--hard` option instead. 

```bash
git reset --soft <commit>
```


> [!CAUTION] 
> Never delete git commit history when working on a repo with others. People need that history.


#### `git revert`

`git revert` is a more collaborative-friendly option for undoing commit history because instead of deleting commits, it only undoes changes much like `git reset --hard` (hard resets) and adds a **revert commit** saying that the codebase reverted to a previous commit.

```bash
git revert <commit>
```

### Git Stashing

When we try to switch to another branch without committing changes, there are two things that can happen:
- we switch to the branch with the changes
- we can’t switch to the branch because there are specific conflicts.

In the case where we can’t switch, we must either commit the changes or stash them if we are not ready to commit. `git stash` is a helpful command that helps you save changes that you are not ready to commit. You can stash all uncommitted changes and return to them later.

The basic stashing workflow is as follows:
- `git stash` : stash away uncommitted changes. This removes the changes and stores them in a stash in the stash stack.
- `git stash pop` : This removes the stash at the top of the stash stack and applies it to the current branch.
- `git stash apply` : This applies the stash at the top of the stash stack without popping it from the stack.

Since stashing is stored in a stack, you can do stuff like name each stash so you can recognize each stash. You can refer to each stash by index, starting at 0 for the stash at the top of the stack.

- `git stash save <stash-name>`: stashes the current changes and assigns a name to it
- `git stash apply <stash>`: applies the specified stash, which can be accessed from the stash index in the stack
- `git stash pop <stash>`: pops and applies the specified stash, which can be accessed from the stash name or the index in the stack

Here are some other useful commands:
- `git stash list`: lists all your stashes
- `git stash drop <stash>`: deletes the specified stash and removes it from the stash stack without applying it.
- `git stash clear` : clears the stash stack.

## Rebasing

### Basic rebasing

![rebasing diagram](https://res.cloudinary.com/dsmvtmv8z/image/upload/v1744405182/image-clipboard-assets/avoqmowdmvz96ad4lc4p.webp)

Rebasing is a way of merging without using merge commits. It's basically a forced fast-forward that rewrites the entire commit history to move the rebasing branch to the tip of the branch that you're rebasing on.


> [!TIP] 
> A great trick to try out rebasing and to prevent messing it up is to create a new temporary branch off the master branch without any changes and then try to rebase onto that branch. If everything works out, then you can try it with the master branch for real.



### Interactive rebasing
## Git configuration and other tips

### Aliases

[![Gist Card](https://github-readme-stats.vercel.app/api/gist?id=8bd4643d2f186cce28a59c6366d243c3)](https://gist.github.com/aadilmallick/8bd4643d2f186cce28a59c6366d243c3)

