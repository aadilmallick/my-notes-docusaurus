## AWS fundamentals

### AWS architecture

Availability zones consist of many data centers that replicate your data for high availability, and then regions replicate availability zones for high reliability.

- **Region:** A geographic location somewhere in the world (e.g., `us-east-1` in N. Virginia, or `eu-west-1` in Ireland). Each region is completely isolated from the others. As a developer, you want to pick a region closest to your users to keep latency low.
- **Availability Zone (AZ):** Inside every Region, there are multiple isolated data centers known as Availability Zones (like `us-east-1a`, `us-east-1b`). They have independent power, cooling, and networking. If a rogue backhoe cuts the power grid to one AZ, your application can automatically switch to another AZ in the same region without dropping a single user request!

### AWS well-architected framework

Read this for more info

```embed
title: "AWS Well-Architected Framework - AWS Well-Architected Framework"
image: "https://docs.aws.amazon.com/assets/r/images/aws_logo_light.svg"
description: "The AWS Well-Architected Framework helps you understand the pros and cons of decisions you make while building systems on AWS. By using the Framework you will learn architectural best practices for designing and operating reliable, secure, efficient, and cost-effective systems in the cloud."
url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html"
favicon: ""
aspectRatio: "58.82352941176471"
```

The main principles of this framework is to use cloud services to create a well-architected app, namely an app that follows these priniciples:

1. designs for failure: focuses on having high availability
2. decouple components: tries to avoid a tightly coupled architecture by preferring microservices to monolithic architecture.
3. implement elasticity: build databases in mind with knowing you might have to do sharding in the future

### AWS cloud-adoption framework

```embed
title: "AWS Cloud Adoption Framework"
image: "https://d1.awsstatic.com/onedam/marketing-channels/website/aws/en_US/cloud-data-migration/approved/images/a3e4233a-4565-5ee7-b04f-a1464d01465f.f7e56f68c7707f79b8dca28d08280bde566eaee4.png"
description: "The AWS Cloud Adoption Framework helps enterprises effectively adopt the AWS cloud"
url: "https://aws.amazon.com/cloud-adoption-framework/"
favicon: ""
aspectRatio: "97.04797047970479"
```


## IAM

IAM is a way to grant developers and other people access to your AWS account while ensuring that their access is secure and they cannot hijack your account by granting the principle of least privilege to those users.

You as the root user can create **IAM** users, and those users are granted permissions to do stuff on your AWS account through **policies**.

There are 4 core components to IAM:

- **Users:** A person or application. For example, _you_ as a developer, or a GitHub Actions CI/CD pipeline.
- **Groups:** A collection of users. You might create a `Developers` group and give everyone in it access to look at database logs.
- **Policies:** A **JSON document** that defines what actions are allowed or denied. This is where your code meets security.
- **Roles:** Think of a role as a temporary hat. Instead of giving a server permanent credentials, you say, "Hey Server, put on this `S3-Uploader` role for a minute so you can save this file."
### Users and user groups

When creating a new user in IAM, you have the option to individually create a user and then attach a policy template to them or add them to a user group.

A **user group** is a group you can bunch users into and then apply a policy to the group as a whole, which will then apply to all users in that that user group.


### Roles

Roles are a ways to give permissions to services, following the principle of least privilege. For example, without roles, an AWS lambda cloud function can access all AWS services at once at the same time, which can be catastrophic if malicious code somehow programmatically accesses an AWS service.

Roles allow us to specify instead specific permissions like dynamoDb read access only for lambda functions.

### Policies

