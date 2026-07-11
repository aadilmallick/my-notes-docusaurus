
## AWS CLI

### Authentication

Run `aws configure` to set up your default profile:

```bash
aws configure
```

It prompts for four values:

```
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: us-east-1
Default output format [None]: json
```

Enter your access key ID, secret access key, `us-east-1` as the region, and `json` as the output format. These values get written to two files in your home directory:

- `~/.aws/credentials`—stores your access keys
- `~/.aws/config`—stores region and output preferences

> [!NOTE]
> Use `us-east-1` because it’s the region where CloudFront certificates and Lambda@Edge functions must be created. Using a single region for everything keeps things simple while you’re learning.

Once you’ve set a default region with `aws configure`, the `--region` flag becomes optional: if you leave it off, the CLI uses whatever you configured. 



#### Named Profiles

The default profile works fine when you have one AWS account. But if you ever have a personal account and a work account—or a staging environment and a production environment—you’ll want **named profiles**.

Create a named profile by adding `--profile` to the configure command:

```bash
aws configure --profile personal
```

This creates a separate set of credentials stored under the `personal` profile name. To use it, add `--profile personal` to any CLI command:

```bash
aws s3 ls \
  --profile personal \
  --region us-east-1
```

The underlying file structure looks like this:

```bash title="~/.aws/credentials"
[default]
aws_access_key_id = AKIAIOSFODNN7EXAMPLE
aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

[personal]
aws_access_key_id = AKIAI44QH8DHBEXAMPLE
aws_secret_access_key = je7MtGbClwBF/2Zp9Utk/h3yCo8nvbEXAMPLEKEY
```


```bash title="~/.aws/config"
[default]
region = us-east-1
output = json

[profile personal]
region = us-east-1
output = json
```


You can also set the `AWS_PROFILE` environment variable to avoid typing `--profile` on every command:

```bash
export AWS_PROFILE=personal
```

#### Verifying Your Credentials

The best way to confirm your CLI is properly configured is the `get-caller-identity` command:

```bash
aws sts get-caller-identity \
  --region us-east-1 \
  --output json
```

This returns the identity associated with your credentials:

```
{
  "UserId": "AIDAIOSFODNN7EXAMPLE",
  "Account": "123456789012",
  "Arn": "arn:aws:iam::123456789012:user/admin"
}
```

If you see your account ID and the ARN of your `admin` user, everything is working. This command requires no special permissions—it works even if the user has no policies attached. It’s the AWS equivalent of `whoami`.

If you get an error like `The security token included in the request is invalid`, your access keys are wrong. Double-check what you entered, or delete the key pair in the console and create a new one.

> [!NOTE]
> Run `aws sts get-caller-identity` any time you’re unsure which credentials the CLI is using. It’s especially useful when you have multiple profiles and want to confirm you’re not accidentally running commands against your production account.

### IAM

#### Creating policies

This is how you can create a policy and output its JSON:

```bash
aws iam create-policy \
  --policy-name S3AssetsReadOnly \
  --policy-document file://s3-assets-read-only.json \
  --region us-east-1 \
  --output json
```

Then here is how you can attach policies to users or user groups:

```bash
aws iam attach-user-policy \
  --user-name admin \
  --policy-arn arn:aws:iam::123456789012:policy/S3AssetsReadOnly \
  --region us-east-1 \
  --output json
```

#### Creating an IAM user with a policy

Create an IAM user named `deploy-bot` with:

- **No console access**—this user exists purely for CLI/API use.
- **Access keys** for programmatic access.
- **A custom IAM policy** that allows exactly these operations and nothing more:
    - Sync files to the `my-frontend-app-assets` S3 bucket (upload, delete, and list)
    - Create cache invalidations on the CloudFront distribution with ID `E1A2B3C4D5E6F7`

Here is how you can use the CLI for this:

1. Create the user

```bash
aws iam create-user \
  --user-name deploy-bot \
  --region us-east-1 \
  --output json
```

2. Create the access keys

```bash
aws iam create-access-key \
  --user-name deploy-bot \
  --region us-east-1 \
  --output json
```

The next step is to create the policy

Create a file called `deploy-bot-policy.json` with a policy that:

1. Allows `s3:PutObject` and `s3:DeleteObject` on objects in the `my-frontend-app-assets` bucket.
2. Allows `s3:ListBucket` on the `my-frontend-app-assets` bucket itself.
3. Allows `cloudfront:CreateInvalidation` on the distribution `E1A2B3C4D5E6F7`.

Remember:

