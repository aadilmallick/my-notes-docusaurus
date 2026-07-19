
## Frontend validation

1. Broken access control: Occurs when users can access parts of the application they shouldn't
	a. Happens through users manipulating URLs or manipulating elements to do something
	b. Never trust client-side validation alone. Always secure API endpoints, as an attacker cannot access those.
2. Security misconfiguration: Violates the principle of least privilege because this happens when default configurations are left unchanged, leading to an attacker having more power than necessary
	a. Example: leaving debyug mode enabled can exposeconsole logs that reveal sensitive info like API keys
	b. Example: leaving a default, permissive CSP can allow XSS attacks
3. Software supply chain failures: these occur when vulnerabilities are introduced in third party libraries like in the npm ecosystem.
4. Cryptographic failures: Happens when sensitive data is not properly encrypted or stored
	a. Always encrypt sensitive data transferred over a network with TLS
	b. Never expose sensitive info in URLs as they may be cached
5. Insecure design: When a poor frontend design or application has attack vectors such as insecure form validation, poor session management, or no frontend rate-loimiting or bot checking
	a. Make sure error messages do not reveal sensitive or personal information
	b. Always validate forms client-side as well as in backend to make sure the application never lands in a broken or unpredictable state
6. Software integrity failure: These happen when frontend code is tampered with such as an attacker altering JS files loaded on the web pages and can then make your website do something malicious.
	a. Use SRI (subresource integrity) to prevent loading scripts that have been tampered with (use nonces to load only the script you made)

### Input validation best practices

1. Always validate inputs on both the client side and server side. While client-side validation improves user experience, it’s not enough on its own, as attackers can bypass it.
2. Use allowlisting, which defines what is allowed, instead of blocklisting, which defines what’s forbidden. For example, validate that a phone number only contains digits, spaces, and special characters like "+" rather than trying to block all possible bad inputs
3. Use regular expressions to enforce valid input patterns, but be cautious of performance issues if they are too complex.

### Output encoding

Output encoding ensures that any user-generated content (such as comments, form inputs, etc.) displayed on the page doesn’t contain harmful code that could be executed in the browser.

1. Escape special characters by converting HTML-sensitive characters (`<`,`>`, `&`,`"`, `'`) to their corresponding HTML entities (`&lt;`, `&gt;`, etc.) before displaying them on the page.
2. Always use textContent by default, which escapes HTML characters and prevents XSS attacks by treating everything as plain text.
3. Use safe methods for DOM manipulation, such as DOMPurify, when HTML content is necessary.
4. Implement Content Security Policy (CSP) headers.

```js
// Safe example - Use one of these methods 
// Option 1: Using textContent (modern, preferred) ✅
document.getElementById('userComment').textContent = userComment;

// Option 2: Using DOMPurify when HTML content is necessary ✅
const sanitizedContent = DOMPurify.sanitize(userComment);
document.getElementById('userComment').innerHTML = sanitizedContent;

// Option 3: Custom encoding function for special cases ✅
function encodeHTML(str) {
  return str
    .replace(/&/g, '&amp;') // Must be first to prevent double-encoding
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
document.getElementById('userComment').innerHTML = encodeHTML(userComment);
```

### XSS attacks

Cross-Site Scripting, or XSS, is one of the most common web vulnerabilities, where attackers inject malicious scripts into web pages that are viewed by other users. If an attacker can execute JavaScript in your user's browser, they can steal session tokens, redirect users to malicious websites, or perform unauthorized actions.

1. Sanitize inputs and outputs: Clean all user inputs and outputs to remove potentially dangerous characters or scripts before rendering them on the page.
2. Use Content Security Policy (CSP): Set a CSP header to limit the sources from which scripts can be loaded. This prevents unauthorized scripts from running, even if they are injected.
3. Escape user inputs in the DOM: When adding user-generated content to the DOM, use textContent or innerText instead of innerHTML.

### CSRF attacks

Cross-site request forgery (CSRF) attacks occur when a malicious website tricks a logged-in user’s browser into making an unwanted request to a different site where the user is authenticated. This can lead to actions being performed on behalf of the user without their consent.


1. Use anti-CSRF tokens to verify that the request comes from the authenticated user and not from an external malicious source.
2. Set cookies with the SameSite attribute to ensure they are not sent in cross-origin requests, reducing the risk of CSRF attacks.
3. Implement token rotation for enhanced security.
4. Add rate limiting to prevent brute force attacks.
5. Consider implementing a double-submit cookie pattern for additional security.

