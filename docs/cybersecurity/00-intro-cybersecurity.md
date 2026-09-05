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

## Cyber threats

### Cyber kill chain

The cyber kill chain refers to a general process of stages attackers follow to compromise a target and achieve their goal:


![](https://i.imgur.com/3gOGYZv.jpeg)

- **Reconnaissance:** The attacker gathers information about the target, like scanning IP addresses and open ports on a company's internet domain to find vulnerabilities.
	- **internet domain**: all public IP addresses a company owns/uses
	- **IP address scan**: scanning all IP addresses living within an internet domain
	- **port scan**: for a single IP address, scanning all open ports running on that IP
- **Weaponization:** The attacker customizes malware to exploit specific vulnerabilities in the target's systems.
- **Delivery:** The malware is delivered to the target, often via phishing emails, infected websites, or compromised credentials. There are 5 types of malware delivery
	- **phishing**: attackers send an infected file or crafts a fake website that a victim visits or opens, which then automatically installs the malware onto the system.
	- **compromised website**: An attacker compromises a website beforehand which installs malware on any user that visits the website.
	- **stolen credentials**: attacker steals credentials via social engineering or keylogging to steal user password credentials and install malware on the system.
	- **exposed vulnerability**: use vulnerabilities in third-party packages to deliver the malware
	- **infected flash drive**: victim plugs in flash drive into their machine, installs the malware automatically.
- **Exploitation:** The malware takes advantage of a vulnerability to execute on the target system.
- **Installation:** The malware installs itself on the system, often setting up persistence to survive reboots.
- **Command and Control:** The malware connects back to the attacker’s server to receive instructions and maintain access.
- **Action:** The attacker carries out their goal, such as stealing data, defacing websites, or extorting money.

### Malware distribution tactics

#### botnets

Botnets are a legion of compromised computers called **zombies** that an attacker uses to perform the cyber-kill chain against a target.

Botnets can be formed via malware, where phishing through infected websites or files can hijack a victim's computer to be a part of the botnet.

Here is how a botnet works:

- **botmaster**: criminal who controls the command and control servers from a central server. 
- **command and control servers**: physical server racks that have the code to control botnets
- **zombies**: infected machines that work as botnets to attack targets.

There are three main use cases for botnets:

1. **DDoS attacks**: legions of zombies flood traffic to a list of targets in order to overflood their servers with requests.
2. **email spam**: legions of zombies email a certain victim with spam.


![](https://i.imgur.com/6OKRujB.jpeg)

**Botnet secrecy techniques**

To stay hidden and maintain control, botnets often change their command servers using techniques like domain generation algorithms.

Here are techniques used in a botnet in order to get away with the crime:

- **botmaster RPC encryption tactics**: the botmaster encrypts RPC calls to command and control servers to make it look like legitimate internet traffic
- **domain generation algorithms**: To stay hidden and maintain control, botnets often change their command servers using techniques like domain generation algorithms.
	- DGAs dynamically let zombies find command and control servers even if their IP addresses change.

**Zeus**

Zeus is the most notorious botnet, and is a botnet construction kit that anybody else can use.

Here's how it works:

1. Steals online credentials
2. Infects computers and smartphones by authenticating with credentials.

**Banking fraud campaign**

A banking fraud campaign in cybercrime works like this:  
  

- Organized criminals plan the campaign and select vulnerable targets through surveillance.
- Malware developers create customized malware tailored to attack specific bank websites or systems.
- A testing team ensures the malware works effectively.
- The malware is delivered and installed on victims' systems using botnets.
- Successful attacks steal funds, which are transferred to disposable bank accounts.
- Money mules, who may be small-time criminals or professional services, withdraw the stolen money as cash to break the electronic trail.

#### Alternate data streams

Malware often hides by using Windows system features designed to conceal files, such as hidden folders that are invisible in normal directory listings and Windows Explorer.

Alternate Data Streams (ADS) in NTFS allow malware to store hidden data or even executable files within a normal file, making detection difficult.

Tools like the command line with specific options (e.g., `dir /r`) can reveal these hidden streams, and special commands can execute hidden malware.

A hidden file stays hidden by attaching these file attributes to it:

- `CLSID`: hides the file when searching in the terminal
- `UICLSID`: hides the file in the file explorer


```
C:\Users\User\AppData\Local\Microsoft\Windows\History>type desktop.ini
[.ShellClassInfo]
ConfirmFileOp=0
CLSID={FF393560-C2A7-11CF-BFF4-444553540000}
UICLSID={7BD29E00-76C1-11CF-9DD0-00A0C9034933}
```



## OWASP top 10

### Broken access control

here are examples of broken access control

- Improper authorization checks, where there is no verification that a user has the necessary permissions to perform an action
- Missing authentication mechanisms, which allow users to access resources without proper authentication
- Insecure role-based access control that could result in assigning excessive permissions to users

Failure to address broken access control could allow an attacker to access confidential information, modify or delete data, or escalate privileges to obtain administrator rights.

To avoid broken access control, it's essential for front-end developers to implement proper authorization checks and validate user permissions. Additionally, back-end developers should enforce authorization rules, manage user roles and permissions, and implement robust authentication mechanisms.

### Security misconfiguration

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

### Software Supply Chain Failures

In modern development, software supply chain failures occur when there is a breakdown or compromise in the process of building, distributing, or updating software. Attackers no longer just look for known bugs in your code; they target the tools you trust. By injecting malicious code into a popular library or compromising a CI/CD pipeline, they can gain unauthorized access to systems that allows them to spread malware and steal data.

Similarly, relying on unhardened build environments or untrusted sources creates weaknesses. Even if your final application seems secure, a compromised development tool or a lack of oversight in code promotion can lead to exposure.

**mitigations**

- Maintaining a Software Bill of Materials (SBOM) to centrally track all direct and transitive dependencies to ensure full visibility of the software stack
- Automating vulnerability monitoring through tools that cross-reference your inventory against databases like the National Vulnerability Database (NVD), and Open Source Vulnerabilities (OSV)
- Removing unused dependencies, unnecessary features, components, files, and documentation
- Hardening the delivery pipeline by regularly updating CI/CD tools and IDEs while enforcing a strict separation of duties for all code promotions

### Cryptographic failures

Cryptographic failures refer to the improper handling of sensitive data, such as credit card numbers, personal information, passwords, or trade secrets. Failure to properly use cryptography can lead to that data being exposed or stolen.

Examples of cryptographic failures include storing data in plaintext, not encrypting data in transit, and exposing data through insecure APIs. These types of failures may lead to identity theft or financial fraud.

Here are some examples of how to mitigate these cryptographic failures:

- Encrypting data at rest, which effectively means locking data in a secure vault
- Encrypting data in transit and using HTTPS to protect data while it's traveling
- Limiting data access by only granting access to those who need it
- Regularly reviewing and updating security measures to keep your defenses strong

### Injection


One of the most common and dangerous vulnerabilities is injection. This occurs when an attacker introduces malicious data into an application's input points. Attackers can use injection vulnerabilities to steal or modify data or gain unauthorized access to systems.

Imagine, for example, a web application that allows users to search for products. If the input isn't properly sanitized, an attacker could inject malicious SQL code into the search query. This could allow them to access sensitive data, modify records, or even take control of the database.

Other types of injection attacks include command injection and LDAP injection. These vulnerabilities can be exploited to execute arbitrary commands on the server or gain unauthorized access to directory services.


### Insecure design

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

### Authentication failures

Authentication failures occur when weak authentication processes allow unauthorized individuals to gain access to user accounts or an application.

These failures happen when passwords are stored in plaintext, or the application uses weak hashing algorithms. Weak password policies and the lack of multi-factor authentication also contribute to this type of vulnerability.

Here are example attacks against authentication:

- Brute-force attacks, which try every possible combination of username and password to guess credentials
- Password spraying by attempting to access with the same password against multiple accounts, hoping one will work
- Credential stuffing, an automated attack using stolen usernames and passwords

### Software and Data Integrity Failures


Examples of software and data integrity failures include:

- Deserializing data from an untrusted source without proper validation
- Failing to validate user input before processing it
- Storing data in a format that is easily manipulated
- Not verifying the integrity of data during processing

### Security logging and alerting failures

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
### Mishandling of Exceptional Conditions


Mishandling exceptional conditions happens when an application fails to properly prevent, detect, or respond to unpredictable situations. Any time an application is unsure of its next instruction, an exceptional condition has been mishandled. This can lead to the application failing to prevent an unusual situation from happening and responding poorly or not at all to the situation afterwards.

These situations can negatively affect the confidentiality, availability, and integrity of a system or its data, which may allow attackers to manipulate an application's flawed error handling.

**mitigations**

- Implement monitoring tools that watch for repeated errors or patterns that indicate an on-going attack
- Catch exceptions locally to ensure that any interrupted transaction is completely rolled back rather than left in an unpredictable, half-finished state
- Use a centralized global exception handler to provide a consistent, predictable response to errors
- Add rate limiting, resource quotas, throttling, and other limits wherever possible, to prevent exceptional conditions in the first place

