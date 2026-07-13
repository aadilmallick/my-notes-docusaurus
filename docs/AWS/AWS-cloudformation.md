## Basics

Cloudformation is a declarative IaC solution for AWS, and all other IaC solutions that apply to AWS in reality just compile down to CloudFormation, like Pulumi, AWS CDK, AWS SAM, etc.

Given a template YAML file, CloudFormation figures out

- what order to create them
- what depends on what
- how to update them
- how to roll them back
- how to delete them

Think of it like a package manager for infrastructure.

Cloudformation organizes resources you provision into **stacks**, and then compares previous stack state to the current stack state in what's called a **changeset** to surgically change the diff without constant setup/teardown of resources.

Here are three main reasons why to use CloudFormation:

- **changesets**: subsequent builds and deployments are nearly instant because CloudFormation looks only at the changeset and surgically updates cloud resources.
- **rollback**: CloudFormation provisions resources and updates them in a transaction, where if any single part of the deploy process fails, the whole thing fails and you are not left in a half-broken state.
- **drift detection**: Cloudformation knows when someone has manually changed provisioned resources in a stack and can detect drift from the declarative template

### CloudFormation Resources

All resources you define for a template live under the `Resources` top level key, where for each resource, you define these three core information pieces:

1. **logical ID**: the logical ID of the resource, not the front-facing AWS name. This is what CloudFormation uses to uniquely identify a resource in a changeset.
2. **resource type**: the type of the resource, specified by `<ResourceLogicalId>.Type`, like `AWS::S3::Bucket` to define an S3 bucket.
3. **resource property configuration**: all configuration for that resource, specified by `<ResourceLogicalId>.Properties`.

```yaml
Resources:
    MyBucket: # the logical ID
        Type: AWS::S3::Bucket # the resource type
        Properties: # resource configuration
            BucketName: uploads
```

Here are the core resource types:

```
AWS::Lambda::Function

AWS::IAM::Role

AWS::S3::Bucket

AWS::DynamoDB::Table

AWS::SQS::Queue

AWS::SNS::Topic

AWS::CloudFront::Distribution

AWS::SecretsManager::Secret

AWS::EC2::Instance
```

### Functions and variables

Functions in CloudFormation start with `!` and can be used to dynamically retrieve or set values using variables or other values:

- `!Ref`: takes in the logical ID of a resource as an argument and returns a unique reference to that resource.
- `!GetAtt`: takes in the logical ID of a resource as an argument and then allows you to access specific properties or outputs of that resource.
- `!Sub`: takes in a string as an argument allows you to perform string interpolation with variables using the template string `${}` syntax

You also have access to global variables and implicit resources in CloudFormation you can access and use in functions.

Here are the global variables that are always available:

- `AWS::Region`: returns the current AWS region
- `AWS::StackName`: returns the stack name you provided for the stack
- `AWS::AccountId`: returns the current AWS account ID
- `AWS::URLSuffix`: always returns `amazonaws.com

#### `!Ref`

The `!Ref` function can be used to get a unique reference to a resource by its logical id, where you invoke the function following this syntax:

```
!Ref <Resource-logical-Id>
```

For example, by creating a DynamoDB table with a logical ID of `UsersTable`

```yaml
Resources:
    UsersTable:
        Type: AWS::DynamoDB::Table
```

Then you can reference that table like so:

```yaml
TABLE_NAME: !Ref UsersTable
```

The return value of `!Ref` on a logical ID depends on the specific type of resource you are referencing:

- **DynamoDB**: a ref on a dynamo db table returns the table name.
- **SQS queue**: a ref on a SQS queue returns the queue URL
- **parameters**: a ref on a parameter returns the parameter value.
#### `!GetAtt`

```
!GetAtt UsersTable.Arn   # returns ARN of resource with logical ID UsersTable
!GetAtt MyFunction.Arn   # returns ARN of resource with logical ID MyFunction
!GetAtt Bucket.WebsiteURL # returns WebsiteUrl property from resource w ID=Bucket
```

#### `!Sub`


```
!Sub

Hello ${AWS::Region}
```

#### Parameters

CloudFormation lets you use ParameterStore key-value pairs behind the scenes by specifying the `Parameters` top level key, which can be globally accessed via the `!Ref` function.

You define the parameters and their data types beforehand and then at build-time you inject values for those parameters. This avoids hardcoding and allows for flexibility.

Here's an example

1. Create a parameter. In this example, the `Stage` parameter

```yaml
Parameters:
    Stage:
        Type: String
```

2. When deploying cloudformation template, inject actual values into the parameters:

```bash
sam deploy \
--parameter-overrides Stage=prod
```

3. If you want to access the value set for the parameter, then use the `!Ref` function and pass in the specific logical ID of the parameter you want to read:

```
!Ref Stage # returns prod
```

#### Outputs

You can define outputs you want to see in the cloudformation stack through the top-level `Outputs` key, which lets you define a bunch of cloudformation oputputs, each one with their own logical ID.

Each output has its own logical ID, value, and description.

```yaml
Outputs:
    ApiUrl: # logical ID of this output
        Value: "https://someurl.com"
        Description: "some description"
```