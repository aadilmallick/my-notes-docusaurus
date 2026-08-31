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

### Managing Python versions

- `uv python install <version>` : installs a specific version of python

- `uv python uninstall <version>` : uninstalls a specific version of python

- `uv python find <version>` : shows the path to a specific version of python

### Projects

You can initialize a project to use `uv` using the `uv init` command and specifying the project folder:


```bash

uv init <foldername>

```

  
You can then add dependencies using the `uv add` command:

```bash

uv add <package>

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


You can now add whatever dependencies with `uv add` and run files with `uv run`
### Running files

The `uv run` command runs a python file, automatically creating and using a virtual environment.

  

```bash

uv run <filename>

```
## Ruff