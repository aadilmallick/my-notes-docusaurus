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

