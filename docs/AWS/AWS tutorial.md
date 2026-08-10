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

#### Principal of least privilege

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
- **authenticated access to AWS services**: authenticated or unauthenticated users can access AWS services you host, like images living on an S3 bucket depending on policies you set up.

These two key features are made possible through two pools:

- **user pools**: provide authentication for in-app users
- **identity pools**: provide AWS credentials for users or authorizes them to access certain services, whether authenticated or not depending on the policies you set up.

### Complete authentication flow

Identity pools handle all the authorization behind application users being able to access certain AWS services.

When creating an identity pool, there are two important properties you need to set for the pool:

1. **authenticated or unauthenticated**: whether or not this pool is public to all users or enforces authentication via some **identity provider** like cognito or apple.
2. **policies**: when authenticated into the ID pool, what IAM roles will the users be able to have? What services can they access, defined by which policies?

Identity providers (IdP) are the different authentication providers you can use for in-app authentication. IdPs require that you create a user pool to store users that authenticate through the selected authentication provider.

1. Create an identity pool
2. Create a user pool
3. In the user pool, create an app client
4. Copy the user pool id and the app client ID to add an identity provider to the identity pool.

Now when a user logs in via the identity provider, they are stored into the user pool and thus given the roles specified by the identity pool.

### unauthenticated entities

When creating an identity pool, if you want public unauthenticated and unauthorized access to an AWS resource, like a public S3 bucket, then you can bypass the requirement for user auth by creating an **unauthenticated entity**.

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
2. After the bucket is created, go into the bucket's permissions and adjust the **Access Control List (ACL)** or bucket policy to grant public read access to the files you want to share.
3. Remember, the default is to block public access for security, so you must explicitly allow it.


![](https://i.imgur.com/XdOz4Rb.jpeg)


4. Create a bucket policy that allows anybody to read files in the bucket, which is specified by the `"s3:GetObject"` and `"s3:GetObjectVersion"` permissions.

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
### DynamoDB vs RDS

#### Performance

DynamoDB's implementation of having a partition key and sort key makes for easy sharding.

This means the db doesn't slow down as your data grows. A table with 100 entries operates at the exact same speed as a table with 100 million entries, because AWS uses the Partition Key to calculate exactly which physical hard drive your data lives on instantly!

> [!NOTE]
> DynamoDB automatically scales to handle millions of requests per second with low latency, which is harder to achieve with relational databases.

#### Flexibility in schemas

Unlike traditional relational databases that use multiple related tables with foreign keys and complex SQL queries, DynamoDB uses a single table structure without relationships between tables, offering a flexible schema that can easily adapt as your application grows.

DynamoDB supports flexible schemas and stores data as items (rows) with attributes (columns), similar to JSON documents, whereas relational databases require a fixed schema.


#### Indexing

It uses primary keys (partition and optional sort keys) and secondary indexes (local and global) to optimize queries, differing from SQL indexes.



## EC2

### Creating an instance

Here are the steps to creating an EC2 instance using the AWS console:

1. **Select AMI (amazon machine image)**: this is the OS that will be provisioned for your VM.
2. **Select instance type and specs**: allows you to choose the instance type and the compute capabilities.
3. **key pair**: generate a SSH key pair so you can securely connect to your EC2 instance.
4. **select network settings**: choose how to expose your EC2 instance to the world, either through SSH only or include HTTP traffic and which IP addresses to allow connecting to the instance.
5. **configure storage**: configure disk storage capacity

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

## Lambda 

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