Every IAM policy follows the same shape:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DescriptiveNameForThisStatement",
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::my-frontend-app-assets/*"
    }
  ]
}
```

Here are the top level keys:

- `"Version"`: the policy SDK version, which should always be `"2012-10-17"`
- `"Statement"`: a list of policies to apply. Each element in the array is one rule that either allows or denies specific actions on specific resources. A single policy can contain multiple statements.

here are the keys that make up a policy:

- `"Sid"`: a descriptive name for the policy
- `"Effect"`: `"Allow"` to make it an 'allow' type policy, and  `"Deny"` to make it an 'deny' type policy
- `"Action"`: An **Action** specifies which AWS API operations the statement applies to. Actions follow the pattern `<service>:<operation>` and you can also specify it as an array to multiply multiple actions at the same time.
	- `s3:GetObject`—read a file from S3
	- `s3:PutObject`—upload a file to S3
	- `cloudfront:CreateInvalidation`—invalidate cached files in CloudFront
	- `iam:CreateUser`—create a new IAM user
- `"Resource"`: The **Resource** field specifies which AWS resources the statement applies to, identified by their **ARN (Amazon Resource Name)**.
- `"Principal"`: The **Resource** field specifies which AWS accounts the statement applies to, identified by their **ARN (Amazon Resource Name)**. 
	- You can specify `"*"` to apply to everyone, meaning everybody on the internet is a principal.

> [!NOTE]
> `Effect` versus `Action`
> ---
> Think of **Action** as _what someone is trying to do_ and **Effect** as _AWS’s answer to that request_. `s3:GetObject` is the action. `"Allow"` or `"Deny"` is the effect. Put them together and you get a complete rule: “allow `s3:GetObject`” or “deny `s3:GetObject`.” Same action, different verdict.

#### Resources and principals

ARNs are globally unique identifiers that follow this format:

```
arn:aws:<service>:<region>:<account-id>:<resource-type>/<resource-id>
```

When specifying an ARN in a resource, you can target an ARN pattern through the use of globs you target more than one resource at a time:

| Resource                           | ARN                                                            |
| ---------------------------------- | -------------------------------------------------------------- |
| A specific S3 bucket               | `arn:aws:s3:::my-frontend-app-assets`                          |
| All objects in that bucket         | `arn:aws:s3:::my-frontend-app-assets/*`                        |
| A specific CloudFront distribution | `arn:aws:cloudfront::123456789012:distribution/E1A2B3C4D5E6F7` |
| All resources (dangerous)          | `*`                                                            |

#### Principle of least privilege

Here are some common mistakes:

- **Using `Resource: "*"` by habit.** This grants access to every resource of the action’s type in your account. Sometimes it’s necessary (IAM actions like `iam:ListUsers` don’t support resource-level restrictions), but for S3 and CloudFront, always scope to specific ARNs.
- **Confusing bucket ARNs and object ARNs.** `arn:aws:s3:::my-bucket` is the bucket. `arn:aws:s3:::my-bucket/*` is the objects inside the bucket. Some actions operate on the bucket (like `s3:ListBucket`), others operate on objects (like `s3:GetObject`). If your policy isn’t working, this is the first thing to check.

> [!NOTE]
> Some IAM actions don’t support resource-level restrictions. For example, `s3:ListAllMyBuckets` can only use `"Resource": "*"` because it operates across all buckets by definition. When AWS tells you an action doesn’t support resource-level restrictions, use `*` for that specific action—but never use it as an excuse to wildcard everything else.

To correctly implement the principle of least privilege, follow these steps:

1. **list what commands need to be run**: look at the CLI or SDK commands you need to run in order to achieve something
2. **map the commands to their IAM actions**: figure out the specific actions certain CLI or SDK commands need.
3. **identify the exact resources necessary**: Use strict glob patterns rather than just `*`.

**in depth**

Ask yourself: what commands will this user or service run? For a frontend deploy pipeline, the answer is:

- `aws s3 sync ./build s3://my-frontend-app-assets`—uploads files to S3
- `aws cloudfront create-invalidation`—clears the CDN cache

Each CLI command maps to one or more IAM actions:

| CLI Command                          | IAM Actions                                        |
| ------------------------------------ | -------------------------------------------------- |
| `aws s3 sync` (upload + delete)      | `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket` |
| `aws cloudfront create-invalidation` | `cloudfront:CreateInvalidation`                    |

Don’t use `*`. Identify the exact resources:

- S3 bucket: `arn:aws:s3:::my-frontend-app-assets` (for `ListBucket`)
- S3 objects: `arn:aws:s3:::my-frontend-app-assets/*` (for `PutObject`, `DeleteObject`)
- CloudFront distribution: `arn:aws:cloudfront::123456789012:distribution/E1A2B3C4D5E6F7`

And here's the final policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowS3Deploy",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::my-frontend-app-assets", "arn:aws:s3:::my-frontend-app-assets/*"]
    },
    {
      "Sid": "AllowCacheInvalidation",
      "Effect": "Allow",
      "Action": ["cloudfront:CreateInvalidation"],
      "Resource": "arn:aws:cloudfront::123456789012:distribution/E1A2B3C4D5E6F7"
    }
  ]
}
```
#### Conditional keys

The five fields above (`Version`, `Statement`, `Effect`, `Action`, `Resource`) form a working policy. A sixth field, `Condition`, lets you narrow an allow to only fire when specific request attributes match. It’s how you turn “allow this action on this resource” into “allow this action on this resource _only when the request comes from my own region_” or “only when the caller’s source IP is in a certain range.”

One concrete example: restrict an IAM user to operations in `us-east-1` only. Even if they have permission to call `ec2:RunInstances`, the condition refuses the call unless the request is scoped to `us-east-1`.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "*",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:RequestedRegion": "us-east-1"
        }
      }
    }
  ]
}
```

Here are the available conditional keys:

- `aws:RequestedRegion` is a **global condition key**—available on every request.
- **`aws:SourceIp`** — CIDR-scoped access (office networks).
- **`aws:SourceVpc`** — only from a specific VPC (for private workloads).
- **`aws:MultiFactorAuthPresent`** — require MFA for sensitive actions.
- **`aws:PrincipalTag/<tagKey>`** — ABAC-style gating by caller tag.

#### Example policies

**allow reading objects from a bucket**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowListBucket",
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::my-frontend-app-assets"
    },
    {
      "Sid": "AllowReadObjects",
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::my-frontend-app-assets/*"
    }
  ]
}
```

- `s3:ListBucket` operates on the bucket ARN, not the objects inside it.
- `s3:GetObject` operates on objects, so the ARN ends with `/*`.

**prevent deletion of a bucket**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PreventDeleteBucket",
      "Effect": "Deny",
      "Action": ["s3:DeleteBucket"],
      "Resource": "arn:aws:s3:::my-frontend-app-assets"
    }
  ]
}
```

### Cognito and user pools

When creating an identity pool in cognito, it actually creates two roles behind the scenes:

- **identity pool role for authenticated access**: Defines the AWS permissions authenticated users in the user pool have
- **identity pool role for unauthenticated access**: Defines the AWS permissions unauthenticated users have (they are not in the user pool).
### Enabling programmatic access for IAM users

If you want certain IAM users to have programmatic access to the AWS CLI and services, then there are two key steps you must do:

1. Create an AWS access key for the IAM user and give it to them
2. Attach the `SignInLocalDevelopmentAWS` policy to that user to let them be able to use the CLI and SDK, and then whatever other additional policies necessary for the services you want to the IAM user to access.


![](https://i.imgur.com/iXgFUFV.jpeg)





## Cognito

Cognito deals with authentication, authorization, and authenticate service access for your application users. Here are the things cognito handles:

- **user authentication**: Users can sign in and out through cognito and become authenticated to your app
- **authenticated access to AWS services**: authenticated or unauthenticated users can access AWS services you host via an identity pool, like images living on an S3 bucket depending on policies you set up.
- **active directory of users**: stores authenticated users with high availability and scalability, scaling to millions of users.

These two key features are made possible through two pools:

- **user pools**: provide authentication for in-app users, primary purpose is to manage an active directory of users.
- **identity pools**: provide AWS credentials for users or authorizes them to access certain services, whether authenticated or not depending on the policies you set up.

### User pool vs identity pool

In Amazon Cognito, **user pools** and **identity pools** serve different but complementary purposes:  
  

- **User pools** manage user authentication. 
	- They act like a secure user directory, handling sign-up, sign-in, and user management. 
	- They verify who the user is and issue JSON Web Tokens (JWT) to confirm identity.  
      
    
- **Identity pools** handle authorization. 
	- They grant users temporary AWS credentials to access AWS resources like S3 or DynamoDB based on assigned roles. 
	- They determine what authenticated users (and even guests) are allowed to do.  



![](https://i.imgur.com/AnG9RbR.jpeg)


  
Together, user pools authenticate users, and identity pools authorize their access to AWS services. Heres' how:

1. A user logs in through a user pool via an **identity provider** and then obtains a JWT. 
2. The JWT is then sent to the Cognito identity pool, which then issues temporary credentials and an IAM role for the authenticated user to use and gain access to AWS services. 
3. The user can now access AWS resources like DynamoDB or S3 based on their assigned permissions. 

### user pool in depth

To setup a user pool for your app, you need two things:

1. **user pool**: create a user pool that defines how to authenticate users, whether to verify emails, etc.
2. **user pool client**: A user pool client in Amazon Cognito acts like an application ID card that allows your web app to interact with the Cognito authentication services. 
	- It's essential because it enables your app to connect to the user pool for handling sign-in, sign-up, and authentication processes. 
	- For typical web apps, this client doesn't need a secret, making it simpler to manage user authentication securely and efficiently.

User pools authenticate users through an **identity provider**, which is an authentication service that you request via REST API and to authenticate a user and then get returned a JWT and user info, like OAuth 2.0.

Cognito offers two types of identity providers.

- **cognito**: if using basic email and password with email verification, cognito itself acts as an identity provider for the user pool
- **third-party providers**: providers with OAuth 2.0 or SSO can be delegated to for obtaining JWT credentials and authenticating a user.

#### what user pools store

User pools store the following information:

- **identity provider**: the type of identity provider used, either Cognito or an external provider via OAuth, OpenID, SSO, etc.
- **username**: the unique identifier for the user, either auto-generated by the identity provider or specified to be a user-supplied email or username.
- **email**: optional email for the user.

#### User pool triggers

**Triggers** set on the user pool allow you to run custom code in response to cognito events, and this is as simple as creating a lambda that gets triggered on a user pool cognito event.

> [!NOTE]
> This is basically the same thing as webhooks for your authentication.



![](https://i.imgur.com/fLgixys.jpeg)

#### User pool hosted UI

After setting up the user pool and identity pool, you can delegate frontend UI authentication logic to Cognito because it offers a hosted URL for your authentication, showing all your configured identity providers.


![](https://i.imgur.com/YZuyK8R.jpeg)


### Identity pool in depth

Identity pools set up the wiring between an identity provider and Cognito, so authenticated users within the identity pool are then assigned AWS roles and permissions.

Identity pools handle all the authorization behind application users being able to access certain AWS services.

When creating an identity pool, there are two important properties you need to set for the pool:

1. **authenticated or unauthenticated**: whether or not this pool is public to all users or enforces authentication via an **identity provider**
2. **policies**: when authenticated into the ID pool or unauthenticated as a guest, what IAM roles will the users be able to have? What services can they access, defined by which policies?


> [!NOTE]
> The main purpose of an identity pool is to provide policies for authenticated and unauthenticated users to access AWS services, as well as dynamically select and assign IAM roles via JWT attributes for users.

#### Creating an identity pool

Here are the steps to create an identity pool:

1. Select the identity provider, either Cognito or a third-party provider. Here is how to set the credentials needed for each type:
	- **Cognito**: A user pool ID and user pool client ID are the necessary credentials for the Cognito email/password identity provider.
	- **third party**: supply something like a client ID and client secret.


![](https://i.imgur.com/XnAak4j.jpeg)

2. Assign a default IAM role for authenticated users and default IAM role for unauthenticated users:


![](https://i.imgur.com/tIaKhiq.jpeg)

#### Dynamic policy assignment

To dynamically assign policies, we can use **user pool triggers** to add attributes onto a user when they sign up and then read those attributes during identity pool creation to assign certain IAM roles based on those attribute values.

1. Create a user pool trigger
2. When creating an identity pool, based on a **claim** (attribute you set on a user pool trigger) and value combination, assign an IAM role.


![](https://i.imgur.com/9BEtQ0F.jpeg)

### How to add cognito to an app

#### App integration

App integration with Cognito has two possibilities depending on how immersed into the ecosystem you are:

- **Option 1 (unmanaged)**: use Cognito mostly for the user pool aspect, to store users and then you can use the AWS SDK to verify returned tokens against services you use.
- **Option 2 (use with AWS)**: use Cognito to authenticate users and then authorize them to make calls against a Lambda or API gateway with role permissions to access other AWS resources.

![](https://i.imgur.com/DLGKzJm.jpeg)



#### Backend setup

1. Create an identity pool
2. Create a user pool
3. In the user pool, create a user pool client
4. Copy the user pool id and the app client ID to add an identity provider to the identity pool.

Now when a user logs in via the identity provider, they are stored into the user pool and thus given the roles specified by the identity pool.

## API gateway

## S3

### Intro

**S3** stands for **Simple Storage Service**. It is an "object storage" service, which is a fancy way of saying it's a giant, highly durable hard drive in the sky for flat files. You use it for profile pictures, videos, PDFs, CSV backups, or front-end static assets (like a React or Vue build).

There are three terms you must know:

- **Buckets:** Think of a bucket like a root-level drive or a top-level folder. **S3 Bucket names must be globally unique across all of AWS**. No two developers in the world can have the same bucket name!
- **Objects:** The actual files you upload (images, text files, binaries).
- **Keys:** The full path to the file inside the bucket. S3 doesn't actually use true physical folders; it simulates folders using the file key name. For example, if your file key is `images/avatars/user-123.png`, S3 treats `images/avatars/` as virtual folders.
    

> [!NOTE]
> 🔐 **Security Note:** By default, everything you create in S3 is completely **private**. Nobody can read or write to your bucket unless you explicitly add permissions or generate a temporary, secure link.

### S3 tags

An AWS tag is a key-value pair that holds metadata about resources, in this case Amazon S3 general purpose buckets. You can tag S3 buckets when you create them or manage tags on existing buckets.

S3 tags are used to manage **Attribute-based access control (ABAC)** to scale access permissions and grant access to S3 buckets based on their tags


### Creating a public bucket

1. When creating your bucket, start with the default settings but then **disable the 'Block all public access'** option to allow public access.
2. Upload a file, but notice that the Object URL of the object actually gives you a forbidden error because you don't have the policy enabling any principal to read any object from the bucket.


![](https://i.imgur.com/KHGuUkm.jpeg)


3. After the bucket is created, go into the bucket's permissions and adjust the **Access Control List (ACL)** or bucket policy to grant public read access to the files you want to share.
4. Remember, the default is to block public access for security, so you must explicitly allow it.


![](https://i.imgur.com/XdOz4Rb.jpeg)


4. Create a bucket policy that allows anybody to read files in the bucket, which is specified by the `"s3:GetObject"` and `"s3:GetObjectVersion"` permissions.



![](https://i.imgur.com/QP6Dcm0.jpeg)


```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": [
        "s3:GetObject",
        "s3:GetObjectVersion"
      ],
      "Resource": [
        "arn:aws:s3:::DOC-EXAMPLE-BUCKET/*"
      ]
    }
  ]
}
```

> [!IMPORTANT]
> You may think that by enabling public access to a bucket would make all objects within it public, but for that to work, you also need to create a bucket policy that makes all objects within the bucket readable.

### Bucket policies

Bucket policies define permissions that affect the bucket and its objects and the users that are authorized to execute those permissions.

Here is an example of a bucket policy that makes all objects within the bucket named publicly accessible to anyone on the internet:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "EnableReadForPublicBucket", // custom name of policy
      "Effect": "Allow",
      "Principal": "*", // policy affects all people who query it
      "Action": [
        "s3:GetObject",  // enable reading object
        "s3:GetObjectVersion"
      ],
      "Resource": [
          // policy applies to all objects within bucket 
        "arn:aws:s3:::amallick-public-bucket-415407093185-us-east-1-an/*" 
      ]
    }
  ]
}
```

- `"Sid"`: the custom name of the policy you want to create
- `"Effect"`: Whether the policy should be a policy that allows permissions or one that blocks permissions. 
	- `"Allow"`: makes this a a policy that allows permissions
	- `"Block"`: makes this a a policy that blocks permissions
- `"Action"`: a list of permissions the policy should apply
- `"Resource"`: a glob list of resources queried by ARNs for which the policy should apply to, meaning all matching resources will have the permissions and effect applied them.


### Static website hosting

1. Make the bucket a public bucket
2. Upload an `index.html` file to the bucket
3. Go to **properties -> static website hosting** and enable static website hosting, designating the website entrypoint to be `index.html`
4. Update the bucket policy to allow any prinicipal to read all objects from the bucket:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "EnableReadForPublicBucket", // custom name of policy
      "Effect": "Allow",
      "Principal": "*", // policy affects all people who query it
      "Action": [
        "s3:GetObject",  // enable reading object
      ],
      "Resource": [
          // policy applies to all objects within bucket
        "arn:aws:s3:::amallick-public-bucket-415407093185-us-east-1-an/*"
      ]
    }
  ]
}
```

## CloudFront

### CloudFront with public bucket

Let's say that you have a public S3 bucket that you want to provide a CDN for using CloudFront. Here are the steps to set that up once you have a public bucket:

1. **Choose origin type**: Choose S3 as the origin type for cloudfront, meaning that a specific S3 bucket will act as the origin server and then CloudFront will cache resources from that origin server (the regional S3 bucket) and cache it at edge locations across the world for distribution.


![](https://i.imgur.com/QYOY2oQ.jpeg)

2. Deploy the cloudfront distribution.
## DynamoDB

### Intro

Amazon DynamoDB is a fully managed, serverless NoSQL database service designed for high scalability and ultra-fast performance.

DynamoDB consists of 4 primary components:

- **Tables:** A collection of data records (similar to a collection in Mongo or a table in SQL).
- **Items:** A single record inside the table (analogous to a row). Each item is a collection of key-value attributes.
- **Attributes:** The individual data fields inside an item (like `id`, `email`, `createdAt`).
- **Primary Key:** Unlike other databases where you can query by any column easily out of the box, DynamoDB _forces_ you to define how you will look up your data upfront. Your primary key can be one of two setups:
    1. **Partition Key (PK) only:** A single unique attribute (like `userId`) used to hash and distribute data across physical storage drives.
    2. **Partition Key + Sort Key (SK):** Also known as a _composite primary key_. This lets you group items under the same Partition Key but sort/filter them uniquely by the Sort Key (e.g., `PK: "USER#123"`, `SK: "ORDER#2026-06-12"`).


> [!TIP]
> **when should you use DynamoDB?**
> ***
> DynamoDB is ideal for applications needing high throughput, flexible data models, and minimal operational overhead, such as web apps, mobile apps, and IoT systems. This makes it a powerful choice when your data model is evolving or when you require fast, scalable access to data without the constraints of traditional relational databases.

#### Partition key + Sort key

DynamoDB is unique in that it allows you to pick one of two setups for how you structure your primary key.

Here is the terminology:

- **partition key**: The partition key is part of the table's primary key. It is a hash value that is used to retrieve items from your table and allocate data across hosts for scalability and availability.
- **sort key**: You can use a sort key as the second part of a table's primary key. The sort key allows you to sort or search among all items sharing the same partition key.

Here are the two setups:

1. **partition key alone**: records are considered unique or not based on the partition key value. No two records can have the same partition key value
2. **partition key + sort key**: uniqueness of records is based on the combination of the partition key and sort key values. No two record can have the same combination of partition key and sort key values.

> [!NOTE]
> The reason why it's so important for a partition key to be unique is because that helps with sharding and ensuring that partitions have equal amounts of data. 

### Creating a DynamoDB table

1. **Choose the primary key**: specify a partition key or a partition + sort key combination


![](https://i.imgur.com/htN3iRW.jpeg)


2. **Choose the table class**: Either choose between standard DynamoDB (optimized for frequent reads/writes) or archive DynamoDB (costs less, archive storage)
3. **Choose the pricing option**: Either choose on-demand pricing (auto-scales for availability and load balancing) or **provisioned**, where you guess read/write capacity in advance so it costs less.


![](https://i.imgur.com/w6xUv9k.jpeg)


### Querying a DynamoDB table

When trying to explore table items in the AWS console of a DynamoDB table, you have two options available:

- **query**: Query items by a partition key or partition key + sort key combination.


![](https://i.imgur.com/W5bwHEc.jpeg)


- **scan**: return all items in the table and then apply certain filters to only get certain items back that satisfy some conditional attribute criteria.


![](https://i.imgur.com/2ZsREfm.jpeg)


## EC2

### Creating an instance

Here are the steps to creating an EC2 instance using the AWS console:

1. **Select AMI (amazon machine image)**: this is the OS that will be provisioned for your VM.
2. **Select instance type and specs**: allows you to choose the instance type and the compute capabilities.
3. **key pair**: generate a SSH key pair so you can securely connect to your EC2 instance.
4. **select network settings**: choose how to expose your EC2 instance to the world, either through SSH only or include HTTP traffic and which IP addresses to allow connecting to the instance.
5. **configure storage**: configure disk storage capacity


#### Network settings

An EC2 instance must be placed with a specific VPC and a specific subnet within that VPC, which then places the instance inside an availability zone.

> [!NOTE]
> How do you know if the subnet you're placing an EC2 instance in is public or private? 
> 
> 1. For that you can just check if the "Auto assign public IP" setting is available and if it's enabled. 
> 2. If it is enabled then that means that your subnet is a public subnet because it has a public IP assigned to it. 

For extra availability, you can create an exact copy of your instance and place it in a different subnet so it gets placed in a different availability zone.

#### Storage settings

The best storage setting for EBS is `gp3`, which stands for SSD drive, since that has good balance of performance, cost-performance, and durability.






### Run a webserver on an instance

There are two ways to connect to an instance:

1. **SSH client connection**: Use the generated key pair to connect to the instance.
2. **AWS web SSH**: AWS offers an in-browser way to connect to your EC2 instance and spin up a SSH session in the browser connecting to that instance. For this to work, however, you need to allow SSH traffic from all IP addresses.

#### Connecting via SSH

This is how to connect the SSH way:

1. Open a terminal window on your computer.
2. Use the **ssh** command to connect to the instance. You need the details about your instance that you gathered as part of the prerequisites. For example, you need the location of the private key (`.pem` file), the username, and the public DNS name or IPv6 address. 

All EC2 instances come with a public IPV4 address, a public DNS name, and a public IPV6 address. You can uniquely connect to the EC2 instance through the IPv6 and DNS names.

The following are example commands for connecting via SSH to the EC2 instances via IPv6 or DNS:

To use the public DNS name, enter the following command.

```bash
ssh -i /path/key-pair-name.pem instance-user-name@instance-public-dns-name
```

Alternatively, if your instance has an IPv6 address, enter the following command to use the IPv6 address.

```bash
ssh -i /path/key-pair-name.pem instance-user-name@2001:db8::1234:5678:1.2.3.4
```

> [!NOTE]
> Either way, it's important to note that the instance user name is by default dependent on which AMI you choose. For the standard Amazon Linux image, the username is `ec2-user`. 

This is what the SSH connection to an EC2 instance should look like:

```config title="~/.ssh/config"
Host ec2-107-22-147-26.compute-1.amazonaws.com
  HostName ec2-107-22-147-26.compute-1.amazonaws.com
  IdentityFile /c/Users/amallick.ENGINEERS/.ssh/first-ec2-key-pair.pem
  User ec2-user
```

Here are all the steps in detail to have it work in VSCode:

1. **allow SSH traffic**: Make sure your EC2 instance's security group allows SSH (port 22) from your IP or anywhere, as configured in the video.
2. **use Remote SSH**: In VSCode, you can use the Remote - SSH extension or open a terminal.
3. **ssh with .pem file**: Use the .pem file as your private key for authentication. In a terminal, the SSH command looks like:  
	- Replace `/path/to/awsdemo.pem` with the actual path to your downloaded .pem file and `your-ec2-public-ip` with your instance's public IP or DNS.
	- Ensure the .pem file has proper permissions (e.g., `chmod 400 awsdemo.pem` on Unix systems) to keep it secure.

```
ssh -i /path/to/awsdemo.pem ec2-user@your-ec2-public-ip
```

#### EC2 User data

The user data script for EC2 is a list of bash commands that EC2 runs upon starting the instance. You can use this to immediately start up a web server or install necessary packages.

Here is an example of a user data script that installs Nginx and then starts it on port 80:

```bash
#!/bin/bash
set -euxo pipefail

# Wait for cloud-init networking
sleep 30

# Update package metadata
apt-get update -y

# Install nginx
DEBIAN_FRONTEND=noninteractive apt-get install -y nginx

# Enable and start nginx
systemctl enable nginx
systemctl restart nginx

# Simple test page
cat > /var/www/html/index.html <<'EOF'
<html>
<body>
<h1>NGINX is running on EC2</h1>
</body>
</html>
EOF
```

#### EC2 IAM policies

If you want to access AWS resources programmatically via the CLI or SDK and you want that to run on an EC2 instance, you have two options for doing so:

1. **put AWS access keys on the EC2 instance**: This is how you access AWS resources normally on your machine, so it works the same for an EC2 instance.
	- **pro**: super simple, the exact same as if you would do it on your personal machine.
	- **con**: extremely insecure. If someone hacks your EC2 instance, they can now obtain the AWS access keys that live on the EC2 instance.
2. **Attach an IAM role to the EC2 instance**: if you want to give an EC2 instance access to AWS resources temporarily without using access keys and storing that on the instance, you can attach an IAM role to the EC2 instance to temporarily give access to AWS services. 

Here are the steps to create an IAM role that allows an EC2 instance to access the S3 API programmatically:

1. Go to IAM and create a new role, and select the trusted entity type to be an AWS service and choose EC2 as the service.


![](https://i.imgur.com/xhwaPEB.jpeg)

2. Add the `AmazonS3FullAccess` permission to the role.
3. Scope the policy JSON to add read/write permissions to a single specific bucket resource instead of all buckets.
4. Go to the instance you want to attach the policy to, then go to **security** then to **modify IAM role** and select the role you just created, then apply that role.


![](https://i.imgur.com/V30bGd2.jpeg)



### Creating snapshots (custom AMIs)

If you want to create snapshots from existing instances to create copies that also take into account storage and installed packages and make a perfect copy of an instance, then what you want to do is create snapshots following these steps:

1. Create an instance, install packages, add data to EBS hard drive.
2. On the instance details, click on **create image** to create a snapshot of this instance.

![](https://i.imgur.com/RfLJwOy.jpeg)

3. Once the new custom AMI is available, launch a new EC2 instance based on it.



### EBS

#### Creating an EBS volume and mounting it



1. Go to **EC2** then to **EBS** tab and create a new EBS volume.
2. Place the EBS Volume in the same Availability Zone as the EC2 Instance you want to attach it to. 


![](https://i.imgur.com/qQ9dQxR.jpeg)

3. Attach the EBS volume to a running instance and choose its mount path on linux


![](https://i.imgur.com/srPxM87.jpeg)



> [!NOTE]
> It is important to realize that since EBS is a regional service, it must be in both the same region and the same availability zone as any EC2 instances you want to attach it to. 

### EFS

#### Creating an EFS volume and mounting it

1. Create the EFS volume by going to **Amazon EFS** then to **File systems**.
2. Attach the EFS volume via the instructions
               
#### Accessing an EFS volume

On the Amazon Linux AMI, the EFS filesystem is mounted at the `/mnt/efs` mount path, so any files you modify, create, or delete here changes those files for all consumers of that specific EFS volume.


## EC2 + ALB + ASG

### Load balancer DNS

The DNS name of a load balancer contains several A records, one for each IP address of an EC2 instance in the target group.

You have different addresses for different availability zones.


![](https://i.imgur.com/KhAz7VL.jpeg)


### Internet-facing vs internal load balancer

- **internet-facing load balancer**: has a public IPv4 and DNS so it can accept ingress publicly on the internet, if configured to do so, and routes traffic across multiple availability zones.


![](https://i.imgur.com/0vacCvm.jpeg)

- **internal load balancer**: does not have a public address, only a private one, so it distributes traffic within a VPC to target instances. A public facing web server EC2 instance sends a request to an internal load balancer to distribute traffic to private instances within a target group
	- **Benefit (availability)**: availability, loose coupling of availability where you can place many instances across many availability zones without configuring the public interface to work with those availability zones.
	- **Benefit (privacy)**: encapsulates the load balancer, shields it from public traffic.
	- **Benefit (loose coupling)**: decouples the scaling of server instances from the public-facing EC2 instance. The public interface has no knowledge of the actual number of servers, since it only queries the load balancer.




![](https://i.imgur.com/i0GDbmi.jpeg)


### Health checks


![](https://i.imgur.com/Wx6QsgV.jpeg)


- **unhealthy threshold**: how many times to tolerate unhealthy responses from health checks before you declare the instance as unhealthy.
- **healthy threshold**: how many successful health check responses does an instance need to return before the load balancer can consider the instance healthy? 

## Docker Containers on AWS

### ECR setup

1. Create a docker image that runs some app

```Dockerfile
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=5000

EXPOSE ${PORT}

CMD ["node", "server.ts"]
```

2. Go to the ECR management pane and create a new repository


![](https://i.imgur.com/cIKnuni.jpeg)
3. Push a docker image to the ECR registry via these commands:


![](https://i.imgur.com/j91IX2l.jpeg)

4. Once your image is pushed up to ECR, you can select it to use in ECS:


![](https://i.imgur.com/Yr7s0zA.jpeg)
5. Create a cluster and set these 5 things:
	- **cluster name**: to easily identify your cluster
	- **container port**: which port to expose the container on
	- **container env vars**: env vars to set in the container.
	- **compute**: the compute to provision for a single task, and the auto-scaling capabilities of when to scale up tasks, and define the minimum and maximum number of tasks.
	- **networking**: the VPCs and subnets to place the tasks in.


![](https://i.imgur.com/qwUnOCM.jpeg)
6. If the cluster doesn't immediately work, that means that the **express service** and **task definition** it created doesn't have the correct networking. Let's fix that by creating a task definition that uses the following:
	- **network mode**: Should use the **bridge** network mode
	- **port mapping**: Should map the exposed container port to a port on the container host that is available and open for TCP traffic.
	- **security group**: security group on the container host should have correct ports being opened.
7. Create a new express service that uses the new task definition you just created.


![](https://i.imgur.com/KRzt6fX.jpeg)


### ECS intro

ECS contains two main components:

- **task definitions**: defines how a single container runs on a container host, which requires you to provide the information below:
	- **container host type**: whether to use Fargate or EC2
	- **task size (compute)**: the underlying compute parameters to provision for the container host.
	- **port mapping**: the port mapping from the port the container is exposed on and running on to the host port.
	- **network mode**: how to setup the container networking with the host instance.
- **clusters**: defines the auto-scaling groups for a single task definition, defining when to scale and the scaling boundaries of horizontally scaling a task definition.

### ECS Clusters


#### Task definitions


**task size**

For **task size**, specify the amount of CPU and memory to reserve for the task. The CPU value is specified as a number of vCPUs. The memory value is specified in GB.

For Amazon ECS tasks hosted on AWS Fargate, the task CPU and memory values are required and there are specific values for both CPU and memory that are supported.

- For `.25 vCPU` CPU, the valid memory values are `.5 GB`, `1 GB`, or `2 GB`.
    
- For `.5 vCPU`, the valid memory values are `1 GB`, `2 GB`, `3 GB`, or `4 GB`.
    
- For `1 vCPU`, the valid memory values are `2 GB`, `3 GB`, `4 GB`, `5 GB`, `6 GB`, `7 GB`, or `8 GB`.
    
- For `2 vCPU`, the valid memory values are between `4 GB` and `16 GB` in 1 GB increments.

**launch type**

The **Launch type** specified for a task definition determines where Amazon ECS launches the task or service. The task definition parameters are validated against the allowed values for the compute option.

- By default, the **AWS Fargate** option is selected. 
- You can also select **Amazon EC2 instances**.

**network mode**

The **network mode** specifies what type of networking the containers in the task use. The following are available:

- **awsvpc**:  which provides the task with an elastic network interface (ENI). When creating a service or running a task with this network mode you must specify a network configuration consisting of one or more subnets, security groups, and whether to assign the task a public IP address.
	- The **awsvpc** network mode is required for tasks hosted on Fargate.
- **bridge** uses Docker's built-in virtual network, which runs inside each Amazon EC2 instance hosting the task. The bridge is an internal network namespace that allows each container connected to the same bridge network to communicate with each other. It provides an isolation boundary from containers that aren't connected to the same bridge network. You use static or dynamic port mappings to map ports in the container with ports on the Amazon EC2 host.
	- If you choose **bridge** for the network mode, under **Port mappings**, for **Host port**, specify the port number on the container instance to reserve for your container.
- **default**: uses Docker's built-in virtual network mode on Windows, which runs inside each Amazon EC2 instance that hosts the task. This is the default network mode on Windows if a network mode isn't specified in the task definition.
- **host**: has the task bypass Docker's built-in virtual network and maps container ports directly to the ENI of the Amazon EC2 instance hosting the task. As a result, you can't run multiple instantiations of the same task on a single Amazon EC2 instance when port mappings are used.
- **none**: this network mode provides a task with no external network connectivity.
    

For tasks hosted on Amazon EC2 instances, the available network modes are **awsvpc**, **bridge**, **host**, and **none**. If no network mode is specified, the **bridge** network mode is used by default.


### ECS Cluster example

#### Create the network

We'll walk through creating this architecture:


![](https://i.imgur.com/kR2libH.jpeg)

First apply this Cloudformation template to create the network

```yaml
AWSTemplateFormatVersion: '2010-09-09'

Parameters:
  VpcCIDR:
    Type: String
    Default: '10.0.0.0/16'
    Description: CIDR block for the VPC

Resources:
  ECSDemoVPC:
    Type: 'AWS::EC2::VPC'
    Properties:
      CidrBlock: !Ref VpcCIDR
      EnableDnsSupport: true
      EnableDnsHostnames: true
      Tags:
        - Key: Name
          Value: ECSDemo

  PublicSubnet1:
    Type: 'AWS::EC2::Subnet'
    Properties:
      VpcId: !Ref ECSDemoVPC
      CidrBlock: '10.0.0.0/24'
      MapPublicIpOnLaunch: true
      AvailabilityZone: !Select [ 0, !GetAZs '' ]
      Tags:
        - Key: Name
          Value: PublicSubnet1

  PublicSubnet2:
    Type: 'AWS::EC2::Subnet'
    Properties:
      VpcId: !Ref ECSDemoVPC
      CidrBlock: '10.0.1.0/24'
      MapPublicIpOnLaunch: true
      AvailabilityZone: !Select [ 1, !GetAZs '' ]
      Tags:
        - Key: Name
          Value: PublicSubnet2

  PublicSubnet1Association:
    Type: 'AWS::EC2::SubnetRouteTableAssociation'
    Properties:
      SubnetId: !Ref PublicSubnet1
      RouteTableId: !Ref ECSDemoPublicRouteTable

  PublicSubnet2Association:
    Type: 'AWS::EC2::SubnetRouteTableAssociation'
    Properties:
      SubnetId: !Ref PublicSubnet2
      RouteTableId: !Ref ECSDemoPublicRouteTable

  PrivateSubnet1:
    Type: 'AWS::EC2::Subnet'
    Properties:
      VpcId: !Ref ECSDemoVPC
      CidrBlock: '10.0.2.0/24'
      AvailabilityZone: !Select [ 0, !GetAZs '' ]
      Tags:
        - Key: Name
          Value: PrivateSubnet1

  PrivateSubnet2:
    Type: 'AWS::EC2::Subnet'
    Properties:
      VpcId: !Ref ECSDemoVPC
      CidrBlock: '10.0.3.0/24'
      AvailabilityZone: !Select [ 1, !GetAZs '' ]
      Tags:
        - Key: Name
          Value: PrivateSubnet2

  PrivateSubnet1Association:
    Type: 'AWS::EC2::SubnetRouteTableAssociation'
    Properties:
      SubnetId: !Ref PrivateSubnet1
      RouteTableId: !Ref ECSDemoPrivateRouteTable

  PrivateSubnet2Association:
    Type: 'AWS::EC2::SubnetRouteTableAssociation'
    Properties:
      SubnetId: !Ref PrivateSubnet2
      RouteTableId: !Ref ECSDemoPrivateRouteTable

  ECSDemoPublicRouteTable:
    Type: 'AWS::EC2::RouteTable'
    Properties:
      VpcId: !Ref ECSDemoVPC
      Tags:
        - Key: Name
          Value: pubdemo

  ECSDemoPrivateRouteTable:
    Type: 'AWS::EC2::RouteTable'
    Properties:
      VpcId: !Ref ECSDemoVPC
      Tags:
        - Key: Name
          Value: pridemo

  InternetGateway:
    Type: 'AWS::EC2::InternetGateway'
    Properties:
      Tags:
        - Key: Name
          Value: ECSDemoIGW

  AttachGateway:
    Type: 'AWS::EC2::VPCGatewayAttachment'
    Properties:
      VpcId: !Ref ECSDemoVPC
      InternetGatewayId: !Ref InternetGateway

  PublicNetworkAcl:
    Type: 'AWS::EC2::NetworkAcl'
    Properties:
      VpcId: !Ref ECSDemoVPC
      Tags:
        - Key: Name
          Value: PublicNetworkAcl

  PrivateNetworkAcl:
    Type: 'AWS::EC2::NetworkAcl'
    Properties:
      VpcId: !Ref ECSDemoVPC
      Tags:
        - Key: Name
          Value: PrivateNetworkAcl

  PrivateSubnet1AclAssociation:
    Type: AWS::EC2::SubnetNetworkAclAssociation
    Properties:
      SubnetId: !Ref PrivateSubnet1
      NetworkAclId: !Ref PrivateNetworkAcl

  PrivateSubnet2AclAssociation:
    Type: AWS::EC2::SubnetNetworkAclAssociation
    Properties:
      SubnetId: !Ref PrivateSubnet2
      NetworkAclId: !Ref PrivateNetworkAcl

  PublicSubnet1AclAssociation:
    Type: AWS::EC2::SubnetNetworkAclAssociation
    Properties:
      SubnetId: !Ref PublicSubnet1
      NetworkAclId: !Ref PublicNetworkAcl

  PublicSubnet2AclAssociation:
    Type: AWS::EC2::SubnetNetworkAclAssociation
    Properties:
      SubnetId: !Ref PublicSubnet2
      NetworkAclId: !Ref PublicNetworkAcl

  InboundRulePublic:
    Type: 'AWS::EC2::NetworkAclEntry'
    Properties:
      NetworkAclId: !Ref PublicNetworkAcl
      RuleNumber: 100
      Protocol: -1
      RuleAction: allow
      Egress: false
      CidrBlock: '0.0.0.0/0'

  OutboundRulePublic:
    Type: 'AWS::EC2::NetworkAclEntry'
    Properties:
      NetworkAclId: !Ref PublicNetworkAcl
      RuleNumber: 100
      Protocol: -1
      RuleAction: allow
      Egress: true
      CidrBlock: '0.0.0.0/0'

  InboundRulePrivate:
    Type: 'AWS::EC2::NetworkAclEntry'
    Properties:
      NetworkAclId: !Ref PrivateNetworkAcl
      RuleNumber: 100
      Protocol: -1
      RuleAction: allow
      Egress: false
      CidrBlock: '0.0.0.0/0'

  OutboundRulePrivate:
    Type: 'AWS::EC2::NetworkAclEntry'
    Properties:
      NetworkAclId: !Ref PrivateNetworkAcl
      RuleNumber: 100
      Protocol: -1
      RuleAction: allow
      Egress: true
      CidrBlock: '0.0.0.0/0'

  NatGatewayEIP:
    Type: 'AWS::EC2::EIP'
    Properties:
      Domain: vpc

  NatGateway:
    Type: 'AWS::EC2::NatGateway'
    Properties:
      AllocationId: !GetAtt NatGatewayEIP.AllocationId
      SubnetId: !Ref PublicSubnet1

  PrivateRouteViaNat:
    Type: 'AWS::EC2::Route'
    Properties:
      RouteTableId: !Ref ECSDemoPrivateRouteTable
      DestinationCidrBlock: '0.0.0.0/0'
      NatGatewayId: !Ref NatGateway

  PubRouteViaIGW:
    Type: 'AWS::EC2::Route'
    Properties:
      RouteTableId: !Ref ECSDemoPublicRouteTable
      DestinationCidrBlock: '0.0.0.0/0'
      GatewayId: !Ref InternetGateway

Outputs:
  VpcId:
    Description: 'VPC Id'
    Value: !Ref ECSDemoVPC
  PublicSubnet1Id:
    Description: 'Public Subnet 1 Id'
    Value: !Ref PublicSubnet1
  PublicSubnet2Id:
    Description: 'Public Subnet 2 Id'
    Value: !Ref PublicSubnet2
  PrivateSubnet1Id:
    Description: 'Private Subnet 1 Id'
    Value: !Ref PrivateSubnet1
  PrivateSubnet2Id:
    Description: 'Private Subnet 2 Id'
    Value: !Ref PrivateSubnet2
```

#### Configure container hosts

Then you have to decide which container host type to use for the cluster:

Choose from three infrastructure types for your containers. All clusters have Fargate access by default:

- **Amazon ECS Managed Instances**: AWS fully manages Amazon EC2 instances (provisioning, patching, scaling). Best for cost-effective compute with minimal operational overhead.
    
- **AWS Fargate**: Serverless compute - Pay only for task resources without managing infrastructure. Ideal for variable workloads and rapid deployment.
    
- **Self-managed instances**: Full control - You manage Amazon EC2 instances directly (selection, configuration, maintenance). Best for custom AMIs or specific instance requirements.



![](https://i.imgur.com/QQ0q5Oq.jpeg)


Once you select EC2 instances as the container host, here is a list of all that you have to configure:

- **auto-scaling group**: whether to delegate to ECS to create an auto-scaling group for the container hosts, or to use an existing auto-scaling group.
	- If you choose to use an existing auto-scaling group, then you have to manually SSH into the container hosts and install the ECS agent yourself.
- **provisioning model**: whether to use on-demand instances or spot instances for cheaper workloads 
- **AMI**: the AMI to use for the container host.
- **instance type**: the instance type for the container host.
- **EC2 instance role**: An IAM instance role is used by Amazon EC2 instances to make AWS API requests
- **desired capacity**: sets the minimum and maximum number of tasks/containers that can run simultaneously per container host. 
	- Basically defines the bounds of the auto-scaling.

Then you have to add the networking settings:


![](https://i.imgur.com/hrTRnUo.jpeg)


- **VPC**: the VPC to place the container hosts in.
- **subnets**: the subnets to use and place the container hosts in.
- **security group**: the security group for the container host
- **public IP**: if in a a public subnet, whether or not to enable automatically assigning a public IP address to the container hosts.

#### Task definitions

Create a new task definition

## Lambda 

### Lambda configuration

#### Adding versions and aliases

1. Create a new alias or version like so for a lambda, or use the version tab:

![](https://i.imgur.com/B4pTJkX.jpeg)

![](https://i.imgur.com/ivb1ze9.jpeg)

2. Publish a new version, note the versioned ARN of the lambda


![](https://i.imgur.com/xHDgqcQ.jpeg)

3. Create an alias, where you have a name point to a version number.


![](https://i.imgur.com/1ivWfNG.jpeg)


### Lambda Development Basics

#### Lambda Monitoring

Lambdas automatically have a dedicated log group for them in cloudwatch, and logs are written to cloudwatch just by printing to the console within the lambda handler using something like `console.log()` or `print()`.



#### Lambda development with AWS toolkit

Once the lambda is created, you can now start developing with it in VSCode using AWS toolkit.


![](https://i.imgur.com/qpknLp3.jpeg)

Here is a good workflow:

1. Create a sample event that is based on the trigger for your lambda. For example, for an API gateway lambda, choose the **APIGatewayProxy event** choice.


![](https://i.imgur.com/1EmG6Wt.jpeg)


2. Based on the sample event, ask the AI to generate JSDOC typings for you so you get type safety.
3. The best dev pipeline is to invoke your function locally, and then hit **Ctrl + S** to save and automatically deploy your function to the cloud.

```ts
const sampleEvent = `{
    "body": "{\"test\":\"body\"}",
    "resource": "/{proxy+}",
    "path": "/path/to/resource",
    "httpMethod": "POST",
    "queryStringParameters": {
        "foo": "bar"
    },
    "pathParameters": {
        "proxy": "path/to/resource"
    },
    "stageVariables": {
        "baz": "qux"
    },
    "headers": {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, sdch",
        "Accept-Language": "en-US,en;q=0.8",
        "Cache-Control": "max-age=0",
        "CloudFront-Forwarded-Proto": "https",
        "CloudFront-Is-Desktop-Viewer": "true",
        "CloudFront-Is-Mobile-Viewer": "false",
        "CloudFront-Is-SmartTV-Viewer": "false",
        "CloudFront-Is-Tablet-Viewer": "false",
        "CloudFront-Viewer-Country": "US",
        "Host": "1234567890.execute-api.{dns_suffix}",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Custom User Agent String",
        "Via": "1.1 08f323deadbeefa7af34d5feb414ce27.cloudfront.net (CloudFront)",
        "X-Amz-Cf-Id": "cDehVQoZnx43VYQb9j2-nvCh-9z396Uhbp027Y2JvkCPNLmGJHqlaA==",
        "X-Forwarded-For": "127.0.0.1, 127.0.0.2",
        "X-Forwarded-Port": "443",
        "X-Forwarded-Proto": "https"
    },
    "requestContext": {
        "accountId": "123456789012",
        "resourceId": "123456",
        "stage": "prod",
        "requestId": "c6af9ac6-7b61-11e6-9a41-93e8deadbeef",
        "identity": {
            "cognitoIdentityPoolId": null,
            "accountId": null,
            "cognitoIdentityId": null,
            "caller": null,
            "apiKey": null,
            "sourceIp": "127.0.0.1",
            "cognitoAuthenticationType": null,
            "cognitoAuthenticationProvider": null,
            "userArn": null,
            "userAgent": "Custom User Agent String",
            "user": null
        },
        "resourcePath": "/{proxy+}",
        "httpMethod": "POST",
        "apiId": "1234567890"
    }
}`;

/**
 * @typedef {Object} Identity
 * @property {string|null} cognitoIdentityPoolId
 * @property {string|null} accountId
 * @property {string|null} cognitoIdentityId
 * @property {string|null} caller
 * @property {string|null} apiKey
 * @property {string} sourceIp
 * @property {string|null} cognitoAuthenticationType
 * @property {string|null} cognitoAuthenticationProvider
 * @property {string|null} userArn
 * @property {string} userAgent
 * @property {string|null} user
 */

