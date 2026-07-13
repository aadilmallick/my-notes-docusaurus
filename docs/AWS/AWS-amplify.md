## Basics

![](https://docs.amplify.aws/images/gen2/how-amplify-works/nextImageExportOptimizer/amplify-flow-opt-1920.WEBP)

### Gen 1 v Gen 2

 - **Gen 1**: In Gen 1, you would use Studio's console or the CLI to provision infrastructure; 
 - **Gen 2**: in Gen 2, you author TypeScript code in files following a file-based convention (such as `amplify/auth/resource.ts` or `amplify/auth/data.ts`)

With TypeScript types and classes for resources, you gain strict typing and IntelliSense in Visual Studio Code to prevent errors. A breaking change in the backend code immediately reflects as a type error in the co-located frontend code. 

> [!NOTE]
> The file-based convention follows the "convention over configuration" paradigm—you know exactly where to look for resource definitions when you group them by type in separate files.

#### New feature: Staging environments

If deploying your `dev` git branch, a staging dev environment is created and becomes linked to the `dev` git branch, allowing you to provision cloud resources in a staging/test environment and then when you finally push up to main, the cloud resources are provisioned in production.

![](https://docs.amplify.aws/images/gen2/how-amplify-works/nextImageExportOptimizer/fullstack-opt-1920.WEBP)



### Installation

### Quick demo (amplify V1): host static React site

1. Create a React app with Vite
2. Run the `amplify init` command, which walks you through your project root and which AWS profile to use.
3. Setup hosting for the app by running `amplify add hosting`
4. Publish the app by running `amplify publish`

