## Intro

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

### Manually uploading a CloudFormation template

When manually uploading a template, here are the steps you should follow:

1. Choose which S3 bucket to store the template YAML in
2. Choose the IAM role that CLoudformation will use to provision those resources, o perform all the required operations in the stack.
3. Choose the **stack policy**, which is a JSON document that defines the resources you want to prevent from accidental deletion or retain them when a stack gets destroyed.
4. Choose the **rollback configuration**, which defines cloudwatch alarms to listen for and if those alarms are breached, then CloudFormation rolls back to the previous template version.
5. Choose the **stack notification options**, where upon stack creation, you set up an SNS topic you want to push to.

### IaC generator

The IaC generator service in AWS creates cloudformation templates from provisioned resources, reverse engineering what you did to manually create selected cloud resources and synthesizes that into a single cloudformation template.

Here is an example of how to best use it: 

1. For all manual resources you eventually want to create a CloudFormation template from, give them all a tag identifier with the same value. 
2. For adding the related resources you want to scan in the IAC generator, select the ones with the tag you set. 
3. Download as either using CDK or Cloudformation YAML.

### Updating stacks and templates

When updating a CloudFormation stack, using the existing template means you keep the original template file unchanged and only modify the parameters. This usually results in minor changes, like resizing an instance, and CloudFormation previews whether resources will be modified or conditionally replaced.  
  
Replacing the template means you upload a new or modified template file. This allows you to add, remove, or change resources and their relationships, leading to more significant updates. CloudFormation will show you exactly what resources will be added, modified, or replaced before you submit the update.  
  
So, updating with the existing template is for parameter tweaks without changing the infrastructure layout, while replacing the template is for structural changes to your stack.

## Basics of templates

A Cloudformation YAML template represents the resources, parameters, and outputs all associated with a single stack.

When you apply a template for provisioning, that template creates a single stack with all associated resources, provisioning that infra on the cloud provider.

### Template format

This is the general format of a CloudFormation YAML representing a single stack


