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

To delete all resources provisioned from the CloudFormation template, just run the `sam delete` command to delete all stacks and their resources.

```bash
sam delete
```

#### Deployment information

You can list all the currently deployed endpoints with the `sam list endpoints` command

```bash
sam list endpoints --output json
```

### `template.yaml` primer

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

##### Implicit resources

Certain keys can create implicit resources behind the scenes, which are not resources you explicitly define under the `Resources` key, but rather resources that SAM manages and makes for you, like IAM roles, API gateways, etc.

```yaml
Resources:
  RollDieFunction:
    Type: AWS::Serverless::Function
    Properties:
      PackageType: Image
      ImageUri: roll-die/
      Architectures:
        - x86_64
      Events:
        RollDieGet:
          Type: Api # creates implicit API gateway
          Properties:
            Path: /roll
            Method: get
```


For example, when you create the above API gateway trigger for the `RollDieFunction`, here are the resources that implicitly get created:

- `RollDieFunctionRole`: the IAM role attached to the lambda that provides basic lambda execution permissions

Also, whenever you create an API gateway event type, it implicitly creates a API gateway resource with the logical ID as `ServerlessRestApi`  behind the scenes that acts as an API gateway for all API gateway proxy lambdas you set in the app.

> [!NOTE]
> Implicit resources can be accessed as variables through their logical ID and then combined with functions like `!GetAtt` or `!Sub` to dynamically retrieve values from them.

##### Explicit Resources

Explicit resources can often be much easier to reason about, so you can define APIs and other resources explicitly and then reference them with the `!Ref` function whenever you need to:

```yaml
Resources:
  MyApi: # define API gateway with logical ID MyApi
    Type: AWS::Serverless::Api
```

Now when creating API gateway events you can reference the explicit API gateway reference to use through the `!Ref` function.

```yaml
Events:
  CreateUser:
    Type: Api
    Properties:
      RestApiId: !Ref MyApi
      Path: /users
      Method: post
```

#### Deployment outputs, functions, Variables implicit vs explicit APIs

Deployment outputs are just like `CfnOutput` instances in AWS CDK, where important info is printed to the console.

```yaml
Outputs:
  # ServerlessRestApi is an implicit API created out of Events key under Serverless::Function
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

##### Outputs

Outputs live under the `Outputs` key and define the outputs for each AWS resource created in the SAM build.

Here is the basic syntax:

```yaml
Outputs:
	<ResourceLogicalId>:
		Description: some description of the output
		Value: some value of the output
```

However, for outputs to do anything useful we need to use functions and variables to dynamically read properties of created resources.

##### Functions and variables

**functions**

The `!GetAtt`, `!Ref`, and `!Sub` functions are important for retrieving data and creating dynamic values.

- **fetching resource properties via logical ID**: the `!GetAtt` function allows you to reference an AWS resource by its logical ID and then extract a property from that resource.

```yaml
!GetAtt HelloWorldFunction.Arn # Retrieve the ARN attribute of HelloWorldFunction.
```

- **string interpolation**: The `!Sub` function allows you to perform string interpolation by using the `${varname}` syntax.

```yaml
!Sub Hello ${AWS::Region} # returns "Hello us-east-1"
```

- **fetching AWS ID of a resource**: You can fetch the AWS ID of a resource through the `!Ref` function and passing the logical ID of the resource to it:

```yaml
Events:
  CreateUser:
    Type: Api
    Properties:
      RestApiId: !Ref MyApi
      Path: /users
      Method: post
```

**global variables**

Here are the global variables that are always available:

- `AWS::Region`: returns the current AWS region
- `AWS::URLSuffix`: always returns `amazonaws.com`

**implicit variables**

You also have variables that come from implicitly created resources or APIs, which makes this:

```
https://${ServerlessRestApi}.executeapi.${AWS::Region}.${AWS::URLSuffix}/Prod/hello
```

Become this:

```
https://abc123.execute-api.us-east-1.amazonaws.com/Prod/hello/
```

### Lambda resources

Serverless functions in SAM are defined by the `AWS::Serverless::Function`resource type, but there is one very important thing to keep in mind:

>A SAM Function is **not** a Lambda function. It's actually a **template** that SAM expands into multiple CloudFormation resources.

For example, this:

```
Resources:
  MyFunction:
    Type: AWS::Serverless::Function
