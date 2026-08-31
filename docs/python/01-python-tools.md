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


## UV

## Ruff