## Gitlab features

### Pull requests

Within pull requests, there are some cool things you can do:

- **add tasks**: markdown todo lists actually create real tasks that are then tracked via DB and shown for all users, creating a nice todo list of tasks to finish on the PR

### Todo list

When you tag something with an `@<username>` mention, it automatically creates a todo item in the **todo list** for their account.

Also, issues assigned to you are also automatically added to your todo list

### Issues

Here is how to create an issue


![](https://i.imgur.com/FwjREIo.jpeg)

A created issue makes a branch behind the scenes, thus you can also create pull requests based on issues and merge issues in.

**labels**

You can also add labels to the issues. 

![](https://i.imgur.com/xOOadAc.jpeg)

You can also subscribe to labels to receive notifications and updates from issues tagged with those labels:


![](https://i.imgur.com/URqfbFd.jpeg)

Based on filtering with labels, you can view them in boards and save those views



![](https://i.imgur.com/YCjnhEO.jpeg)

### SSH 

**Linux**

Here are the steps to set up SSH keys with Gitlab:

1. Create an SSH key pair on your local machine

```sh
ssh-keygen -t ed25519 -C "aadil.mallick@unisonglobal.com"
```

2. THis is what the full process looks like

```
amallick@5DTBSJ4:~$ ssh-keygen -t ed25519 -C "aadil.mallick@unisonglobal.com"
Generating public/private ed25519 key pair.
Enter file in which to save the key (/home/amallick/.ssh/id_ed25519): gitlab_devsecops
Enter passphrase for "gitlab_devsecops" (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in gitlab_devsecops
Your public key has been saved in gitlab_devsecops.pub
The key fingerprint is:
SHA256:asfalksjfalsda aadil.mallick@unisonglobal.com
The key's randomart image is:
+--[ED25519 256]--+
|                 |
|                 |
afjdaskhfajksfaj
|=XO*o=+          |
+----[SHA256]-----+
amallick@5DTBSJ4:~$
```

3. Paste the public SSH key contents (the file ending in `.pub`) into Gitlab
4. Extract your company's gitlab self-hosted host domain, which you will use for scoping easy SSH authentication configuration for specific hosts.

![](https://i.imgur.com/KqBwPDT.jpeg)

5. For the host, edit your `~/.ssh/config` and point to your private key filepath of the SSH key pair you created for the identity file.

```bash title="~/.ssh/config"
# Personal GitHub Account
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal_aadilmallick

# company gitlab
Host gitlab.compusearch.com
    HostName gitlab.compusearch.com
    User git
    IdentityFile ~/.ssh/gitlab_devsecops

```

**Windows**

On windows, the keys are saved in `%USERPROFILE%\.ssh` — the private key has no extension, the public key ends with `.pub`.

On windows, the only difference is the filepath structure, but the `~/.ssh/config` path and file still works the same and the `ssh` command still works the same:


1. Generate the SSH key pair. Give the public key to GitLab as usual. 
2. In the SSH config point the identity file for your specific self-hosted GitLab host to your private key from the key pair you created. 


```bash
Host gitlab.compusearch.com
  HostName gitlab.compusearch.com
  User git
  IdentityFile 'C:\Users\amallick.ENGINEERS/.ssh/gitlab_devsecops'
  IdentitiesOnly yes
```

3. Test the SSH connection. 

```
PS C:\Users\amallick.ENGINEERS> ssh -T git@gitlab.compusearch.com

Authorized uses only. All activity may be monitored and reported.
Welcome to GitLab, @amallick!
```

### Gitlab pages

Gitlab pages is exactly like github pages.

## Gitlab CI

### GitLab pages

```yaml
stages:
  - build
  - deploy

build:
  stage: build
  image: oven/bun:latest
  script:
    - bun install --frozen-lockfile
    - bun test ./tests/transformer.test.ts
    - bun run index.ts
  artifacts:
    paths:
      - public
    expire_in: 1 hour

pages:
  stage: deploy
  image: busybox
  dependencies:
    - build
  script:
    - echo "The site will be deployed to $CI_PAGES_URL"
  artifacts:
    paths:
      - public
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

```
### MakeFiles strategy