/**
 * @typedef {Object} RequestContext
 * @property {string} accountId
 * @property {string} resourceId
 * @property {string} stage
 * @property {string} requestId
 * @property {Identity} identity
 * @property {string} resourcePath
 * @property {string} httpMethod
 * @property {string} apiId
 */

/**
 * @typedef {Object} APIGatewayProxyEvent
 * @property {string} body
 * @property {string} resource
 * @property {string} path
 * @property {string} httpMethod
 * @property {Object.<string, string>} queryStringParameters
 * @property {Object.<string, string>} pathParameters
 * @property {Object.<string, string>} stageVariables
 * @property {Object.<string, string>} headers
 * @property {RequestContext} requestContext
 */

/**
 * @typedef {Object} APIGatewayProxyResult
 * @property {number} statusCode
 * @property {string} body
 */

/**
 * Lambda handler for REST API requests
 * @param {APIGatewayProxyEvent} event
 * @returns {Promise<APIGatewayProxyResult>}
 */
export const handler = async (event) => {
  /**
   * @type {APIGatewayProxyResult}
   */
  let response = {
    statusCode: 200,
    body: JSON.stringify("Hello from Lambda!"),
  };

  if (event.queryStringParameters && event.queryStringParameters.foo) {
    response.body = JSON.stringify(`Hello ${event.queryStringParameters.foo}!`);
    return response;
  }

  const stage = event.requestContext.stage;
  if (stage) {
    response.body = JSON.stringify(`In stage ${stage} stage!`);
    return response;
  }

  return response;
};

