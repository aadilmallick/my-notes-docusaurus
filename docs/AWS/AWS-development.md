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

### Building and deploying

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

### Endpoints

```bash
sam list endpoints --output json
```

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
## AWS SDK

### Lambda functions

#### Basics

There are two main ways to create lambda functions in your code:

1. **AWS toolkit + upload lambda**: write the code for a lambda function and then manually upload it to the AWS console or use AWS toolkit to upload it.
2. **infrastructure as code**: Using something like AWS CDK or serverless framework, you can write the code describing the behavior and architecture of the lambda, and then also write the actual source code of the lambda.

The basic code for a lambda has the following three rules:

1. There must be an exported async handler function in the file, which takes in an `event` parameter and returns an object that structures a response.
2. The `event` parameter will have different types depending on which type of Lambda you are creating (input/output of Lambda)
3. You must return an object with `statusCode`, `body`, and `headers` property.

```ts
/**
 * In AWS Lambda, your entrypoint is always an exported function.
 */
export const handler = async (
  event: any // different lambdas will have different types of events
) => {
    console.log("📥 Received Event:", JSON.stringify(event, null, 2));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({"message" : "hello world"}),
    };
}
```

##### Deploying, logging, testing

Once your Lambda function is live in production, you can't use `console.log` on your local terminal anymore to see what's happening. Instead, AWS routes everything automatically to **Amazon CloudWatch Logs**.

- Every time you use `console.log()` or `console.error()` inside your TypeScript Lambda code, AWS catches it and saves it as a line item inside a CloudWatch **Log Stream**.
    
- If a production user gets a `500 Internal Server Error`, you jump straight into the CloudWatch console, find your function's log stream, and read the exact stack trace generated by your Node process.

#### API Gateway Lambda

This is an example of a lambda that should be used as an API gateway handler.

- **event typing**: The `event` argument coming into the lambda should be typed with the `APIGatewayProxyEvent` interface.
- **response**: The response type returned from the lambda should be typed with the `APIGatewayProxyResult` interface.

```ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

/**
 * In AWS Lambda, your entrypoint is always an exported function.
 * API Gateway routes events here into the `event` parameter.
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log("📥 Received API Gateway Event:", JSON.stringify(event, null, 2));

    // Extract query parameters from the HTTP request url (e.g. ?name=Sam)
    const name = event.queryStringParameters?.name || "Anonymous Developer";

    // Build a structured response matching what API Gateway expects
    const responseBody = {
      message: `Hello ${name}! Welcome to your serverless backend.`,
      timestamp: new Date().toISOString(),
    };

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(responseBody),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
```

##### Testing

This is how you can test this API gateway lambda by mocking the event:

```json title="mock-event.json"
{
  "queryStringParameters": {
    "name": "Satoshi"
  },
  "body": null,
  "headers": {
    "Content-Type": "application/json"
  },
  "requestContext": {
    "httpMethod": "GET",
    "path": "/hello",
    "resourcePath": "hello",
  }
}
```

```ts
import { expect, test } from "vitest";
import { handler } from "./lambda-handler";
import mockEvent from "./mock-event.json";
import { APIGatewayProxyEvent } from "aws-lambda";

test("Lambda should greet the user by name from query parameters", async () => {
  // Cast our mock JSON to the official AWS Lambda type
  const event = mockEvent as unknown as APIGatewayProxyEvent;
  
  // Execute the handler directly on your machine
  const result = await handler(event);
  
  // Assert the outcome
  expect(result.statusCode).toBe(200);
  
  const body = JSON.parse(result.body);
  expect(body.message).toContain("Hello Satoshi!");
});
```

##### Deploying

There are three main ways to deploy an API gateway that uses a lambda as its handler.

**method 1: manual**

- **Deploying the Lambda:**
    
    - Go to the AWS Console -> **Lambda** -> click **Create function**.
        
    - Choose **Author from scratch**, name it `my-typescript-lambda`, and select the **Node.js** runtime.
        
    - Paste your compiled JavaScript code into the built-in code editor (or upload a compressed `.zip` containing your script and `node_modules`).
        
- **Adding API Gateway:**
    
    - Inside your new Lambda function dashboard, look at the top diagram block and click **+ Add trigger**.
        
    - From the dropdown, select **API Gateway**.
        
    - Select **Create a new API**, and pick **HTTP API** (it’s newer, faster, and cheaper than REST API).
        
    - Set Security to **Open** (for now, so we can test it publicly).
        
    - Click **Add**.
        
- **The Result:** AWS will automatically generate a public URL for you (e.g., `https://random-id.execute-api.us-east-1.amazonaws.com/default/my-typescript-lambda`). You can click that link or hit it with Postman instantly!

**method 2: CLI**

1. Create IAM role that allows for lambda execution and log writing:

