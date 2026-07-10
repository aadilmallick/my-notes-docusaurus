## Basics

### Why CDK

The CDK is infrastructure as code via a TypeScript API and is much faster and less error-prone than creating AWS resources yourself manually.

Behind the scenes, the CDK compiles into **CloudFormation** terraform code that then declaratively spins up AWS resources behind the scenes.


### CDK architecture 


![](https://i.imgur.com/3WvaJBQ.jpeg)


- **constructs**: the individual AWS resources or architecture deployments that serve a single purpose, like a lambda, DynamoDB table, S3 bucket, or a load balancer that combines ELB, EC2, and auto-scaling.
- **stacks**: a logical grouping of related constructs together so you can organize them and also have the constructs within the same stack easily interact with each other.
- **app**: a grouping of all the stacks you want to deploy. You can only have one app per CDK project.

#### Constructs

AWS CDK structures its API for creating cloud resources in three increasing levels of abstraction called **constructs**, going from L1 -> L2 -> L3.

- **L1 constructs**: also called **CFN resources**, these are the lowest level abstraction and represent individual building blocks that make up AWS services, and are pretty much one-to-one with CloudFormation configuration for resources.
	- **use case**: when you want compete control over a resource's configuration and provide every single detail.
	- **con**: too unnecessarily complicated.
- **L2 constructs**: also called **curated constructs**, these abstraction represent single AWS service components, like a lambda or a DynamoDB table or a single S3 bucket. This is the most common construct.
	- **pro**: These resources come with sensible defaults, good security by default, a decent amount of configuration, and a good set of helper methods.
	- **use case**: when you want to use a single instance of a service, like a DynamoDB table or create a lambda function.
- **L3 constructs**: Also called **patterns**, these constructs represent high-level architectures combining multiple AWS services, like a load balancer with an auto-scaling group or a lambda connecting to DynamoDB and S3 buckets all at once.
	- **pro**: offer a simple abstraction over big architectures like a load balancer.
	- **con**: offer less configuration for the individual L2 constructs that make up the L3 construct

#### Stacks

A logical grouping of related constructs together so you can organize them and also have the constructs within the same stack easily interact with each other.

For example, an event listener stack would consist of multiple constructs related to events, logging, and notifications, such as:

- notification lambdas that send emails with SES
- eventbridge rules
- Cloudwatch alarms that send SNS topics
- DynamoDB streams

#### Apps

An app is a grouping of all the stacks you want to deploy.

You can have multipel stacks per app, but you can only deploy one single app from your CDK project.


## CDK code

### Basics

#### File structure

```
my-cdk-app/
├── bin/
│   └── my-cdk-app.ts        # Entry point — instantiates the App and Stacks
├── lib/
│   └── my-cdk-app-stack.ts  # Your stack definition(s) live here
├── test/
│   └── my-cdk-app.test.ts   # Jest tests
├── cdk.json                 # CDK config: how to run the app, feature flags
├── cdk.out/                 # Synthesized output (git-ignored)
├── package.json
├── tsconfig.json
└── jest.config.js
```

**`cdk.json` — the config file**

The most important line is `app`, which tells the CLI how to run your program:

```json
{
  "app": "npx ts-node --prefer-ts-exts bin/my-cdk-app.ts",
  "context": {
    "@aws-cdk/aws-lambda:recognizeLayerVersion": true,
    "@aws-cdk/core:checkSecretUsage": true
  }
}
```

The `context` block contains **feature flags** — versioned behavior toggles CDK uses so upgrading the library doesn't silently change how your existing infrastructure synthesizes. 

> [!WARNING]
> Don't hand-edit the feature flags in the `"context"` block unless you know what you're doing; `cdk init` sets them to sensible values for your CDK version.

Because the app is run via `ts-node`, you never need a manual compile step for deployment — the CLI transpiles on the fly. (You still compile for tests and type-checking.)

#### Constructs

A **construct** is the basic building block. It represents one or more AWS resources — or a logical grouping of them. Everything in CDK is a construct: a single S3 bucket is a construct, a whole VPC is a construct, and your entire application is a construct.

Constructs form a tree. Each construct is created with three arguments, which is a pattern you'll type thousands of times:


```typescript
new SomeConstruct(scope, id, props);
```

- **`scope`** — the parent construct. This is what places the new construct into the tree. Usually you pass `this`.
- **`id`** — a string that must be unique _among siblings_ under the same scope. CDK uses it to generate stable **logical IDs** for CloudFormation.
- **`props`** — a configuration object specific to that construct.

> [!NOTE]
> You will deal with the `scope` parameter a lot, but it's exactly what is sounds like: each construct (L1, L2, L3) needs to be "scoped" into a parent construct so it knows where it belongs.
> 
> - L2 constructs like lambdas, DynamoDB tables, etc. should be scoped into an L3 construct like a stack or a load balancer.
> - L3 constructs like load balancers should be scoped into a stack, and stacks should be scoped into an app.

> [!NOTE]
> The parent construct must always be at the same level or greater.
> 
> - An L1 construct cannot be the parent of an L2 construct.
> - An L3 construct can be the parent of L1 and L2 constructs, or even other L3 constructs.


Here are the different important types of L3 constructs:

- **multi-service systems**: stuff like load balancers which combine many services together.
- **stacks**: logical collections of multiple cloud resources and services.
- **app**: the culmination of all stacks you want to deploy.

Obviously, these L3 constructs are of different sizes, and follow a nesting order:

```
L3 constructs -> stacks -> 1 app
```

#### Stack and app 

A stack extends from the `cdk.Stack` type and is considered an L3 construct, inheriting from the `Construct` class.


```ts title="lib/cdk-learning-stack.ts"
import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkLearningStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'CdkLearningQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}

```

When instantiating a stack, its constructor takes in three arguments:

- `scope`: A `Construct` type which can be any L1, L2, L3 construct that should define the **parent construct**.
	- In the context of deciding the `scope` for a stack, a stack is a L3 construct, and a stack belongs to an app, so we should pass in the entire CDK app as the parent L3 construct for the stack. 
- `id`: a unique string identifier to uniquely identify this stack in cloudformation.
- `props`: a list of configuration, like the AWS account ID to run this IaC code in, the specific region to spin up all this services in, etc.

Here's a complete example, where we create a S3 bucket as an L2 construct scoped to a stack, then we instantiate the stack by scoping it to the app.

```ts
import { Bucket } from "aws-cdk-lib/aws-s3";
import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";

export class CdkLearningStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // example resource: create bucket with ID Level2Bucket and dynamic name
    const s3Bucket = new Bucket(this, "Level2Bucket", {
      versioned: true,
    });
  }
}
```

```ts
#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { CdkLearningStack } from '../lib/cdk-learning-stack';

const app = new cdk.App();
new CdkLearningStack(app, 'CdkLearningStack', {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
```

```ts
#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { MyCdkAppStack } from '../lib/my-cdk-app-stack';

const app = new App();

new MyCdkAppStack(app, 'MyCdkAppStack', {
  // env determines which account/region the stack deploys to.
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
```

Now when we run `cdk deploy`, a new bucket with an ID `"Level2Bucket"` gets created, but it has a unique bucket name that cloudformation creates at runtime.

> [!NOTE]
> `CDK_DEFAULT_ACCOUNT` and `CDK_DEFAULT_REGION` are set automatically by the CLI from your current credentials.

##### Stacks

A **stack** is the unit of deployment. It maps one-to-one to a CloudFormation stack. Everything you want deployed together lives inside a stack. When you `cdk deploy`, you're deploying stacks.

A stack is itself a construct (it extends `Stack`, which extends `Construct`). You define resources by creating constructs _inside_ a stack, passing the stack as their scope.

##### Apps

An **app** is the root of the tree. It's a container for one or more stacks. When CDK runs, it executes your app, walks the construct tree, and synthesizes each stack into a template.

Here's how they nest:

```
App
├── Stack (e.g. "NetworkStack")
│   ├── Vpc construct
│   └── SecurityGroup construct
└── Stack (e.g. "AppStack")
    ├── Function (Lambda) construct
    └── Bucket (S3) construct
```

##### The smallest complete example


```typescript
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

class MyFirstStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // A construct created inside the stack.
    // `this` is the scope — the bucket becomes a child of the stack.
    new Bucket(this, 'MyBucket', {
      versioned: true,
    });
  }
}

const app = new App();
new MyFirstStack(app, 'MyFirstStack');
app.synth();
```

#### IDs and retention policies

CDK derives CloudFormation **logical IDs** from the construct's path in the tree (its chain of `id`s) plus a hash. Logical IDs are how CloudFormation tracks resources across deployments. This has a consequence that trips up beginners:

**If you rename a construct's `id`, or move it to a different scope, CloudFormation sees it as a delete-and-recreate, not a rename.** For a stateful resource like a database or bucket, that means data loss. Choose IDs thoughtfully and be very careful about renaming or restructuring stateful resources after they're in production.

The ID of a cloudformation resource/construct is static and must be unique as to uniquely identify the construct so the CDK can intelligently read diffs between a resource's previous state and a current state, uniquely targeted by the ID.

Let's say you change an important property of the bucket like the bucket name:

```ts
import { Bucket } from "aws-cdk-lib/aws-s3";
import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";

export const constants = {
  APP_NAME: "cdk-learning-stack",
  userPrefix: "2022amallick",
  createResourceName: (resourceName: string) =>
    `${constants.userPrefix}-${constants.APP_NAME}-${resourceName}`,
};

export class CdkLearningStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // example resource: create bucket with ID Level2Bucket and static name
    const s3Bucket = new Bucket(this, "Level2Bucket", {
      versioned: true,
      bucketName: constants.createResourceName("level2bucket"),
      // NOT recommended for production code
      removalPolicy: cdk.RemovalPolicy.DESTROY, 
    });
  }
}
```

For non-conflicting properties like enabling/disabling bucket encryption or bucket versioning, any new resource doesn't have to be created, but for static properties that can't be changed once the resource has been created, like the bucket name, Cloudformation has two policies for how to deal with a property change to this resource:

- **UpdateReplacePolicy**: The policy that defines what happens to constructs that have their properties updated.
	- If `Retain`, then it keeps the old version of the construct (no tear down) and then provisions the new one as well.
	- if `Delete`, then upon a property change to a construct, it deletes the old version and then provisions the version.
- **DeletionPolicy**: The policy that defines whether or not to delete the specific construct scoped to a stack when the user runs `cdk destroy [STACK]` to destroy a specific stack. You have granular control over this by setting this policy for each construct scoped in a stack being destroyed, choosing whether or not they get deprovisioned.
	- If `Retain`, it just deletes the stack, but not the provisioned resource
	- If `Delete`, it deletes the stack and the provisioned cloud resource of the construct scoped in the stack.

You can change the `UpdateReplacePolicy` and `DeletionPolicy` for each construct in code with the special `removalPolicy` property:

```ts
// example resource: create bucket with ID Level2Bucket and static name
const s3Bucket = new Bucket(this, "Level2Bucket", {
  versioned: true,
  bucketName: "my-unique-bucket-name",
  // NOT recommended for production code
  removalPolicy: cdk.RemovalPolicy.DESTROY,
});
```

Here are the different values you can set for the removal policy:

- `"DESTROY"`: enum value under `cdk.RemovalPolicy.DESTROY`, which sets the `Delete` value for both the `UpdateReplacePolicy` and `DeletionPolicy`.
- `"RETAIN"`: enum value under `cdk.RemovalPolicy.RETAIN`, which sets the `Retain` value for both the `UpdateReplacePolicy` and `DeletionPolicy`.



### Constructs

#### L1 constructs (Cfn — "Cloudformation" resources)

L1 constructs are auto-generated, one-to-one mappings of raw CloudFormation resources. Their names always start with `Cfn`. They expose exactly the properties CloudFormation exposes, with the same names, and provide **no** defaults or convenience. You have to specify everything.

typescript

```typescript
import { CfnBucket } from 'aws-cdk-lib/aws-s3';

new CfnBucket(this, 'RawBucket', {
  bucketName: 'my-explicit-bucket-name',
  versioningConfiguration: { status: 'Enabled' },
});
```

You rarely start here, but L1 is your escape valve: if a brand-new AWS feature isn't yet supported by a higher-level construct, the L1 version almost always has it, because L1 constructs are generated directly from the CloudFormation spec.

#### L2 constructs (the sweet spot)

L2 constructs are hand-written, curated abstractions over L1. They provide sensible defaults, helper methods, and an intuitive API. This is where you should spend most of your time. Compare the S3 bucket:


```typescript
import { Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';

const bucket = new Bucket(this, 'MyBucket', {
  versioned: true,
  encryption: BucketEncryption.S3_MANAGED,
});

// L2 constructs give you convenience methods you'd never get from L1:
bucket.grantRead(someRole);              // wires up the exact IAM policy
bucket.addLifecycleRule({ expiration: Duration.days(90) });
```

The `grant*` methods are a huge part of L2's value. Instead of hand-writing IAM policy JSON, you say "this function can read this bucket" and CDK computes the least-privilege policy and attaches it to the right role. 

#### L3 constructs (patterns)

L3 constructs — often called **patterns** — compose multiple resources into an opinionated, ready-to-use architecture. AWS ships a set in `aws-cdk-lib/aws-*-patterns`. For example, a load-balanced Fargate service:


```typescript
import { ApplicationLoadBalancedFargateService }
  from 'aws-cdk-lib/aws-ecs-patterns';

new ApplicationLoadBalancedFargateService(this, 'Service', {
  cluster,
  taskImageOptions: {
    image: ContainerImage.fromRegistry('amazon/amazon-ecs-sample'),
  },
  publicLoadBalancer: true,
});
```

That single construct creates an ECS cluster service, a task definition, an Application Load Balancer, target groups, listeners, security groups, and all the IAM wiring — dozens of underlying resources. L3 constructs are fantastic for getting started fast, but they make architectural decisions for you; when you outgrow those decisions, you compose your own from L2s.

#### Custom constructs

The power of CDK is composition: wrapping resources into your own constructs with a clean, typed interface. This is how teams build internal platforms.

A custom construct extends `Construct` and takes a typed props interface. Here's a reusable "secure bucket" that bakes in your organization's standards:

```ts
import { Construct } from 'constructs';
import { Bucket, BucketEncryption, BlockPublicAccess, IBucket } from 'aws-cdk-lib/aws-s3';
import { Duration, RemovalPolicy } from 'aws-cdk-lib';

// Define the inputs your construct accepts, with types and docs.
export interface SecureBucketProps {
  /** Days after which to expire objects. Defaults to no expiration. */
  readonly expirationDays?: number;
  /** Whether to enable versioning. Defaults to true. */
  readonly versioned?: boolean;
}

export class SecureBucket extends Construct {
  // Expose the inner bucket so consumers can grant access, add notifications, etc.
  public readonly bucket: IBucket;

  constructor(scope: Construct, id: string, props: SecureBucketProps = {}) {
    super(scope, id);

    this.bucket = new Bucket(this, 'Bucket', {
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: props.versioned ?? true,
      removalPolicy: RemovalPolicy.RETAIN,
      lifecycleRules: props.expirationDays
        ? [{ expiration: Duration.days(props.expirationDays) }]
        : undefined,
    });
  }
}
```

Then you can use the bucket like so:

```ts
const logs = new SecureBucket(this, 'Logs', { expirationDays: 30 });
logs.bucket.grantWrite(someService);
```

Here are the conventions you should follow when creating custom constructs:

- **Mark props `readonly`.** Props objects should be immutable; the compiler helps enforce it.
- **Provide defaults with `??`.** `props.versioned ?? true` gives a default while allowing an explicit `false`.
- **Expose inner resources as public readonly fields** (like `this.bucket`) so consumers can wire up grants and integrations. Prefer exposing the _interface_ type (`IBucket`) rather than the concrete `Bucket` when you can — it keeps your API flexible.
- **Document props with JSDoc `/** */` comments.** These show up in consumers' IDE tooltips, which is a big usability win.

### IAM and permissions

IAM is where CDK's abstraction shines brightest, because hand-writing least-privilege policies is tedious and error-prone.

#### The `grant*` pattern

Most L2 constructs that represent a resource offer `grant*` methods, and most that represent an identity (Lambda functions, ECS tasks, roles) can be passed to those methods as the grantee. CDK computes the minimal policy and attaches it to the right role.


```ts
table.grantReadData(handler);        // read-only on the table
table.grantWriteData(handler);       // write-only
table.grantReadWriteData(handler);   // both
bucket.grantRead(handler);           // s3:GetObject etc. on this bucket
bucket.grantPut(handler);            // s3:PutObject
queue.grantConsumeMessages(handler); // SQS receive/delete
topic.grantPublish(handler);         // SNS publish
secret.grantRead(handler);           // read a specific Secrets Manager secret
```

#### Custom policies

When no `grant*` method fits, add a policy statement directly:


```typescript
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';

handler.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['ses:SendEmail'],
    resources: ['*'],
    conditions: {
      StringEquals: { 'ses:FromAddress': 'noreply@example.com' },
    },
  }),
);
```

#### Creating roles

Sometimes you need a role you control directly — for cross-account access, service roles, or when multiple resources share a role:


```typescript
import { Role, ServicePrincipal, ManagedPolicy } from 'aws-cdk-lib/aws-iam';

const taskRole = new Role(this, 'TaskRole', {
  assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
  managedPolicies: [
    ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMReadOnlyAccess'),
  ],
});

bucket.grantReadWrite(taskRole);   // grant* works on roles too
```

The principle: prefer `grant*` methods, reach for `addToRolePolicy` for one-off custom actions, and define `Role` objects explicitly only when you genuinely need control over the role itself.

### Assets

An **asset** is a local file, directory, or Docker image that CDK bundles, uploads to the bootstrap S3 bucket or ECR repo, and references from your CloudFormation template. Assets are how your application code gets from your laptop into AWS.

#### Lambda code assets

The simplest form points a Lambda at a directory of pre-built code:


```typescript
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';

new Function(this, 'Handler', {
  runtime: Runtime.NODEJS_20_X,
  handler: 'index.handler',
  code: Code.fromAsset('lambda-dist'), // a folder with your built JS
});
```

But as shown earlier, `NodejsFunction` is usually better for TypeScript because it runs esbuild for you — no separate build step, tree-shaking, and TypeScript support out of the box. You can customize bundling:


```typescript
new NodejsFunction(this, 'Handler', {
  entry: 'src/handler.ts',
  bundling: {
    minify: true,
    sourceMap: true,
    externalModules: ['@aws-sdk/*'], // provided by the Lambda runtime; don't bundle
  },
});
```

Excluding the AWS SDK v3 packages via `externalModules` keeps your bundle small since they're already present in the Node.js runtime.

#### Docker image assets

For containerized Lambdas or ECS tasks, CDK can build a Docker image from a local `Dockerfile`, push it to ECR, and reference it:


```typescript
import { DockerImageFunction, DockerImageCode } from 'aws-cdk-lib/aws-lambda';

new DockerImageFunction(this, 'ContainerFn', {
  code: DockerImageCode.fromImageAsset('./image'), // dir with a Dockerfile
});
```

This requires Docker running locally at synth/deploy time. CDK invokes `docker build`, tags the result, and pushes it during deploy.

#### File/directory assets

You can also ship arbitrary files — for example, seeding config into S3:


```typescript
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';

new BucketDeployment(this, 'DeployWebsite', {
  sources: [Source.asset('./website-build')],
  destinationBucket: siteBucket,
});
```

`BucketDeployment` zips a local folder, uploads it, and (via a helper Lambda it creates) extracts the contents into your bucket — handy for static sites.

### Testing

When testing, here are the basic steps to see if your cloud resources got provisioned correctly:

1. Create the app
2. Create the specific stack you want to test
3. Create the cloudformation template in code from the stack
4. You can test if specific cloudformation properties exist on the created in-memory template to see if your infra was provisioned correctly.

## CDK Examples

### S3 with SQS

Here is a stack that achieves the following:

1. Creates an S3 bucket
2. Creates an SQS queue
3. Sets up an automatic trigger for whenever an object is added to the S3 bucket, it pushes an S3-based `OBJECT_CREATED` message to the SQS queue.

```ts
import { Bucket, EventType } from "aws-cdk-lib/aws-s3";
import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import { constants } from "./utils/constants";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { SqsDestination } from "aws-cdk-lib/aws-s3-notifications";

export class CdkLearningStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. create bucket
    const s3Bucket = new Bucket(this, "Level2Bucket", {
      versioned: true,
      bucketName: constants.createResourceName("level2bucket"),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

	// 2. create queue
    const queue = new Queue(this, "Level2Queue", {
      queueName: constants.createResourceName("level2queue"),
      visibilityTimeout: cdk.Duration.seconds(30),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

	// 3. create trigger on bucket to add message to queue
    s3Bucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new SqsDestination(queue),
    );
  }
}

```

### DynamoDB + Lambda + API gateway

#### Creating the table

This is how you create a DynamoDB table on the fly using AWS CDK.

Things you should specify:

- **partition key**: the partition key for the table

```ts title="lib/constructs/dynamodb/ItemsTable.ts"
import {
  Table,
  AttributeType,
  BillingMode,
  TableEncryption,
} from 'aws-cdk-lib/aws-dynamodb';
import { RemovalPolicy } from 'aws-cdk-lib';

export const table = new Table(this, 'ItemsTable', {
  partitionKey: { name: 'id', type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,   // on-demand; no capacity planning
  encryption: TableEncryption.AWS_MANAGED,
  pointInTimeRecovery: true,
  // In production, keep RETAIN so a stack teardown never deletes your data.
  // For a throwaway demo, DESTROY makes cleanup easier — choose deliberately.
  removalPolicy: RemovalPolicy.DESTROY,
});
```

#### Creating the lambda with API gateway

This is how you create a lambda function construct: Create a **handler** object and specify these core properties for the `props` parameter:

- `runtime`: the code runtime value to use. If you want to create a nodeJS function, then use one of these values:
	- `Runtime.NODEJS_20_X`: runs the lambda code in a node 20 environment.
	- `Runtime.NODEJS_22_X`: runs the lambda code in a node 22 environment.
	- `Runtime.NODEJS_24_X`: runs the lambda code in a node 24 environment.
- `entry`: the absolute path to the code containing your exported lambda function.
- `handler`: the function name of the exported function in the entry file.
- `memorySize`: the amount of kilobytes to provide in memory for the lambda function compute.
- `timeout`: the timeout amount to set for the lambda.
- `environment`: any environment variables to pass into the lambda function code which can be accessed via `process.env` in the bundled handler.

```ts title="lib/constructs/lambda/ItemsHandler.ts"
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';
import * as path from 'path';

const handler = new NodejsFunction(this, 'ItemsHandler', {
  runtime: Runtime.NODEJS_20_X,
  entry: path.join(__dirname, '../src/handler.ts'), // your TS source
  handler: 'handler',                                // exported function name
  memorySize: 256,
  timeout: Duration.seconds(10),
  environment: {
    // Pass the table name to the function at runtime.
    TABLE_NAME: table.tableName,
  },
});

// Grant the function least-privilege access to the table.
// CDK writes the exact IAM policy for you.
table.grantReadWriteData(handler);
```

> [!NOTE]
> That `table.grantReadWriteData(handler)` line is the payoff of L2 constructs. It creates an IAM policy allowing precisely the DynamoDB actions needed to read and write items on _this specific table's ARN_, and attaches it to the function's execution role. No hand-written JSON, no wildcard resources.

The corresponding handler code (`src/handler.ts`) might look like:

```ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyHandler } from 'aws-lambda';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME!;

export const handler: APIGatewayProxyHandler = async (event) => {
  if (event.httpMethod === 'POST') {
    const item = JSON.parse(event.body ?? '{}');
    await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
    return { statusCode: 201, body: JSON.stringify(item) };
  }

  const id = event.pathParameters?.id;
  const result = await ddb.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { id } }),
  );
  return result.Item
    ? { statusCode: 200, body: JSON.stringify(result.Item) }
    : { statusCode: 404, body: 'Not found' };
};
```

Then you can create the API gateway like so, where the `LambdaRestAPI` gateway is an L3 construct that creates an API gateway that automatically uses the lambda function as a route handler for all resource and HTTP method combinations you specify.

```ts
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';

const api = new LambdaRestApi(this, 'ItemsApi', {
  handler,
  proxy: false,      // we'll define routes explicitly
});

const items = api.root.addResource('items');
items.addMethod('POST');              // POST /items

const singleItem = items.addResource('{id}');
singleItem.addMethod('GET');          // GET /items/{id}
```

> [!NOTE]
> `LambdaRestApi` is a small L3-ish convenience over API Gateway that wires a Lambda as the backend. Setting `proxy: false` lets us define specific routes instead of forwarding everything.

#### Reading outputs

You often want to know the deployed API URL. `CfnOutput` prints values to the terminal after deploy and exposes them for scripts.

```ts
import { CfnOutput } from 'aws-cdk-lib';

new CfnOutput(this, 'ApiUrl', {
  value: api.url,
  description: 'Base URL of the Items API',
});
```

After `cdk deploy`, you'll see `MyStack.ApiUrl = https://xxxx.execute-api.us-east-1.amazonaws.com/prod/`.

#### All together

```ts
import { Stack, StackProps, Duration, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Table, AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';

export class ServerlessApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

	// 1. create a table
    const table = new Table(this, 'ItemsTable', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.RETAIN,
    });

	// 2. create the lambda function
    const handler = new NodejsFunction(this, 'ItemsHandler', {
      runtime: Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../src/handler.ts'),
      handler: 'handler',
      timeout: Duration.seconds(10),
      environment: { TABLE_NAME: table.tableName },
    });

	// 3. grant lambda function read/write perms to the DynamoDB table
    table.grantReadWriteData(handler);

	// 4. create the REST API gateway that send requests for resources to the lambda handler we defined.
    const api = new LambdaRestApi(this, 'ItemsApi', { handler, proxy: false });
    const items = api.root.addResource('items');
    items.addMethod('POST');
    items.addResource('{id}').addMethod('GET');

	// print out the the REST API URL of the API gateway.
    new CfnOutput(this, 'ApiUrl', { value: api.url });
  }
}
```

## CDK code reference

### VPCs

The `Vpc` L2 construct is a great example of how much an L2 does for you. This one line creates subnets across availability zones, route tables, an internet gateway, and NAT gateways:

```ts
import { Vpc, IpAddresses, SubnetType } from 'aws-cdk-lib/aws-ec2';

const vpc = new Vpc(this, 'AppVpc', {
  ipAddresses: IpAddresses.cidr('10.0.0.0/16'),
  maxAzs: 2,
  natGateways: 1,   // NAT gateways cost money — tune this deliberately
  subnetConfiguration: [
    { name: 'public',  subnetType: SubnetType.PUBLIC,  cidrMask: 24 },
    { name: 'private', subnetType: SubnetType.PRIVATE_WITH_EGRESS, cidrMask: 24 },
  ],
});
```

> [!WARNING]
> Be aware NAT gateways have an hourly cost plus data processing charges. For dev environments, `natGateways: 0` (using only public subnets or VPC endpoints) can save real money.



### S3 buckets

#### Basics

```ts
import { Bucket, BucketEncryption, BlockPublicAccess } from 'aws-cdk-lib/aws-s3';
import { Duration } from 'aws-cdk-lib';

const bucket = new Bucket(this, 'AssetsBucket', {
  encryption: BucketEncryption.S3_MANAGED,
  blockPublicAccess: BlockPublicAccess.BLOCK_ALL,  // safe default
  versioned: true,
  enforceSSL: true,                                 // deny non-HTTPS requests
  lifecycleRules: [
    {
      // Move old versions to cheaper storage, then expire them.
      noncurrentVersionExpiration: Duration.days(90),
      transitions: [],
    },
  ],
});
```

### Lambda functions

## CDK CLI

### Installation and setup

First install the AWS CDK:

```bash
npm install -g aws-cdk
```

And now you can use the cdk like so:

- `cdk init app --language typescript`: creates a new CDK app

### Development and deployment

#### **bootstrapping**

Before you can deploy, you must **bootstrap** each AWS account-and-region combination you'll deploy into. This is a one-time (per environment) setup step that provisions supporting resources CDK needs: an S3 bucket for assets (Lambda code, Docker images), an ECR repository for container images, and IAM roles used during deployment.

The first step you always have to do in a new CDK project is to bootstrap it.

- `cdk bootstrap`: Deploys the CDK toolkit stack into an AWS environment, by default reading the current AWS login session.

You can also bootstrap a specific account by passing in an AWS account URL:

```bash
cdk bootstrap aws://ACCOUNT-NUMBER/REGION
```


#### **other commands**

- `cdk ls`: lists all the stacks in the app
- `cdk synth`: outputs the cloudformation template based off the current IaC CDK code.
- `cdk diff [STACKS]`: prints out the differences between the current stack state and the deployed stack state, for either all stacks or whatever stacks you specify.

#### **deployment commands**

These are commands that perform the actual deployment of IaC and provision the cloud resources.

-  `cdk deploy`: creates a CloudFormation template from your CDK code and then deploys that template to CloudFormation to provision all yoru resources.
-  `cdk deploy --watch`: deploys and then watches for changes.
- `cdk watch`: does the exact same thing as `cdk deploy --watch`


### Commands reference

#### `cdk synth`

Synthesizes your app into CloudFormation templates and writes them to `cdk.out/`. It also prints the template to the terminal. This is your fastest feedback loop — you can catch errors without touching AWS at all.

bash

```bash
cdk synth                 # all stacks
cdk synth MyStack         # a specific stack
```

Run this constantly. If `cdk synth` succeeds, your code is at least structurally valid.

#### `cdk diff`

Compares your synthesized template against what's currently deployed and shows exactly what will change: resources added, modified, or destroyed, plus IAM and security group changes highlighted separately.

bash

```bash
cdk diff
cdk diff MyStack
```

> [!IMPORTANT]
> **Always run `cdk diff` before deploying to production.** The security-impact section (changes to IAM policies, security group rules) is especially worth reading — it flags anything that broadens permissions.

#### `cdk deploy`

Deploys one or more stacks. CDK synthesizes, uploads assets, and executes a CloudFormation change set.

```bash
cdk deploy                          # deploy all stacks (prompts for confirmation)
cdk deploy MyStack                  # one stack
cdk deploy --all                    # all stacks explicitly
cdk deploy MyStack --require-approval never   # skip the IAM confirmation prompt
cdk deploy '**'                     # all stacks including nested (glob)
```

By default, if a deployment includes changes to IAM or security groups, CDK pauses and asks you to confirm. `--require-approval never` disables that (used in CI). `--hotswap` can do faster, in-place updates for certain resources like Lambda code during development — never use it for production because it bypasses CloudFormation.

#### `cdk destroy`

Tears down a stack and its resources.

```bash
cdk destroy MyStack
```

Resources with a `RETAIN` removal policy (the default for many stateful resources) survive destruction — this protects data but means you may have orphaned resources to clean up manually.