```

is approximately expanded into something like:

```
MyFunction (SAM)

        │
        ▼

AWS::Lambda::Function
AWS::IAM::Role
AWS::Logs::LogGroup
AWS::Lambda::Permission
AWS::ApiGateway::Integration (if API)
AWS::ApiGateway::Method
AWS::ApiGateway::Deployment
```

#### Intro

Here are the important top-level configuration keys that live under the `Properties` key:

- `Timeout`: the max timeout in seconds of the lambda function
- `ReservedConcurrentExecutions`: the max concurrency for the lambdas, meaning the maximum number of lambdas that can run at one time.
- `Memory`: the max memory in megabytes to let the lambda function execution environment have.
	- An important thing to remember is *Higher memory == faster execution*.
- `Architectures`: which architectures to build the lambda for, which accept either `x86_64` or `arm64` as values.
	- An important thing to remember is your Docker image architecture **must match** this value.


And here are the top-level keys that require a bit more configuration and determine a large portion of lambda behavior:

- `PackageType`: `Zip` to zip up lambda source code or `Image` to use docker to build lambda source code.
- `Events`: the triggers to define for the lambda
- `Environment`: provides configuration to set environment variables
- `Policies`: policies to attach to the lambda role
- `Metadata`: metadata that helps containerized images find their Dockerfile path, etc.

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
      ReservedConcurrentExecutions: 5
      Architectures:
        - x86_64
      # define lambda triggers
      Events:
        HelloWorld: # logical ID for trigger
          Type: Api # API gateway trigger that executes lambda on GET /hello
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


Here's a more complete example:

```yaml
Resources:
  CreateUserFunction:
    Type: AWS::Serverless::Function

    Properties:

      PackageType: Image

      Timeout: 30

      MemorySize: 512

      Architectures:
        - arm64

      Environment:
        Variables:
          DATABASE_URL: postgres://...
          LOG_LEVEL: info

      Policies:
        - DynamoDBCrudPolicy:
            TableName: Users

      Events:
        CreateUser:
          Type: Api
          Properties:
            Path: /users
            Method: post

    Metadata:
      DockerContext: ./functions/create-user
      Dockerfile: Dockerfile
      DockerTag: latest
```
#### **zip vs dockerfile method**

When choosing to either use a DockerFile to package up your lambdas or let SAM manage the lambda source code by zipping it up, you have different configurations you need to provide.

For a single lambda resource, to control whether using zip method or docker method, you specify the `Properties.PackageType` either with the `Zip` value to specify zip or `Image` value to specify docker.

- `PackageType: Zip`: Uses zip mode for lambda packaging and requires these properties:
	- `CodeUri`: the path to the folder (relative from project root) containing the lambda source code.
	- `Handler`: follows the syntax `<file-basename>.<handler-method-name>`, which specifies the specific function to register as the lambda handler function.
		- For example, `app.handler` refers to the exported `handler()` method in `app.mjs`
- `PackageType: Image`: Uses zip mode for lambda packaging and requires these properties:
	- `ImageUri`: the path to the folder (relative from project root) containing the Dockerfile.

#### Environment variables

The `Properties.Environment` key on a resource lets you set environment variables which can be accessed in code.

```yaml
Environment:
  Variables:
    DATABASE_URL: xxx
    NODE_ENV: production
    API_KEY: abc
```

However, to load secrets that should not be exposed within the `template.yaml`, you would have to references secrets inside Secrets manager or SSM parameter store like so:

```yaml
DATABASE_URL: !Ref DatabaseSecret
```

#### Policies and roles

Without SAM creating IAM permissions is incredibly verbose. Instead you can simply write something like this, creating policies under the `Properties.Policies` key, which will then attach that policy to the implicitly created lambda execution role.

```yaml
Policies:
  - DynamoDBCrudPolicy: # grants READ/WRITE to a specific ddb table
      TableName: Users
```

By default, the implicitly created role will have the `AWSLambdaBasicExecutionRole` permissions attached to it, but if you want to add additional policies, here are some examples:

```yaml
Policies:
  # grants the lambda READ objects permission to the uploads bucket
  - S3ReadPolicy:
      BucketName: uploads
      
  # grants the lambda READ/WRITE to the Users ddb table
  - DynamoDBCrudPolicy: 
	TableName: Users

 # allows the lambda to send messages to the Orders SQS queue
  - SQSSendMessagePolicy:
      QueueName: Orders