- `s3:PutObject` and `s3:DeleteObject` operate on **objects**, so the resource ARN needs `/*` at the end.
- `s3:ListBucket` operates on the **bucket**, so the resource ARN doesn’t have `/*`.
- CloudFront distribution ARNs have no region (use an empty region segment) and follow the pattern `arn:aws:cloudfront::<account-id>:distribution/<distribution-id>`.
- Every statement needs `Effect`, `Action`, and `Resource`.
- The policy needs `"Version": "2012-10-17"`.

Then you can attach the policy using the `aws iam attach-user-policy` command:

```bash
aws iam create-policy \
  --policy-name DeployBotPolicy \
  --policy-document file://deploy-bot-policy.json \
  --region us-east-1 \
  --output json
```

## AWS SDK

Most SDK helpers use the **command pattern** to provide a simple, unified API for accessing AWS services programmatically.

1. Create a client
2. Invoke a command with `client.send(command)`, which is an asynchronous function.

Here's an example:

```ts
// 1. create with default credentials (reads from ~/.aws/config)
const s3Client = new S3Client({});

// 2. create  a command
const createBucketCommand = new CreateBucketCommand({
  Bucket: "2022-amallick-unique-bucket-name",
});

// 3. send the command
await s3Client.send(createBucketCommand);
```

### IAM

#### Creating policies and users

This is a simple example where we perform the following steps:

1. Create a policy that allows listing buckets and reading objects from a specific bucket
2. Attach the policy to an existing IAM user

```ts
import { IAMClient, CreatePolicyCommand, AttachUserPolicyCommand } from '@aws-sdk/client-iam';

const iam = new IAMClient({ region: 'us-east-1' });

const policy = await iam.send(
  new CreatePolicyCommand({
    PolicyName: 'S3AssetsReadOnly',
    PolicyDocument: JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'AllowListBucket',
          Effect: 'Allow',
          Action: ['s3:ListBucket'],
          Resource: 'arn:aws:s3:::my-frontend-app-assets',
        },
        {
          Sid: 'AllowReadObjects',
          Effect: 'Allow',
          Action: ['s3:GetObject'],
          Resource: 'arn:aws:s3:::my-frontend-app-assets/*',
        },
      ],
    }),
  }),
);

await iam.send(
  new AttachUserPolicyCommand({
    UserName: 'admin',
    PolicyArn: policy.Policy!.Arn!,
  }),
);
```

This is a more involved example where we perform the following:

1. Create an IAM user
2. Give them access keys
3. Create a policy allowing object creation and deletion in a specific bucket and cloudfront cache invalidation
4. Attach the policy to the newly created IAM user.

```ts
import {
  IAMClient,
  CreateUserCommand,
  CreateAccessKeyCommand,
  CreatePolicyCommand,
  AttachUserPolicyCommand,
} from '@aws-sdk/client-iam';

const iam = new IAMClient({ region: 'us-east-1' });

await iam.send(new CreateUserCommand({ UserName: 'deploy-bot' }));

const keys = await iam.send(new CreateAccessKeyCommand({ UserName: 'deploy-bot' }));
// This response is the ONLY time the secret is returned — store it now.
console.log('Access key:', keys.AccessKey?.AccessKeyId);
console.log('Secret:', keys.AccessKey?.SecretAccessKey);

const policy = await iam.send(
  new CreatePolicyCommand({
    PolicyName: 'DeployBotPolicy',
    PolicyDocument: JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: ['s3:PutObject', 's3:DeleteObject'],
          Resource: 'arn:aws:s3:::my-frontend-app-assets/*',
        },
        {
          Effect: 'Allow',
          Action: ['s3:ListBucket'],
          Resource: 'arn:aws:s3:::my-frontend-app-assets',
        },
        {
          Effect: 'Allow',
          Action: ['cloudfront:CreateInvalidation'],
          Resource: 'arn:aws:cloudfront::123456789012:distribution/E1A2B3C4D5E6F7',
        },
      ],
    }),
  }),
);

await iam.send(
  new AttachUserPolicyCommand({
    UserName: 'deploy-bot',
    PolicyArn: policy.Policy!.Arn!,
  }),
);
```
### S3