Here's an example of sending secure cookies:

```js
// Set a secure cookie with the SameSite attribute to prevent CSRF
response.setHeader("Set-Cookie", 
    "sessionId=abc123; " +
    "SameSite=Strict; " +  // Prevents the cookie from being sent in cross-site requests
    "Secure; " +           // Only sends cookie over HTTPS
    "HttpOnly; " +         // Prevents JavaScript access to the cookie
    "Path=/; " +          // Limits cookie to specific path
    "Max-Age=3600"        // Sets cookie expiration time
);
```

### Error handling in the backend

1. Display user-friendly error messages to users, but avoid exposing detailed error information (e.g., stack traces, internal server errors).
2. Log errors on the server side for debugging, but sanitize the logs to ensure no sensitive information (like passwords or API keys) is accidentally logged.
3. When applications handle errors, it's important not to expose sensitive information that could help attackers.

```ts
// Safe example: Secure Error Handling
const logger = require('./logger'); // Using a proper logging service ✅
app.use((err, req, res, next) => {
    // Secure error logging ✅
    logger.error({
        error: err,
        request: {
            method: req.method,
            url: req.url,
            headers: req.headers,
            body: req.body
        }
    });

    // Safe error response ✅
    res.status(500).json({ 
        error: 'An unexpected error occurred',
        requestId: req.id // For tracking purposes
    });
});
```

### CORS

Cross-Origin Resource Sharing (CORS) policies dictate which domains are allowed to interact with your server resources. An overly permissive CORS policy can expose your application to cross-site attacks.

1. Only allow specific, trusted domains to access your resources rather than using a wildcard (*).
2. Use Access-Control-Allow-Credentials carefully: If your API allows credentials, ensure CORS is configured tightly to only allow trusted domains.
3. Only allow necessary HTTP methods.
4. Regularly audit and update the allowed origins list.

```js
// Safe example with secure CORS configs 
// 1. Specific origins with array of trusted domains ✅
app.use(cors({
  origin: ['https://www.knowbe4.com', 'https://blog.knowbe4.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Only necessary methods ✅
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // Cache preflight requests for 24 hours
}));
```

## Cybersecurity basics

### Principles of cybersecurity

These are the three main components of cybersecurity:

1. **authentication**: ensuring a user is who they say the are
2. **authorization**: ensuring a user can perform actions based on their role and preventing unauthorized actions
3. **integrity**: the process of input validation and sanitization to prevent data from being tampered
4. **data protection (secrecy)**: the process of safeguarding sensitive data from unauthorized access, modification, or disclosure.

### Cloud services

There are three main types of cloud services:

- **infrastructure as a service**: cloud provider manages hardware and networking for you and provisions instances for you, but you control the environment and software
	- *example*: AWS ec2 instance or Digital Ocean, where you get a linux VM and then you can do whatever tf you want with it.
- **platform as a service**: cloud provider manages the infrastructure and the platform, setting up the operating system for you and the middleware
	- *example*: Vercel, where all the developer is responsible for is the code and that's it.
- **software as a service**: a product that one uses.

### Security testing tools

- **SAST (Static Application Security Testing)**: identifies vulnerabilities in the code early in development just by looking at the source code.
	- Advantages: Can detect vulnerabilities early, saving you time and money
	- Disadvantages: Might miss runtime issues that only appear when the application is running
- **DAST (Dynamic Application Security Testing)**: identifies vulnerabilities in the code during runtime, using runtime testing
	- Advantages: Can catch vulnerabilities that SAST might miss
	- Disadvantages: Can be more time-consuming and resource-intensive, and it does not necessarily detect flaws in business logic and role-based access control
- **SAC (Software Composition Analysis)**: identifies vulnerabilities in the chain of third party software your application uses
	- Advantages: Quickly finds vulnerabilities in open-source components
	- Disadvantages: Might miss custom vulnerabilities or issues in your own code, and it does not understand the context of how the component is being used

### OWASP top 10

#### Broken access control

here are examples of broken access control

- Improper authorization checks, where there is no verification that a user has the necessary permissions to perform an action
- Missing authentication mechanisms, which allow users to access resources without proper authentication
- Insecure role-based access control that could result in assigning excessive permissions to users

Failure to address broken access control could allow an attacker to access confidential information, modify or delete data, or escalate privileges to obtain administrator rights.

