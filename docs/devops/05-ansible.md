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
	- This is a big benefit because installing agents on remote servers are a pain and require manual downloading.
- **declarative pushing**: One control node pushes to all target hosts, ansible is a push model.



Here is the core loop behind how ansible works:

1. Make one machine a **control node** that has ansible installed on it.
2. Connect to other servers via SSH and send the ansible module to those servers, called **hosts**, so you can control them via Ansible playbooks. 
	- The servers can be hosted on any cloud provider and you can mix and match them since Ansible is provider agnostic.


![](https://i.imgur.com/0rKHvJU.jpeg)


### Control pane

In the `/etc/ansible` folder on the control pane instance there are three important files/folders:

- `ansible.cfg`: ansible configuration settings file
- `hosts`: contains the list of target hosts that the control pane can connect to for controlling them.
	- Also called the **Inventory file**

#### Adding hosts to the inventory file

The ansible inventory file lists the servers and target hosts that Ansible will manage.

- Servers are organized into groups called **hosts**, where each individual host is a group of IP addresses or servers to include in that target group.
- a single host is more like a group of target hosts that all get targeted with the same name reference.

Here is how to add a new host to the `hosts` file:

```toml
[host_name]

# list of IP address to include in this target host group
ip-address-1
ip-address-2
...
```

#### Controlling hosts imperatively

Now you can use the `ansible` CLI to control hosts imperatively by running Linux commands on those target host groups:

```bash
# HOST = the name of a target host group you created in the `hosts` file
# COMMAND = any linux command to run on the target hosts, like `ping`
ansible $HOST_NAME -m $COMMAND
```



```bash
# HOST = the name of a target host group you created in the `hosts` file
# COMMAND_STRING = a shell command string to execute
ansible $HOST_NAME -a $COMMAND
```


#### Controlling hosts declaratively

We can use Ansible playbooks to declaratively control target hosts via Ansible
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



## Ansible on EC2 instance example

Here are some links that go over this lab in detail:

- [Lab+-+Configuration+Management+with+Ansible.pdf](https://drive.google.com/file/d/1mjC5s2Rb_UsQcBJCBeZEVy7XnfdXoHk4/view?usp=sharing)
- [Configuration+Management+Tools+Study+Guide.pdf](https://drive.google.com/file/d/1mRTme1qQ1SPrWwZZ9fKFApRKhdOdbf2A/view?usp=sharing)

### Step 1 - Setup

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

3. Create an inventory file adding hosts, create two hosts and use private IP addresses of the individual target instances in the hosts:

```ini
[web]
172.31.40.47
172.31.42.209

[control]
172.31.36.74
```

### Step 2 - connect to hosts

For Ansible to manage the servers, it needs SSH access to them. When you created the instances, AWS provided a key pair for secure access, and all of those instances should have the same key pair.

1. Transfer the key pair from your local computer to the Control VM. Use the following command in your terminal:

```
scp -i ansible-key.pem ansible-key.pem ubuntu@<Control_VM_Public_IP>:~/
```

2. Test SSH connections from control VM to the target VM via its private IP address.

```
ssh -t -i ansible-key.pem ubuntu@<Private_IP_of_target_instance>
```

3. Create a playbook on the control VM

```yaml
- hosts: web
	 become: yes
	 tasks:
		 - name: Install Apache
			 apt:
			 name: apache2
			 state: present
		 - name: Start Apache
			 service:
			 name: apache2
			 state: started
			 enabled: yes
```

3. Run the playbook, where we specify the inventory file to use with the `-i` flag and the private SSH key to use for connecting to the hosts with the `--private-key` flag and then run the playbook with `ansible-playbook setup-web-server.yml`

```bash
ansible-playbook -i inventory --private-key ansiblekey.pem setup-web-server.yml 
```