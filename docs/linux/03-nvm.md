## NVM

NVM is a way to manage different versions of node. 

## Installation

You can install NVM through a curl command to the git repo. NVM also adds lines of code to the `~/.bashrc` in order to source the NVM and run it upon startup.

### Git Bash

For git bash, you can install NVM as normal but then you must add the sourcing code to `~/.bash_profile` as that is what is run at the start of every session instead of `~/.bashrc`.

## Usage

You can install node with `nvm install node` or `nvm install <version>`.

You can use a specific version with `nvm use <version>`:

- `nvm install 20`: installs node version 20
- `nvm install --lts`: installs the current lts version of node



