## Cybersecurity basics

Cybersecurity encompasses total networked system security, extending to critical infrastructure and national defense. It unifies three related disciplines:

- **Information Security:** Protecting data assets.
- **Computer Security:** Securing individual endpoint machines and operating systems.
- **Network Security:** Securing communication channels and traffic across nodes.

### Principles of cybersecurity

These are the four main components of cybersecurity:

1. **authentication**: ensuring a user is who they say the are
2. **authorization**: ensuring a user can perform actions based on their role and preventing unauthorized actions
3. **integrity**: the process of input validation and sanitization to prevent data from being tampered
4. **data protection (secrecy)**: the process of safeguarding sensitive data from unauthorized access, modification, or disclosure.

#### CIA

Cybersecurity aims to have these three aspects in the practice, abbreviated CIA:

- **Confidentiality:** Preventing unauthorized access or disclosure.
    
- **Integrity:** Preventing unauthorized alteration, tampering, or corruption of data.
    
- **Availability:** Ensuring timely, reliable access to systems and services without disruption.



![](https://i.imgur.com/dgzLnaS.jpeg)


#### Defense in depth

Defense in depth is the concept that we should have multiple layers of security/defense to prevent a single point of failure and promote stronger defense.

#### Principle of least privilege

The concept that you should only give a user or system the least permissions possible 

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

### Terminology

We describe cybersecurity attacks with these 4 concepts

- **Method:** how did the attack work?
- **Vector:** how did the attack launch and move over time?
- **Motive:** why was the attack carried
- **Target:** who or what did the attack target

There are three types of attackers/hackers

- **hacktivists**: those who hack systems for political gain
- **script kiddies**: those who break into systems for fun

### Common Attack Patterns

- **70% of attacks are financially motivated.**
    
- **30% target secondary targets first** (e.g., HVAC vendors, third-party contractors, software libraries) to pivot into primary targets.
    
- **Legacy vulnerabilities dominate:** Most exploits leverage older, well-documented vulnerabilities rather than pure zero-days.
    
- **Crime-as-a-Service:** High-performing tools quickly become commodified (Exploit kits like RIG/Fallout, Ransomware-as-a-Service, DDoS-for-hire).
    
- **Social Engineering:** Phishing drives roughly **80%** of social engineering breaches. About 30% of phishing emails are opened, and 12% result in attachment clicks.

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


![](https://i.imgur.com/WMgsf86.jpeg)

#### The problem with the cyber kill chain

The traditional Kill Chain heavily focuses on preventing the initial perimeter breach. However, with **Advanced Persistent Threats (APTs)** and **supply chain compromises**, attackers frequently masquerade as legitimate insiders or bypass the perimeter entirely.

Modern defense must prioritize **internal lateral movement prevention**, zero-trust architecture, and detecting malicious behavioral anomalies from valid authenticated accounts.

### History of cyber attacks

- **1980s (Early Intrusions & Worms):**
    
    - _Kevin Poulsen (Dark Dante, 1983):_ Breached DoD classified research systems; later served as a military cybersecurity consultant before being indicted for telecom/computer fraud.
        
    - _Morris Worm (Robert Tappan Morris, 1988):_ The first denial-of-service worm of its kind.
        
- **2005 (Web Applications & XSS):**
    
    - _Samy Worm (Samy Kamkar):_ First major cross-site scripting (XSS) worm; infected over 1 million MySpace users in just 20 hours.
        
- **2007–2010 (Nation-State & Kinetic Warfare):**
    
    - _Syrian Air Defense Hack (2007):_ Electronic spoofing used to mask an airstrike on a suspected nuclear site.
        
    - _Estonia DoS (2007):_ Large-scale Russian denial-of-service attacks triggered by a dispute over a war memorial.
        
    - _Stuxnet (2010):_ Malware engineered to cause physical destruction of Iranian nuclear centrifuges.
        
- **2014 (Retail & Financial POS Breaches):**
    
    - _Sony Pictures (Shamoon/Disstrack):_ Payment cards exposed, internal communications exfiltrated, and workstations wiped.
        
    - _Target & Home Depot:_ Massive point-of-sale (POS) malware infiltrations via third-party vendor credentials, exposing 90M and 100M records respectively.
        
    - _JPMorgan Chase:_ Compromised systems exposing 76M records.
        
- **2015–2016 (Ransomware, IoT, & Election Interference):**
    
    - _Healthcare Breaches:_ Anthem (80M records), Premera, and Excellus targeted.
        
    - _Critical Infrastructure:_ BlackEnergy malware causing regional power outages in Ukraine.
        
    - _Mirai Botnet (2016):_ Massive DDoS attacks leveraging default credentials on IoT devices to disrupt DynDNS and Krebs on Security.
        
    - _2016 US DNC Hacks:_ Spearphishing campaigns targeting Google accounts (e.g., John Podesta), exfiltrating emails via encrypted tunnels.
        
- **2019–2021+ (Software Supply Chain & Protestware):**
    
    - _SolarWinds (2019–2020):_ Nation-state actors inserted backdoors directly into the Orion build/CI pipeline, distributing malicious updates to 18,000 entities, including US federal agencies.
        
    - _Package Ecosystem Threats:_ Typosquatting and dependency confusion targeting PyPI, npm, and RubyGems.
        
    - _Protestware (2022):_ Maintainers injecting destructive payloads (e.g., the `node-ipc` incident wiping machines in Russia/Belarus) into popular open-source dependencies.

#### **Morris Worm**

The morris worm reinfected computers over and over again until they ran out of memory, taking down 10% of the internet at the time.

The morris worm is significant because it led to the development of computer response teams.

#### **2017 equifax**

Over 143 million data records were stolen, affecting over 40% of Americans. Equifax had the ability to prevent this, but didn’t take it seriously enough. They ended up paying $575 million.
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

### Types of attacks

#### Phishing and social engineering

**Social engineering** is a manipulation technique that exploits human error to gain private information from them, and then contact them with the intention to *phish* them.

**Phishing** is the use of digital communications to trick people into revealing sensitive data or deploying malicious software.

- **Business Email Compromise (BEC):** A threat actor sends an email message that seems to be from a known source to make a seemingly legitimate request for information, in order to obtain a financial advantage.
- **Spear phishing:** A malicious email attack that targets a specific user or group of users in a company. The email seems to originate from a trusted source.
- **Whaling:** A form of spear phishing. Threat actors target company executives to gain access to sensitive data.
- **Vishing:** The exploitation of electronic voice communication to obtain sensitive information or to impersonate a known source.
- **Smishing:** The use of text messages to trick users, in order to obtain sensitive information or to impersonate a known source.

### Cybercrime and the law

Cybercrime is a crime involving computers. The computer is either the tool, target, or place of the crime.

Cybercrime is a low risk, high reward crime because you can get a lot of money, and if you work internationally instead of domestically, you are unlikely to be caught, because it’s difficult to trace network communications

Here is the legal definition of cybercrime:

- **Traditional Crime:** Engaging in conduct outlawed by a human social grouping.
    
- **Cybercrime:** The commission of a crime that involves the use of computer technology.
    
- **The Three Legal Categories of Cybercrime:**
    
    1. **Computer as the Target (or Victim):** Attacking a system directly via unauthorized access or code injection.
        
        - _Access target crimes:_ Exceeding authorized access or breaking in without authorization to read, store, or manipulate data.
            
        - _Code target crimes:_ Malware, viruses, worms, and Denial-of-Service (DoS) attacks that impair availability or data integrity.
            
    2. **Computer as a Tool:** Using a machine to execute traditional crimes (e.g., wire fraud, identity theft, financial embezzlement). The tool facilitates execution, but the underlying statutory violation remains the same.
        
    3. **Computer as Incidental:** The device serves merely as physical or digital evidence (e.g., a drug distributor keeping an inventory spreadsheet, or an extortionist sending an email).

Here's some terminology

- **trespass:** If you’re not privileged to enter a system but you try entering it anyway, you commit a trespass crime.
- **burglary:** If you steal data after trespassing it, then you commit burglary
- **simple hacking:** Gaining access to a computer without being authorized to do so.


There's a  direct comparison between **1930s criminals adopting the automobile** and modern cybercriminals adopting the internet:

- **cars**: In the 1930s, cars allowed criminals to plan an offense in one state, execute it in a second, and escape to a third before local police could coordinate across jurisdictional boundaries.
- **internet**: The internet amplifies this advantage dramatically:
    
    - **Remote execution:** Perpetrators operate globally without physical presence.
        
    - **Anonymity:** Obfuscation layers make tracing IP addresses and digital footprints complex.
        
    - **No physical getaway:** There is no traditional crime scene to flee or cordon off.
        
    - **High Reward, Low Risk:** Global syndicates extract millions, while international borders and non-extradit

To be charged with a crime, you have to benefit from the crime.

- **theft:** stealing property and money for your benefit
- **fraud:** stealing property and money willingly based on false pretenses. To be charged with fraud, you need to benefit from the fraud.

#### **US patriot act**

If a person from another country attacks the US through cybercrime, then they can be charged with a USA crime.

However, this will only work if the other country allows the USA to prosecute those criminals.

#### **Gramm-Leach-Bliley Act (GLBA)**

The GLBA act was made to protect consumer information, meaning that companies have to disclose their privacy practices to their customers

#### **CFAA act 1984**

The Computer Fraud and Abuse Act (CFAA) of 1984 is a United States federal law that was enacted to address the growing concerns over computer-related crimes and unauthorized access to computer systems. Nixon pushed this law after watching _War Games_.

The CFAA act made it illegal to do unauthorized damage to computer systems.

#### **Economic Espionage act 1996**

The main purpose of the EEA is to protect trade secrets and intellectual property from theft, especially from foreign governments.

#### Mitigations

- Having a two-man system: Collusion with two people is harder to achieve than one malicious bad actor.


### Case studies

#### Bullitt County, KY (2009)

- **The Incident:** Ukrainian actors deployed the **Zeus Trojan** keylogger to a county treasurer's workstation, capturing credentials and opening a remote shell.
    
- **Bypassing Controls:** The bank required dual authorization (treasurer and county judge). Hackers logged in from the treasurer's machine (bypassing IP/hardware fingerprinting), changed the judge's email/password settings, authorized wire transfers, and routed $415,989 across 25 domestic money mules recruited via fake transcription job postings.
    
- **Takeaway:** Highlights the vulnerability of dual-control workflows to compromised internal endpoints and demonstrates the low-risk/high-reward profile of cross-border syndicates.
    

#### The "Robin Hoode" Dilemma (2001)

- **The Scenario:** A hacker altered casino game code so slot machines and craps games constantly hit payouts, transferring $1.9M across 140 random players without the hacker taking any money directly.
    
- **Legal Dilemma:**
    
    - _Theft?_ Traditional theft requires "taking and carrying away personal property with intent to steal." Hoode never took or kept the funds.
        
    - _Fraud?_ Fraud typically requires false representations made to another human, inducing them to give up property. Here, an automated machine carried out the skewed logic, and the benefactor was not the perpetrator.
        

#### Port of Houston & Aaron Caffrey (2001) — Cyber Forensics Defense

- **The Case:** A DoS attack took down Port of Houston systems; logs led directly to the UK residence of 18-year-old Aaron Caffrey. Attack software was recovered directly on his machine.
    
- **The Defense:** Caffrey claimed a Trojan had infected his computer, executed the attack on behalf of third parties, and deleted itself while forging local logfiles to frame him.
    
- **The Verdict:** The jury acquitted Caffrey, exposing a major hurdle in cyber litigation: the inherent difficulty in proving physical keyboard presence vs. an automated remote compromise beyond a reasonable doubt.
    

#### Mirai Botnet & Corporate Vendor Liability (2016–2019)

- **The Shift to IoT:** The 2016 Mirai botnet harnessed millions of default-credential IoT devices to launch massive DDoS attacks against KrebsOnSecurity (600+ Gbps) and DynDNS (knocking out major platforms like Netflix, Twitter, and Amazon).
    
- **Legal Repercussions:** In January 2017, the FTC sued router/camera manufacturer **D-Link**, alleging failures to patch software, hardcoded credentials, and compromised private code-signing keys. The 2019 settlement set a legal precedent: hardware/software vendors face regulatory liability and required security oversight for failing to follow reasonable security-by-design standards.


### Protection against hackers
![](https://i.imgur.com/9kAxHKk.jpeg)


## Code attacks

### 4 main attacks

Here is an in-depth breakdown of each attack, how it operates under the hood, and how to defend against it based on the slides.

  

---

#### 1. Stack Buffer Overflow

A buffer overflow occurs when a program writes more data into an allocated memory buffer than it was sized to hold, causing the excess data to spill over into adjacent memory spaces.

  

- **Memory Context:** When a function executes, a call stack frame is pushed into memory. It stores function parameters, local variables, frame pointers, and crucially, the **return address** (which tells the CPU where to resume execution once the function finishes).
    
      
    
- **The Mechanism:**
    
      
    1. A function allocates a fixed-size local buffer on the stack (e.g., `char buf[64];`).
        
          
        
    2. The program reads user-controlled input into that buffer without bounds checking (e.g., using `gets()` or unbounded `strcpy()`).
        
          
        
    3. The input exceeds the buffer size, writing past the buffer boundary, overwriting local variables, the frame pointer, and finally the **saved return address**.
        
          
        
    4. The attacker crafts the input to replace the return address with the memory address of injected **shellcode** (often preceded by a **NOP sled** to improve landing reliability) or uses techniques like _jump-to-register_.
        
          
        
    5. When the function returns, execution diverts straight into the attacker's payload.
        
          
        
- **Why Bytecode/Interpreted Languages Are Still At Risk:** While managed runtimes (like Java, Python, or C#) have built-in array bounds checking, they become vulnerable whenever they load or interface with unmanaged native binaries (e.g., via JNI or C extensions).
    
      
    
- **Defenses:**
    
      
    - Use safe, bounded memory APIs (e.g., `fgets()` or `strncpy()` instead of `gets()` or `strcpy()`).
        
          
        
    - Enforce OS-level protections: **DEP / Executable Space Protection** (marking memory regions like stack/heap as non-executable via the NX/XD bit) and **ASLR** (randomizing memory layouts).
        
          
        

---

#### 2. Heap Overflow

Heap overflows occur in dynamic memory—the pool allocated at runtime (via `malloc()`, `new`, etc.) rather than on the call stack.

  

- **The Mechanism:**
    
      
    - Dynamic memory is managed in chunks, with each chunk containing **heap metadata/headers** (such as chunk size, allocation status, and pointers to adjacent chunks).
        
          
        
    - When an attacker writes past the boundary of a dynamically allocated heap buffer, they corrupt these internal heap control structures or adjacent dynamic objects.
        
          
        
    - Common triggers include integer overflows during memory calculation (under-allocating memory), unchecked copying to dynamic buffers, or triggering **use-after-free** vulnerabilities where dangling pointers access freed heap blocks.
        
          
        
    - When the memory allocator subsequently manipulates the corrupted heap (such as coalescing or freeing chunks), the overwritten pointers allow the attacker to redirect arbitrary memory pointers or execute shellcode.
        
          
        
- **Stack vs. Heap Overflow:**
    
      
    - _Stack:_ Directly targets the execution flow by overwriting the function return address in the active call frame.
        
          
        
    - _Heap:_ Indirectly hijacks control by corrupting dynamic data structures, function pointers, or heap management metadata.
        
          
        

---

#### 3. Cross-Site Scripting (XSS)

XSS occurs when an application includes untrusted user input directly in a web page without adequate validation or escaping, causing the victim's browser to execute it as malicious JavaScript within the application's security context.

  

- **Primary Variants:**
    
      
    - **Reflected XSS:** The malicious payload is part of the request itself (e.g., a URL parameter like `?search=<script>...`). The server reflects this exact input into the immediate response. Execution happens only for the user clicking that specific link.
        
          
        
    - **Persistent (Stored) XSS:** The payload is stored permanently in the database (e.g., forum comment, user profile name, email subject). Every time other users view that data, the script executes automatically in their browsers.
        
          
        
    - **DOM-based XSS:** The vulnerability exists entirely on the client side. JavaScript reads untrusted data from a sink (e.g., `location.search`, `document.referrer`) and injects it unsafely into the DOM (e.g., `element.innerHTML = ...`) without the payload ever needing to touch the server.
        
          
        
    - **Cross Channel Scripting (XCS):** Payloads arrive via non-HTTP protocols (such as syslog entries, RADIUS fields, or SSL certificate strings) and are later rendered unescaped on a web management console.
        
          
        
- **The Threat:** Attackers can hijack active sessions, deface pages, exfiltrate cookies/tokens, or scan internal networks behind corporate firewalls.
    
      
    
- **Defenses:**
    
      
    - Context-aware output encoding/sanitization before inserting data into HTML, attributes, or script blocks.
        
          
        
    - Implementing a strict **Content Security Policy (CSP)** header to restrict unauthorized script sources and disable inline script execution.
        
          
        
    - Setting `HttpOnly` flags on session cookies so JavaScript cannot access them.
        
          
        

---

#### 4. Cross-Site Request Forgery (CSRF)

CSRF is an attack that tricks an authenticated user into executing unwanted actions on a trusted web application without their knowledge.

  

- **Core Distinction from XSS:**
    
      
    - **XSS** exploits the client's trust in the server (the browser believes whatever script the server sends is legitimate).
        
          
        
    - **CSRF** exploits the server's trust in the client (the server trusts requests coming from an authenticated browser session).
        
          
        
- **The Mechanism:**
    
      
    1. A victim logs into a sensitive site (e.g., their banking portal) and receives a session cookie.
        
          
        
    2. Without logging out, the victim visits a malicious site or views an email containing an embedded tag (e.g., `<img src="[https://bank.com/transfer?amount=1000&to=attacker](https://bank.com/transfer?amount=1000&to=attacker)">`).
        
          
        
    3. The victim's browser automatically appends the valid session cookies along with the cross-origin request.
        
          
        
    4. The banking server validates the cookie, believes the user intentionally initiated the action, and executes the transfer.
        
          
        
- **Defenses:**
    
      
    - **Anti-CSRF Tokens:** The server generates a unpredictable, cryptographically random token tied to the user's session and embeds it in forms. The server strictly validates this token on state-changing requests (`POST`, `PUT`, `DELETE`).
        
          
        
    - **SameSite Cookie Attribute:** Setting `SameSite=Strict` or `SameSite=Lax` on session cookies to prevent the browser from automatically sending them with cross-site requests.
        
          
        

---

Would you like to walk through a concrete vulnerable code snippet from the slides (like the C buffer overflow exercises) and fix it step by step?

### SQL injection

- **input validation:** validate user input and sanitize it
- **prepared statements:** Use prepared statements or stored procedures to prevent passing SQL command queries into your database query from the user-supplied data
- **least privilege:** put your database on least privilege
- **role-based access control:** authorization for user accounts
- **server-side validation:** do not depend on client-side validation. use server-side validation

### XSS

Reflected XSS is what happens when an attacker gives user input, and attack is reflected into the browser.

For example, on a procedure where the website alerts something the user, the attacker could insert a script that makes the server display all the emails of other users, and then that will get sent back in the alert.

Here are the different types of XSS attacks you can have:

- **reflected XSS:** Input is executed as javascript on the client’s side
- **persistent XSS:** Input is stored in server database and rendered on client every time by server.

To mitigate against XSS, you have these options:

- **server-side validation:** Always validate on the server.

### CSRF

Stealing session id cookie from other users to masquerade as being authenticated as that user

Use CSRF tokens to uniquely identify each page for each user. This way the server can manage the session information well.
## OWASP top 10

OWASP is a non-profit foundation that handles securing software and creating open source tools for cybersecurity.

| **#**   | **Vulnerability**                            | **Primary Mitigation**                                                   |
| ------- | -------------------------------------------- | ------------------------------------------------------------------------ |
| **A01** | **Broken Access Control**                    | Rigorous role enforcement, strict authorization checks, thorough testing |
| **A02** | **Cryptographic Failures**                   | Data classification, robust encryption at rest/transit, DRM              |
| **A03** | **Injection** (SQL, OS, LDAP, XSS)           | Parameterized queries, input sanitization, threat modeling               |
| **A04** | **Insecure Design**                          | Threat modeling, secure architectural design patterns                    |
| **A05** | **Security Misconfiguration**                | Automated hardening, disabling unnecessary services, safe defaults       |
| **A06** | **Vulnerable & Outdated Components**         | Software Composition Analysis (SCA), continuous dependency management    |
| **A07** | **Identification & Authentication Failures** | Multi-factor authentication (MFA), standardized auth frameworks          |
| **A08** | **Software & Data Integrity Failures**       | Code signing, pipeline integrity checks, verified artifact sources       |
| **A09** | **Security Logging & Monitoring Failures**   | Centralized tamper-proof logging, SIEM alerts, active monitoring         |
| **A10** | **Server-Side Request Forgery (SSRF)**       | Network segmentation, URL validation, and input sanitization             |


![](https://i.imgur.com/SEMitpY.jpeg)

![](https://i.imgur.com/AI2wpJy.jpeg)





### Quickstart

Here is a practical, code-level mapping of the OWASP Top 10 vulnerabilities to concrete defensive design patterns and implementation practices.

---

#### 1. Broken Access Control (A01)

* **Vulnerability:** Insecure Direct Object References (IDOR), missing function-level authorization, or bypassing path protections.
* **Anti-Pattern:** Relying on client-side state or directly trusting route parameters without checking authorization context:
```ts
// Vulnerable: trusts client-supplied documentId unconditionally
app.get('/api/document/:id', async (req, res) => {
  const doc = await db.documents.findUnique({ where: { id: req.params.id } });
  return res.json(doc);
});

```


* **Defensive Pattern:** **Scoped Query Context & Centralized Policy Enforcement (RBAC/ABAC)**. Force every retrieval query to bind to the authenticated subject's scope:
```ts
// Defensive: implicitly scopes access to the authenticated user ID
app.get('/api/document/:id', requireAuth, async (req, res) => {
  const doc = await db.documents.findFirst({
    where: { 
      id: req.params.id, 
      ownerId: req.user.id // Enforced at the persistence boundary
    }
  });
  if (!doc) return res.status(404).json({ error: 'Not found' });
  return res.json(doc);
});

```



---

#### 2. Cryptographic Failures (A02)

* **Vulnerability:** Using deprecated algorithms (MD5, SHA-1), storing plaintext secrets, or weak PRNGs for token generation.
* **Defensive Pattern:** **Adaptive Work-Factor Hashing & Envelope Encryption**.
* Use adaptive functions (Argon2id, bcrypt) with high work factors for passwords.
* Use cryptographic pseudorandom generators (`crypto.randomBytes`) instead of standard math libraries (`Math.random`).
* Enforce TLS 1.3 in transit with `Strict-Transport-Security` headers.



---

#### 3. Injection (A03: SQL, Command, XSS)

* **Vulnerability:** Concatenating untrusted user input directly into interpreters (SQL engines, shells, DOM parsers).
* **Anti-Pattern:**
```python
# Vulnerable: string concatenation leads to SQL injection
cursor.execute(f"SELECT * FROM users WHERE email = '{user_input}'")

```


* **Defensive Pattern:** **Parameterized Queries & Contextual Output Encoding**.
```python
# Defensive: separation of code and untrusted data
cursor.execute("SELECT * FROM users WHERE email = %s", (user_input,))

```


* For frontend XSS: Rely on framework JSX/template auto-escaping and set a strict `Content-Security-Policy` header. Never use raw sinks like `dangerouslySetInnerHTML` or `innerHTML`.



---

#### 4. Insecure Design (A04)

* **Vulnerability:** Architectural flaws that cannot be solved by perfect implementation (e.g., missing rate limits on credential resets, credential enumeration).
* **Defensive Pattern:** **Threat Modeling & Rate-Limiting Gateways**.
* Implement token bucket rate limiting on authentication and sensitive state endpoints.
* Enforce time-constant responses across auth flows to prevent side-channel timing attacks or user enumeration.



---

#### 5. Security Misconfiguration (A05)

* **Vulnerability:** Default passwords, debug error tracebacks exposed to end users, unnecessary HTTP methods enabled.
* **Defensive Pattern:** **Hardened Middleware Stacks & Automated Policy-as-Code**.
* Use security header wrappers (e.g., `helmet` in Node.js) to strip framework identifiers (`X-Powered-By`) and set `X-Frame-Options: DENY`.
* Centralize exception handlers so stack traces are logged internally but sanitized to a generic correlation ID for the client.



---

#### 6. Vulnerable and Outdated Components (A06)

* **Vulnerability:** Transitive dependencies containing known CVEs, malicious packages, or typosquatting.
* **Defensive Pattern:** **Automated SCA (Software Composition Analysis) & Pinned Lockfiles**.
* Run CI dependency scanners (Dependabot, Snyk, `npm audit --audit-level=high`) to block pipelines on known vulnerabilities.
* Commit exact lockfiles (`package-lock.json`, `poetry.lock`) to avoid unexpected upstream changes during builds.



---

#### 7. Identification and Authentication Failures (A07)

* **Vulnerability:** Permitting brute-force attacks, session fixation, or weak session cookies.
* **Defensive Pattern:** **Strict Session Flags & Re-Authentication Barriers**.
* Cookie attributes: Always configure `Secure`, `HttpOnly`, and `SameSite=Strict` or `Lax` to neutralize cookie theft and CSRF.
* Invalidate active session tokens entirely on server-side logout and privilege escalation.



---

#### 8. Software and Data Integrity Failures (A08)

* **Vulnerability:** Deserializing untrusted JSON/binary structures directly into memory objects, or executing unverified CI/CD artifacts.
* **Defensive Pattern:** **Schema Validation & Cryptographic Checksums**.
* Parse untrusted payloads strictly through typed schemas (e.g., Zod, Pydantic) that discard unknown keys, rather than raw deserializers (`eval()`, Python `pickle`, `unserialize()`).
* Sign CI build outputs and dependencies using tools like Cosign/Sigstore before promotion to production.



---

#### 9. Security Logging and Monitoring Failures (A09)

* **Vulnerability:** Sensitive events occurring silently, or logging plaintext credentials/PII.
* **Defensive Pattern:** **Structured Audit Logging with PII Redaction**.
* Log contextual security events (login failures, permission changes, token revocation) with consistent schemas (timestamps, actor IDs, IP, status code).
* Implement redaction filters at the logging interface level to mask tokens, passwords, and PII before writing to disk or forwarders.



---

#### 10. Server-Side Request Forgery (SSRF) (A10)

* **Vulnerability:** Server fetching a remote URL supplied by an attacker, exposing internal networks (e.g., AWS metadata endpoint `169.254.169.254`).
* **Anti-Pattern:**
```ts
// Vulnerable: fetching user-supplied URL directly
app.post('/fetch-preview', async (req, res) => {
  const response = await fetch(req.body.imageUrl);
  // ...
});

```


* **Defensive Pattern:** **Positive IP Whitelisting & DNS Pinning**.
* Resolve domain names server-side and block connections to private/loopback/link-local ranges (`127.0.0.0/8`, `10.0.0.0/8`, `169.254.0.0/16`).
* If fetching external assets, route outbound traffic through a dedicated forward proxy with restricted network egress.

### Broken access control

Broken access control comes as a result of both authentication and authorization flaws, such as manipulating user IDs or exploiting APIs that assume trust.


![](https://i.imgur.com/unCaK6v.jpeg)


- **authentication flaws**: attackers are able to hijack authentication state somehow via manipulation of user IDs or exploiting APIs that assume trust

here are examples of broken access control

- Improper authorization checks, where there is no verification that a user has the necessary permissions to perform an action
- Missing authentication mechanisms, which allow users to access resources without proper authentication
- Insecure role-based access control that could result in assigning excessive permissions to users

Failure to address broken access control could allow an attacker to access confidential information, modify or delete data, or escalate privileges to obtain administrator rights.

To avoid broken access control, it's essential for front-end developers to implement proper authorization checks and validate user permissions. 

Additionally, back-end developers should enforce authorization rules, manage user roles and permissions, and implement robust authentication mechanisms.

> [!NOTE]
> Broken access control happens when an app's permissions fail, allowing unauthorized users to access or modify data or functions.

Best practices to prevent this include applying the principle of least privilege, using role-based permissions with CRUD operations, practicing deny by default, logging access control failures, rate limiting APIs, and hardening web servers to block unauthorized access.

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

## Vulnerabilities

### CVE and CVSS

CVE (common vulnerabilities and exposures) catalog cyber vulnerabilities.

> [!NOTE]
> CVE is maintained by MITRE.

CVSS stands for common vulnerability scoring system, and is a universal way of assessing how bad a CVE vulnerability in software is.

There are three metrics that go into determining the score of a certain vulnerability.

- **base metrics:** Intrinsic factors of a vulnerability, like attack vector and complexity
- **temporal metrics:** Factors of a vulnerability that may change over time
- **environmental metrics:** These represent the characteristics of a vulnerability in a specific environment

Here are some things that determine the severity of a vulnerability.

- **Attack vector:** Could be done from online, on a local network, or has to be done by using the target’s physical machine. It’s worse if you could exploit the vulnerability remotely.
    - There are 4 different types of attack vectors possible:
        - **network:** on the internet
        - **adjacent:** From a local network
        - **local:** Phishing a user or using a terminal locally
        - **physical:** Touching the computer directly to hack it
- **Attack complexity:** Low complexity means it’s simple to exploit, high complexity means only someone skilled could do the exploit.
- **Privileges required:** Vulnerability is worse if you don’t need any privilege to do the exploit, as opposed to high privilege required.
- **User interaction:** Worse if no user interaction is required for the exploit is triggered

### EPSS

EPSS means Exploit prediction scoring system, and is a daily estimate of the probability of exploitation activity being observed over the next 30 days.



![](https://i.imgur.com/ZYH6Atj.jpeg)




![](https://i.imgur.com/xZJKeey.jpeg)

### Authentication vulnerabilities

A _back door_ is when you’re developing an authentication system, and you make a shortcut during development to authenticate easier. Such back doors can be exploited.

Here are some ways to mitigate back doors.

- Do not hardcode secrets
- Document what you’re doing, so team members know about the existence of the back door

### Authorization vulnerabilities

A common problem with authorization is that protection is done client side, meaning we hide elements that need a certain level of authorization to use.

The problem is that the DOM is easily manipulable and thus a malicious user could just make it visible again.

Here are four authorization flaws:

- missing authorization
- incorrect authorization
- Least Privilege violations
- Backdoors

### Information leakage

Information leakage is when you leak sensitive user data that isn’t supposed to be leaked, like passwords and credit card numbers.

Here are some ways to defend against information leakage:

- Always encrypt data
- Never store sensitive data in logs. If you don’t need it, delete it.

### Threat Modeling

Threat modeling is a tool used to brainstorm possible threats and corresponding mitigations, where you set up a table with the threat description in one column, and the mitigation for that threat in the next column.



![](https://i.imgur.com/0GFZIma.jpeg)


#### **STRIDE**

- **spoofing:** Impersonating something or someone else. To mitigate against this, use strong passwords.
- **tampering:** Modifying data, code, or packets. To mitigate against this, encrypt data
- **repudiation:** Claiming to have not performed an action, like deleting tax evasion info. To mitigate against this, have adequate logging
- **information disclosure:** Exposing information to unauthorized agents
- **Denial of service:** Using DDOS attacks to crash a website
- **Elevation of privilege:** Gaining privileges without proper authorization

## Configuration Hardening

### Best practices

#### OWASP ASVS

THe OWASP ASVS is a PDF that provides info on how to test web applications and harden them.

#### OWASP cheatsheets

COncise cheat sheets on how to mitigate against vulnerabilities:

```embed
title: "Index Top 10 - OWASP Cheat Sheet Series"
image: "https://cheatsheetseries.owasp.org/assets/OWASP_Logo.svg"
description: "Website with the collection of all the cheat sheets of the project."
url: "https://cheatsheetseries.owasp.org/IndexTopTen.html"
favicon: ""
aspectRatio: "100.38314176245211"
```


#### CIS benchmarks

CIS benchmarks are very specific actions one can take that are essential for improving security hardening in several ways:

1. **Configuration Guidelines**: CIS benchmarks provide standardized configuration guidelines for various systems, including operating systems, applications, and network devices. These benchmarks help organizations ensure they are following best practices for security.
    
2. **Checklist for Validation**: They serve as a checklist to validate that security measures have been implemented correctly. For example, if someone builds a vanilla server, using the benchmarks allows you to verify their hardening efforts against established guidelines.
    
3. **Levels of Implementation**: CIS benchmarks are categorized into levels (Level 1 and Level 2). Level 1 benchmarks are designed to enhance security without affecting the usability of the system, while Level 2 benchmarks may have usability implications but offer enhanced security. This allows organizations to choose the level of security that is appropriate for their needs.

You can refer to the giant PDF list of benchmarks for what to do

```embed
title: "CIS Benchmarks"
image: "https://learn.cisecurity.org/l/799323/2020-03-30/jw9z/799323/22985/CIS_Benchmarks.png_width_250_name_CIS_Benchmarks.png"
description: "Center for Internet Security Benchmarks Download Form"
url: "https://learn.cisecurity.org/benchmarks"
favicon: ""
aspectRatio: "14.227642276422763"
```

#### CIS controls

CIS Controls are a set of best practices designed to enhance the security posture of organizations. Here are the 18 CIS Controls explained briefly:

1. **Inventory and Control of Enterprise Assets**: Ensure an inventory of all physical devices and systems within the organization so that you know what assets exist.
    
2. **Inventory and Control of Software Assets**: Maintain an inventory of all software programs including licenses and versions to avoid unauthorized or outdated software.
    
3. **Data Protection**: Implement processes and technical controls to securely manage data, including classification, storage, and disposal.
    
4. **Secure Configuration of Enterprise Assets and Software**: Maintain and enforce secure configurations of the systems and software, such as managing settings via group policies.
    
5. **Account Management**: Securely manage user accounts and permissions, implementing principles like least privilege.
    
6. **Access Control Management**: Implement policies for granting, controlling, and monitoring access to systems and data.
    
7. **Security Awareness and Skills Training**: Provide training to employees to make them aware of security risks and best practices.
    
8. **Incident Response Management**: Establish processes and plans for detecting, responding to, and recovering from security incidents.
    
9. **Penetration Testing**: Regularly test the security measures in place by simulating attack scenarios to identify and fix vulnerabilities.
    
10. **Malware Defenses**: Implement measures to detect and prevent malware.
    
11. **Vulnerability Management**: Regularly identify, assess, and remediate vulnerabilities in software and systems.
    
12. **Logging and Monitoring**: Implement logging and monitoring mechanisms to maintain visibility over systems and detect potential security incidents.
    
13. **Security Configurations**: Maintain secure configurations for software and hardware, ensuring they are not left in insecure state.
    
14. **Account Monitoring and Control**: Monitor accounts for unusual activity and enforce account controls.
    
15. **Secure Network Management**: Ensure network security including segmentation, firewalls, and controlling network traffic.
    
16. **Application Software Security**: Incorporate security in the software development process to address vulnerabilities early on.
    
17. **Implementation of Security Policies**: Establish and enforce security policies to guide security practices across the organization.
    
18. **Threat Intelligence and Vulnerability Intelligence**: Utilize external threat intelligence to inform and enhance your security posture.

### Bell-LaPadula model

The Bell-LaPadula model is designed to enforce confidentiality in a system.

Each user is assigned a specific clearance level, and each object is assigned a specific security level. You have two main rules:

- **no read up:** No user can read an object that has a higher security level than the user’s clearance level
- **no write down:** No user can write to an object with a lower security level than the user’s clearance level (prevents leaking info to lower security levels)


### **Biba model**

The biba model is designed to enforce integrity in a system.

Each object is assigned a specific integrity level (low, medium, high), and gives us these two rules:

- **no read down:** Objects cannot write to another object with a higher integrity level.
- **no write up:** Objects with a higher integrity level cannot read data from objects with a lower integrity level.

## Sockets

A socket comes down to a simple formula: **IP Address + Port number**, so a socket is a port that’s listening and open for as long as you want it to, and multiple clients can connect to the same socket.

The socket and client can send messages back and forth.