![](https://i.imgur.com/1EIk5RG.jpeg)
- `Description`: text-based human-facing description 
- `Parameters`: SSM parameters to inject during runtime 
- `Resources`: list of cloud resources to provision 
- `Outputs`: human-readable outputs after provisioning occurs 
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

#### `!Ref` and `!GetAtt`

The `!Ref` and `!GetAtt` functions are both used to query an individual resource and retrieve information from it.

- `!Ref`: The `!Ref` function can be used to get a unique reference to a resource by its logical id, or return the value of a parameter or variable.
- `!GetAtt`: the `!GetAtt` function returns specific properties of a resource using dot notation.


![](https://i.imgur.com/asnHg7x.jpeg)


##### `!Ref` in depth

The `!Ref` function allows you to get a unique reference to a resource by its logical ID by invoking the function following this syntax:

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
- **variable name**: a ref on a variable name returns the value of the variable

##### `!GetAtt` in depth

```yaml
# returns ARN of resource with logical ID UsersTable
!GetAtt UsersTable.Arn   

# returns ARN of resource with logical ID MyFunction
!GetAtt MyFunction.Arn   

# returns WebsiteUrl property from resource w ID=Bucket
!GetAtt Bucket.WebsiteURL 
```

#### `!Sub`


```
!Sub

Hello ${AWS::Region}
```

### Parameters

CloudFormation lets you use ParameterStore key-value pairs behind the scenes by specifying the `Parameters` top level key, which can be globally accessed via the `!Ref` function.

```yaml
Parameters:
  <ParameterName>:
    Description: Enter description here.
    Type: String
```

Here are the properties you can provide for each parameter:

- `Type`: **Required**. the data type of the parameter, like `String`
- `Description`: the human-friendly description.
- `Default`: the default value to provide if no parameter value is provided by the user.
- `AllowedValues`: a YAML list of allowed values for the parameter, so it's sort of like providing an ENUM data type on top of being a string.

You define the parameters and their data types beforehand and then at build-time you inject values for those parameters. This avoids hardcoding and allows for flexibility.

Here's an example:

1. Create a parameter. In this example, the `Stage` parameter

```yaml
Parameters:
    Stage:
        Type: String
        Description: "this is my last stand"
        Default: dev
        AllowedValues:
	        - t3.micro
	        - t3.small
	        - t3.medium
	        - t3.large
```

2. When deploying cloudformation template, inject actual values into the parameters:

```bash
sam deploy \
--parameter-overrides Stage=prod
```

3. If you want to access the value set for the parameter within the template, then use the `!Ref` function and pass in the specific logical ID of the parameter you want to read:

```yaml
!Ref Stage # returns prod
```

Here's a more complete example:

```yaml
AWSTemplateFormatVersion: 2010-09-09
Description: |
  This template creates a single EC2
  instance with a hard-coded AMI and size!
Parameters:
  MyInstanceType:
    Description: Choose from a few t3 instance types
    Type: String
    Default: t3.micro
    AllowedValues:
      - t3.micro
      - t3.small
      - t3.medium
      - t3.large
  MyImageId:
    Description: Enter the value of the base AMI for this instance.
    Type: String
    Default: ami-05b10e08d247fb927
Resources:
  MyInstance:
    Type: AWS::EC2::Instance
    Properties:
      ImageId: !Ref MyImageId
      InstanceType: !Ref MyInstanceType
```


#### Parameter data types

There's not just `String` data types for parameters. You can also specify these:


![](https://i.imgur.com/TCvEMan.jpeg)

> [!NOTE]
> So why would you want to use these hyper-specific parameter types? 
> 
> Well, because they offer autocomplete when you're putting it into the CloudFormation console and database type safety with the provided strict enum typing, so it reduces errors.

### Outputs

You can define outputs you want to see in the cloudformation stack through the top-level `Outputs` key, which lets you define a bunch of cloudformation outputs, each one with their own logical ID.

Each output has its own logical ID, value, and description.

```yaml
Outputs:
    ApiUrl: # logical ID of this output
        Value: "https://someurl.com"
        Description: "some description"
```

You can also use the `!Ref` or `!GetAtt` to dynamically get provisioned resource info from and use that in your outputs.

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: CloudFormation template to create an S3 bucket with configurable versioning.

Parameters:
  BucketName:
    Description: "Enter the name of the S3 bucket"
    Type: String
  VersioningEnabled:
    Description: "Choose whether to enable or disable versioning"
    Type: String
    AllowedValues:
      - "Enabled"
      - "Suspended"
    Default: "Suspended"
  EnvironmentTag:
    Description: Which environment is this for?
    Type: String
    Default: development
    AllowedValues:
      - development
      - staging
      - production

Resources:
  MyBucket:
    Type: "AWS::S3::Bucket"
    Properties:
      BucketName: !Ref BucketName
      VersioningConfiguration:
        Status: !Ref VersioningEnabled
      Tags: 
        - Key: Environment
          Value: !Ref EnvironmentTag

Outputs:
  BucketName:
    Description: "The name of the created S3 bucket"
    Value: !Ref MyBucket
  BucketArn:
    Description: "The ARN of the created S3 bucket"
    Value: !GetAtt MyBucket.Arn
```

## Examples

### EC2 server

1. Define parameters

```yaml
Parameters:
  MyInstanceType:
    Description: Choose from a few t3 instance types
    Type: String
    Default: t3.micro
    AllowedValues:
      - t3.micro
      - t3.small
      - t3.medium
      - t3.large

  MyImageId:
    Description: Enter the value of the base AMI for this instance.
    Type: String
    Default: ami-05b10e08d247fb927
```

2. Create an EC2 instance with a security group

```yaml
Resources:

  MyInstance:
    Type: AWS::EC2::Instance
    Properties:
      ImageId: !Ref MyImageId
      InstanceType: !Ref MyInstanceType
      SecurityGroupIds:
        - !Ref MySecurityGroup # creates security group first
      UserData:
        Fn::Base64: |
          #!/bin/bash
          yum update -y
          yum install -y nginx
          systemctl enable nginx
          systemctl start nginx
      Tags:
        - Key: Name
          Value: MyNginxServer
          
  MySecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Allow HTTP traffic from the world
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 80
          ToPort: 80
          CidrIp: 0.0.0.0/0
        - IpProtocol: tcp
          FromPort: 443
          ToPort: 443
          CidrIp: 0.0.0.0/0
```

3. Create an elastic IP:

```yaml
Resources:
  MyEIP:
    Type: AWS::EC2::EIP
    Properties:
      Domain: vpc

  MyEIPAssociation:
    Type: AWS::EC2::EIPAssociation
    Properties:
      AllocationId: !GetAtt MyEIP.AllocationId
      InstanceId: !Ref MyInstance
```

Here is the full YAML:

```yaml
AWSTemplateFormatVersion: 2010-09-09
Description: |
  This template creates a single EC2 instance with a public IP accessible to 
  the world on port 80.  The template installs and starts nginx, then outputs the 
  public IP value to CloudFormation.
  Note: to get VSCode to stop flagging Cloudformation functions as invalid,
  edit your settings.json customTags section.  
  See https://github.com/redhat-developer/vscode-yaml/issues/669

Parameters:
  MyInstanceType:
    Description: Choose from a few t3 instance types
    Type: String
    Default: t3.micro
    AllowedValues:
      - t3.micro
      - t3.small
      - t3.medium
      - t3.large

  MyImageId:
    Description: Enter the value of the base AMI for this instance.
    Type: String
    Default: ami-05b10e08d247fb927

Resources:

  MyInstance:
    Type: AWS::EC2::Instance
    Properties:
      ImageId: !Ref MyImageId
      InstanceType: !Ref MyInstanceType
      SecurityGroupIds:
        - !Ref MySecurityGroup      
      UserData:
        Fn::Base64: |
          #!/bin/bash
          yum update -y
          yum install -y nginx
          systemctl enable nginx
          systemctl start nginx
      Tags:
        - Key: Name
          Value: MyNginxServer

  MySecondInstance:
    Type: AWS::EC2::Instance
    Properties:
      ImageId: !Ref MyImageId
      InstanceType: !Ref MyInstanceType
      SecurityGroupIds:
        - !Ref MySecurityGroup      
      Tags:
        - Key: Name
          Value: SecondInstance"          

  MySecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Allow HTTP traffic from the world
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 80
          ToPort: 80
          CidrIp: 0.0.0.0/0   
        - IpProtocol: tcp
          FromPort: 443
          ToPort: 443
          CidrIp: 0.0.0.0/0                       

  MyEIP:
    Type: AWS::EC2::EIP
    Properties:
      Domain: vpc

  MyEIPAssociation:
    Type: AWS::EC2::EIPAssociation
    Properties:
      AllocationId: !GetAtt MyEIP.AllocationId
      InstanceId: !Ref MyInstance          

Outputs:
  PublicIP:
    Description: Public IP of the EC2 instance
    Value: !GetAtt MyInstance.PublicIp
```

### DynamoDB + DependsOn + Policies

1. `OrdersTable`: Create a DynamoDB table resource with a partition and sort key combination as the primary key and it also depends on (specified by `DependsOn` property) the IAM resource `DynamoDBQueryPolicy` to be defined first.
2. `DynamoDBQueryPolicy`: create an IAM policy that allows querying of all DynamoDB tables, and attach this policy to the role `OrdersTableQueryRole`

```yaml
AWSTemplateFormatVersion: 2010-09-09
Resources:
  OrdersTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: AuthorsTable_prod
      AttributeDefinitions:
        - AttributeName: "AuthorName"
          AttributeType: "S"
        - AttributeName: "BookTitle"
          AttributeType: "S"
      KeySchema:
        - AttributeName: "AuthorName"  # partition key, string
          KeyType: "HASH"
        - AttributeName: "BookTitle"   # sort key, string
          KeyType: "RANGE"
      TimeToLiveSpecification:
        AttributeName: "ExpirationTime"
        Enabled: true
      ProvisionedThroughput:
        ReadCapacityUnits: "10"
        WriteCapacityUnits: "5"
    DependsOn:                          # needs the policy to be created first
      - DynamoDBQueryPolicy

  DynamoDBQueryPolicy:             # policy that allows querying all tables
    Type: "AWS::IAM::Policy"
    Properties:
      PolicyName: DynamoDBQueryPolicy
      PolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: "Allow"
            Action: "dynamodb:Query"
            Resource: "*"
      Roles:
	    # attaches to specific role via logical ID
        - Ref: !Ref OrdersTableQueryRole  

  OrdersTableQueryRole:
    Type: "AWS::IAM::Role"
    Properties:
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: "Allow"
            Principal:
              Service:
                - "dynamodb.amazonaws.com"
            Action:
              - "sts:AssumeRole"
      Path: "/"

```