To avoid broken access control, it's essential for front-end developers to implement proper authorization checks and validate user permissions. Additionally, back-end developers should enforce authorization rules, manage user roles and permissions, and implement robust authentication mechanisms.

#### Security misconfiguration

Misconfigured applications could allow attackers to perform unauthorized actions or run malicious scripts or commands. They could also compromise the application by taking control of it or disrupting its functionality.

Here are some examples of security misconfiguration:

- Running applications with default credentials: Many applications come with default usernames and passwords that are widely known
- Weak encryption settings: Using weak encryption algorithms or failing to properly configure encryption settings puts data at risk
- Insecure network configurations: Misconfigured firewalls, routers, or other network devices can expose applications to vulnerabilities
- Outdated software: Running outdated software with known vulnerabilities will make applications susceptible to attacks

**mitigations**

- Review and modify default settings: Change default passwords, adjust security configurations, and disable unnecessary features
- Stay up-to-date with security patches: Regularly update software and frameworks to address known vulnerabilities
- Implement strong network security through proper configuration of firewalls, routers, and other network devices
- Conduct regular security assessments: Perform vulnerability scans and penetration testing to identify and address potential misconfigurations

#### Software Supply Chain Failures

In modern development, software supply chain failures occur when there is a breakdown or compromise in the process of building, distributing, or updating software. Attackers no longer just look for known bugs in your code; they target the tools you trust. By injecting malicious code into a popular library or compromising a CI/CD pipeline, they can gain unauthorized access to systems that allows them to spread malware and steal data.

Similarly, relying on unhardened build environments or untrusted sources creates weaknesses. Even if your final application seems secure, a compromised development tool or a lack of oversight in code promotion can lead to exposure.

**mitigations**

- Maintaining a Software Bill of Materials (SBOM) to centrally track all direct and transitive dependencies to ensure full visibility of the software stack
- Automating vulnerability monitoring through tools that cross-reference your inventory against databases like the National Vulnerability Database (NVD), and Open Source Vulnerabilities (OSV)
- Removing unused dependencies, unnecessary features, components, files, and documentation
- Hardening the delivery pipeline by regularly updating CI/CD tools and IDEs while enforcing a strict separation of duties for all code promotions

#### Cryptographic failures

Cryptographic failures refer to the improper handling of sensitive data, such as credit card numbers, personal information, passwords, or trade secrets. Failure to properly use cryptography can lead to that data being exposed or stolen.

Examples of cryptographic failures include storing data in plaintext, not encrypting data in transit, and exposing data through insecure APIs. These types of failures may lead to identity theft or financial fraud.

Here are some examples of how to mitigate these cryptographic failures:

- Encrypting data at rest, which effectively means locking data in a secure vault
- Encrypting data in transit and using HTTPS to protect data while it's traveling
- Limiting data access by only granting access to those who need it
- Regularly reviewing and updating security measures to keep your defenses strong

#### Injection


One of the most common and dangerous vulnerabilities is injection. This occurs when an attacker introduces malicious data into an application's input points. Attackers can use injection vulnerabilities to steal or modify data or gain unauthorized access to systems.

Imagine, for example, a web application that allows users to search for products. If the input isn't properly sanitized, an attacker could inject malicious SQL code into the search query. This could allow them to access sensitive data, modify records, or even take control of the database.

Other types of injection attacks include command injection and LDAP injection. These vulnerabilities can be exploited to execute arbitrary commands on the server or gain unauthorized access to directory services.


#### Insecure design

Insecure design consists of:

- Failing to identify and address potential threats early in the development process
- Not having clear security goals and objectives for the application
- Choosing an inadequate architecture that makes it difficult to implement security controls
- Failing to integrate security testing throughout the development lifecycle

**mitigations**

- Choose secure architecture patterns by utilizing well-established secure design principles when building your application
- Integrate security considerations into all phases of development, from planning to deployment. This means embracing the software development lifecycle with security as a priority.
- Conduct threat modeling to help identify potential threats and vulnerabilities early on
- Keep security professionals involved during the design and development process
- Lastly, perform regular and continuous security testing to check your application for vulnerabilities throughout the entire development lifecycle

#### Authentication failures

Authentication failures occur when weak authentication processes allow unauthorized individuals to gain access to user accounts or an application.

These failures happen when passwords are stored in plaintext, or the application uses weak hashing algorithms. Weak password policies and the lack of multi-factor authentication also contribute to this type of vulnerability.

