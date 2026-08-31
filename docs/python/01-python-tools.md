## Pip and PIPX

### `pip` basics

#### Installing packages

Here is how to find out what versions of a package exist:

```bash
pip index versions localemu
```

### `pipx`

The `pipx` is basically pip's `npx` alternative, where a virtual environment is managed for you in your home directory rather than in the CWD.

Here is how to install it:

```bash
brew install pipx
```

#### Package management

- `pipx install <package>`: installs a package
- `pipx uninstall <package>`: installs a package

To install packages globally with `pipx`, just run `pipx install`.

```bash
pipx install localemu
```

You can also specify a specific version to install with package-version syntax below:

```bash
pipx install "<package>==<version>"
pipx install "localemu==1.2.0"
```

> [!NOTE]
> When installing Python packages, the way to refer to a specific version is through the `"<package>==<version>"` syntax.

Here is how to use a specific Python version to install a package:

```bash
pipx install --python /usr/bin/python3.12 "localemu==1.2.0"
```

## UV

### Installation

```bash
# macOS / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Or 

```bash
# Homebrew (macOS)
brew install uv

# pip (if Python is already installed)
pip install uv
```
### Managing Python versions

- `uv python install <version>` : installs a specific version of python

- `uv python uninstall <version>` : uninstalls a specific version of python

- `uv python find <version>` : shows the path to a specific version of python

```bash
# Install a specific Python version
uv python install 3.12

# List available versions
uv python list

# Install multiple versions for testing
uv python install 3.11 3.12 3.13
```

### Virtual environments

The `uv venv` command creates a virtual environment in the CWD in one command

Here is how you can name your virtual environment folder:

```bash
uv venv .venv # creates a virtual environment by creating .venv folder
```

### Package management

#### `uv pip`

If you have existing workflows built around pip and requirements files, uv provides a drop-in compatible interface:

```bash
# Install from requirements.txt
uv pip install -r requirements.txt

# Install a package
uv pip install requests

# Generate a locked requirements file from loose constraints
uv pip compile requirements.in -o requirements.txt

# Sync an environment to match a requirements file exactly
uv pip sync requirements.txt
```

> [!NOTE]
> These commands produce identical results to their pip equivalents but run 10-100x faster. Swap `pip` for `uv pip` in your CI scripts for an immediate speed boost without changing your project structure.

### Projects

You can initialize a project to use `uv` using the `uv init` command and specifying the project folder:


```bash

uv init <foldername>

```

  
You can then add dependencies using the `uv add` command:

```bash

uv add <package>

```

`uv init` scaffolds a new project with a `pyproject.toml`. The virtual environment and lockfile are created when you first run `uv sync`, `uv add`, or `uv run`.

```bash
# Create a new project
uv init my-project
cd my-project

# Add dependencies
uv add requests
uv add pandas numpy

# Add development dependencies
uv add --dev pytest ruff

# Install everything (creates/updates .venv and uv.lock)
uv sync

# Run the console script uv init created
uv run my-project
```

Here is the basic workflow:

1. Init a uv project in either the current directory or make a new one and select your specific python version

  
  ```
  uv init <foldername> --python <version>
  ```


2. Sync project, which initializes venv and activates it and installs all dependencies in the `pyproject.toml`

```
uv sync
```

> [!NOTE]
> `uv.lock` pins every direct and transitive dependency to an exact version, ensuring reproducible installs across machines. Unlike `pip freeze` output, uv’s lockfile is cross-platform by default.

#### `pyproject.toml`

This is what a `pyproject.toml` looks like:

```toml
[project]
name = "text-analyzer"
version = "0.1.0"
description = "Add your description here"
readme = "README.md"
requires-python = ">=3.10"
dependencies = []

[project.scripts]
text-analyzer = "text_analyzer:main"

[build-system]
requires = ["uv_build>=0.12.0,<0.13.0"]
build-backend = "uv_build"
```

- The `[project.scripts]` line is what makes `text-analyzer` runnable as a command: it points at the `main` function inside the `text_analyzer` module. 
- The `[build-system]` table tells Python how to build the project into an installable package.

Now you can run this project as `uv run text-analyzer`, where `text-analyzer` is a custom script that just runs the `main()` function in the `text_analyzer.py` file.


#### Project initialization in depth

##### Setting a python version

You can pin a project to a specific Python version with a [`.python-version` file](https://pydevtools.com/handbook/explanation/what-is-a-python-version-file/):

```bash
uv python pin 3.12
```

This writes a `.python-version` file that uv (and other tools) respect. When a collaborator clones the project and runs `uv sync`, uv reads this file and downloads the specified interpreter if it is not already installed.

Changing your project’s Python version is straightforward:

```bash
uv python pin 3.13
uv sync
```
#### `uv add`

You can now add whatever dependencies with `uv add` and run files with `uv run`.

Each `uv add` updates `pyproject.toml`, refreshes `uv.lock`, and installs the package into `.venv/`.

Creating a new project will generate 1) `uv.lock` file in the project and 2) `.venv/` directory that stores the virtual environment

- `.venv`: The virtual environment holds the project’s Python interpreter and installed packages and records the exact version of every installed package, so everyone working on the project gets identical installs. 
- `uv.lock`: The lockfile pins exact versions so anyone else can reproduce the environment with one command.

##### **Dev dependencies**

You can add dev dependencies with the `--dev` flag, which adds those packages into a separate `[dependency-groups]` table within the `pyproject.toml` instead of the main `dependencies` list.

```bash
uv add --dev pytest
```

They get installed in `.venv/` like any other package, but `uv sync --no-dev` will skip them, which matters when you build a slim Docker image or deploy to production.

Use the dev tools through `uv run` so they pick up the project’s venv automatically. If you call `ruff` directly without `uv run`, your shell either reports `command not found: ruff` or runs a different Ruff installed elsewhere on your machine.

```bash
$ uv run ruff format .
$ uv run ruff check --fix .
```
### `uv run`

The `uv run` command runs a python file, automatically creating and using a virtual environment, but can also be used npm style to run scripts.

#### Running files

`uv run` can be passed a python filepath and run that python file in the context of the current virtual environment.

```bash

