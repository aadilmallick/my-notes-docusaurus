## Authentication

### App setup

Before your app can be authorized to call any Microsoft Graph API, the Microsoft identity platform must first be aware of it.

You must first register the app in the [Microsoft Entra admin center](https://entra.microsoft.com/) to establish its configuration information including the following core parameters:

- **Application ID**: A unique identifier assigned by the Microsoft identity platform.
- **Redirect URI/URL**: One or more endpoints at which your app receives responses from the Microsoft identity platform. The Microsoft identity platform assigns the URI to native and mobile apps.
- **Credential**: Can be a client secret (a string or password), a certificate, or a federated identity credential. Your app uses the credential to authenticate with the Microsoft identity platform. This property is only required for confidential client applications; It isn't required for public clients like native, mobile, and single page applications. For more information, see [Public client and confidential client applications](https://learn.microsoft.com/en-us/entra/identity-platform/msal-client-applications).


![](https://i.imgur.com/o9Dhpyq.jpeg)


An app can access data in one of two ways as illustrated in the following image.

- **Delegated access**, an app acting on behalf of a signed-in user.
- **App-only access**, an app acting with its own identity.

#### Delegated access

In this access scenario, a user signs into a client application which calls Microsoft Graph on their behalf. _Both the client app and the user must be authorized to make the request_.

For the client app to be authorized to access the data on behalf of the signed-in user, it must have the required permissions, which it receives through a combination of two factors:

- _Delegated permissions_, also referred to as _scopes_: The permissions exposed by Microsoft Graph and that represent the operations that the app can perform on behalf of the signed-in user. The app is allowed to perform an operation on behalf of the signed in user but not another.
- _User permissions_: The permissions that the signed-in user has to the resource. The user can be the owner of the resource, the resource can be shared with them, or they can be assigned permissions through a role-based access control system (RBAC) such as [Microsoft Entra RBAC](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference?toc=%2Fgraph%2Ftoc.json).


The `https://graph.microsoft.com/v1.0/me` endpoint is the access point to the signed-in user's information, which represents a resource that's protected by the Microsoft identity platform. For delegated access, the two factors are fulfilled as follows:

- The app must be granted a supported Microsoft Graph delegated permission, for example, the _User.Read_ delegated permission, on behalf of the signed-in user.
- The signed-in user in this scenario is the owner of the data.

> [!NOTE]
> Endpoints and APIs with the `/me` alias operate on the signed-in user only and are therefore called in delegated access scenarios.


#### App-only access

In this access scenario, the application can interact with data on its own, without a signed in user. _App-only_ access is used in scenarios such as automation and backup, and is mostly used by apps that run as background services or daemons. It's suitable when it's undesirable to have a user signed in, or when the data required can't be scoped to a single user.


### Permissions

[Microsoft Graph exposes granular permissions](https://learn.microsoft.com/en-us/graph/permissions-reference) that control access to Microsoft Graph resources, like users, groups, and mail. Two types of permissions are available for the supported [access scenarios](https://learn.microsoft.com/en-us/graph/auth/auth-concepts#access-scenarios):

- _Delegated permissions_: Also called _scopes_, allow the application to act on behalf of the signed-in user.
- _Application permissions_: Also called _app roles_, allow the app to access data on its own, without a signed-in user.

As a developer, you decide which Microsoft Graph permissions to request for your app based on the access scenario and the operations you want to perform. When a user signs in to an app, the app must specify the permissions that it needs to be included in the access token. These permissions:

- May be preauthorized for the application by an administrator.
- May be consented by the user directly.
- If not preauthorized, requires administrator privileges to grant consent. For example, for permissions with a greater potential security impact.

### Access token

To access a protected resource, an application must prove that it's authorized to do so by submitting a valid access token. The application gets this access token when it makes an authentication request to the Microsoft identity platform which in turn uses the access token to verify that the app is authorized to call Microsoft Graph.


To call Microsoft Graph, the app makes an authorization request by attaching the access token as a **Bearer** token to the **Authorization** header in an HTTP request. For example, the following call that returns the profile information of the signed-in user (the access token has been shortened for readability):


```
GET https://graph.microsoft.com/v1.0/me/ HTTP/1.1
Host: graph.microsoft.com
Authorization: Bearer EwAoA8l6BAAU ... 7PqHGsykYj7A0XqHCjbKKgWSkcAg==
```

To get an access token, read these articles:

1. [Microsoft identity platform and OAuth 2.0 authorization code flow - Microsoft identity platform | Microsoft Learn](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow)
2. [Get access on behalf of a user - Microsoft Graph | Microsoft Learn](https://learn.microsoft.com/en-us/graph/auth-v2-user?tabs=http)


## Outlook API

<iframe width="560" height="315" src="https://www.youtube.com/embed/7Cve_k4C_Ts?si=cjxLVr62noalmiCL" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