```

You can also use any of the 1,482 AWS managed policies, like the `AWSLambdaBasicExecutionRole` which grants basic lambda execution permissions to the implicitly created lambda role.

```yaml
Policies:
    - AWSLambdaBasicExecutionRole
```

Overall the steps for giving your lambda the right permissions are as follows:

1. Either you create your own role, use an existing role, or just do nothing and use the implicit role attached to the lambda.
2. Specify additional policies
##### Override implicit role

Instead of Policies, you can provide your own IAM Role that will override the implicitly created lambda role. There are two ways you can do this:

1. **use existing role**: point the lambda to use an already existing role and thus set of permissions via the `Properties.Role` key

```yaml
Role: arn:aws:iam::123456789:role/MyRole
```

2. **create new role**: Create a new role that is basically you creating a JSON policy statement that defines permissions for the lambda role. This requires both the `Properties.AssumeRolePolicyDocument` and the `Properties.Policies` keys

```yaml
Resources:
  HelloWorldFunction:
    Type: AWS::Serverless::Function
    Properties:
      # 1. create the role
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
            Action: sts:AssumeRole
      # 2. define the policies to attach to the role
      Policies:
        - AWSLambdaBasicExecutionRole
```



> [!NOTE]
> Generally,
> 
> - use `Policies` for most projects
> - use `Role` only when you need full control or must reuse an existing role

#### Events

The `Properties.Events` key defines the triggers for the lambda and creates all the necessary infrastructure behind the scene to create the trigger wiring successfully.

| Event Type      | Trigger                                    |
| --------------- | ------------------------------------------ |
| Api             | HTTP request through API Gateway           |
| HttpApi         | HTTP request through API Gateway HTTP APIs |
| Schedule        | Cron or rate expression                    |
| S3              | File uploaded to a bucket                  |
| SQS             | Message arrives in a queue                 |
| SNS             | Topic publishes a message                  |
| DynamoDB        | Table stream record changes                |
| EventBridgeRule | Custom or AWS events                       |
| CloudWatchLogs  | Log subscription                           |
| Kinesis         | Stream records                             |

For example:

```yaml
Resources:
  HelloWorldFunction:
    Type: AWS::Serverless::Function

    Properties:
      PackageType: Image

      Events:
        Hello: # logical ID for trigger
          Type: Api
          Properties:
            Path: /hello # triggers lambda on GET /hello to API gateway
            Method: get
```

This tiny amount of YAML creates:

```
Lambda
↓
API Gateway
↓
Permission allowing API Gateway to invoke Lambda
↓
Method
↓
Integration
↓
Deployment
↓
Stage
```

##### REST API Gateway events

You specify a REST API gateway through specifying the `Events.<Event-ID>.Type` to be of value `Api`.

Here are the different keys that live under the `Properties` configuration for an API gateway event:

- `Path`: the routing pattern to match for the event
- `Method`: the lowercase HTTP method to match for the event.

**routing**

This is how to match a dynamic route to `GET /users/:id`:

```yaml
Events:
	Hello: # logical ID for trigger
	  Type: Api
	  Properties:
		Path: /users/{id} # triggers lambda on GET /users/:id to API gateway
		Method: get
```

Then inside the lambda you can access it through the `event.pathParameters.id` property:

```js
/**
 * @param {import('aws-lambda').APIGatewayEvent} event - The API Gateway event object.
 * @param {import('aws-lambda').Context} context - The Lambda execution context.
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResult>} The response object.
 */
export const lambdaHandler = async (event, context) => {

  /**
    * @type {import('aws-lambda').APIGatewayProxyResult}
    */
  const response = {
	statusCode: 200,
	body: JSON.stringify({
	  message: `route id is ${event.pathParameters.id}`,
	}),
  };


  return response;
};

```

**http method**

Here are the allowed HTTP method values you can pass to the `Properties.Method` property for an API Gateway Event:

```
get

post

put

delete

patch

head

options