Here are example attacks against authentication:

- Brute-force attacks, which try every possible combination of username and password to guess credentials
- Password spraying by attempting to access with the same password against multiple accounts, hoping one will work
- Credential stuffing, an automated attack using stolen usernames and passwords

#### Software and Data Integrity Failures


Examples of software and data integrity failures include:

- Deserializing data from an untrusted source without proper validation
- Failing to validate user input before processing it
- Storing data in a format that is easily manipulated
- Not verifying the integrity of data during processing

#### Security logging and alerting failures

Security logging and alerting failures refer to applications or processes that don't properly track and record user activity, system events, and security incidents. This can significantly hinder your ability to detect, investigate, and respond to security threats in a timely manner.

As a result, attackers can remain undetected since there are no logs to track their activity, which allows them to operate with greater freedom. They can cover their tracks by disabling or tampering with existing logs. The lack of timely detection also allows attacks to continue for longer periods, potentially causing more damage.

Examples of security logging and monitoring failures include:

- Inadequate logging of user activity, such as not capturing critical user actions like login attempts, data access, or changes to configurations
- Missing security alerts to notify you of suspicious activity, like unusual login attempts or system errors
- Insecure log storage, such as when logs are stored on the same system as the application, which makes them vulnerable to attack or deletion
- Failing to retain logs for a sufficient period of time which hinders forensic investigations when they're needed

**Tips for front-end developers:**

- Log user interactions like logins, clicks, and form submissions
- Use that log to detect unusual patterns or anomalies in user behavior that could qualify as suspicious activity
- Provide users an easy path for reporting anything suspicious

**Tips for back-end developers:**

- Use a centralized logging system to capture system events, security alerts, and error messages
- Store logs in a secure location separate from the application itself to prevent tampering
- Determine how long logs should be retained based on regulatory requirements and internal policies
#### Mishandling of Exceptional Conditions


Mishandling exceptional conditions happens when an application fails to properly prevent, detect, or respond to unpredictable situations. Any time an application is unsure of its next instruction, an exceptional condition has been mishandled. This can lead to the application failing to prevent an unusual situation from happening and responding poorly or not at all to the situation afterwards.

These situations can negatively affect the confidentiality, availability, and integrity of a system or its data, which may allow attackers to manipulate an application's flawed error handling.

**mitigations**

- Implement monitoring tools that watch for repeated errors or patterns that indicate an on-going attack
- Catch exceptions locally to ensure that any interrupted transaction is completely rolled back rather than left in an unpredictable, half-finished state
- Use a centralized global exception handler to provide a consistent, predictable response to errors
- Add rate limiting, resource quotas, throttling, and other limits wherever possible, to prevent exceptional conditions in the first place

## Backend security

### Secure API development tactics

#### 1) Auth mitigations

- Use token-based authentication by implementing industry-standard protocols like OAuth 2.0 or JSON Web Tokens for secure, stateless authentication.
- Enforce role-based access control (RBAC) to ensure users only have access to the resources they need based on their roles.
- Store tokens securely using HTTPOnly cookies to minimize exposure to cross-site scripting attacks.

#### 2) Rate limiting

Rate limiting and throttling are crucial for protecting your APIs from abuse and denial-of-service attacks. By limiting the number of requests a client can make within a given time frame, you can prevent excessive use and reduce the risk of service disruptions.

**Best Practices:**

- Set thresholds for requests by configuring your API gateway or server to limit requests per client to a safe number. For example, limit requests to 100 per minute.
- Apply stricter rate limits for anonymous users and higher limits for authenticated users.
- Return appropriate status codes when rate limits are exceeded, and provide retry information. For example, HTTP status code 429: Too Many Requests.

#### 3) data validation and output encoding

Data validation and output encoding are essential for preventing injection attacks and data corruption. Validate all incoming data, whether from user inputs, third-party sources, or even trusted applications.

- Use allow-lists to validate inputs against known safe values rather than trying to block malicious inputs.
- Sanitize user inputs to remove potentially harmful characters before processing them.
- Apply encoding when rendering data to different outputs, such as HTML or JSON, to prevent injection attacks.

#### 4) error handling

Secure error handling prevents attackers from gathering insights about your system's internals. Improper error messages can reveal stack traces, system configurations, or database structures, which could be used to craft targeted attacks.

**Best Practices:**

