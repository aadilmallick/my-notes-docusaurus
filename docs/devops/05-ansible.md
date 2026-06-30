## Why Ansible

Ansible is a network automation and server infrastructure tool used for providing a declarative way to configure network settings and OSs for multiple devices at a time via YAML files.

On top of that, Ansible also has these use cases:

- **ansible vault**: Has two way encryption and decryption of SSH keys and dotfiles
- **configuration across multiple systems**

Ansible has many advantages over bash scripts, the core ones being that the setup is customizable and easily modular for different host machines while also allowing for differences in network and OS settings. 

When bash gets too complicated, Ansible is the winner.

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