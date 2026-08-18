## Intro

### Why ansible

Ansible is an **agentless** network automation and server infrastructure tool used for providing a declarative way to configure network settings and OSs for multiple devices at a time via YAML files.

On top of that, Ansible also has these use cases:

- **ansible vault**: Has two way encryption and decryption of SSH keys and dotfiles
- **configuration across multiple systems**

Ansible has many advantages over bash scripts, the core ones being that the setup is customizable and easily modular for different host machines while also allowing for differences in network and OS settings. 

> [!NOTE]
> When bash gets too complicated, Ansible is the winner.

### How does ansible work

Here are the core components in ansible:

- **playbook**: declarative yaml files that house a series of plays.
- **plays**: A set of instructions/tasks that can be executed on one of more target hosts. Plays have these properties:
	- **parallel**: plays can be executed in parallel since they target different hosts and don't depend on each other
	- **idempotent**: play execution is idempotent, preventing destructing re-executions
- **task**: a step in a play. A task could just run bash or do other stuff like fetch secrets

With Ansible, you make a change on the control node, and then the control node implements the playbook and pushes changes to all configured target hosts at once, with rollbacks.

Here are the core properties of ansible:

- **Python-based**: can be installed with Python
- **agentless**: no need to install agents on target hosts. Rather, updates to target hosts are done via SSH.
- **declarative pushing**: One control node pushes to all target hosts, ansible is a push model.



Here is the core loop behind how ansible works:

1. Make one machine a **control node** that has ansible installed on it.
2. Connect to other servers via SSH and send the ansible module to those servers, called **hosts**, so you can control them via Ansible playbooks. 
	- The servers can be hosted on any cloud provider and you can mix and match them since Ansible is provider agnostic.


![](https://i.imgur.com/0rKHvJU.jpeg)




## Basics


### First ansible script

Here is the most basic ansible script possible, which runs on your local computer (denoted by `localhost`)


```yaml title="first-playbook.yaml"
- name: My first playbook
  hosts: localhost
  tasks:
```

Then you can execute this playbook by using the `ansible-playbook` command and running it on a YAML file:


```bash
ansible-playbook first-playbook.yaml
```

### Installing neovim on ansible

This is an example of a multi-step process where using ansible, we can setup neovim instantly for any device just by running the playbook. In the playbook, here are the steps we take in order to install neovim:

1. Clone the neovim git repo using the `ansible.builtin.git` task
2. Install global libraries using `apt` via the `ansible.builtin.apt` task.
3. Run the `make` command using the ansible `<linux_command>` task, where you can treat any linux command like an ansible task and control how the execution of that command works by passing in these arguments:
	- `target`: any arguments (non flags) passing into the command
	- `params`: key-value pair dictionary of flags and their values
	- `chdir`: the directory to cd into before executing the command.

```yaml
- name: My first playbook
  hosts: localhost
  tasks:
  
  # 1. clone specific version of neovim repo into your filesystem
  - name: Git neovim
    ansible.builtin.git:
      repo: "https://github.com/neovim/neovim.git"
      dest: "{{ lookup('ansible.builtin.env', 'HOME') }}/personal/neovim"
      version: v0.9.4

  # 2. install libraries using apt
  - name: Install helping libs
    become: true
    ansible.builtin.apt:
      pkg:
      - lua5.1
      - liblua5.1-0-dev
      - cmake
      - gettext

  # 3. cd into $HOME/personal/neovim then run the cmake command
  - name: neovim
    make:
      chdir: "{{ lookup('ansible.builtin.env', 'HOME') }}/personal/neovim"
      params:
        CMAKE_BUILD_TYPE: "RelWithDebInfo"

  # 4. cd into $HOME/personal/neovim then run the `make install` command.
  - name: neovim install
    become: true
    make:
      target: install
      chdir: "{{ lookup('ansible.builtin.env', 'HOME') }}/personal/neovim"
```

Since the installation of packages requires `sudo`, running this playbook as-is will not work because it requires a password, which needs TTY interaction, thus breaking the automation.

To run the playbook already authenticated as the superuser, run the `ansible-playbook` command with the `-k` option:

```bash
ansible-playbook -k neovim.yaml
```

## Ansible example

### Ansible on EC2 instance

1. Create three EC2 instances and then make one of them the **control plane** on which you're going to SSH into and download Ansible. 
2. SSH into the control plane EC2 and then run these commands to install ansible, or make this a user data script:

```bash
# ON UBUNUTU
#!/bin/bash
sudo apt update
sudo apt upgrade
sudo apt install ansible -y

# ON AMAZON AMI
#!/bin/bash
yum update -y
yum install epel-release -y
yum install ansible -y
```