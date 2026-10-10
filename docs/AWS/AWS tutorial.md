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


#### User pool client in depth

A single user pool has **multitenancy** enabled, meaning that it can be leveraged by several app clients so users have different ways of authenticating into the user pool via an app client.

A user pool client (also called app client) in Amazon Cognito allows users to authenticate through one or more identity providers you configure, and you can have multiple user pool clients.

In summary:

1. User pool has many user pool clients
2. User pool client has many identity providers


> [!NOTE]
> For typical web apps, the user pool client doesn't need a secret, making it simpler to manage user authentication securely and efficiently.

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

#### Google login

**Cognito steps**

1. Create a user pool, which automatically creates a user pool client
2. Get the cognito domain for the user pool, which is important for specifying the google Redirects


![](https://i.imgur.com/F9GdW9e.jpeg)


**Google client steps**

The next steps require you to add your google auth credentials.

1. Add `https://<your user pool domain>` to your project as an authorized JavaScript origin.
    
2. Create OAuth 2.0 credentials for a web application.
    
3. Add `https://<your user pool domain>/oauth2/idpresponse` to your project as an authorized redirect URI.



![](https://i.imgur.com/FAW5Qmo.jpeg)

    
4. On the OAuth consent screen, add the cognito domain to the list of authorized domains


![](https://i.imgur.com/UIP4aVB.jpeg)


5. Add the OAuth client ID and client secret for your Google project to your user pool IDP configuration, by creating an identity provider. You will have to provide three pieces of info in order to create the identity provider:
	- **client ID**: the google client ID
	- **client secret**: the google client secret
	- **scopes**: the google scopes to request, verbatim you should enter this:

```
email profile openid
```


![](https://i.imgur.com/DFgdJNe.jpeg)



**Enabling google auth on the hosted UI**

This final step brings everything together by connecting the google identity provider and enabling it on the user pool client.

1. Go to the app client, edit the login page, and add the redirect URIs for you app, basically the URL(s) in your app that you want the users to get redirected to after they authenticate.

![](https://i.imgur.com/1eXCRdg.jpeg)

2. Go to the app client, edit it and add the google identity provider.


![](https://i.imgur.com/lQT2ax8.jpeg)

2. Now on the login page, you should see the hosted UI work correctly


![](https://i.imgur.com/JmqiURy.jpeg)

## API gateway


### API gateway with Cognito authorizers

On cognito, you can enable an option to return a JWT after a user authenticates and then you can use that token on subsequent requests to API Gateway to pass any authorization protection set on routes. 



#### How authorizers work

In an _Amazon Cognito_ authorizer for _API Gateway_, the **token source** is a configuration setting that tells _API Gateway_ which header to inspect for an authentication token.

- When a client makes an API request, it must include that header with a valid _JSON Web Token_ (JWT).
- _API Gateway_ then automatically intercepts this header, validates the token against your _Cognito User Pool_, and only if it is legitimate, forwards the request to your backend resource (like a _Lambda_ function)

Here is how the end-to-end flow works for a user interacting with a Single Page Application (SPA):

1. **Initiation:** The user clicks a 'Login' button on your website, which redirects them to the _Cognito_ hosted UI 
2. **Authentication:** The user provides their credentials. When constructing this link, you must set the `response_type` to `token` to ensure _Cognito_ returns the JWT directly in the URL 
3. **Callback:** Upon successful login, _Cognito_ redirects the user back to your specified callback URL (e.g., `example.com/callback`) with the tokens (ID token and Access token) appended to the fragment 
4. **Extraction:** Your SPA code extracts the **ID token** (or Access token) from the URL fragment and stores it in memory or local storage 
5. **API Call:** When the SPA needs to access a protected resource, it sends a request to the _API Gateway_ endpoint, including the stored token in the `Authorization` header 
6. **Verification:** _API Gateway_ verifies the token with _Cognito_. If valid, the request proceeds to your _Lambda_ function, which processes the request and returns the data 


#### Cognito prerequisites

Here are the prerequisites:

1. User pool with user pool client, configured with callback URLs and one or more identity providers (Cognito, Google, etc.), but most importantly, has both **authorization code grant** and **implicit grant** (has the JWT flow) set as grant types.


![](https://i.imgur.com/LsOcHrM.jpeg)

2. Make sure that when copying the hosted UI url, the `response_type` is set to `token` so users can extract the JWT from the callback URL query params

#### Creating the API gateway

1. Choose to create a REST API


![](https://i.imgur.com/MyTW7dE.jpeg)
2. Create a resource on the API gateway


![](https://i.imgur.com/r2xxz9i.jpeg)

3. Create a lambda function that will be the target for `GET /transactions`


![](https://i.imgur.com/pkxyoZ4.jpeg)


4. Create a GET method for the `transactions` resource, wire it to the lambda function you created.


![](https://i.imgur.com/K7ppX4Q.jpeg)


![](https://i.imgur.com/wU2ka2r.jpeg)

5. Deploy the API, which will now make the api publicly available on the internet in this syntax:

```
https://<api-domain>/<api-stage>/<resource>
```


![](https://i.imgur.com/UqwifiW.jpeg)
![](https://i.imgur.com/tpn3U9d.jpeg)

#### Create the authorizer

1. Create an authorizer on the API gateway, choose the authorizer type as **cognito**.


![](https://i.imgur.com/TiVT4VR.jpeg)


2. Set the token source as `Authorization`, so it uses the standard `Authorization` header to store the JWT on, and then you will send the `Authorization: bearer <token>` syntax as a header to every request to the API gateway to authenticate with Cognito.



![](https://i.imgur.com/v35uvE4.jpeg)

#### Connecting the authorizer to cognito

1. Sign in through the cognito hosted UI with the `response_type=token` query param


![](https://i.imgur.com/W4CBFyp.jpeg)


2. After logging in, extract the JWT from the `id_token` query param on the callback URL


![](https://i.imgur.com/hRcSKs6.jpeg)


3. When testing the authorizer, paste in that JWT and provide that token as the value for the `Authorization` header:

![](https://i.imgur.com/h5YYUoX.jpeg)


4. Attach the authorizer to resources on the API gateway to protect certain resources via cognito. You can do this by going to the `transactions` resource and then editing the `GET` method for it to add an authorizer:


![](https://i.imgur.com/0NPL0hM.jpeg)

5. Configure the settings for the authorizer:
	- **authorizer to use**: select a specific user pool authorizer from Cognito
	- **scopes**: select email as a scope
	- **request validator**: depends on what URL query string params, HTTP request headers, and request body structure you want to come in on the request.


![](https://i.imgur.com/0T3yWoZ.jpeg)

6. Redeploy the API


![](https://i.imgur.com/LufsWkW.jpeg)

7. Now you can request the API gateway resource protected by authorizers by specifying the JWT value under the `Authorization` header:


![](https://i.imgur.com/7OMadNI.jpeg)


### API gateway with Lambda authorizers




![](https://i.imgur.com/0d6bk6y.jpeg)


- **goal**: have lambdas accept authorization tokens in headers sent in requests to API gateway, and if token is valid, forward request to workload lambda handler.
- **resources to create**: 
	1. API gateway with at least one resource + method combo,
	2. **Lambda-type authorizer**: an authorizer for the API gateway with authorizer type "lambda", used to check authorization tokens by invoking a lambda function to delegate the token-checking logic to based on the incoming request.
	3. **authorizer lambda**: the lambda that runs the token-checking logic to authorize based on the incoming request, and is invoked by the lambda-type authorizer

Here is the flow:

1. **the request**: User calls resource + method combo in API gateway, providing an authorization token in the request headers
2. **invoke authorizer**: **Lambda-type authorizer** is configured to seek the authorization token value at a header property name specified by the **token source** on an authorizer, then invokes the registered **authorizer lambda** with the purpose of trying to authorize the token
3. **check authorization**: the authorizer Lambda rolls its own custom logic to validate the request and authorization token against your business logic, codebase, and data sources (like checking for the JWT in a sessions table that you own on some database, for example). 
4. **send back authorization response**: If the authorization token is valid and we should validate the request, then the function sends back an **IAM policy document** to attach to the user to authorize them and give them permissions


![](https://i.imgur.com/gVXdTJd.jpeg)

5. **forward authorized traffic**: If authorized, then the authorizer lambda sends back a "token is valid" response to the API gateway, and then API gateway forwards the original request traffic to the resource + method handler specified.


#### Create the API gateway

1. Create a new resource + method combo in an API gateway, have the route handler forward to a lambda function.


![](https://i.imgur.com/3jQlQqA.jpeg)

2. Deploy the API
3. Test that the resource + method + handler works


![](https://i.imgur.com/Y9QnPOL.jpeg)

#### Create the Lambda-type authorizer + Authorizer Lambda

1. Create an authorizer lambda that you will set as a target for the lambda-type authorizer in step 3.


![](https://i.imgur.com/sfSUlyV.jpeg)


2. The lambda code takes in an **API Gateway Authorizer Event** and must return a policy document string. Here are a couple of important about the code:
	- **authorization token property**: must be named `authorizationToken`,  nothing else will work.
	- **must return policy document string**



![](https://i.imgur.com/WFdTfiu.jpeg)



```ts
function validateToken(token) {
  return true
}

function createAllowPolicyDocument(event) {
  return {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: "*",
        Action: "execute-api:Invoke",
        Resource: event.methodArn
      }
    ]
  }
}

function createDenyPolicyDocument(event) {
  return {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Deny",
        Principal: "*",
        Action: "execute-api:Invoke",
        Resource: event.methodArn
      }
    ]
  }
}


export const handler = async (event) => {
  const token = event.Authorization

  if (token) {
    if (validateToken(token)) {
      return createAllowPolicyDocument(event)
    }
  }
  
  return createDenyPolicyDocument(event)
};
```

3. Create a lambda type authorizer:
	- **token source**: set this to what you set in the lambda, which is `authorizationToken`
	- **ttl**: set this very low so there is no caching of lambda code, which is annoying during development to receive a stale authorizer

![](https://i.imgur.com/FQCU6xo.jpeg)


4. Now when testing your authorizer, let's say you're getting IAM errors. This means you have to add permissions to the API gateway to allow it to execute lambdas


![](https://i.imgur.com/YFYu4uZ.jpeg)


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


## AWS EKS

### Intro EKS

Amazon EKS (Elastic Kubernetes Service) simplifies running Kubernetes on AWS by managing the control plane and allowing users to focus on deploying and managing applications. Here are key points regarding how EKS works, its availability, and management roles:

- **worker nodes**: worker nodes are represented as EC2 instances with a container runtime you can either self-manage or let AWS manage for you.
	- You can configure your EKS cluster to use multiple worker nodes in different AZs for fault tolerance and load balancing.
	- Nodes can be provisioned either as EC2 instances or through AWS Fargate, which offers a serverless compute option.
- **pods**: Pods are represented as a AMI container. The containers within pods are created from docker images hosted on ECR
- **control plane**: AWS-managed service that creates multiple EC2 instances intended to become control plane nodes, each with the control plane software installed for high availability.
	- The control plane is highly available by default, as AWS automatically sets it up across multiple Availability Zones (AZs).
	-  AWS manages the Kubernetes control plane, which includes the API server and etcd. This reduces the overhead for developers in managing the Kubernetes infrastructure.


Kubernetes handles the orchestration of containers and ensures that if a worker node fails, the pods are rescheduled to other available nodes, thus maintaining application availability.

![](https://i.imgur.com/mPP05Kr.jpeg)


**shared responsibility**


- **AWS Responsibilities**: AWS handles the maintenance, availability, and scaling of the control plane. This includes automatic updates, scaling of the control plane, and ensuring security best practices are followed.
- **Developer Responsibilities**: Developers manage worker nodes, deploy applications using Kubernetes manifests, monitor application performance, and configure networking using services like the VPC CNI plugin. They also define and manage deployments, which control the number of pod replicas and their lifecycle.

**networking**

- **pod**: Each pod, which is a group of related containers, receives its own private IP address within the cluster VPC via the VPC CNI plugin.
- **load balancer service**: a load balancer can be configured with a public DNS name and public IP address that can then route traffic to a pod.

#### Manual cluster creation basics

Here are the EKS specific core components:

- **Cluster IAM role**: IAM role to give the control plane EC2 instances permissions to manage AWS resources on your behalf
- **Node IAM role**: IAM role to give the worker node EC2 instances permissions to manage and access AWS resources on your behalf
- **VPC**: a VPC with correct subnets and networking and tagging suitable for creating the EKS cluster in.

And here's how to do manual creation manual mode EKS

1. Add a Cluster IAM role by **create recommended role**



![](https://i.imgur.com/6nqP8m3.jpeg)

2. Add a Node IAM role by **create recommended role**

![](https://i.imgur.com/UkkMgcK.jpeg)

3. Create a VPC with public and private subnets via this [Cloudformation template](https://s3.us-west-2.amazonaws.com/amazon-eks/cloudformation/2020-10-29/amazon-eks-vpc-sample.yaml).
	- **Stack name**: Choose a stack name for your AWS CloudFormation stack. For example, you can call it `amazon-eks-vpc-sample`. The name can contain only alphanumeric characters (case-sensitive) and hyphens. It must start with an alphanumeric character and can’t be longer than 100 characters. The name must be unique within the AWS Region and AWS account that you’re creating the cluster in.
    
	- **VpcBlock**: Choose a CIDR block for your VPC. Each node, Pod, and load balancer that you deploy is assigned an `IPv4` address from this block. The default `IPv4` values provide enough IP addresses for most implementations, but if it doesn’t, then you can change it. For more information, see [VPC and subnet sizing](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Subnets.html#VPC_Sizing) in the Amazon VPC User Guide. You can also add additional CIDR blocks to the VPC once it’s created.
	    
	- **Subnet01Block**: Specify a CIDR block for subnet 1. The default value provides enough IP addresses for most implementations, but if it doesn’t, then you can change it.
	    
	- **Subnet02Block**: Specify a CIDR block for subnet 2. The default value provides enough IP addresses for most implementations, but if it doesn’t, then you can change it.
	    
	- **Subnet03Block**: Specify a CIDR block for subnet 3. The default value provides enough IP addresses for most implementations, but if it doesn’t, then you can change it.


![](https://i.imgur.com/Z9cyUFz.jpeg)



![](https://i.imgur.com/iAXJmhF.jpeg)


4. Specify the VPC to use for the cluster as the one you just created. Make sure to include at least one public subnet and one private subnet.


![](https://i.imgur.com/6R3woKC.jpeg)

5. Configure cluster endpoint access to be **public and private** so that you can have public-facing ingress and load balancer resources as well as private cluster resources.


![](https://i.imgur.com/MXZQLCj.jpeg)

6. Create a **node group**, which defines configuration for a node pool of  EC2 instance worker nodes. You should supply this info:
	- **node IAM role**: the IAM role to give EC2 instance worker nodes so they can access certain AWS services (whatever their pods need to access)
	- **AMI**: the AMI or launch template used to specify the configuration of the instance type and compute requirements.
	- **node group scaling configuration**: the auto-scaling bounds of the worker nodes



![](https://i.imgur.com/M5v6tRV.jpeg)

![](https://i.imgur.com/Mcv0dYr.jpeg)



#### Cluster connection

After the cluster gets created, you can connect to it in two different ways:


- **local machine**: connect from your local machine by adding that remote EKS context to your local kube config:
	- By default, this creates or updates the kubeconfig file at `~/.kube/config`. 
	- You can specify a different path with the `--kubeconfig` option

```bash
aws eks update-kubeconfig --region region-code --name my-cluster
```

- **EKS console**: If you prefer not to set up locally, you can connect directly from the AWS Management Console using AWS CloudShell

**Connecting via EKS console**

1. Open the Amazon EKS console and choose your cluster.
2. On the cluster details page, choose **Connect** from the top-right action bar.
3. AWS CloudShell opens with kubectl pre-configured for your cluster.

> [!NOTE]
> CloudShell sessions include kubectl, the AWS CLI, and standard CloudShell utilities.

#### Simple app deployment

Load balancer services work out of the box for internet-facing ingress handling when trying to deploy them to EKS, as long as you've configured the VPC settings correctly as per [[#Manual cluster creation basics]].

> [!NOTE]
> For more advanced networking with ingress and ingress classes, you have much more setup to do, where you can follow along in [[#Manual Networking]] or look at [[#auto mode]].

Once you have created a cluster manually via the console and set up the correct netowrking, you can deploy a simple app that uses one public load balancer service.

Connect to the cluster and then deploy these resources:

1. Basic deployment with `ClusterIP` service directing traffic to that deployment.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: auth-service
spec:
  selector:
    app: auth
  type: ClusterIP
  ports:
    - protocol: TCP
      port: 3000
      targetPort: 3000
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: auth
  template:
    metadata:
      labels:
        app: auth
    spec:
      containers:
        - name: auth-api
          image: academind/kub-dep-auth:latest
          env:
            - name: TOKEN_KEY
              value: 'shouldbeverysecure'
```

2. Create a load balancer service that is exposed on HTTP port 80, routes traffic to a deployment via labels and selectors.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: users-service
spec:
  selector:
    app: users
  type: LoadBalancer
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: users-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: users
  template:
    metadata:
      labels:
        app: users
    spec:
      containers:
        - name: users-api
          image: academind/kub-dep-users:latest
          env:
            - name: MONGODB_CONNECTION_URI
              value: 'someconnectionuri'
            - name: AUTH_API_ADDRESSS
              value: 'auth-service.default:3000'
          volumeMounts:
            - name: efs-vol
              mountPath: /app/users
      volumes:
        - name: efs-vol
          persistentVolumeClaim: 
            claimName: efs-pvc
```

### eksctl

The `eksctl` CLI tool allows you to control your EKS cluster via the command line.

#### Installation

**windows install**

```bash
choco install eksctl
scoop install eksctl
```

**linux install**

```bash
# for ARM systems, set ARCH to: `arm64`, `armv6` or `armv7`
ARCH=$(uname -m | sed 's/x86_64/amd64/' | sed 's/aarch64/arm64/')
PLATFORM=$(uname -s)_$ARCH

curl -sLO "https://github.com/eksctl-io/eksctl/releases/latest/download/eksctl_$PLATFORM.tar.gz"

# (Optional) Verify checksum
curl -sL "https://github.com/eksctl-io/eksctl/releases/latest/download/eksctl_checksums.txt" | grep $PLATFORM | sha256sum --check

tar -xzf eksctl_$PLATFORM.tar.gz -C /tmp && rm eksctl_$PLATFORM.tar.gz

sudo install -m 0755 /tmp/eksctl /usr/local/bin && rm /tmp/eksctl
```

**mac install**

```bash
brew tap weaveworks/tap
brew install weaveworks/tap/eksctl
```

#### Cluster creation

You can create a cluster via IaC by applying the `eksctl` CLI on YAML file configurations of the EKS cluster you want to create. 

> [!NOTE]
> Under the hood, this creates a cloud formation template and uploads it to AWS to create the EKS cluster.

1. Create a YAML file that creates an EKS cluster configuration and creates one node in that cluster:

```yaml title="cluster.yaml"
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: lil-eks  # cluster name
  region: us-east-1
  tags:
    project: linkedin-learning

nodeGroups:
  - name: worker-node  # node name
    instanceType: m5.large
    desiredCapacity: 1 # number of duplicate instances
```

2. Apply the YAML file to create the cluster:

```bash
eksctl create cluster -f cluster.yaml
```


#### auto mode cluster creation

Here is an example of the cluster configuration that allows you to create an auto mode cluster with the name `web-quickstart`:

1. Create a cluster yaml manifest with `autoModeConfig.enable` set to `true` in order to enable EKS auto mode on the cluster.

```yaml
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: web-quickstart
  region: us-east-1

autoModeConfig:
  enabled: true
```

2. Create the EKS cluster using the `cluster-config.yaml`:

```bash
eksctl create cluster -f cluster-config.yaml
```

#### Fargate mode cluster creation

If you want to create an EKS fargate cluster, you can do so with `eksctl`:

```bash
eksctl create cluster --name AadilFargate --fargate
```

#### Cluster management

- **list clusters**:

```bash
eksctl get cluster

```

- **list nodegroups in a cluster**

```bash
eksctl get nodegroup --cluster=<cluster-name>
```

- **get specific cluster info**

```bash
eksctl get cluster --name <cluster-name>
```

- **delete cluster**

```bash
eksctl delete cluster -f cluster.yaml
```

### Networking Annotations

From this ingress manifest:

```yaml
kind: Ingress
metadata:
  name: app
```

EKS knows:

> "Create an ALB"

But doesn't know:

- Internal or public?
- HTTP or HTTPS?
- Which certificate?
- IP targets or instance targets?

Annotations answer these questions.

> [!NOTE]
> **Annotations** are special Kubernetes metadata that give instructions to the ALB controller (or EKS Auto Mode ALB integration). Think of them as AWS-specific configuration attached to an Ingress.

#### ALB annotations

ALB annotations let you configure specific behavior for the ALB provisioned by EKS for a load balancer service or public ingress.

Here's a real production example:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: frontend
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTPS":443}]'
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:...
    alb.ingress.kubernetes.io/healthcheck-path: /health
spec:
  ingressClassName: alb
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

##### **`scheme`**

`scheme` defines if the load balancer should be public or private. 

- If set to `internet-facing`, then AWS assigns the ALB a public DNS name and IP address.

```yaml
annotations:
  alb.ingress.kubernetes.io/scheme: internet-facing
```

- If set to `internal`, then it acts like an internal load balancer with a private IP and no public internet access

```yaml
annotations:
  alb.ingress.kubernetes.io/scheme: internal
```

##### **`target-type`**

`target-type` defines whether to target IP addresses or EC2 instances.

- `instance`: The ALB registers the EC2 instance worker nodes as targets, and can only route traffic to pods through a `NodePort` service, since `NodePort` services allow you to route traffic to pods by running a pod as an exposed process on a node, targeting a specific origin on the node.
	- Longer path, more complexity, more latency if nodes redirect to other nodes.

```yaml
alb.ingress.kubernetes.io/target-type: instance
```

```
Target, 31000 = NodePort
------
10.0.1.10:31000
10.0.2.15:31000
```

```
User
 |
ALB
 |
EC2 Node
 |
NodePort
 |
Pod
```

- `ip`: the ALB registers IP addresses as targets. It can route traffic to pods directly via a service, since pods have their own IP addresses.

```yaml
alb.ingress.kubernetes.io/target-type: ip
```

```
ALB
 |
 +--> 192.168.1.10
 |
 +--> 192.168.3.22
 |
 +--> 192.168.4.15
```

```
Internet
   |
   v
 ALB
   |
   v
 Pod
```


> [!NOTE]
> IP address targeting is the recommended mode for EKS and is what AWS demonstrates in their Auto Mode examples.

IP address targeting is the easiest networking option since every pod gets its own VPC IP through the AWS VPC CNI.

```
Pod A -> 10.0.1.45
Pod B -> 10.0.2.81
Pod C -> 10.0.3.96
```

Because pods have real VPC addresses, the ALB can directly route traffic to them without requiring a node port.

```
ALB
 |
 +--> Pod IP
```

> [!NOTE]
> Modern EKS deployments and EKS Auto Mode typically prefer `ip` because it provides a more direct path and better integration with the AWS VPC networking model

##### `listen-ports`

The `listen-ports` ALB annotation defines the listening ports on the ALB, like for HTTP and HTTPS:

```
alb.ingress.kubernetes.io/listen-ports: '[{"HTTP":80},{"HTTPS":443}]'
```

This actually provisions the listener infra on the ALB:

```
ALB
 |
 +--> 80
 |
 +--> 443
```

You can also add an SSL redirect upgrade:

```yaml
alb.ingress.kubernetes.io/ssl-redirect: '443'
```

Which achieves this:

```
http://app.com
       |
       v
301 Redirect
       |
       v
https://app.com
```
##### `certificate-arn`

If we want our load balancer to be reachable via HTTPS, we must add a certifiacte for SSL termination, since pod traffic only works through HTTP, not HTTPS.

```yaml
annotations:
  alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-east-1:123456789:certificate/abc
```

This lets the ALB terminate TLS:

```
User HTTPS  

|  

v  

ALB decrypts  

|  

v  

Pods
```

##### `healthcheck-path`

```yaml
alb.ingress.kubernetes.io/healthcheck-path: /health
```

The ALB will send a `GET /health` to the pods it targets via services as a health check to see whether to keep or remove the targets.

### Manual Networking


#### AWS load balancer controller

The challenge is:

> Kubernetes knows about Pods and Services, but AWS knows about ALBs.

Something needs to connect the two worlds. That "something" is traditionally the **AWS Load Balancer Controller**.

The AWS Load Balancer Controller is a component that manages AWS Elastic Load Balancers for your Kubernetes cluster on AWS (EKS).

It helps your Kubernetes services handle incoming internet traffic by automatically creating and configuring load balancers in your AWS environment. 

1. It watches the Kubernetes API server for ingress resources—these define how external traffic should reach your applications. 
2. When it detects an ingress, it automatically creates or updates the corresponding AWS load balancer to route traffic properly. It relies on Cert Manager to handle TLS certificates, enabling secure HTTPS traffic.

> [!NOTE]
> This controller ensures that your applications are accessible and that traffic is properly balanced across your Kubernetes pods, which is crucial for reliability and scalability in cloud deployments.

> [!IMPORTANT]
> A controller watches for Ingresses and turns them into real infrastructure.

The controller also requires specific IAM policies to have permission to create and manage AWS resources, and it uses tags on your VPC subnets to know where to place load balancers.

Therefore, setting up the AWS load balancer controller requires two core components:

1. **IAM policy**: An IAM policy for the AWS Load Balancer Controller is essential because it grants the controller the necessary permissions to create, manage, and delete AWS Elastic Load Balancers on your behalf.
2. **tagging**: for correct networking, it needs to identify the right subnets in your cluster's Virtual Private Cloud (VPC) using specific tags.

> [!NOTE]
> Manually setting this up can be challenging, so `eksctl` with an EKS auto mode clsuter automates all of this setup for you. See [[#Networking in auto mode]] for more info.

##### Setup

**setting up tagging**

Tagging your VPC subnets is essential because the AWS Load Balancer Controller uses these tags to identify which subnets it should use to create Elastic Load Balancers.

- Without the correct tags, the controller can't find the right subnets in your cluster's VPC, which means it won't be able to set up load balancing for your applications properly. 
- Essentially, tagging tells the controller where to direct traffic, enabling your Kubernetes services to be accessible and balanced across the network.

> [!TIP]
> It's easy to mess up these tags when doing it manually. You should instead automate this on the cluster creation manifest with `eksctl` or by using the AWS CLI.

**setting up the IAM policy**

This policy defines which AWS services and actions the controller can perform, ensuring it operates securely and with the right level of access. 

Without this policy, the controller wouldn't be able to set up load balancing for your Kubernetes applications, which is key to making your services accessible and scalable in the AWS environment.

Here are the steps:

1. Create the policy

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "iam:CreateServiceLinkedRole"
            ],
            "Resource": "*",
            "Condition": {
                "StringEquals": {
                    "iam:AWSServiceName": "elasticloadbalancing.amazonaws.com"
                }
            }
        },
        {
            "Effect": "Allow",
            "Action": [
                "ec2:DescribeAccountAttributes",
                "ec2:DescribeAddresses",
                "ec2:DescribeAvailabilityZones",
                "ec2:DescribeInternetGateways",
                "ec2:DescribeVpcs",
                "ec2:DescribeVpcPeeringConnections",
                "ec2:DescribeSubnets",
                "ec2:DescribeSecurityGroups",
                "ec2:DescribeInstances",
                "ec2:DescribeNetworkInterfaces",
                "ec2:DescribeTags",
                "ec2:GetCoipPoolUsage",
                "ec2:DescribeCoipPools",
                "elasticloadbalancing:DescribeLoadBalancers",
                "elasticloadbalancing:DescribeLoadBalancerAttributes",
                "elasticloadbalancing:DescribeListeners",
                "elasticloadbalancing:DescribeListenerCertificates",
                "elasticloadbalancing:DescribeSSLPolicies",
                "elasticloadbalancing:DescribeRules",
                "elasticloadbalancing:DescribeTargetGroups",
                "elasticloadbalancing:DescribeTargetGroupAttributes",
                "elasticloadbalancing:DescribeTargetHealth",
                "elasticloadbalancing:DescribeTags"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "cognito-idp:DescribeUserPoolClient",
                "acm:ListCertificates",
                "acm:DescribeCertificate",
                "iam:ListServerCertificates",
                "iam:GetServerCertificate",
                "waf-regional:GetWebACL",
                "waf-regional:GetWebACLForResource",
                "waf-regional:AssociateWebACL",
                "waf-regional:DisassociateWebACL",
                "wafv2:GetWebACL",
                "wafv2:GetWebACLForResource",
                "wafv2:AssociateWebACL",
                "wafv2:DisassociateWebACL",
                "shield:GetSubscriptionState",
                "shield:DescribeProtection",
                "shield:CreateProtection",
                "shield:DeleteProtection"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "ec2:AuthorizeSecurityGroupIngress",
                "ec2:RevokeSecurityGroupIngress"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "ec2:CreateSecurityGroup"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "ec2:CreateTags"
            ],
            "Resource": "arn:aws:ec2:*:*:security-group/*",
            "Condition": {
                "StringEquals": {
                    "ec2:CreateAction": "CreateSecurityGroup"
                },
                "Null": {
                    "aws:RequestTag/elbv2.k8s.aws/cluster": "false"
                }
            }
        },
        {
            "Effect": "Allow",
            "Action": [
                "ec2:CreateTags",
                "ec2:DeleteTags"
            ],
            "Resource": "arn:aws:ec2:*:*:security-group/*",
            "Condition": {
                "Null": {
                    "aws:RequestTag/elbv2.k8s.aws/cluster": "true",
                    "aws:ResourceTag/elbv2.k8s.aws/cluster": "false"
                }
            }
        },
        {
            "Effect": "Allow",
            "Action": [
                "ec2:AuthorizeSecurityGroupIngress",
                "ec2:RevokeSecurityGroupIngress",
                "ec2:DeleteSecurityGroup"
            ],
            "Resource": "*",
            "Condition": {
                "Null": {
                    "aws:ResourceTag/elbv2.k8s.aws/cluster": "false"
                }
            }
        },
        {
            "Effect": "Allow",
            "Action": [
                "elasticloadbalancing:CreateLoadBalancer",
                "elasticloadbalancing:CreateTargetGroup"
            ],
            "Resource": "*",
            "Condition": {
                "Null": {
                    "aws:RequestTag/elbv2.k8s.aws/cluster": "false"
                }
            }
        },
        {
            "Effect": "Allow",
            "Action": [
                "elasticloadbalancing:CreateListener",
                "elasticloadbalancing:DeleteListener",
                "elasticloadbalancing:CreateRule",
                "elasticloadbalancing:DeleteRule"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "elasticloadbalancing:AddTags",
                "elasticloadbalancing:RemoveTags"
            ],
            "Resource": [
                "arn:aws:elasticloadbalancing:*:*:targetgroup/*/*",
                "arn:aws:elasticloadbalancing:*:*:loadbalancer/net/*/*",
                "arn:aws:elasticloadbalancing:*:*:loadbalancer/app/*/*"
            ],
            "Condition": {
                "Null": {
                    "aws:RequestTag/elbv2.k8s.aws/cluster": "true",
                    "aws:ResourceTag/elbv2.k8s.aws/cluster": "false"
                }
            }
        },
        {
            "Effect": "Allow",
            "Action": [
                "elasticloadbalancing:AddTags",
                "elasticloadbalancing:RemoveTags"
            ],
            "Resource": [
                "arn:aws:elasticloadbalancing:*:*:listener/net/*/*/*",
                "arn:aws:elasticloadbalancing:*:*:listener/app/*/*/*",
                "arn:aws:elasticloadbalancing:*:*:listener-rule/net/*/*/*",
                "arn:aws:elasticloadbalancing:*:*:listener-rule/app/*/*/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "elasticloadbalancing:ModifyLoadBalancerAttributes",
                "elasticloadbalancing:SetIpAddressType",
                "elasticloadbalancing:SetSecurityGroups",
                "elasticloadbalancing:SetSubnets",
                "elasticloadbalancing:DeleteLoadBalancer",
                "elasticloadbalancing:ModifyTargetGroup",
                "elasticloadbalancing:ModifyTargetGroupAttributes",
                "elasticloadbalancing:DeleteTargetGroup"
            ],
            "Resource": "*",
            "Condition": {
                "Null": {
                    "aws:ResourceTag/elbv2.k8s.aws/cluster": "false"
                }
            }
        },
        {
            "Effect": "Allow",
            "Action": [
                "elasticloadbalancing:RegisterTargets",
                "elasticloadbalancing:DeregisterTargets"
            ],
            "Resource": "arn:aws:elasticloadbalancing:*:*:targetgroup/*/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "elasticloadbalancing:SetWebAcl",
                "elasticloadbalancing:ModifyListener",
                "elasticloadbalancing:AddListenerCertificates",
                "elasticloadbalancing:RemoveListenerCertificates",
                "elasticloadbalancing:ModifyRule"
            ],
            "Resource": "*"
        }
    ]
}
```

2. Create the policy in your AWS account via the CLI, store the ARN

```bash
aws iam create-policy \
    --policy-name AWSLoadBalancerControllerIAMPolicy \
    --policy-document file://iam_policy.json
```

3. Have `eksctl` attach that IAM policy as a kubernetes service account to the EKS cluster

```bash
eksctl utils associate-iam-oidc-provider --cluster lil-eks --approve

eksctl create iamserviceaccount \
    --cluster=lil-eks \
    --name=aws-load-balancer-controller \
    --namespace=kube-system \
    --attach-policy-arn=arn:aws:iam::xxxxxxxxxxxx:policy/AWSLoadBalancerControllerIAMPolicy \
    --approve
```

4. Add certificate management, which you need to handle HTTPS traffic

```bash
kubectl apply \
    --validate=false \
    -f https://github.com/jetstack/cert-manager/releases/download/v1.5.4/cert-manager.yaml
```

5. Verify that the `aws-load-balancer-controller` service account was added and that the certificate manager pods were added

```bash
kubectl get sa -n kube-system
kubectl get pods -n cert-manager
```

##### Installation

The AWS load balancer controller is a k8s plugin you can install that watches for any ingress traffic coming in towards the API server

#### AWS load balancer ingress

IngressClass and IngressClassParams are Kubernetes resources that define how incoming traffic (ingress) should be handled in your cluster. 

In this setup, they are essential because they tell the AWS Load Balancer Controller how to manage and route external traffic to your applications. 

- Specifically, IngressClass links your ingress resources to the AWS Load Balancer Controller
- while IngressClassParams provide configuration details the controller needs to create and manage the correct AWS Elastic Load Balancer

> [!NOTE]
> Without these, the controller wouldn't know how to connect your Kubernetes ingress to the AWS load balancer, so they are key to making your application accessible from the internet.

Here's an example:

```yaml
---
apiVersion: elbv2.k8s.aws/v1beta1
kind: IngressClassParams
metadata:
  labels:
    app.kubernetes.io/name: aws-load-balancer-controller
  name: alb
---
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  labels:
    app.kubernetes.io/name: aws-load-balancer-controller
  name: alb
spec:
  controller: ingress.k8s.aws/alb
  parameters:
    apiGroup: elbv2.k8s.aws
    kind: IngressClassParams
    name: alb
```

#### Full networking flow

Here are the main components facilitating networking in an EKS cluster:

- **ingress**: set of routing rules acting like a reverse proxy for ingress traffic to the cluster
- **AWS load balancer controller**: watches for Ingresses and turns them into real infrastructure.
- **AWS load balancer service**: alternative to ingresses, if you only need one public load balancer for your cluster.

```
Ingress YAML
      |
      v
Controller notices it
      |
      v
Creates AWS ALB
      |
      v
Configures listeners
      |
      v
Registers targets
```

### Storage

#### EBS

1. Create and apply an EBS storage class in your cluster

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: auto-ebs-sc
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"
provisioner: ebs.csi.eks.amazonaws.com
volumeBindingMode: WaitForFirstConsumer
parameters:
  type: gp3
  encrypted: "true"
```

2. Create and apply a PVC targeting the EBS storage class you created.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: game-data-pvc
  namespace: game-2048
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: auto-ebs-sc
```
#### EFS CSI

The first order of operations is to create an EFS storage and then configure it for k8s networking:

1. Create a security group with an NFS inbound rule with the CIDR range being the cluster's VPC CIDR range.


![](https://i.imgur.com/y6D7VI2.jpeg)

2. Go to EFS, create a filesystem, put it in the cluster's VPC, then click on **customize**.


![](https://i.imgur.com/d9FHFjs.jpeg)


3. Select all private subnets and mount the EFS drive on there; attach the security group you created for mount targets



![](https://i.imgur.com/cK5g2Ug.jpeg)


Now we can attach that EFS to a pod:


1. Create and apply an EFS storage class in your cluster

```yaml
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: efs-sc
provisioner: efs.csi.aws.com
```

2. Create and apply a PV and PVC targeting the EFS storage class you created.

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: efs-pv
spec:
  capacity: 
    storage: 5Gi
  volumeMode: Filesystem
  accessModes:
    - ReadWriteMany
  storageClassName: efs-sc
  csi:
    driver: efs.csi.aws.com
    volumeHandle: fs-59d14521
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: efs-pvc
spec:
  accessModes:
    - ReadWriteMany
  storageClassName: efs-sc
  resources:
    requests:
      storage: 5Gi
---
```

3. Attach the PVC to a pod as a volume, mount that volume to a container:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: users-service
spec:
  selector:
    app: users
  type: LoadBalancer
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: users-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: users
  template:
    metadata:
      labels:
        app: users
    spec:
      containers:
        - name: users-api
          image: academind/kub-dep-users:latest
          env:
            - name: MONGODB_CONNECTION_URI
              value: 'mongodb+srv://maximilian:wk4nFupsbntPbB3l@cluster0.ntrwp.mongodb.net/users?retryWrites=true&w=majority'
            - name: AUTH_API_ADDRESSS
              value: 'auth-service.default:3000'
          volumeMounts:
            - name: efs-vol
              mountPath: /app/users
      volumes:
        - name: efs-vol
          persistentVolumeClaim: 
            claimName: efs-pvc
```

### auto mode

[Amazon EKS Auto Mode](https://docs.aws.amazon.com/eks/latest/userguide/automode.html) simplifies cluster management by automating routine tasks like block storage, networking, load balancing, and compute autoscaling. During setup, it handles creating nodes with EC2 managed instances, application load balancers, and EBS volumes.

EKS auto mode lets you extend AWS management beyond just the control plane and extend it to the **data plane** (worker nodes) as well.

In auto mode, here is what EKS additionally manages:

- **auto-scaling**: EKS manages horizontal and vertical scaling of the worker node instances based on workload and traffic demand
	- **adding nodes**: If a pod gets created and there are no nodes, EKS auto mode will create and provision a node for that deployment.
	- **terminating nodes**: EKS auto mode polls every 30 seconds to see if pods are running, and if a node has no pods running, then that node gets terminated.
- **OS management**: EKS auto mode handles patching and updates for the OS of the underlying EC2 instances.
- **networking**: EKS auto mode creates the AWS load balancer controller connection to ingress and automatically provisions load balancers for you and the correct ingress routing rules without you having to manually do anything.

> [!NOTE]
> When Kubernetes attempts to schedule those pods but finds no existing nodes with enough resources to accommodate them, that’s when Auto Mode steps in to provision a new node.

#### node pools

The biggest advantage of auto mode is the ability to just start applying kubernetes manifests, where worker nodes will be automatically provisioned by just applying the k8s resource. This is made possible through **node pools**, which contain nodes.

```bash
kubectl get nodepools
```


![](https://i.imgur.com/LfOWblu.jpeg)

Node pools refer to collections of worker nodes that are automatically managed by AWS to support your Kubernetes workloads.

Here's how they work:

1. **Automatic Node Provisioning**: When you create an EKS cluster in Auto Mode, a default node pool (called "general purpose") is automatically created. This pool includes the necessary resources to handle workloads.
    
2. **Resource Management**: EKS Auto Mode automatically provisions and scales the nodes based on the demand of your application. For example, when you deploy a workload, EKS will allocate the required compute resources by creating new nodes if necessary.
    
3. **Node Lifecycle Management**: If a workload scales down or is deleted, EKS monitors the usage and will terminate any nodes that are no longer needed. This helps optimize costs and manage resources effectively.

There are two types of node pools:

- **general purpose**: the default node pool where new worker nodes are allocated to.
- **system**: the node pool which contains only control plane instances.


> [!NOTE]
> What if you want to use more node pools besides the default one?
> ***
> While Auto Mode offers a default node pool, you also have the flexibility to create additional node pools with specific configurations, such as different instance types or resource optimizations.


#### Networking in auto mode

EKS auto mode creates networking resources automatically to facilitate ingress to the cluster, like creating an AWS load balancer controller with the appropriate service accounts and upgrades.

Here's the key differences between auto mode and the manual mode:

- **auto mode (new way)**: AWS manages the controller-like functionality by managing these 4 responsibilities for you.
	- Create IAM roles
	- Create service accounts
	- Manage upgrades
	- Maintain compatibility
- **manual mode (old way)**: you have to manually set up all the infrastructure and IAM policies yourself.

```
EKS Cluster
|
+-- AWS Load Balancer Controller
       |
       +-- Watches Ingresses
       |
       +-- Creates ALBs
       |
       +-- Registers Pod IPs
```

| Component     | Responsibility       |
| ------------- | -------------------- |
| Pod           | Runs app             |
| Service       | Finds pods           |
| Ingress       | Routing rules        |
| ALB           | Internet entry point |
| EKS Auto Mode | Creates/manages ALB  |

Here's how networking works with EKS auto mode at a high level


1. An Ingress defines HTTP routing rules in Kubernetes. 
2. In EKS Auto Mode, an IngressClass with `eks.amazonaws.com/alb` tells EKS to automatically provision and manage an AWS Application Load Balancer. 
3. When an Ingress is created, EKS creates the ALB, configures listeners and routing rules, and registers pod IPs as targets. 
4. Traffic flows from the ALB to Kubernetes Services and then to Pods

**subnet tagging**

In order for EKS to do networking correctly across subnets within a VPC, you must manually tag those subnets. EKS auto mode changes that:

- **manual mode (old way)**: you must manually tag subnets created from an EKS cluster
- **EKS auto mode (new way)**: you can use `eksctl` to create an EKS auto mode cluster, which then skips this manual tagging and does it for you programmatically.

**ingress**

Create a Kubernetes `IngressClass` for EKS Auto Mode. 

- The IngressClass defines how EKS Auto Mode handles Ingress resources. 
- This step configures the load balancing capability of EKS Auto Mode. 

When you create Ingress resources for your applications, EKS Auto Mode uses this IngressClass to automatically provision and manage load balancers, integrating your Kubernetes applications with AWS load balancing services.

Here's an example ingress class which specifies the ALB controller as the controller to process ingress traffic.

- `spec.controller`: which controller to use to process ingress traffic. You can have multiple controllers, like an NGINX ingress controller, or an ALB controller.
	- `controller: eks.amazonaws.com/alb` means "Let EKS Auto Mode manage this ALB for me."
- `annotations`: Annotations are special Kubernetes metadata that give instructions to the ALB controller (or EKS Auto Mode ALB integration).
	- Think of them as AWS-specific configuration attached to an Ingress.

```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: alb
  annotations:
    ingressclass.kubernetes.io/is-default-class: "true"
spec:
  controller: eks.amazonaws.com/alb
```

After creating an ingress class, you must create an ingress to have actual routing rules.

```yaml
# 5. create an ingress resource for rules
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  namespace: game-2048
  name: ingress-2048
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    # reroute traffic to IP addresses
    alb.ingress.kubernetes.io/target-type: ip
spec:
  # use controller from ingress class with name 'alb'
  ingressClassName: alb
  rules:
    - http:
        paths:
        - path: /
          pathType: Prefix
          backend:
            # on HTTP /* match, reroute to service
            service:
              name: service-2048
              port:
                number: 80
```


Once you apply the ingress class and then ingress in your cluster, here are the steps that happen:

1. The ingress appears in K8S
2. EKS auto mode detects it
3. Via the ALB controller, EKS auto mode creates an ALB set with defaults like receiving HTTP traffic on port 80 and HTTPS traffic on port 443 and handling all reverse proxy routing rules specified by any `Ingress` resources.


#### creating a cluster with auto mode

You can use eksctl to create an EKS cluster with auto mode, which will soon become the default.

- **VPC Configuration**: When using the eksctl cluster template that follows, eksctl automatically creates an IPv4 Virtual Private Cloud (VPC) for the cluster. By default, eksctl configures a VPC that addresses all networking requirements, in addition to creating both public and private endpoints.
    
- **Instance Management**: EKS Auto Mode dynamically adds or removes nodes in your EKS cluster based on the demands of your Kubernetes applications.
    
- **Data Persistence**: Use the block storage capability of EKS Auto Mode to ensure the persistence of application data, even in scenarios involving pod restarts or failures.
    
- **External App Access**: Use the load balancing capability of EKS Auto Mode to dynamically provision an Application Load Balancer (ALB).

> [!WARNING]
> If you do not use eksctl to create the cluster, you need to manually tag the VPC subnets. See [[#AWS load balancer controller]]


Now let's go into the resources:

```yaml
---
# 1. create a namespace for easy deletion
apiVersion: v1
kind: Namespace
metadata:
  name: game-2048
---
# 2. create a deployment with a pod 
apiVersion: apps/v1
kind: Deployment
metadata:
  namespace: game-2048
  name: deployment-2048
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: app-2048
  replicas: 5
  template:
    metadata:
      labels:
        app.kubernetes.io/name: app-2048
    spec:
      containers:
	  # creates a container from an ECR image.
      - image: public.ecr.aws/l6m2t8p7/docker-2048:latest
        imagePullPolicy: Always
        name: app-2048
        ports:
        - containerPort: 80
---
# 3. create a service you can route to via DNS name
apiVersion: v1
kind: Service
metadata:
  namespace: game-2048
  name: service-2048
spec:
  ports:
    - port: 80
      targetPort: 80
      protocol: TCP
  type: NodePort
  selector:
	# service targets pods with label "app-2048" on port 80
    app.kubernetes.io/name: app-2048
---
# 4. Create ingress class to register AWS ALB controller
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: alb
  annotations:
    ingressclass.kubernetes.io/is-default-class: "true"
spec:
  # now ALB will be provisioned to handle ingress
  controller: eks.amazonaws.com/alb
---
# 5. create an ingress resource for rules
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  namespace: game-2048
  name: ingress-2048
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    # reroute traffic to IP addresses
    alb.ingress.kubernetes.io/target-type: ip
spec:
  # use controller from ingress class with name 'alb'
  ingressClassName: alb
  rules:
    - http:
        paths:
        - path: /
          pathType: Prefix
          backend:
            # on HTTP /* match, reroute to service
            service:
              name: service-2048
              port:
                number: 80
```

1. Create a deployment and then an internal service that routes to the pods of the deployment:

```yaml
---
# 1. create a namespace for easy deletion
apiVersion: v1
kind: Namespace
metadata:
  name: game-2048
---
# 2. create a deployment with a pod
apiVersion: apps/v1
kind: Deployment
metadata:
  namespace: game-2048
  name: deployment-2048
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: app-2048
  replicas: 5
  template:
    metadata:
      labels:
        app.kubernetes.io/name: app-2048
    spec:
      containers:
	  # creates a container from an ECR image.
      - image: public.ecr.aws/l6m2t8p7/docker-2048:latest
        imagePullPolicy: Always
        name: app-2048
        ports:
        - containerPort: 80
---
# 3. create a service you can route to via DNS name
apiVersion: v1
kind: Service
metadata:
  namespace: game-2048
  name: service-2048
spec:
  ports:
    - port: 80
      targetPort: 80
      protocol: TCP
  type: NodePort
  selector:
	# service targets pods with label "app-2048" on port 80
    app.kubernetes.io/name: app-2048
```

2. Create an ingress class that will provision an internet-facing ALB to handle ingress traffic

```yaml
# 4. Create ingress class to register AWS ALB controller
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: alb
  annotations:
    ingressclass.kubernetes.io/is-default-class: "true"
spec:
  # now ALB will be provisioned to handle ingress
  controller: eks.amazonaws.com/alb
```

3. Create an ingress that supplies for the rules for how the ingress controller should route ingress traffic and how the ALB should be created:

```yaml
# 5. create an ingress resource for rules
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  namespace: game-2048
  name: ingress-2048
  annotations:
    # create public load balancer
    alb.ingress.kubernetes.io/scheme: internet-facing
    # reroute traffic to IP addresses, target pods directly
    alb.ingress.kubernetes.io/target-type: ip
spec:
  # use controller from ingress class with name 'alb'
  ingressClassName: alb
  rules:
    - http:
        paths:
        - path: /
          pathType: Prefix
          backend:
            # on HTTP /* match, reroute to service
            service:
              name: service-2048
              port:
                number: 80
```

Once you apply all these resources, you should perform these troubleshooting steps:

1. Wait for the load balancer to be provisioned, view the ingress:

```bash
kubectl get ingress --all-namespaces
```

2. Check the target group of the ALB once provisioned
3. Add a health check annotation to understand when the pod stops working and does not become a viable target for
#### Storage in auto mode

Here's the high level overview of creating persistent storage for your cluster pods:

1. Create storage classes that use EBS as the driver
2. Create a persistent volume and a persistent volume claim that uses the EBS storage class you created
3. Connect the PVC you created to a pod, then mount that volume on the containers within that pod.

Here's an example:

1. Create a storage class

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: auto-ebs-sc
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"
provisioner: ebs.csi.eks.amazonaws.com
volumeBindingMode: WaitForFirstConsumer
parameters:
  type: gp3
  encrypted: "true"
```

```bash
kubectl apply -f storage-class.yaml
```

2. Create a PVC for the storage class

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: game-data-pvc
  namespace: game-2048
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: auto-ebs-sc
```

```yaml
kubectl apply -f ebs-pvc.yaml
```

3. Attach the PVC to a pod, mount it on the container.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  namespace: game-2048
  name: deployment-2048
spec:
  replicas: 3 
  selector:
    matchLabels:
      app.kubernetes.io/name: app-2048
  template:
    metadata:
      labels:
        app.kubernetes.io/name: app-2048
    spec:
      containers:
        - name: app-2048
          image: public.ecr.aws/l6m2t8p7/docker-2048:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 80
          # 2. mount PV on container at directory
          volumeMounts:
            - name: game-data
              mountPath: /var/lib/2048
      # 1. attach PV to pod from PVC
      volumes:
        - name: game-data
          persistentVolumeClaim:
            claimName: game-data-pvc
```

```bash
kubectl apply -f ebs-deployment.yaml
```

### EKS with Fargate

Fargate is a serverless option for running containers, thus it's pay-for-usage cost vs EC2 instances pay-for-running cost.

Therefore, if your cluster does not have steady, predictable traffic, EKS with fargate may save you some money, because now you won't have to pay for resources you don't actually use.

> [!NOTE]
> Fargate will handle all fo the underlying compute infrastructure, and now you only have to pay for exactly the vCPU and memory a pod uses up, and scale up those pods in a replicaset via application autoscaling.

What Fargate manages:

- Manages control plane (EKS already does this)
- Manages EC2 worker nodes completely

What you manage:

- Pod deployment

#### EKS auto mode vs EKS fargate

- **when to use EKS auto mode**: when you want more control over the instance types of worker nodes and need persistent workloads (server that handles consistent traffic). It's best for:
	- AI/ML workloads
	- persistent workloads
	- applications with specific instance type requirements
- **when to use EKS fargate**: when you want to pay for only what you use and you want more simplicity and not having to manage EC2 instance worker nodes. It's best for:
	- Microservices and event-driven workloads
	- lightweight applications
	- burstable workloads (workloads that need to scale up and down dynamically)

#### Creating a fargate cluster

See [[#Fargate mode cluster creation]] for how to create a fargate cluster with `eksctl`.

A **Fargate profile** allow you to define which namespaces get fargate compute and will be able to deploy resources to the fargate cluster.

Here are the three key properties of fargate profiles:

1. **Namespace Association**: You can define which Kubernetes namespaces will use Fargate for scheduling pods. This allows for clear segregation between different environments, such as development, staging, and production.
    
2. **IAM Role Integration**: Different Fargate profiles can be associated with different IAM roles. This means you can assign varying permissions to pods based on their requirements. For example, some pods may need access to an S3 bucket while others might not.
    
3. **Management Simplification**: With Fargate, you do not need to manage the underlying EC2 instances. It abstracts the infrastructure and automatically handles scaling, patching, and provisioning of compute resources based on the needs of your applications.

Here's the hierachy in a nutshell: 

>One namespace has many fargate profiles, you deploy resources to namespaces.

We can use `eksctl` to create a fargate profile:

```bash
eksctl create fargateprofile --cluster <cluster-name> --name <profile-name> --namespace <namespace-name>
```

So after creating a cluster, here are the general steps to deploy an app to EKS fargate:

1. Create namespaces.
2. Create fargate profiles in those namespaces via `eksctl`

```bash
eksctl create fargateprofile --cluster <cluster-name> --name <profile-name> --namespace <namespace-name>
```

3. Create K8S resources in the namespaces that have fargate profiles associated with it.

#### Autoscaling in Fargate

Fargate lets you scale yoru deployments via built-in scaling methods via a `HorizontalPodAutoscaler` resource.

1. Create your pods, deployments, whatever, scoped to a namespace that has a fargate profile associated with it
2. Create a `HorizontalPodAutoscaler` resource within the same namespace you want to scale the pods in.
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


