## Intro

All linux systems come equipped with the `make` command, which you can think of as a generic process-watcher hot reload system.

Every `make` command runs and watches a `MakeFile` in the current directory, which looks like so, which is a list of **directives**.

```bash
paper.pdf: paper.tex plot-data.png. # directive
	pdflatex paper.tex              # rule
	
plot-%.png: %.dat plot.py           # directive
	./plot.py -i $*.dat -o $@       # rule
```

The main advantage of `make` is that it only reruns the process if and only if the dependencies change.

Here is an example `Makefile`:

```make
export AWS_SECRET_ACCESS_KEY ?= test
export AWS_DEFAULT_REGION=us-east-1
SHELL := /bin/bash

## Show this help
usage:
		@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

## Check if all required prerequisites are installed
check:
	@command -v docker > /dev/null 2>&1 || { echo "Docker is not installed. Please install Docker and try again."; exit 1; }
	@command -v localstack > /dev/null 2>&1 || { echo "LocalStack is not installed. Please install LocalStack and try again."; exit 1; }
	@command -v aws > /dev/null 2>&1 || { echo "AWS CLI is not installed. Please install AWS CLI and try again."; exit 1; }
	@command -v awslocal > /dev/null 2>&1 || { echo "awslocal is not installed. Please install awslocal and try again."; exit 1; }
	@command -v python > /dev/null 2>&1 || { echo "Python is not installed. Please install Python and try again."; exit 1; }
	@command -v jq > /dev/null 2>&1 || { echo "jq is not installed. Please install jq and try again."; exit 1; }
	@echo "All required prerequisites are available."
	
## Install dependencies
install:
	@echo "Installing dependencies..."
	pip install virtualenv
	virtualenv venv
	bash -c "source venv/bin/activate && pip install -r requirements-dev.txt"
	@echo "Dependencies installed successfully."

## Build the Lambda functions
build-lambdas:
	@echo "Building the Lambda functions..."
	bash -c "source venv/bin/activate && deployment/build-lambdas.sh"
	@echo "Lambda functions built successfully."

## Deploy the application locally using `awslocal`, a wrapper for the AWS CLI
deploy:
	@echo "Deploying the application..."
	@make build-lambdas
	deployment/awslocal/deploy.sh
	@echo "Application deployed successfully."

## Deploy the application locally using `tflocal`, a wrapper for the Terraform CLI
deploy-terraform:
	@command -v terraform > /dev/null 2>&1 || { echo "Terraform is not installed. Please install Terraform and try again."; exit 1; }
	@which tflocal || pip install terraform-local
	@echo "Deploying the application..."
	@make build-lambdas
	deployment/tflocal/deploy.sh
	@echo "Application deployed successfully."

## Run tests locally
test:
	@echo "Running tests..."
	bash -c "source venv/bin/activate && pytest tests"
	@echo "Tests completed successfully."

## Start LocalStack
start:
	@echo "Starting LocalStack..."
	@test -n "${LOCALSTACK_AUTH_TOKEN}" || (echo "LOCALSTACK_AUTH_TOKEN is not set. Find your token at https://app.localstack.cloud/workspace/auth-token"; exit 1)
	@LOCALSTACK_AUTH_TOKEN=$(LOCALSTACK_AUTH_TOKEN) localstack start -d
	@echo "LocalStack started successfully."

## Stop LocalStack
stop:
	@echo "Stopping LocalStack..."
	@localstack stop
	@echo "LocalStack stopped successfully."

## Make sure the LocalStack container is up
ready:
		@echo Waiting on the LocalStack container...
		@localstack wait -t 30 && echo LocalStack is ready to use! || (echo Gave up waiting on LocalStack, exiting. && exit 1)

## Save the logs in a separate file
logs:
		@localstack logs > logs.txt

.PHONY: usage install start ready build-lambdas deploy test logs stop
```

### Basic structure

A Makefile consists of rules defining how to build targets from prerequisites. Each rule looks like this:  

```
target: prerequisites
    command
    command
```

- **Target:** What you're building (e.g., an executable).
- **Prerequisites:** Files or other targets needed to build it.
- **Commands:** Shell commands to run, prefixed with a tab (not spaces!).

Let's shrink everything down to the smallest possible example, where we create a target called `hello`:

```make
hello:
	echo "Hello world"
```

Now we can run the `make hello` command to run the `echo "Hello world"` command.