any
```

**implicit event**

When specifying an API gateway event, SAM creates an implicit API gateway called `ServerlessRestApi` which you can then access as a variable.

##### HTTP API Gateway event

You specify a HTTP (newer version) API gateway through specifying the `Events.<Event-ID>.Type` to be of value `HTTPApi`.

> [!NOTE]
> You should always prefer `HTTPApi` now to just `Api`, because HTTP API gateway version is not only newer but also faster and simpler. Most new APIs should use **HTTP APIs** unless you specifically need a REST API feature such as API keys, request validation, usage plans, or certain advanced integrations.


```yaml
Events:
	Hello: # logical ID for trigger
	  Type: HTTPApi # define HTTP API gateway trigger
	  Properties:
		Path: /users/{id} # triggers lambda on GET /users/:id
		Method: get
```

**code**

Now in the code, since you're using the HTTP API, then you should use the V2 versions.

```ts
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";

export const handler = async (
    event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
	// code here
};
```

##### S3 event

```yaml
Events:
  Upload: # logical ID of trigger
    Type: S3 # S3-based trigger
    Properties:
      Bucket: !Ref UploadBucket # reference specific bucket resource
      Events: s3:ObjectCreated:* # listen for any object created evenbts
```

##### SQS event

```yaml
Events:
  Message: # logical ID of trigger
    Type: SQS # SQS based trigger that forwards messages to lambda
    Properties:
      Queue: !GetAtt OrdersQueue.Arn # reference queue
      BatchSize: 10 # batch size (max concurrent messages)
```

##### Cron event

```yaml
Events:
  Cleanup: # logical ID of trigger
    Type: Schedule # cron based trigger that runs lambda on schedule
    Properties:
      Schedule: rate(5 minutes) # runs every 5 minutes
```

You can also use normal cron syntax to describe the schedule:

```yaml
Schedule: cron(0 3 * * ? *)
```

##### EventBridge

Think of EventBridge as AWS's central event bus.

Example

```
Order Created

↓

EventBridge

↓

Inventory Lambda

↓

Email Lambda

↓

Analytics Lambda
```

One event.

Multiple consumers.

SAM

```
Type: EventBridgeRule
```

Very popular in microservices.

##### SNS

SNS is pub/sub.

```
Publisher

↓

Topic

↓

Subscriber A

Subscriber B

Subscriber C
```

SAM

```
Type: SNS
```

Good for broadcasting notifications to multiple systems.

##### DynamoDB streams

Suppose someone inserts

```
New User
```

into DynamoDB.

Automatically

```
DynamoDB

↓

Stream

↓

Lambda
```

Great for

- auditing
- analytics
- cache invalidation
- search indexing
#### Layers

Lambda Layers are shared code or binaries.

Imagine

```
20 Lambdas
```

all need

```
FFmpeg
```

Instead of embedding FFmpeg into every image or ZIP,

you can create

```
FFmpeg Layer
```

Every Lambda mounts it.

```
Layer

↓

Lambda A

Lambda B

Lambda C
```

This reduces duplication for ZIP-based deployments. For container image Lambdas, you'll often bake shared dependencies into a common base image instead of using layers.


#### VPC

If your lambda needs access to private AWS resources that live inside VPCs, like RDS, then you need to specify which VPC a lambda should live in.

```yaml
VpcConfig:
  SecurityGroupIds:
    - sg-123

  SubnetIds:
    - subnet-1
    - subnet-2
```

Pros

- Access to private resources (RDS, internal services)

Cons

- More networking complexity
- Historically slower cold starts (much improved today)


#### Function URLs

Not every Lambda needs API Gateway.

Lambda URLs provide a built-in HTTPS endpoint.

```
FunctionUrlConfig:
  AuthType: NONE
```

Now AWS creates

```
https://abc.lambda-url.us-east-1.on.aws
```

Much simpler than API Gateway for lightweight services.

#### Metadata

The `Properties.Metadata` field describes how to look for the Dockerfile and prepare the build context.

```yaml
Metadata:
      DockerTag: nodejs24.x-v1
      DockerContext: ./roll-die # the folder of content the Dockerfile can access
      Dockerfile: Dockerfile # the path to DockerFile within the DockerCOntext
```

- `Metadata.DockerContext`: specifies the build path which contains all the files the Dockerfile can access. The Dockerfile cannot access any files or folders outside of what you provide to the `DockerContext`.
- `Metadata.Dockerfile`: the path to DockerFile relative to the folderpath you provided for `DockerContext`.



### SAM with TypeScript and Docker

#### Basic Docker

#### Docker with TypeScript

#### Useful Utilities

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