```bash
# 1. Create the role
aws iam create-role --role-name lambda-ex-role --assume-role-policy-document '{
  "Version": "2012-10-17",
  "Statement": [{ "Effect": "Allow", "Principal": { "Service": "lambda.amazonaws.com" }, "Action": "sts:AssumeRole" }]
}'

# 2. Attach basic execution logging policies to it
aws iam attach-role-policy --role-name lambda-ex-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

2. Zip and deploy the lambda, setting the `AWS_ACCOUNT_ID` env var to the AWS account ID you want to upload the lambda to.

```bash
# Zip up your compiled index.js file
zip function.zip index.js

# Deploy it to AWS
aws lambda create-function --function-name MyCLILambda \
--zip-file fileb://function.zip --handler index.handler --runtime nodejs18.x \
--role arn:aws:iam::${AWS_ACCOUNT_ID}:role/lambda-ex-role
```

#### S3 Lambda

When a file is uploaded to an S3 bucket, S3 can publish an asynchronous event message. If a Lambda function is subscribed to that bucket, AWS will automatically invoke your function and pass a JSON payload containing metadata about the bucket and the exact file key that changed.

```ts
import { S3Event } from "aws-lambda";

// An S3Event contains an array of 'Records' because AWS can batch events together!
const exampleStructure: S3Event = {
  Records: [
    {
      awsRegion: "us-east-1",
      eventName: "ObjectCreated:Put",
      s3: {
        bucket: {
          name: "my-dev-bucket",
          arn: "arn:aws:s3:::my-dev-bucket"
        },
        object: {
          key: "uploads/user-profile.png",
          size: 14325,
          eTag: "d41d8cd98f00b204e9800998ecf8427e"
        }
      }
    }
  ]
};
```

> [!NOTE]
> Notice how it doesn't contain the _contents_ of the file itself? It only tells you _where_ the file is! If your Lambda needs to read or process the file (like resizing an image), it must use the `S3Client` and `GetObjectCommand` we learned earlier to grab it using the `bucket.name` and `object.key`.

```ts
import { S3Event, S3Handler } from "aws-lambda";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({});

// Using the built-in S3Handler type enforces correct inputs and promise outputs
export const handler: S3Handler = async (event: S3Event): Promise<void> => {
  try {
    // S3 events can technically contain multiple file records in a batch
    for (const record of event.Records) {
      const bucketName = record.s3.bucket.name;
      
      // S3 keys in events are URL-encoded! (e.g., spaces become '+' or '%20')
      // Decoded keys prevent "NoSuchKey" errors when trying to read the file.
      const fileKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
      
      console.log(`📷 New file detected! Processing ${fileKey} from bucket ${bucketName}`);

      // If this were an image thumbnail maker, we would download the file like this:
      /*
      const response = await s3Client.send(new GetObjectCommand({
        Bucket: bucketName,
        Key: fileKey
      }));
      const fileBuffer = await response.Body?.transformToByteArray();
      // ... perform image manipulation logic here ...
      */
    }
  } catch (error) {
    console.error("❌ Error processing S3 event trigger:", error);
    throw error; // Throwing ensures Lambda registers a failure in CloudWatch metrics
  }
};
```


### Bedrock

#### OpenAI compatible endpoints

Here is how you can use the bedrock API key to query GPT models:

1. Set the `OPENAI_API_KEY` env var to the bedrock API key and set the `OPENAI_BASE_URL` env var to point to the bedrock inference endpoint.

```bash
export OPENAI_API_KEY="bedrock-api-key-...."
export OPENAI_BASE_URL="https://bedrock-mantle.us-east-1.api.aws/v1"
```

2. Install openai

```bash
npm install openai
```

3. Run inference as normal:

```ts
import OpenAI from "openai";  

const client = new OpenAI();  

const response = await client.responses.create({ 
    model: "openai.gpt-oss-120b", 
    input: [ 
        { role: "user", content: "Write a one-sentence bedtime story about a unicorn." } 
    ] 
});  

console.log(response.output_text);
```




### AWS bedrock API inference


1. Export the env var `AWS_BEARER_TOKEN_BEDROCK` into the shell session

```bash
export AWS_BEARER_TOKEN_BEDROCK="bedrock-api-key-..."
```

2. INstall the bedrock SDK:

```bash
npm install @aws-sdk/client-bedrock-runtime
```

3. Run inference like so:

```ts
import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: "us-east-1" });

const response = await client.send(new ConverseCommand({ 
    modelId: "us.anthropic.claude-haiku-4-5-20251001-v1:0", 
    messages: [
        { 
            role: "user",
            content: [{ text: "Write a one-sentence bedtime story about a unicorn." }] 
        } 
    ] 
}));

console.log(response.output.message.content[0].text);
```