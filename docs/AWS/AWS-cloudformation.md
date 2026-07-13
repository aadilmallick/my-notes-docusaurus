## Basics

Cloudformation is a declarative IaC solution for AWS, and all other IaC solutions that apply to AWS in reality just compile down to CloudFormation, like Pulumi, AWS CDK, AWS SAM, etc.

CloudFormation figures out

- what order to create them
- what depends on what
- how to update them
- how to roll them back
- how to delete them

Think of it like a package manager for infrastructure.

Cloudformation organizes resources you provision into **stacks**, and then compares previous stack state to the current stack state in what's called a **changeset** to surgically change the diff without constant setup/teardown of resources.

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

### Functions and varables

Functions in CloudFormation start with `!` and can be used to dynamically retrieve or set values using variables or other values:

- `!Ref`: takes in the logical ID of a resource as an argument and returns a unique reference to that resource.
- `!GetAtt`: takes in the logical ID of a resource as an argument and then allows you to access specific properties or outputs of that resource.
- `!Sub`: takes in a string as an argument allows you to perform string interpolation with variables using the template string `${}` syntax

You also have access to global variables and implicit resources in CloudFormation you can access and use in functions.



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