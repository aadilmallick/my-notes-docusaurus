## LocalStack

### Installation and authentication

There are 6 ways to use localstack:

- **standalone docker image**
- **localstack operator with kubernetes**
- **docker compose**
- **localstack CLI**
- **localstack desktop**
- **localstack VSCode extension**

All the different ways to use LocalStack require the same thing: an **auth token**.

There are two ways to supply an auth token:

1. **env var method**: export the `LOCALSTACK_AUTH_TOKEN` environment variable into the shell session before interacting with the CLI
2. **CLI way**: run the `lstk` CLI to authenticate.

To debug if the localstack process is currently running, you can make a curl request to `localhost:4566`, which is the port the localhost process runs on.

```bash
curl http://localhost:4566/_localstack/info | jq
```

### Connecting to Localstack

There are two ways to programmatically use LocalStack with AWS:

1. **CLI**: use the `awslocal` CLI or the `aws` CLI and point environment variables to localstack.
2. **AWS local profile**: create a dedicated "localstack" profile in your `~/.aws/config` and `~/.aws/credentials` files. Once this is set up, all IaC solutions like Cloudformation, SAM, and AWS CDK will pull the localstack credentials from the localstack profile and be able to work.

#### AWS credential overrides

**method 1: `aws` way with `--endpoint-url`**

The localstack process runs on a dedicated URL and has its own access keys for programmatic access, so all we have to do is change the endpoint url and some environment variables.

```bash
export AWS_ACCESS_KEY_ID="test"
export AWS_SECRET_ACCESS_KEY="test"
export AWS_DEFAULT_REGION="us-east-1"

# example where we just point to localstack endpoint URL and dummy access keys
aws --endpoint-url=http://localhost.localstack.cloud:4566 kinesis list-streams
```

**method 2: `aws` way with `--profile`**

This method is a tad more convenient than the first because it works with IaC solutions for AWS automatically pulling from the currently authenticated AWS profile, so if you set the currently authenticated AWS profile to a localstack profile, then all IaC actions will automatically connect to LocalStack.

1. Add the following profile to your AWS configuration file (by default, this file is at `~/.aws/config`):

```bash title="~/.aws/config"
[profile localstack]
region=us-east-1
output=json
endpoint_url = http://localhost.localstack.cloud:4566
```

2. Add the `localstack` profile  to your AWS credentials file witht he exact dummy access keys being the value `"test"` (by default, this file is at `~/.aws/credentials`):

```bash title="~/.aws/credentials"
[localstack]
aws_access_key_id=test
aws_secret_access_key=test
```

You can now use the `localstack` profile with the `aws` CLI by specifying the `--profile localstack` flag on every single command:

```bash
aws s3 mb s3://test --profile localstack
aws s3 ls --profile localstack
```

> [!NOTE]
> Alternatively, you can also set the `AWS_PROFILE=localstack` environment variable, in which case the `--profile localstack` parameter can be omitted in the commands above.

**method 3: `awslocal` way**

`awslocal` is the official LocalStack AWS CLI and serves as a thin wrapper and a substitute for the standard `aws` command, enabling you to run AWS CLI commands within the LocalStack environment without specifying the `--endpoint-url` parameter or a profile.

Here is how to install it:

```bash
pip install awscli-local[ver1] # installs version compatiable of v1 of AWS CLI
```


#### Docker compose

Use Docker Compose when you want a reusable configuration file that can be shared across a team or checked into a project repository. Create a `docker-compose.yml` with the following configuration:

```yaml
services:
  localstack:
    container_name: '${LOCALSTACK_DOCKER_NAME:-localstack-main}'
    image: localstack/localstack
    ports:
      - '127.0.0.1:4566:4566' # LocalStack Gateway
      - '127.0.0.1:4510-4559:4510-4559' # external services port range
      - '127.0.0.1:443:443' # LocalStack HTTPS Gateway
    environment:
      # Activate LocalStack for AWS: https://docs.localstack.cloud/getting-started/auth-token/
      - LOCALSTACK_AUTH_TOKEN=${LOCALSTACK_AUTH_TOKEN:?}
      # LocalStack configuration: https://docs.localstack.cloud/references/configuration/
      - DEBUG=${DEBUG:-0}
      - PERSISTENCE=${PERSISTENCE:-0}
    volumes:
      - '${LOCALSTACK_VOLUME_DIR:-./volume}:/var/lib/localstack'
      - '/var/run/docker.sock:/var/run/docker.sock'
```


