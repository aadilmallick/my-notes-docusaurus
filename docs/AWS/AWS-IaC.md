## AWS-SAM

### Intro

AWS Serverless Application Model (AWS SAM) is an open-source framework for building serverless applications using infrastructure as code (IaC). With AWS SAM's shorthand syntax, developers declare [CloudFormation](https://aws.amazon.com/cloudformation) resources and specialized serverless resources that are transformed to infrastructure during deployment. When working with AWS SAM, you will interact with:

1. AWS SAM CLI - A command-line tool that helps you develop, locally test, and deploy your serverless applications.
    
2. AWS SAM Template - An extension of CloudFormation that provides simplified syntax for defining serverless resources.

AWS SAM is an ideal IaC solution for scenarios where you want simplified serverless development with the full power of CloudFormation. For example, you can use SAM for:

- **Serverless applications:** You can use SAM to quickly define AWS Lambda functions, Lambda durable functions, Amazon API Gateway APIs, Amazon DynamoDB tables, and other serverless resources with minimal code.
    
- **CloudFormation enhancement:** You can combine SAM with existing CloudFormation templates to add serverless components to traditional infrastructure. SAM resources work alongside standard CloudFormation resources in the same template.
    
- **Local development and testing:** You can use the SAM CLI to test Lambda functions locally, simulate API Gateway endpoints, and debug serverless applications on your development machine before deploying to AWS.
    
- **CI/CD for serverless:** You can build deployment pipelines using SAM templates that automatically generate the CloudFormation infrastructure needed for staging and production environments.
    
- **Migration from console-created resources:** You can convert Lambda functions and API Gateway resources created in the AWS Management Console into infrastructure as code using SAM templates.
    

**Comparing AWS SAM with other IaC tools**

- Use SAM instead of CloudFormation to simplify serverless resource definitions while maintaining template compatibility.
    
- Use SAM instead of AWS CDK if you prefer a declarative approach to describing your infrastructure rather than a programmatic one.
    
- Combine SAM with AWS CDK by using SAM CLI's local testing features to enhance your CDK applications.

### Installation

**Linux installation**

You can install this package via brew:

```bash
brew install aws-sam-cli
```

### Basics

1. Run the `sam init` command to create your serverless application and create a project directory.
2. Modify the `template.yaml` file, which is your AWS SAM template.
3. Run the `sam build` command to update the changes you made in the `template.yaml` to produce a new CloudFormation output. When you build, the AWS SAM CLI creates a `.aws-sam` directory and organizes your function dependencies, project code, and project files there.

> [!WARNING]
> The installed Python version must match the `Runtime` property specified in `template.yaml`. For production workloads, we recommend using Python 3.12 or earlier versions that are fully supported in AWS environments. If the Python versions don't match, you'll encounter build errors.

To resolve version compatibility issues:

