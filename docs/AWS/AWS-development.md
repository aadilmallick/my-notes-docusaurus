## IAM 

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