- Return generic error messages to clients while logging detailed errors on the server. These messages can be as simple as "an error occurred, please try again."
- Avoid stack traces in responses by ensuring those traces (and sensitive information) are not sent to the client.
- Implement logging that captures security-relevant information without exposing sensitive data, such as passwords or session tokens.

### Access control and secure session management


#### RBAC

Role-based access control is a method of restricting system access based on the roles assigned to users. Each role has specific permissions, allowing you to define what actions users can take within the application. Let's review best practices for implementing RBAC.

Best Practices:

- Principle of least privilege: Assign the minimum permissions necessary for users to perform their tasks. This limits potential damage in the event of an account compromise.
- Centralize access control logic: Ensure that access control rules are managed in a single, consistent location to avoid discrepancies.
- Regularly review roles and permissions: Periodically audit roles and permissions to ensure they align with current business needs and do not grant excessive access.

#### Session Management Essentials

Session management is the practice of securely handling user sessions to protect authenticated states and prevent session-related vulnerabilities like hijacking or fixation attacks. Effective session management involves generating and maintaining session identifiers securely.

Best Practices:

- Secure session identifiers: Generate session IDs on the server side and ensure they are sufficiently random to prevent guessing or prediction.
- HttpOnly and secure cookies: Use the HttpOnly attribute to prevent client-side scripts from accessing session cookies and the secure attribute to ensure cookies are only transmitted over HTTPS.
- Session expiration: Configure session timeouts to log users out after periods of inactivity. This limits the window for potential session hijacking.

#### Multi-Factor Authentication (MFA)

Multi-factor authentication, or MFA, adds an extra layer of security to the authentication process. Even if an attacker compromises a user's password, MFA requires additional factors to verify the user's identity.

Best Practices:

- Time-based one-time passwords (TOTP): Implement time-based one-time passwords through mobile apps.
- SMS and email verification: As an alternative, use SMS or email verification, but keep in mind that these are less secure than app-based TOTP.
- Mandatory MFA for high-privilege accounts: Enforce MFA for admin accounts and any users with access to sensitive information.

#### Best Practices for Implementing Access Control

To ensure access control is secure and effective, follow these best practices:

- Enforce server-side access controls: Validate user permissions on the server side, as client-side checks can be bypassed.
- Use attribute-based access control (ABAC): In addition to RBAC, ABAC allows for more granular control by considering user attributes, actions, and context.
- Implement access control mechanisms consistently: Apply access control policies across all routes and endpoints uniformly to prevent gaps in enforcement.

### Security misconfigurations

Here are examples of common security misconfigurations:

- **Unnecessary features enabled**: Keeping unnecessary services or pages active can expose your system to attacks. Always disable features that are not in use, such as directory listings or debug pages.
- **Default credentials**: Using default usernames and passwords can lead to unauthorized access. Ensure all default accounts are disabled or secured with strong, unique credentials.
- **Misconfigured security header**s: Headers such as Strict-Transport-Security, X-Frame-Options, and Content Security Policy are essential for protecting web applications. Implement and properly configure these headers to prevent common web vulnerabilities.
- **Improper file permissions**: Failing to set file and directory permissions correctly can allow unauthorized users to access or modify sensitive files.

To avoid common security misconfigurations, follow these best practices:

- **Harden server configurations**: Disable all unused services and open ports. Use firewalls and security groups to limit access to essential services only.
- **Secure HTTP headers**: Implement HTTP security headers such as Strict-Transport-Security to enforce HTTPS connections and X-Content-Type-Options to prevent MIME-type sniffing.
- **Configure environment-specific setting**s: Ensure different environments, such as development, staging, and production, are configured appropriately. For example, verbose error messages might be enabled in development but should be turned off in production to prevent information disclosure.

#### Container security

With the growing use of containers in back-end development, securing containerized environments has become crucial:

- Use minimal base images: Reduce the attack surface by using lightweight, minimal base images for your containers.
- Implement namespace isolation: Ensure containers have proper isolation to prevent cross-container attacks.
- Restrict container privileges: Run containers with the least privilege necessary. Avoid running containers as the root user unless absolutely required.

## E2E Client-side encryption

### Theory

To implement **end-to-end encryption (E2EE)**, you must **ensure that data is encrypted on the sender's device and decrypted only on the recipient's device**, preventing intermediaries or central servers from ever accessing the plaintext. The standard industry architecture combines **asymmetric cryptography** (for secure key exchange) with **symmetric cryptography** (for fast data encryption).