- Specify a compatible [runtime](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-init.html#sam-cli-command-reference-sam-init-options-runtime) during initialization: `sam init --runtime python3.9`
- Modify the `Runtime` property in `template.yaml` after initialization

#### File structure

```
.
├── README.md
├── events    // contain sample events
│   └── event.json
├── hello-world  // contain lambda image code
│   ├── Dockerfile
│   ├── app.mjs
│   ├── package.json
│   └── tests    // for testing lambda with sample event
│       └── unit
│           └── test-handler.mjs
├── samconfig.toml
└── template.yaml
```

Here are the important top-level files:

- `template.yaml`: A template that defines the application's AWS resources.

And here are the dedicated folders:

- `hello-world/tests` : folder containing nit tests for the application code.
- `events`: folder containing sample JSON events that you can use to invoke the function and test it out.

#### Building and deploying

**building**

Run the `sam build` command to build the CloudFormation template from your `template.yaml`

> [!NOTE]
> If you don't have Python on your local machine, use the **`sam build --use-container`** command instead. The AWS SAM CLI will create a Docker container that includes your function's runtime and dependencies. This command requires Docker on your local machine.

The following is a shortened example of the `.aws-sam` directory created by the AWS SAM CLI:
    
```
.aws-sam
├── build
│   ├── HelloWorldFunction
│   │   ├── __init__.py
│   │   ├── app.py
│   │   └── requirements.txt
│   └── template.yaml
└── build.toml
```

Some important files to highlight:

- `build/HelloWorldFunction` – Contains your Lambda function code and dependencies. The AWS SAM CLI creates a directory for each function in your application.
    
- `build/template.yaml` – Contains a copy of your AWS SAM template that is referenced by CloudFormation at deployment.
    
- `build.toml` – Configuration file that stores default parameter values referenced by the AWS SAM CLI when building and deploying your application.
    
**deploying**

You are now ready to deploy your application to the AWS Cloud.

In this step, you use the AWS SAM CLI to deploy your application to the AWS Cloud. The AWS SAM CLI will do the following:

- Guide you through configuring your application settings for deployment.
    
- Upload your application files to Amazon Simple Storage Service (Amazon S3).
    
- Transform your AWS SAM template into an CloudFormation template. It then uploads your template to the CloudFormation service to provision your AWS resources.

To deploy your application, follow these steps:

1. Run the `sam deploy` command and walk through the TUI.

```bash
sam deploy --guided
```


Here is what happens behind the scenes:

- The AWS SAM CLI creates an Amazon S3 bucket and uploads your `.aws-sam` directory.
- The AWS SAM CLI transforms your AWS SAM template into CloudFormation and uploads it to the CloudFormation service.
- CloudFormation provisions your resources.

**building and deploying all together**

```bash
sam build
sam deploy --guided
```

The first command will build a docker image from a Dockerfile and then the source of your application inside the Docker image. The second command will package and deploy your application to AWS, with a series of prompts:

- **Stack Name**: The name of the stack to deploy to CloudFormation. This should be unique to your account and region, and a good starting point would be something matching your project name.
- **AWS Region**: The AWS region you want to deploy your app to.
- **Confirm changes before deploy**: If set to yes, any change sets will be shown to you before execution for manual review. If set to no, the AWS SAM CLI will automatically deploy application changes.
- **Allow SAM CLI IAM role creation**: Many AWS SAM templates, including this example, create AWS IAM roles required for the AWS Lambda function(s) included to access AWS services. By default, these are scoped down to minimum required permissions. To deploy an AWS CloudFormation stack which creates or modifies IAM roles, the `CAPABILITY_IAM` value for `capabilities` must be provided. If permission isn't provided through this prompt, to deploy this example you must explicitly pass `--capabilities CAPABILITY_IAM` to the `sam deploy` command.
- **Save arguments to `samconfig.toml`**: If set to yes, your choices will be saved to a configuration file inside the project, so that in the future you can just re-run `sam deploy` without parameters to deploy changes to your application.

> [!NOTE]
> Deployment configuration settings are stored in `samconfig.toml` so you can run `sam deploy` without any flags or arguments on subsequent deployments.

### Local testing

After building the function with `sam build`, you have these options available to you:

```
Commands you can use next
=========================
[*] Validate SAM template: sam validate
[*] Invoke Function: sam local invoke
[*] Test Function in the Cloud: sam sync --stack-name {{stack-name}} --watch
[*] Deploy: sam deploy --guided
```

#### Local function invocation

1. Build the app with the `sam build` command
2. Run functions locally and invoke them with the `sam local invoke` command:

Here is a manual invocation of a function, where you use the `sam local invoke` command and pass the function name to invoke (pulled from `template.yaml`) and the specific sample event to pass using the `--event` flag.

```bash
sam local invoke HelloWorldFunction --event events/event.json
```

The SAM CLI can also emulate your application's API. Use the `sam local start-api` to run the API locally on port 3000.

```bash
sam local start-api
curl http://localhost:3000/
```

#### Logs

To simplify troubleshooting, SAM CLI has a command called `sam logs`. `sam logs` lets you fetch logs generated by your deployed Lambda function from the command line. In addition to printing the logs on the terminal, this command has several nifty features to help you quickly find the bug.

```bash
sam logs -n HelloWorldFunction --stack-name sam-lambda-course --tail
```

### Deployment in depth

#### Deleting stacks

To delete the sample application that you created, use the AWS CLI. Assuming you used your project name for the stack name, you can run the following:

```bash
sam delete --stack-name sam-lambda-course
```

### Deployment information

You can list all the currently deployed endpoints with the `sam list endpoints` command

```bash
sam list endpoints --output json
```

### `template.yaml` in depth

Let's examine the basic hello world example for `template.yaml`:

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Transform: AWS::Serverless-2016-10-31
Description: |
  sam-lambda-course
  Sample SAM Template for sam-lambda-course

# More info about Globals: https://github.com/awslabs/serverless-application-model/blob/master/docs/globals.rst
Globals:
  Function:
    Timeout: 3
Resources:
  HelloWorldFunction:
    Type: AWS::Serverless::Function
    Properties:
      PackageType: Image
      Architectures:
        - x86_64
      Events:
        HelloWorld:
          Type: Api
          Properties:
            Path: /hello
            Method: get
    Metadata:
      DockerTag: nodejs24.x-v1
      DockerContext: ./hello-world
      Dockerfile: Dockerfile
  RollDieFunction:
    Type: AWS::Serverless::Function
    Properties:
      PackageType: Image
      ImageUri: roll-die/ # this is the path to the folder where the Dockerfile is located
      Architectures:
        - x86_64
      Events:
        RollDieGet:
          Type: Api
          Properties:
            Path: /roll
            Method: get
        RollDiePost:
          Type: Api
          Properties:
            Path: /roll
            Method: post
    Metadata:
      DockerTag: nodejs24.x-v1
      DockerContext: ./roll-die
      Dockerfile: Dockerfile

Outputs:
  # ServerlessRestApi is an implicit API created out of Events key under Serverless::Function
  # Find out more about other implicit resources you can reference within SAM
  # https://github.com/awslabs/serverless-application-model/blob/master/docs/internals/generated_resources.rst#api
  HelloWorldApi:
    Description: API Gateway endpoint URL for Prod stage for Hello World function
    Value: !Sub https://${ServerlessRestApi}.execute-api.${AWS::Region}.${AWS::URLSuffix}/Prod/hello/
  HelloWorldFunction:
    Description: Hello World Lambda Function ARN
    Value: !GetAtt HelloWorldFunction.Arn
  HelloWorldFunctionIamRole:
    Description: Implicit IAM Role created for Hello World function
    Value: !GetAtt HelloWorldFunctionRole.Arn

```

Your file has this structure

```
AWSTemplateFormatVersion
Transform
Description

Globals

Resources

Outputs
```

These are the major sections.

Think of it like

```
Metadata

Global defaults

Actual AWS resources

Useful information after deployment
```

#### Metadata section

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Transform: AWS::Serverless-2016-10-31
Description: |
  sam-lambda-course
  Sample SAM Template for sam-lambda-course
```

Pretty standard, these settings don't change.

> [!NOTE]
> The `|` means register it as a multiline string, maintain new line breaks verbatim.

#### Global defaults

The `Global` top level provides global configuration across all AWS resources of a specific type, like for lambda functions, a shared timeout, environment variables, etc.

This below example gives all lambda functions a timeout of 30 seconds.

```yaml
Globals:
  Function:
    Timeout: 30
```

**Lambda function globals**

Global configuration across all lambda functions live under the `Globals.Function` key.

**`LoggingConfig` globals**


```yaml
LoggingConfig:
	LogFormat: JSON
```

Without it

```
hello world

user logged in

finished
```

With JSON

```
{
  "level":"INFO",
  "message":"user logged in",
  "timestamp":"..."
}
```

Structured logs are much easier to search.
#### AWS resources

SAM is not just for lambda. It's IaC for all AWS resources.

Under the `Resources` top level key, you define the resources you want to provision and their individual configuration. Here are some examples of resources you can provision:

- `AWS::Serverless::Function`: represents a lambda function, which you can create either with containerization or zipping the source code folder, both of which SAM handles for you.

Here is an example resource, where we create a lambda function resource by specifying the type as `AWS::Serverless::Function` under the logical ID `HelloWorldFunction`.

```yaml
Resources:
  HelloWorldFunction: # logical ID of resource
    Type: AWS::Serverless::Function # define as lambda
    Properties: # configuration for the lambda
	    ...
```

##### Lambda Resources

Here are the important top-level configuration keys that live under the `Properties` key:

- `PackageType`: `Zip` to zip up lambda source code or `Image` to use docker to build lambda source code.
- `Architectures`: which architectures to build the lambda for
- `Events`: the triggers to define for the lambda

```yaml
Resources:
  # name of resource
  HelloWorldFunction:
    Type: AWS::Serverless::Function # define as lambda
    Properties:
	  # use Zip method and target lambda source handler() at hello-world/app.mjs
      PackageType: Zip
      CodeUri: hello-world/
      Handler: app.lambdaHandler
      Architectures:
        - x86_64
      # define lambda triggers
      Events:
        HelloWorld: # API gateway trigger that executes lambda on GET /hello
          Type: Api
          Properties:
            Path: /hello
            Method: get
  RollDieFunction:
    Type: AWS::Serverless::Function
    Properties:
      PackageType: Image
      ImageUri: roll-die/ # folderpath where the Dockerfile is located
      Architectures:
        - x86_64
      Events:
        RollDieGet:
          Type: Api
          Properties:
            Path: /roll
            Method: get
        RollDiePost:
          Type: Api
          Properties:
            Path: /roll
            Method: post
    Metadata:
      DockerTag: nodejs24.x-v1
      DockerContext: ./roll-die
      Dockerfile: Dockerfile
```

**zip vs dockerfile method**

When choosing to either use a DockerFile to package up your lambdas or let SAM manage the lambda source code by zipping it up, you have different configurations you need to provide.

For a single lambda resource, to control whether using zip method or docker method, you specify the `Properties.PackageType` either with the `Zip` value to specify zip or `Image` value to specify docker.

- `PackageType: Zip`: Uses zip mode for lambda packaging and requires these properties:
	- `CodeUri`: the path to the folder (relative from project root) containing the lambda source code.
	- `Handler`: follows the syntax `<file-basename>.<handler-method-name>`, which specifies the specific function to register as the lambda handler function.
		- For example, `app.handler` refers to the exported `handler()` method in `app.mjs`
	- 

#### Deployment outputs


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
2. **CLI way**: use the `localstack` CLI to run the `localstack auth set-token` command to set your auth token for localstack and gain permanent authentication:

```bash
localstack auth set-token <YOUR_AUTH_TOKEN>
localstack start
```

To debug if the localstack process is currently running, you can make a curl request to `localhost:4566`, which is the port the localhost process runs on.

```bash
curl http://localhost:4566/_localstack/info | jq
```

### Connecting to Localstack

There are two ways to programmatically use LocalStack with AWS:

1. **CLI**: use the `awslocal` CLI or the `aws` CLI and point environment variables to localstack.
2. **AWS local profile**: create a dedicated "localstack" profile in your `~/.aws/config` and `~/.aws/credentials` files. Once this is set up, all IaC solutions like Cloudformation, SAM, and AWS CDK will pull the localstack credentials from the localstack profile and be able to work.

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





### Localstack CLI

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


### LocalStack with SAM
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


## Serverless Framework