```



### Lambda API gateway

1. Create an API gateway that is an **HTTP API** type. Don't add any integrations or routes.

	![](https://i.imgur.com/1Jcl6gq.jpeg)

2. Create a lambda with the API gateway you created as the trigger. Choose **open** security so your API is open to the public and has no need for authentication.

	![](https://i.imgur.com/Yb6ejdT.jpeg)


#### Example

Here is an example API gateway lambda that accepts a POST request with `num1` and `num2` as parameters in the request body:


```ts
/**
 * Lambda handler for REST API requests
 * @param {APIGatewayProxyEvent} event
 * @returns {Promise<APIGatewayProxyResult>}
 */
export const handler = async (event) => {
  /**
   * @type {APIGatewayProxyResult}
   */
  let response = {
    statusCode: 200,
    body: JSON.stringify("Hello from Lambda!"),
  };

  console.log("Received event:", JSON.stringify(event, null, 2));

  if (event.requestContext.http.method === "POST" && event.body) {
    const { num1, num2 } =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    if (typeof num1 === "number" && typeof num2 === "number") {
      const sum = num1 + num2;
      response.body = JSON.stringify(
        `The sum of ${num1} and ${num2} is ${sum}.`,
      );
      return response;
    } else {
      response.statusCode = 400;
      response.body = JSON.stringify(
        "Invalid input. Please provide two numbers.",
      );
      return response;
    }
  }

  return response;
}
```

Then you can test the lambda like so:

```http
### GET /
GET https://l5cfpz1xhg.execute-api.us-east-1.amazonaws.com/lambda-course-rest-api-handler