### Variables

Variables in Makefiles act like constants or macros, making your file reusable and easier to maintain. Define them with `VAR = value`, and reference with `$(VAR)`.


**Types of assignment:**

- `=` : Lazy evaluation (value computed when used).
- `:=` : Immediate evaluation.
- `?=` : Set only if not already defined.
- `+=` : Append to existing value.


Here is an example of setting variables in a `Makefile`:

```make
export AWS_SECRET_ACCESS_KEY ?= test
export AWS_DEFAULT_REGION=us-east-1
SHELL := /bin/bash
```

> [!NOTE]
> Use built-in functions like `$(shell command)` for dynamic values.

You can combine with command-line overrides, like `make DEBUG=1 <target>`:

```bash
make ENVVAR=value <target>
```
#### Special variables

- `%`: placeholder for some wildcard text. Think of this as the same as a regex capturing group.
- `$*`: reference substitution to whatever was captured by `%`. Think of this as the same as regex capturing group reference.
- `$@`: name of the target, like name of the output file.
- `$<` : First prerequisite.
- `$^` : All prerequisites.

#### Built-in variables

- `SHELL`: the filepath to the shell to use for spawning make target subprocesses.

```make
SHELL := /bin/bash
```

### Conditionals

Conditionals let your Makefile adapt to environments, like debug vs. release builds. Use `ifdef`, `ifndef`, `ifeq`, `ifneq`.

Here's a practical example with platform detection:

```make
OS := $(shell uname -s)  # Detect OS

ifeq ($(OS),Linux)
    LIBS = -lm
else ifeq ($(OS),Darwin)
    LIBS =
endif
```

### Targets

#### How targets really work

When Make encounters a target, internally, for each command in the target, make launches a shell branching off the parent process.

So for example, for the `hello` target:

```make
hello:
	echo hello
	echo bruh
```

Running `make hello` actually executes two commands sequentially:

```bash
/bin/sh -c "echo hello"
/bin/sh -c "echo bruh"
```


A beginner often expects this to work:

```make
install:
	source venv/bin/activate
	pip install -r requirements-dev.txt
```

it may look reasonable, but Make launches each line in a separate shell, so conceptually it becomes

```bash
bash -c "source venv/bin/activate"
bash -c "pip install -r requirements-dev.txt"
```

The second shell has forgotten everything from the first shell. The virtual environment is no longer active.

To solve this, group both commands into a single Bash session:

```make
install:
	@echo "Installing dependencies..."
	pip install virtualenv
	virtualenv venv
	# do in one process, not two
	bash -c "source venv/bin/activate && pip install -r requirements-dev.txt"
	@echo "Dependencies installed successfully."
```
#### Persisting variables across targets

When you create targets in a Makefile, the commands that run on those targets actually run in a child process, so if you want variables to persist across targets, you need to export them into the parent shell session with `export` keyword:

```make
export AWS_ACCESS_KEY_ID ?= test
```

#### Special targets

These are special target names reserved in a `Makefile`, that are triggered on lifecycle events:

- **`all`**: Default target to set, where if you run `make` without specifying a target, it runs the target specified by `all`.
- **`clean`**: Target that gets triggered to run after a target finishes execution with `make <target>`. Semantically used to remove build artifacts.

> [!NOTE]
> `.PHONY` ensures the target runs even if a file is named the same as one of the targets.

```make
# Makefile with phony targets and tricks
.PHONY: all clean test

all: app  # Default target

app: $(OBJECTS) | build_dir
    @mkdir -p build_dir
    mv $(OBJECTS) build_dir/
    gcc -o build_dir/app build_dir/*.o
    
clean:
   rm -f *.o app

test: app # app step is a dependency to run this test step
    ./build_dir/app  # Assuming it prints test output

```


#### Target dependencies

Most modern developers use Make as a task runner. Historically, that's not its primary purpose. Its primary purpose is dependency management.

An example where the `test` target is dependent on the `app` target, and the `all` target is dependent on the `app` target:

```make
# Makefile with phony targets and tricks
.PHONY: all clean test

all: app  # Default target

app: $(OBJECTS) | build_dir
    @mkdir -p build_dir
    mv $(OBJECTS) build_dir/
    gcc -o build_dir/app build_dir/*.o
    
clean:
   rm -f *.o app

test: app # app step is a dependency to run this test step
    ./build_dir/app  # Assuming it prints test output

```