Execute `docker compose up` to start.


#### Docker CLI

Use the Docker CLI for one-off starts or when you want to test a container configuration before moving it into Compose:

```bash
docker run \
  --rm -it \
  -p 127.0.0.1:4566:4566 \
  -p 127.0.0.1:4510-4559:4510-4559 \
  -p 127.0.0.1:443:443 \
  -e LOCALSTACK_AUTH_TOKEN=${LOCALSTACK_AUTH_TOKEN:?} \
  -v /var/run/docker.sock:/var/run/docker.sock \
  localstack/localstack
```

The Docker Compose and Docker CLI examples above use the same runtime settings:

- The `4566` port exposes the LocalStack Gateway.
- The `4510-4559` range exposes external service ports used by services that bind additional endpoints.
- The `443` port exposes the LocalStack HTTPS Gateway.
- The Docker socket mount is required for services that start additional containers, such as Lambda.
- Docker reuses a local image if one already exists. Pull explicitly or pin an image tag, such as `localstack/localstack:<version>`, when you need reproducible CI or team environments.
- If you use Docker bridge networking, container name resolution may not work as expected from other containers. Prefer the default LocalStack networking setup unless you have a specific reason to customize it.
- Configuration variables can be prefixed with `LOCALSTACK_` in Docker. For instance, setting `LOCALSTACK_PERSISTENCE=1` is equivalent to `PERSISTENCE=1`.
### `lstk` CLI

`lstk` is a high-performance command-line interface for LocalStack, built in Go. It provides a built-in terminal UI (TUI) for interactive use and plain text output for CI/CD pipelines and scripting.

`lstk` handles the full emulator lifecycle: authentication, pulling the Docker image, starting, stopping, and restarting the container, streaming logs, and checking status. 

- It can also save and load emulator state (as local snapshots or Cloud Pods) reset running state, run AWS CLI commands against the emulator, and manage the on-disk volume.
- Running `lstk` with no arguments takes you through the entire startup flow automatically.

`lstk` also proxies developer tools so they run directly against LocalStack: the AWS CLI (`lstk aws`), the Azure CLI (`lstk az`), Terraform (`lstk terraform`), the AWS CDK (`lstk cdk`), and the AWS SAM CLI (`lstk sam`).

#### Installation and updating

Here's how to install with brew:

```bash
brew install localstack/tap/lstk
```

Here's how to install with npm globally

```bash
npm install -g @localstack/lstk
```

You can then update with `lstk update`:

```bash
# Check for updates without installing
lstk update --check

# Update to the latest version
lstk update
```

#### `lstk` for emulator management

- `lstk start`: authenticates and starts the emulator.
- `lstk logs`: view logs from emulator

#### deprecated `localstack` CLI