uv run <filename>

```

Here are the additional flags you have access to:

- `--with <package>`: specifies a package to install and run the package with.
- `--python <version>`: specifies a specific Python version to use to run the file with.

You can also pass dependencies on the command line without modifying the script:

```bash
uv run --with requests script.py
```

This is useful for quick experiments or when running someone else’s script with an additional package. You can even specify a Python version:

```bash
uv run --python 3.11 script.py
```

For interactive work, uv launches a REPL with your project’s dependencies available:

```bash
uv run python
```

#### Running scripts

`uv run` executes a Python script after ensuring the project’s virtual environment is up to date. For one-off scripts that aren’t part of a project and you don't want to force the script consumer to install a virtual environment just to use your CLI, you can specify dependencies inline using [PEP 723](https://pydevtools.com/handbook/explanation/what-is-pep-723/) metadata:

```python
# /// script
# dependencies = ["requests", "rich"]
# requires-python = ">=3.11"
# ///

import requests
from rich import print

response = requests.get("https://api.github.com/zen")
print(response.text)
```

You can then run the script with `uv run <filename>`:

```
uv run script.py
```
### Installing and using packages globally

Many Python packages ship command-line tools: [Ruff](https://pydevtools.com/handbook/reference/ruff/), [Black](https://pydevtools.com/handbook/reference/black/), [Jupyter](https://pydevtools.com/handbook/how-to/jupyter-notebook-with-uv/), and dozens more. uv provides two ways to run them:

- `uvx`: the drop-in replacement for `pipx`, which allows you to both run and install packages.
- `uv tool install`: installs packages globally and adds them to the path.

> [!NOTE]
> Which to use maps to how often you run the tool: 
> 
> - `uvx` for occasional or one-off runs
> - `uv tool install` for daily use with the tool on your PATH. 4
> 
> Both isolate the tool’s dependencies from your project.



#### `uvx`

`uvx` runs a tool in a temporary, isolated environment. No installation required. The tool is cached for fast subsequent runs:

#### `uv tool install`

`uv tool install` installs a tool permanently so it’s available as a regular command:

```bash
uv tool install ruff
ruff check .  # now available directly
```

This replaces [pipx](https://pydevtools.com/handbook/reference/pipx/) for most use cases. Each tool gets its own isolated environment, so tools never conflict with each other or with your project’s dependencies.

Here is an example of installing a global package with a specific version and specific python interpreter version.

```bash
uv tool install --python 3.12 "localemu==1.2.0"
```

You can also upgrade installed tools:

```bash
uv tool upgrade ruff
uv tool upgrade --all
```

### `uv format`

uv includes a `uv format` command that formats Python code using [Ruff](https://pydevtools.com/handbook/reference/ruff/)’s formatter.

```bash
# Format all Python files in the project
uv format

# Check formatting without making changes
uv format --check
```

Formatting settings are read from `[tool.ruff.format]` in your `pyproject.toml`. If you already use [Ruff](https://pydevtools.com/handbook/reference/ruff/) for formatting, `uv format` uses the same configuration.

> [!NOTE]
> `uv format` is experimental and prints a preview warning. Its interface may change. For a stable formatting setup today, run Ruff directly (`uvx ruff format`) or pin a uv version in CI.

### uv with pytest

```bash
uv add --dev pytest
uv run pytest
```
## Ruff

Ruff gives Python developers a single tool for linting, formatting, import sorting, and code modernization. 

One dev dependency, one configuration section in [pyproject.toml](https://pydevtools.com/handbook/reference/pyproject.toml/), one CI step. It ships as a standalone binary with no runtime dependencies, so installation is fast and there are no version conflicts to manage.

### Installation

The recommended way to add Ruff to a project is as a dev dependency:

```bash
uv add --dev ruff
```

For one-off usage without installing:

```bash
uvx ruff check .
```

For a global install available on your PATH:

```bash
uv tool install ruff
```

Alternative methods:

```bash
pip install ruff
pipx install ruff
```

Confirm the installation:

```bash
ruff --version
```

### `ruff check`

`ruff check` scans Python files for errors, style violations, and potential bugs:

```bash
# Check all files in the current directory
ruff check .

# Check a specific file
ruff check src/main.py

# Check a specific directory
ruff check src/
```

Output shows the file, line, column, rule code, and message:

```
src/main.py:3:1: F401 [*] `os` imported but unused
src/main.py:7:5: F841 Local variable `x` is assigned to but never used
```

The `[*]` marker indicates a rule with an available auto-fix. Apply all safe fixes with:

```bash
ruff check --fix .
```

### `ruff format`