### POST /
POST https://l5cfpz1xhg.execute-api.us-east-1.amazonaws.com/lambda-course-rest-api-handler
Content-Type: application/json

{
    "num1": 5,
    "num2": 10
}
```
#### Testing the API gateway

Once the lambda is deployed and the API gateway is created, you need to test out if the API gateway URL works for real or not.

1. Go to **Routes**
2. Find the specific route in the API gateway whose **integration** is the lambda you created that gets triggered.

> [!NOTE]
> The thing about HTTP API gateway is that it creates a specific route by default where the lambda gets triggered, so it's one lambda that gets triggered per route.


![](https://i.imgur.com/g6d2rXZ.jpeg)

You can find the exact deployed URL of the API gateway by going to your lambda then go to **triggers** and look at the API gateway trigger:


![](https://i.imgur.com/GNCM2ks.jpeg)

### Bucket to SNS to lambda

1. Create an SNS topic that anybody can subscribe to (`Principal: *`)
2. Go to **S3 -> events -> create new event** and have it push to the SNS topic.
3. Create a lambda whose trigger is the SNS topic, and thus receives data in SNS event format.

### Lambda with API gateway and DynamoDB

Although you can technically call lambda via HTTPS by making a request to its function URL, it's better practice to set up a REST API via API Gateway service that then redirects requests to the REST API to specific lambdas, triggering certain lambdas or sequences of lambdas on a route request.

> [!NOTE]
> Think of API gateway being the front gate, the gateway to executions, and lambda being the actual resource that's being gatekept by API gateway.


Here are the benefits of this gateway approach to HTTPS lambdas:

- **CORS**: you can provide CORS via GUI per route without having to do weird code configuration.
- **service integration**: Instead of handling the request-response cycle yourself with code, you can simply create a **resource** (route) and for that route create a **method** (HTTP method) which executes some type of AWS service or existing functionality.

Here are the different types of methods available to you:

- **lambda function**: invoke a lambda function upon an HTTP method to a resource
- **HTTP endpoint**: redirect the request to another existing online URL.
- **AWS service**: redirect the request to an AWS service
- **VPC link**: redirect the request to a resource that you own within a VPC you own.


#### DynamoDB with API gateway example


1. Create a lambda that has a role with the `DynamoDBFullAccess` permission.
2. The lambda should have this type of code:

```ts
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

const dynamo = DynamoDBDocument.from(new DynamoDB());

/**
 * Demonstrates a simple HTTP endpoint using API Gateway. You have full
 * access to the request and response payload, including headers and
 * status code.
 *
 * To scan a DynamoDB table, make a GET request with the TableName as a
 * query string parameter. To put, update, or delete an item, make a POST,
 * PUT, or DELETE request respectively, passing in the payload to the
 * DynamoDB API as a JSON body.
 */
export const handler = async (event) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    let body;
    let statusCode = '200';
    const headers = {
        'Content-Type': 'application/json',
    };

    try {
        switch (event.httpMethod) {
            case 'DELETE':
                body = await dynamo.delete(JSON.parse(event.body));
                break;
            case 'GET':
                body = await dynamo.scan({ TableName: event.queryStringParameters.TableName });
                break;
            case 'POST':
                body = await dynamo.put(JSON.parse(event.body));
                break;
            case 'PUT':
                body = await dynamo.update(JSON.parse(event.body));
                break;
            default:
                throw new Error(`Unsupported method "${event.httpMethod}"`);
        }
    } catch (err) {
        statusCode = '400';
        body = err.message;
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};

```


