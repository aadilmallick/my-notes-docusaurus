## CloudBuild

CloudBuild is a CI/CD tool that you can use to deploy your infra, app, and google services.

1. Define a trigger from a source code repo
2. Create a cloud build configuration file, which are defined in a `cloudbuild.yaml` file.

### CloudBuild YAML

Create a `Makefile` as an abstraction over bash scripts.

```make
FUNCTION=undefined
PLATFORM=undefined
URL=undefined
VERSION=undefined
BUILD_NUMBER=undefined
CODE=$(shell ls *.py)

ifneq (,$(findstring -staging,$(FUNCTION)))
	ENVIRONMENT = STAGING
else ifneq (,$(findstring -production,$(FUNCTION)))
	ENVIRONMENT = PRODUCTION
else
	ENVIRONMENT = undefined
endif

hello:
	@echo "Here are the targets for this Makefile:"
	@echo "  requirements   - install the project requirements"
	@echo "  lint           - run linters on the code"
	@echo "  black          - run black to format the code"
	@echo "  test           - run the tests"
	@echo "  build          - build the lambda.zip file"
	@echo "  deploy         - deploy the lambda.zip file to AWS"
	@echo "  testdeployment - test the deployment"
	@echo "  clean          - remove the lambda.zip file"
	@echo "  all            - clean, lint, black, test, build, and deploy"
	@echo
	@echo
	@echo "You must set the FUNCTION variables to use the deploy target."
	@echo "FUNCTION must be set to the name of an existing lambda function to update."
	@echo "For example:"
	@echo
	@echo "  make deploy FUNCTION=sample-application-staging"
	@echo
	@echo "Optional deploy variables are:"
	@echo "  VERSION       - the version of the code being deployed (default: undefined)"
	@echo "  PLATFORM      - the platform being used for the deployment (default: undefined)"
	@echo "  BUILD_NUMBER  - the build number assigned by the deployment platform (default: undefined)"
	@echo "  URL           - the URL to use for testing the deployment (default: undefined)"
	@echo

requirements:
	pip install -U pip
	pip install --requirement requirements.txt

check:
	set
	zip --version
	python --version
	pylint --version
	flake8 --version
	aws --version

lint:
	pylint --exit-zero --errors-only --disable=C0301 --disable=C0326 --disable=R,C $(CODE)
	flake8 --exit-zero --ignore=E501,E231 $(CODE)


black:
	black --diff $(CODE)

test:
	python -m unittest -v index_test

build:
	zip lambda.zip index.py data.json template.html

deploy:
	aws sts get-caller-identity

	aws lambda wait function-active \
		--function-name="$(FUNCTION)"

	aws lambda update-function-configuration \
		--function-name="$(FUNCTION)" \
		--environment "Variables={PLATFORM=$(PLATFORM),VERSION=$(VERSION),BUILD_NUMBER=$(BUILD_NUMBER),ENVIRONMENT=$(ENVIRONMENT)}"

	aws lambda wait function-updated \
		--function-name="$(FUNCTION)"

	aws lambda update-function-code \
		--function-name="$(FUNCTION)" \
	 	--zip-file=fileb://lambda.zip

	aws lambda wait function-updated \
		--function-name="$(FUNCTION)"

testdeployment:
	curl -s $(URL) | grep $(VERSION)

clean:
	rm -vf lambda.zip

all: clean lint black test build deploy

.PHONY: test build deploy all clean
```


Now create a `cloudbuild.yaml` file

```yaml title="cloudbuild.yaml"
steps:
# Step 0: Create a virtual environment named 'local'
- name: 'python'
  args: ['/usr/local/bin/python', '-m', 'venv', 'local']

# Step 1: Activate the virtual environment, install AWS CLI and then use 'make' to install the requirements
- name: 'python'
  entrypoint: '/usr/bin/bash'
  args:
  - '-c'
  - |
    source ./local/bin/activate
    pip install awscli
    /usr/bin/make requirements

# Step 2: install zip, check the environment, and lint the code
- name: 'python'
  entrypoint: '/usr/bin/bash'
  args:
  - '-c'
  - |
    apt update && apt install zip -qq
    source ./local/bin/activate
    /usr/bin/make check lint

# Step 3: Run tests
- name: 'python'
  entrypoint: '/usr/bin/bash'
  args:
  - '-c'
  - |
    source ./local/bin/activate
    /usr/bin/make test

# Step 4: Install zip, activate the virtual environment, and build the project
- name: 'python'
  entrypoint: '/usr/bin/bash'
  args:
  - '-c'
  - |
    apt update && apt install zip -qq
    source ./local/bin/activate
    /usr/bin/make build

# Step 5: Deploy to staging using AWS CLI (AWS secrets are injected from Secret Manager)
- name: 'python'
  entrypoint: '/usr/bin/bash'
  env: 
  - 'AWS_DEFAULT_REGION=$_AWS_DEFAULT_REGION'
  secretEnv: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY']
  args:
  - '-c'
  - |
    source ./local/bin/activate
    /usr/bin/make deploy PLATFORM="Google Cloud Build" \
      FUNCTION=$_STAGING_FUNCTION_NAME \
      VERSION=$COMMIT_SHA \
      BUILD_NUMBER=$BUILD_ID

# Step 6: Test the deployed function's staging environment
- name: 'python'
  entrypoint: '/usr/bin/bash'
  args:
  - '-c'
  - |
    /usr/bin/curl -s $_STAGING_URL | /usr/bin/grep $BUILD_ID

# Step 7: Deploy to production using AWS CLI (AWS secrets are injected from Secret Manager)
- name: 'python'
  entrypoint: '/usr/bin/bash'
  env: 
  - 'AWS_DEFAULT_REGION=$_AWS_DEFAULT_REGION'
  secretEnv: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY']
  args:
  - '-c'
  - |
    source ./local/bin/activate
    /usr/bin/make deploy PLATFORM="Google Cloud Build" \
      FUNCTION=$_PRODUCTION_FUNCTION_NAME \
      VERSION=$COMMIT_SHA \
      BUILD_NUMBER=$BUILD_ID

# Step 8: Test the deployed function's production environment
- name: 'python'
  entrypoint: '/usr/bin/bash'
  args:
  - '-c'
  - |
    /usr/bin/curl -s $_PRODUCTION_URL | /usr/bin/grep $BUILD_ID

# Substitutions: default values for environment variables that can be overridden when triggering the build
substitutions:
  _AWS_DEFAULT_REGION: UPDATE_THIS_VALUE
  _STAGING_FUNCTION_NAME: UPDATE_THIS_VALUE    
  _STAGING_URL: UPDATE_THIS_VALUE
  _PRODUCTION_FUNCTION_NAME: UPDATE_THIS_VALUE   
  _PRODUCTION_URL: UPDATE_THIS_VALUE

# Secrets: Fetch AWS secrets from Google Cloud Secret Manager
availableSecrets:
  secretManager:
  - versionName: projects/$PROJECT_ID/secrets/AWS_ACCESS_KEY_ID/versions/latest
    env: 'AWS_ACCESS_KEY_ID'
  - versionName: projects/$PROJECT_ID/secrets/AWS_SECRET_ACCESS_KEY/versions/latest
    env: 'AWS_SECRET_ACCESS_KEY'
```