> [!NOTE]
> [`lstk`](https://docs.localstack.cloud/aws/developer-tools/running-localstack/lstk/) is our new Go-based CLI with an interactive terminal UI for lifecycle (`start`, `stop`), monitoring (`status`, `logs`), storage (`snapshot`), and more.

Here are the basic `localstack` CLI commands:

- `localstack start`: starts localstack on `localhost:4566`
- `localstack logs`: views the logs on localstack
### Localstack VSCode extension development

Read this for more info:

```embed
title: "Developing with LocalStack using the AWS Toolkit for VS Code"
image: "https://blog.localstack.cloud/_astro/banner.DZfy5x8r_ZdcPpx.webp"
description: "The new AWS Toolkit for VS Code integration streamlines your serverless development by connecting directly to LocalStack’s AWS emulator. Seamlessly browse resources, deploy SAM projects, and live debug Lambda functions without leaving your IDE."
url: "https://blog.localstack.cloud/aws-toolkit-vscode-localstack/"
favicon: ""
aspectRatio: "52.5"
```


1. Install AWS toolkit
2. Install the localstack VSCode extension
3. Install the localstack CLI with brew
4. Go to the command palette and then run **Localstack: Run LocalStack setup Wizard**. This will automatically authenticate with your account to use the localstack auth token for localstack actions.
5. Go to the command palette and then run **Localstack: Configure LocalStack profile**

The 4th step adds a dummy login and credentials to your `~/.aws/config` and `~/.aws/credentials` file that you can use so you can AWS through the context of localstack.

As part of the setup, a new `localstack` profile will have been added to your `~/.aws/config` file. If you examine the file, you’ll see the following entry:


```bash title="~/.aws/config"
[profile localstack]
region = us-east-1
output = json
endpoint_url = http://localhost.localstack.cloud:4566
```

and the corresponding entry in `~/.aws/credentials`:

```bash title="~/.aws/credentials"
[localstack]
aws_access_key_id = test
aws_secret_access_key = test
```

> [!NOTE]
> Note that the installer will add these entries to the end of your existing files, but only if you don’t already have a `localstack` profile. Nothing else in these files will be modified.

### Localstack with CDK

To run localstack with CDK, use the `cdklocal` command as a drop-in replacement for the `cdk` package.

```bash
npm install -g aws-cdk-local aws-cdk
cdklocal --version
```



#### Connecting to CDK

Before doing anything with CDK and starting a new project, you must have a fresh slate. You can do this by stopping localstack and then restarting the cloud instance of localstack.

To connect to CDK, you can follow these patterns:

**method 1: connect to AWS localstack profile**

1. Run the `cdklocal init app --language typescript` to scaffold the boilerplate.
2. Export these environment variables:

```bash
export AWS_PROFILE=localstack
export AWS_ACCESS_KEY_ID="test"
export AWS_SECRET_ACCESS_KEY="test"
export AWS_DEFAULT_REGION="us-east-1"
```

3. Now run the `cdklocal bootstrap` command to setup resources.

### Localstack with Amplify

#### Installation and setup

[Amplify LocalStack Plugin](https://github.com/localstack/amplify-localstack) allows the `amplify` CLI tool to create resources on your local machine instead of AWS. It achieves this by redirecting any requests to AWS to a LocalStack container running locally on your machine.

To install the Amplify LocalStack Plugin, install the [amplify-localstack](https://www.npmjs.com/package/amplify-localstack) package from the npm registry and add the plugin to your Amplify setup:

```bash
npm install -g amplify-localstack
amplify plugin add amplify-localstack
```

After installing the plugin, you can deploy your resources to LocalStack using the `amplify init` or `amplify push` commands. The console will prompt you to select whether to deploy to LocalStack or AWS.

You can also add the parameter `--use-localstack true` to your commands to avoid being prompted and automatically use LocalStack. Here is an example:

```bash
amplify init --use-localstack true
amplify add api
amplify push --use-localstack true
```

#### Resource browser

The LocalStack Web Application provides a Resource Browser for managing Amplify applications. You can access the Resource Browser by opening the LocalStack Web Application in your browser, navigating to the **Resource Browser** section, and then clicking on **Amplify** under the **Front-end Web & Mobile** section.

![](https://docs.localstack.cloud/images/aws/amplify-resource-browser.png)

The Resource Browser allows you to perform the following actions:

- **Create new Amplify applications**: Create new Amplify applications by clicking **Create App** and filling in the required details.
- **View Amplify applications**: View the list of Amplify applications created in LocalStack by clicking on the application ID.
- **Edit Amplify applications**: Edit the configuration of an existing Amplify application by clicking on the application ID and then clicking **Edit App**.
- **Delete Amplify applications**: Delete an existing Amplify application by selecting the application, followed by clicking **Actions** and then **Remove Selected**.


### Examples

#### Creating Lambdas and SNS with aws CLI

The `000000000000` is the AWS account ID for localstack, because since you're developing locally, 

```bash
#!/bin/bash

export AWS_DEFAULT_REGION=us-east-1

# 1. create S3 buckets
awslocal s3 mb s3://localstack-thumbnails-app-images
awslocal s3 mb s3://localstack-thumbnails-app-resized

# 2. create an SNS topic
awslocal sns create-topic --name failed-resize-topic
awslocal sns subscribe \
    --topic-arn arn:aws:sns:us-east-1:000000000000:failed-resize-topic \
    --protocol email \
    --notification-endpoint my-email@example.com

# 3. create a python lambda function 
	# --role: for lambdas, set this to arn:aws:iam::000000000000:role/lambda-role
	#c 
awslocal lambda create-function \
    --function-name presign \
    --runtime python3.11 \
    --timeout 10 \
    --zip-file fileb://lambdas/presign/lambda.zip \
    --handler handler.handler \
    --role arn:aws:iam::000000000000:role/lambda-role \
    --environment Variables="{STAGE=local}"

awslocal lambda wait function-active-v2 --function-name presign

awslocal lambda create-function-url-config \
    --function-name presign \
    --auth-type NONE
```


## Localemu

### Installation

#### Virtual environment method

1. Create a virtual environment using the Python version as Python 3.12

```bash
uv --python 3.12 venv .venv
```

2. Activate the virtual environment

```bash
source .venv/bin/activate
```

3. Install localemu v1.2.0 into the virtual environment

```bash
uv pip install "localemu==1.2.0"
```

Now follow the verification steps:

1. List and find `localemu` in the isntalled packages within the virtual environment:

```bash
pip list
pip show localemu
```

2. Deactivate the virtual environment once done with using localemu.

```bash
deactivate
```


#### `uv` method

#### `pipx` method

1. Install `pipx` to manage global packages for you

```
brew install pipx
```

2. Use `pipx` to install `localemu`

```
pipx install localemu
```


### Setup

1. Set these environment variables in your current shell session

```bash
export AWS_ENDPOINT_URL="http://localhost:4566"
export AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
export AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
export AWS_DEFAULT_REGION="us-east-1"
```

2. Start localemu

```bash
localemu start
```

### CLI

```
Commands:
  export    Export running LocalEmu state to deployable Terraform /...
  import    Replay a snapshot into a LocalEmu or AWS endpoint.
  services  List supported services, or show operations for a specific...
  ssh       SSH into a Docker-backed EC2 instance.
  start     Start LocalEmu.
  status    Check LocalEmu status and running services.
  stop      Stop LocalEmu.
  vpc-ip    Show the addressing-redesign view of a container or instance.
```

- `localemu start`: start the emulator
- `localemu stop`: stop the emulator
- `localemu status`: check emulator status
- `localemu services`: List supported services

```bash
# List all supported services
localemu services

# Show operations for a specific service
localemu services s3
localemu services lambda
localemu services dynamodb

# Check running services
localemu status

# Stop
localemu stop
```

By default, LocalEmu state is ephemeral. To keep your resources across restarts:

```bash
# Local
PERSISTENCE=1 localemu start
```
### AWSEMU

`awsemu` is a thin wrapper around the standard AWS CLI. When you run any `awsemu` command, it automatically sets:

- *`--endpoint-url=http://localhost:4566`
- *`AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE`
- *`AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`
- *`AWS_DEFAULT_REGION=us-east-1`

> [!NOTE]
> Every AWS CLI command works with `awsemu`. Just replace `aws` with `awsemu`.


```bash
# Without awsemu (verbose, error-prone)
$ aws --endpoint-url=http://localhost:4566 \
    --region us-east-1 \
    s3 ls

# With awsemu (same result, zero config)
$ awsemu s3 ls
```

```bash
$ awsemu s3 mb s3://my-bucket
make_bucket: my-bucket

$ awsemu dynamodb create-table --table-name Users \
    --key-schema AttributeName=id,KeyType=HASH \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --billing-mode PAY_PER_REQUEST
TableStatus: ACTIVE

$ awsemu sqs create-queue --queue-name my-queue
QueueUrl: http://sqs.us-east-1.localhost:4566/000000000000/my-queue
```

### LocalEmu dashboard

LocalEmu includes a built-in web dashboard for monitoring and exploring your local AWS environment in real time.

```
http://localhost:4566/_localemu/dashboard
```

The dashboard shows:

- **Service overview** with resource counts and status indicators for all active services
- **Resource drill-down**: click any service to see tables, buckets, queues, functions, instances, and more
- **S3 object browser** and **DynamoDB item viewer** with click-through navigation
- **CloudTrail event history** with expandable request/response details
- **Live activity feed** showing API calls as they happen, filterable by service

The dashboard starts automatically with LocalEmu. No configuration needed.