```ts
import {
  S3Client,
  CreateBucketCommand,
  PutObjectCommand,
  S3ClientConfig,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  DeleteBucketCommand,
} from "@aws-sdk/client-s3";

export class S3Wrapper {
  private s3Client: S3Client;

  constructor(
    public bucketName: string,
    config?: S3ClientConfig,
  ) {
    // 1. Initialize the S3 Client (inherits region from your CLI setup)
    this.s3Client = new S3Client(config ?? {});
  }

  async createBucket(): Promise<void> {
    const createBucketCommand = new CreateBucketCommand({
      Bucket: this.bucketName,
    });
    await this.s3Client.send(createBucketCommand);
  }

  async uploadObject(
    key: string,
    body: Buffer | string,
    options?: { ContentType?: string },
  ): Promise<void> {
    const putObjectCommand = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: body,
      ContentType: options?.ContentType,
    });
    await this.s3Client.send(putObjectCommand);
  }

  async getObject(key: string): Promise<Buffer | null> {
    try {
      const getObjectCommand = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      const response = await this.s3Client.send(getObjectCommand);
      if (response.Body) {
        const chunks: Uint8Array[] = [];
        for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
          chunks.push(chunk);
        }
        return Buffer.concat(chunks);
      }
      return null;
    } catch (error) {
      if (error instanceof Error && error.name === "NoSuchKey") {
        return null; // Object not found
      }
      throw error; // Rethrow other errors
    }
  }

  async deleteObject(key: string): Promise<void> {
    const deleteObjectCommand = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    await this.s3Client.send(deleteObjectCommand);
  }

  async listObjects(): Promise<string[]> {
    const listObjectsCommand = new ListObjectsV2Command({
      Bucket: this.bucketName,
    });
    const response = await this.s3Client.send(listObjectsCommand);
    return response.Contents?.map((item) => item.Key ?? "") ?? [];
  }

  async deleteBucket(): Promise<void> {
    const deleteBucketCommand = new DeleteBucketCommand({
      Bucket: this.bucketName,
    });
    await this.s3Client.send(deleteBucketCommand);
  }
}

```

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

##### Deploying

**method 1: deploying manually**

1. Write your lambda code
2. Select the lambda trigger (S3, SQS, etc.)

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

##### **logging**

Once your Lambda function is live in production, you can't use `console.log` on your local terminal anymore to see what's happening. Instead, AWS routes everything automatically to **Amazon CloudWatch Logs**.

- Every time you use `console.log()` or `console.error()` inside your TypeScript Lambda code, AWS catches it and saves it as a line item inside a CloudWatch **Log Stream**.
    
- If a production user gets a `500 Internal Server Error`, you jump straight into the CloudWatch console, find your function's log stream, and read the exact stack trace generated by your Node process.


##### Testing

Since lambdas are just normal JS functions that accept an `event` JavaScript object, you can just mock that event and then invoke the handler.

But if you want to manually invoke the lambda via CLI, use the `aws lambda invoke` command:

```bash
aws lambda invoke \
  --function-name MyS3TriggeredLambda \
  --payload file://mock-event.json \
  response.json
```

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
    "resource": "hello",
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

After deploying the lambda

```bash
aws lambda invoke \
  --function-name MyS3TriggeredLambda \
  --payload file://mock-event.json \
  response.json
```

#### SQS Lambda

The event for a lambda with an SQS trigger is typed with the `SQSEvent` interface:

```ts
import { SQSEvent } from "aws-lambda";

const exampleSQSEvent: SQSEvent = {
  Records: [
    {
      messageId: "19dd0b57-b21e-4ac1-bd88-01bbb068cb78",
      receiptHandle: "MessageReceiptHandle",
      // The body is ALWAYS a string. If you sent JSON, you must JSON.parse() it inside the Lambda!
      body: '{"orderId": "XYZ-123", "quantity": 2}',
      attributes: {
        ApproximateReceiveCount: "1",
        SentTimestamp: "1720700000000",
        SenderId: "AROAIAMZBAOKFCBITNYOI",
        ApproximateFirstReceiveTimestamp: "1720700000001"
      },
      messageAttributes: {},
      md5OfBody: "098f6bcd4621d373cade4e832627b4f6",
      eventSource: "aws:sqs",
      eventSourceARN: "arn:aws:sqs:us-east-1:123456789012:MyQueue",
      awsRegion: "us-east-1"
    }
  ]
};
```

Here are the rules of the event:

- **The Body is a Plain String:** Even if your frontend or microservice sends a beautiful TypeScript object to the queue, SQS serializes it as a string. You **must** use `JSON.parse(record.body)` inside your Lambda code to turn it back into an object.
- **Batch Size Matters:** By default, Lambda can grab up to 10 messages at a time in a single `Records` array to process them efficiently. If message #4 fails but messages 1-3 succeed, handling errors properly prevents processing duplicate messages!

Here is a lambda:

```ts
import { SQSHandler, SQSEvent } from "aws-lambda";

// Define the interface for the message payload we expect
interface OrderMessage {
  orderId: string;
  quantity: number;
}

export const handler: SQSHandler = async (event: SQSEvent): Promise<void> => {
  try {
    // Remember, Lambda can poll and receive multiple messages at once!
    for (const record of event.Records) {
      console.log(`✉️ Processing SQS Message ID: ${record.messageId}`);
      
      // Fix the mistake from our riddle: parse the string body!
      const bodyData = JSON.parse(record.body) as OrderMessage;
      
      console.log(`🛒 Order received! ID: ${bodyData.orderId}, 
      Qty: ${bodyData.quantity}`);
      
      // Perform your business logic here (e.g., save to DynamoDB)
    }
  } catch (error) {
    console.error("❌ Failed to process SQS batch:", error);
    // Throwing an error tells SQS that the processing failed,
    // so the messages will return to the queue to be retried!
    throw error; 
  }
};
```

And this is how to trigger the lambda by sending a message to the SQS queue:

```ts
aws sqs send-message \
  --queue-url https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue \
  --message-body '{"orderId": "XYZ-123", "quantity": 2}'
```


#### SNS + SES lambda

```ts
import { SNSEvent } from "aws-lambda";

const exampleSNSEvent: SNSEvent = {
  Records: [
    {
      EventSource: "aws:sns",
      EventVersion: "1.0",
      EventSubscriptionArn: "arn:aws:sns:us-east-1:123456789012:NewUserTopic:some-subscription-id",
      Sns: {
        Type: "Notification",
        MessageId: "95df01b4-ee98-5cb9-9903-4c221d41eb5e",
        TopicArn: "arn:aws:sns:us-east-1:123456789012:NewUserTopic",
        Subject: "New User Registered",
        // Just like SQS, the Message payload itself is passed as a string!
        Message: '{"userId": "usr_999", "email": "chef@bakery.com"}',
        Timestamp: "2026-07-11T14:00:00.000Z",
        MessageAttributes: {
          // You can pass metadata metadata attributes for filtering!
          tier: {
            Type: "String",
            Value: "premium"
          }
        }
      }
    }
  ]
};
```

Notice how the hierarchy differs slightly from SQS:

- In **SQS**, the text payload is located at `record.body`.
- In **SNS**, the text payload is located at `record.Sns.Message`.

This is how you can create an SNS topic handler:

```ts
import { SNSHandler, SNSEvent } from "aws-lambda";

interface UserRegistrationPayload {
  userId: string;
  email: string;
}

export const handler: SNSHandler = async (event: SNSEvent): Promise<void> => {
  try {
    for (const record of event.Records) {
      console.log(`📢 Processing SNS Message ID: ${record.Sns.MessageId}`);

      // Parse the stringified payload from record.Sns.Message
      const userPayload = JSON.parse(record.Sns.Message) as UserRegistrationPayload;

      console.log(`✉️ Sending welcome email to: ${userPayload.email} (User ID: ${userPayload.userId})`);
      
      // Your actual business logic here (e.g. calling an email service API)
    }
  } catch (error) {
    console.error("❌ Error processing SNS event:", error);
    throw error;
  }
};
```

#### SES

Here's an example where we can execute a lambda by registering its trigger as an SES email trigger, where the lambda gets executed upon some email sent to a specific destination email.


```ts
import { SESEvent } from "aws-lambda";

const exampleSESEvent: SESEvent = {
  Records: [
    {
      eventSource: "aws:ses",
      eventVersion: "1.0",
      ses: {
        mail: {
          timestamp: "2026-07-11T14:00:00.000Z",
          source: "user@example.com", // The sender!
          messageId: "example-id-123",
          destination: ["support@yourcompany.com"], // The recipient routing address
          headersTruncated: false,
          headers: [
            { name: "Subject", value: "Re: Ticket #1024" }
          ],
          commonHeaders: {
            returnPath: "user@example.com",
            from: ["user@example.com"],
            date: "2026-07-11T14:00:00.000Z",
            to: ["support@yourcompany.com"],
            messageId: "example-id-123",
            subject: "Re: Ticket #1024"
          }
        },
        receipt: {
          timestamp: "2026-07-11T14:00:01.000Z",
          processingTimeMillis: 342,
          recipients: ["support@yourcompany.com"],
          spamVerdict: { status: "PASS" },
          virusVerdict: { status: "PASS" },
          spfVerdict: { status: "PASS" },
          dkimVerdict: { status: "PASS" },
          dmarcVerdict: { status: "PASS" },
          action: {
            type: "Lambda",
            functionArn: "arn:aws:lambda:us-east-1:123456789012:function:ProcessEmail"
          }
        }
      }
    }
  ]
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