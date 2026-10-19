---
aliases:
---
## The Enterprise Java Ecosystem

### JVM, JRE, JDK

In languages like C or C++, source code is compiled directly into machine code (binary instructions: `010101...`) that only runs on a specific operating system and processor architecture (e.g., Windows x86_64, macOS ARM64).

Java introduced the famous motto: **"Write Once, Run Anywhere" (WORA)**.
To achieve this, Java does not compile to native machine code. Instead:
1. **Source code (`.java` or `.kt`)** is compiled into **Bytecode (`.class`)**.
2. Bytecode is a standardized intermediate instruction set.
3. The **Java Virtual Machine (JVM)** is a software runtime installed on your OS that reads this bytecode and translates it on-the-fly (via Just-In-Time compilation / JIT) into native CPU instructions.

```
+------------------+      +-------------------+
|  Java Code       |      |  Kotlin Code      |
|  (HelloWorld.java)      |  (HelloWorld.kt)  |
+--------+---------+      +---------+---------+
         |                          |
   javac |                    kotlinc
         v                          v
    +----+--------------------------+----+
    |      Bytecode (.class files)       |
    |      (e.g., HelloWorld.class)      |
    +-----------------+------------------+
                      |
                      v
    +-----------------+------------------+
    |      Java Virtual Machine (JVM)    |
    +-----------------+------------------+
                      |
     +----------------+----------------+
     |                                 |
     v                                 v
[Windows x64]                    [Linux ARM64]
```

You will constantly see these three acronyms. Here is the hierarchy:

| Term | Full Name | What it Contains | Who Needs It? |
| :--- | :--- | :--- | :--- |
| **JVM** | Java Virtual Machine | Just the execution engine that runs `.class` bytecode. | Computers running JVM apps. |
| **JRE** | Java Runtime Environment | JVM + standard libraries (e.g., `java.lang`, `java.util`). | End users running pre-compiled apps (largely deprecated in favor of packaged JDKs). |
| **JDK** | Java Development Kit | JRE + JVM + Compilers (`javac`, `kotlinc`), Debuggers, and tools (`jar`, `javap`). | **Developers and build tools (like Maven & Gradle).** |

> 💡 **Key Takeaway:** As a developer, you **always install a JDK**, not just a JRE or JVM.
#### JVM

You can create bytecode from java files using JVM, and that bytecode can run on any machine that has the JVM.

The JVM does not care what language you wrote in. As long as a compiler produces valid JVM bytecode, the JVM will execute it!

- **Java (`.java`)**: The original static, object-oriented language compiled with `javac`.
- **Kotlin (`.kt`, `.kts`)**: Modern, concise, null-safe language developed by JetBrains, compiled with `kotlinc`. Fully interoperable with Java (Kotlin can call Java classes, and Java can call Kotlin classes without wrappers!).
- **Groovy (`.groovy`)**: Dynamic, flexible scripting language historically used in Gradle build scripts and Jenkins pipelines.
- **Scala (`.scala`)**: Advanced object-functional language popular in big data (Apache Spark).

Kotlin is fully interoperable with Java, which means Kotlin works great with all existing Java [source code](https://hyperskill.org/learn/step/4350 "In Kotlin, a source code is a set of instructions and statements written in the Kotlin programming language. | These instructions are used to create programs, functions, and data structures. Source code can include various elements such as keywords, identifiers, expressions, blocks, and comments. Keywords are reserved words that have special meanings in the language, while identifiers are names given to variables, functions, and classes. Expressions are pieces of code that produce a single value, and blocks are groups of statements enclosed in curly braces. Comments are ignored by the compiler and are used to explain parts of the code.") and libraries. It also allows companies to make a gradual migration from Java to Kotlin because Java code can access Kotlin code, too. At the same time, developers can use Kotlin as the only language for their projects without Java at all.

A **build tool** is a program that automates the process of creating executable applications from source code.

Here are the two main build tools: Maven and Gradle.


#### kt vs kts

- **`.kt`**: Standard Kotlin source file. Intended to be compiled into classes and packaged into applications/libraries.
- **`.kts`**: Kotlin Script file. Intended to be executed directly as a script (e.g., TeamCity's `settings.kts` or Gradle's `build.gradle.kts`).

#### Distributable file types

```embed
title: "Hyperskill — Learn programming, create apps"
image: "https://hyperskill.org/static/hyperskill-hypercover.png"
description: "Get theory, practice coding, and move beyond programming challenges to building your own working projects. Join over 700 000 learners at Hyperskill."
url: "https://hyperskill.org/learn/step/4311"
favicon: ""
aspectRatio: "52.5"
```

There are three main distributable files:

- `.class`: A single compiled file containing the bytecode for one class or interface.
- `.jar`: A `.jar` file is simply a standard **ZIP archive** containing: 
	- Compiled `.class` files.
	- Resource files (images, configs, XML, JSON).
	- A `META-INF/MANIFEST.MF` file (which can specify metadata and the `Main-Class` to run).
- `.war`: A `.jar` structured specifically for deployment into a Java Servlet container (like Apache Tomcat, Jetty, or WildFly), containing web assets (`WEB-INF/web.xml`, HTML, JS).

A **Java Archive (JAR)** is a platform-independent file format to pack multiple files together and distribute them as a single unit. So it comes in handy if your application contains lots of files.

These are the main benefits of a JAR file:

- it can aggregate multiple files of different types;
- it is a compressed archive (with a **ZIP** algorithm) that reduces the size of the application and makes it easier to move it over a network;
- you can digitally sign it (this feature won't be discussed in this topic).

> [!NOTE]
> A JRE can start an application packed into a JAR, but to create a JAR you need to use a JDK.

A JAR file is simply an aggregation of bytecode files (`.class`), configuration files (e.g., `.json`, `.xml`), images, and even sound clips into a single compressed file. 

- All files except bytecode files are usually called **resources**. 
- It is also recommended that a JAR file contains a special file named `MANIFEST.MF` in a special folder named `META-INF`. This file should describe the JAR file itself (a manifest is a kind of metadata): its version, the author, and so on.

Here is the example of a structure of a JAR file:

```
example.jar
├── META-INF
│   └── MANIFEST.MF
├── second
│   ├── Main.class
│   └── MyIcon.png
└── third
    └── another
        └── OneMore.class
```

```
my-library.jar (ZIP format)
├── META-INF/
│   └── MANIFEST.MF
├── com/
│   └── example/
│       ├── App.class
│       └── utils/
│           └── Helper.class
└── application.properties
```

#### Classpath

In Python, you have `sys.path`. In Node.js, you have `node_modules`.
In Java and Kotlin, you have the **Classpath**.

The Classpath (`-cp` or `-classpath` options on the `java` CLI command) is a list of directories and `.jar` files telling the JVM and compiler where to look when resolving imported classes.

For example, when your Kotlin file has:

```kotlin
import jetbrains.buildServer.configs.kotlin.v2019_2.Template
```

The compiler asks: *"Where on my classpath is a `.jar` containing the package `jetbrains/buildServer/configs/kotlin/v2019_2/Template.class`?"*

- If found on the classpath $\rightarrow$ **Compilation succeeds & IDE shows clean code**.
- If NOT found on the classpath $\rightarrow$ **Compilation fails with `Unresolved reference` & IDE paints the code RED!**

> [!NOTE]
> **What build tools solve**
> ***
> Managing this Classpath manually (downloading 50 JARs and linking them with `java -cp lib1.jar;lib2.jar...`) is nightmare fuel. **This is why Build Tools (Maven & Gradle) exist!**

### Build tools intro

#### Why use build tools?

A **build tool** is a program that automates the process of creating executable applications from source code. The build process includes compiling sources and linking and packaging the code into a usable or executable form.

In small projects (like projects for learning), developers can manually invoke the build process. However, this approach is not efficient for larger projects, when it is pretty hard to keep track of what needs to be built. 

Here are the three main benefits of using build tools:

- Automating the build process minimizes the risk of human error. 
- Additionally, an automated build tool typically runs faster than someone performing the same steps manually. 
- As a consequence, an automated build process improves the quality of the product and saves time and money.


Modern build tools can perform a wide variety of tasks that software developers do in their day-to-day activities:

1. **Downloading and adding dependencies.** This is especially convenient when your project depends on a large number of libraries.
    
2. **Compiling source code into bytecode**. Build tools will invoke the compiler for all the files in your project.
    
3. **Packaging compiled code.** You will have a production-ready application archive like JAR, APK, or some other.
    
4. **Running tests.** For example, testing the application archive every time to check if it works correctly. It allows programmers to avoid bugs after modifying the application.
    
5. **Deploying** to a production environment.

There are three main build tools for Java-based projects: **Apache Ant**, **Apache Maven**, and **Gradle**.

- **Apache Ant** was released in 2000. It is the oldest of these three build tools. Coders rarely use **Ant** in new projects but it still occurs in practice. You can use this tool together with **Apache Ivy** to manage dependencies.

- **Apache Maven** was released in 2004, and now it is one of the most popular choices for Java developers (especially for server-side development). Many projects, both old and new, use Maven as a build tool because of its powerful dependency management possibilities.

- **Maven** follows the _Convention Over Configuration_ concept which means that a developer needs to specify only unconventional aspects of the application, and all standard aspects work by default.

- **Gradle** is a new tool compared to Ant and Maven. It was released in 2007 and is now standard for Android applications. Also, developers use it for server and desktop development. **Gradle** aims to _“combine the power and flexibility of Ant with the dependency management and conventions of Maven into a more effective way to build.”_

> [!NOTE]
> **Apache Maven** and **Gradle** are more than simply build tools. They manage almost the entire lifecycle of an application.

#### DSL vs GPL

Please note that DSL is a computer language specialized to a particular application domain (like build automation). This is in contrast to a general-purpose language (GPL), which is broadly applicable across domains.

- **DSL**: stands for "domain specific language", and is not turing-complete.
- **GPL**: stands for "general purpose language", and is turing-complete.


#### Maven intro

Apache Maven is the grandmaster of JVM build tools. It introduced declarative dependency management, standardized project structures, and a global repository ecosystem.

Maven is governed by a single configuration file in the project root: **`pom.xml`** (**P**roject **O**bject **M**odel).

Instead of writing custom build scripts that manually compile files, Maven is **declarative**: you declare _what_ the project is, _what_ it needs (dependencies), and _what plugins_ to execute. Maven handles the _how_.

#### Gradle intro

**Gradle** is a build automation tool. Think of it as the project manager for your code.

The key features of Gradle are as follows:

- **Settings files.** Gradle uses several types of settings files to describe how to build a project.
    
- **Build-by-convention.** A programmer doesn't need to specify every building step that needs to be done. Instead, Gradle uses default settings and behavior. Although, every step of the default build process can be customized if necessary.
    
- **Dependency management.** Gradle automatically downloads specified external libraries and solves conflict cases with dependencies. You can declare as many dependencies as you need for a project.
    
- **Builds**. Gradle allows programmers to design well-structured and easily maintained comprehensible builds. It also supports complex cases such as multi-project or partial builds.
    
- **Ease of migration**. Gradle can easily adapt to any project structure you have. Therefore, you can always develop your project exactly the way you want.
    
- **DSL** (based on Groovy and Kotlin) for writing scripts in settings files.

**Gradle** is a modern automation tool that helps build and manage projects written in Java, Kotlin, Scala, and other JVM-based languages. It describes project dependencies and determines how to build a project. Gradle uses a well-designed plugin system, which is why it is a highly extensible tool. You can use plugins for automatic versioning, automatic testing, reporting about the build, and so on.

One of the best things about Gradle is its [Groovy-based](https://en.wikipedia.org/wiki/Apache_Groovy) domain-specific language (DSL) that gives developers a specific way to form custom build scripts. The Kotlin developers are especially lucky since Gradle also started to support Kotlin for such scripts. So, there are two languages to write the Gradle build scripts (Groovy and Kotlin) and you can choose any of them.

For example, instead of manually downloading a JSON library, you tell Gradle:

```groovy
dependencies {
    implementation("com.fasterxml.jackson.core:jackson-databind:2.19.0")
}
```

- **Gradle** is a DSL (domain-specific language) that is based on Groovy.
- **Groovy** is a programming language that was traditionally used to write Gradle build scripts.

Historically, Gradle files looked like this, which uses the **Gradle Groovy DSL**

```groovy
plugins {
    id 'org.jetbrains.kotlin.jvm' version '2.2.20'
}

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.jetbrains.kotlin:kotlin-stdlib'
}
```

> [!NOTE]
> What makes gradle so great is that you can specify as many dependencies as you want, and gradle will install them all and handle any conflicts for you

There are two different versions of the gradle language: the newer kotlin version and the groovy version:

```kotlin
apply plugin: "application"   // for Groovy DSL
apply(plugin = "application") // for Kotlin DSL

// ❌ Groovy
implementation 'com.google.guava:guava:33.0.0-jre'

// ✔️ Kotlin
implementation("com.google.guava:guava:33.0.0-jre")
```

Nowadays, especially for Kotlin projects, many developers prefer the **Kotlin DSL**, because instead of the gradle file being called `build.gradle`, you use `build.gradle.kts`, which means the build script itself is written in Kotlin.

Here's an example of using Kotlin DSL:

```kts
plugins {
    kotlin("jvm") version "2.2.20"
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.jetbrains.kotlin:kotlin-stdlib")
}
```

## Maven

### `pom.xml`

Every single library, plugin, and project in the Java/Kotlin universe is uniquely identified by three coordinates: **GAV** (**G**roupId, **A**rtifactId, **V**ersion).

```xml
<dependency>
    <groupId>org.jetbrains.kotlin</groupId>
    <artifactId>kotlin-stdlib</artifactId>
    <version>1.9.20</version>
</dependency>
```

| Coordinate       | Analogy                          | Description                                                                |
| :--------------- | :------------------------------- | :------------------------------------------------------------------------- |
| **`groupId`**    | Organization / Domain (reversed) | E.g. `com.google.guava`, `org.jetbrains.kotlin`, `org.jetbrains.teamcity`. |
| **`artifactId`** | Specific Project / Library Name  | E.g. `guava`, `kotlin-stdlib`, `configs-dsl-kotlin`.                       |
| **`version`**    | Release Version                  | E.g. `1.0.0`, `2022.10`, `1.0-SNAPSHOT`.                                   |

You also have these optional coordinates:

- `<scope>`: decides the scope of where to install the plugin
	- `compile` (default): Required at both compile-time and runtime.
	   - `provided`: Needed to compile, but assumed to be provided by the host environment at runtime.
	   - `test`: Only placed on the classpath during unit test execution (e.g., JUnit).
	   - `runtime`: Only needed to run, not to compile.


The `SNAPSHOT` keyword is a variable for dynamic build numbers:

- **Release version (e.g., `1.8.0`)**: Immutable. Once published, the code never changes.
- **Snapshot version (e.g., `1.0-SNAPSHOT`)**: Work-in-progress. Maven will periodically check the remote repository for newer daily/hourly builds.

Let's dissect the essential sections of a real `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" ...>
  <modelVersion>4.0.0</modelVersion>

  <!-- 1. Coordinates of THIS project -->
  <groupId>PrismModern</groupId>
  <artifactId>PrismModern_dsl</artifactId>
  <version>1.0-SNAPSHOT</version>

  <!-- 2. Parent POM (Inheritance) -->
  <parent>
    <groupId>org.jetbrains.teamcity</groupId>
    <artifactId>configs-dsl-kotlin-parent</artifactId>
    <version>1.0-SNAPSHOT</version>
  </parent>

  <!-- 3. Remote Repositories (Where to find dependency JARs) -->
  <repositories>
    <repository>
      <id>jetbrains-all</id>
      <url>https://download.jetbrains.com/teamcity-repository</url>
    </repository>
    <repository>
      <id>teamcity-server</id>
      <url>https://teamcity.jetbrains.com/app/dsl-plugins-repository</url>
    </repository>
  </repositories>

  <!-- 4. Plugin Repositories (Where to find build tool plugins) -->
  <pluginRepositories>
    <pluginRepository>
      <id>JetBrains</id>
      <url>https://download.jetbrains.com/teamcity-repository</url>
    </pluginRepository>
  </pluginRepositories>

  <!-- 5. Dependencies (Libraries our code imports) -->
  <dependencies>
    <dependency>
      <groupId>org.jetbrains.teamcity</groupId>
      <artifactId>configs-dsl-kotlin</artifactId>
      <version>${teamcity.dsl.version}</version>
      <scope>compile</scope>
    </dependency>
  </dependencies>

  <!-- 6. Build & Plugins (Tools that compile or process the code) -->
  <build>
    <sourceDirectory>${basedir}</sourceDirectory>
    <plugins>
      <plugin>
        <groupId>org.jetbrains.kotlin</groupId>
        <artifactId>kotlin-maven-plugin</artifactId>
        <version>${kotlin.version}</version>
        <executions>
          <execution>
            <id>compile</id>
            <goals><goal>compile</goal></goals>
          </execution>
        </executions>
      </plugin>
    </plugins>
  </build>
</project>
```

1. **`<parent>`**: Maven supports object-oriented inheritance for builds! Child projects inherit dependencies, properties (like `${kotlin.version}`), and plugin configurations from parent POMs.
2. **`<repositories>`**: Public Maven Central (`repo.maven.apache.org`) only hosts open-source packages. Proprietary or vendor-specific libraries (like JetBrains TeamCity DSL plugins) must have their repository URLs declared here.
3. **`<pluginRepositories>`**: Maven separates *libraries your code uses* (`<repositories>`) from *build plugins that run during compilation* (`<pluginRepositories>`). Both must be reachable!

#### Repositories

Where do downloaded JARs actually go on your computer?

- On Windows: `C:\Users\<YourUsername>\.m2\repository\` 
- On Mac/Linux: `~/.m2/repository/`

```text
                       ┌─────────────────────────────────────────┐
                       │           Remote Repositories           │
                       │ - Maven Central (repo1.maven.org)       │
                       │ - JetBrains (download.jetbrains.com)    │
                       │ - TeamCity Server (teamcity.jetbrains)  │
                       └────────────────────┬────────────────────┘
                                            │
                                  1. Download over HTTPS
                                            │
                                            ▼
                       ┌─────────────────────────────────────────┐
                       │          Local Maven Cache              │
                       │        (~/.m2/repository/)              │
                       │ - Cached .jar, .pom, .sha1 files        │
                       └────────────────────┬────────────────────┘
                                            │
                                  2. Classpath Injection
                                            │
                                            ▼
                  ┌─────────────────────────┴──────────────────��──────┐
                  │                                                   │
                  ▼                                                   ▼
       ┌──────────────────────┐                           ┌──────────────────────┐
       │   Maven CLI Build    │                           │  IntelliJ IDEA IDE   │
       │   (javac / kotlinc)  │                           │  (Code Intelligence) │
       └──────────────────────┘                           └──────────────────────┘
```

Within this top level `~/.m2/repository` directory, Maven organizes the folder structure strictly according to the **GAV coordinates** in this format:

```
~/.m2/repository/<groupId>/<artifactId>/<version>
```

Here's an example:

- Library: `org.jetbrains.teamcity:configs-dsl-kotlin:2022.10` 
- Folder on disk: `C:\Users\amallick.ENGINEERS\.m2\repository\org\jetbrains\teamcity\configs-dsl-kotlin\2022.10\` 
- Files inside:
	- `configs-dsl-kotlin-2022.10.jar` (The compiled bytecode)
	- `configs-dsl-kotlin-2022.10.pom` (Metadata & transitive dependencies)
	- `configs-dsl-kotlin-2022.10.jar.sha1` (Checksum validation)

### Maven CLI

Maven builds follow an ordered sequence of phases, where each CLI command in the chain implicitly runs the dependent CLI commands before it in the chain.

> [!NOTE]
> When you run mvn compile, Maven executes validate → compile.

```
validate ──> compile ──> test ──> package ──> verify ──> install ──> deploy
```

Therefore you have these maven CLI commands:

- **`validate`**: Checks that the project structure and `pom.xml` are valid.
- **`compile`**: Compiles source code (`src/main/java`, `src/main/kotlin`) into `target/classes`.
- **`test`**: Runs unit tests (e.g. Surefire plugin).
- **`package`**: Packages compiled classes into a `.jar` or `.war` in `target/`.
- **`install`**: Copies the packaged `.jar` into your local `~/.m2/repository` so other local projects on your machine can consume it.
- **`deploy`**: Uploads the final `.jar` to a remote corporate artifact server (e.g. Nexus, Artifactory).

| Command               | What it Does                                                          | When to Use It                             |
| :-------------------- | :-------------------------------------------------------------------- | :----------------------------------------- |
| `mvn compile`         | Resolves dependencies and compiles all source code.                   | Basic build check.                         |
| `mvn clean`           | Deletes the `target/` directory.                                      | When you want a 100% fresh, clean build.   |
| `mvn test`            | Runs unit tests.                                                      | Verification before committing.            |
| `mvn compile -U`      | Forces Maven to re-check and download snapshot/failed dependencies.   | When libraries failed to download earlier. |
| `mvn dependency:tree` | Prints a visual tree of all dependencies and transitive dependencies. | Troubleshooting version conflicts.         |
| `mvn -X compile`      | Runs compilation with maximum debug logging.                          | Diagnosing download or plugin crashes.     |
#### `mvn compile`

The `mvn compile` command reads the `pom.xml` at the root of the current directory and compiles the source code into `.class` files.

```bash
mvn compile
```

You have these additional flags you can set:

- `-f <path-to-pom-xml>`: lets you point to a different pom XML file by filepath to compile based on that.
- `-U`: always bypass cache, reload it. Prevents stale cache errors.
- `-X`: Maximum debug output (prints full stack traces and HTTP requests)

```bash
# Maximum debug output (prints full stack traces and HTTP requests)
mvn compile -X

# Force re-download of snapshots and failed releases
mvn compile -U

# Build offline (prevents remote network checks)
mvn compile -o
```

#### `mvn dependency`

- `mvn dependency:tree`: print all dependencies as a tree

```bash
# Print all dependencies as a tree
mvn dependency:tree
```

### Bad cache: The Dreaded `.lastUpdated` File

When Maven tries to download a library and fails (due to a 404, offline server, or blocked HTTP):

1. Maven writes a tracking file: `configs-dsl-kotlin-parent-1.0-SNAPSHOT.pom.lastUpdated`.
2. Inside `.lastUpdated`, Maven records: _"Failed to download at timestamp X from URL Y"_.
3. **Important Cache Rule**: By default, Maven will **NOT** retry downloading failed dependencies on subsequent runs until a timeout expires (often 24 hours), unless you explicitly pass the **`-U`** flag (`mvn compile -U` forces update check)!

> [!NOTE]
> It's very important to always consider your compilation could be failing because of a stale cache of your libraries, so always run `mvn compile -U`.

There are all kinds of reasons trying to download a library fails:

- **timeout error**: takes too long to download, a 404 or 500 timeout request came back.
- **HTTP blocking**: Modern Maven versions (3.8.1+) strictly block unencrypted `http://` repositories for security (to prevent Man-in-the-Middle attacks).
## Gradle

Gradle combines the declarative dependency management of Maven with the scripting power of full programming languages (Groovy and Kotlin).

Key Gradle Features:

- **Build Cache & Incremental Builds**: If you modify 1 file out of 1,000, Gradle only recompiles that 1 file.
- **Gradle Daemon**: A background JVM process that stays warm in memory so subsequent builds execute in milliseconds.
- **Gradle Wrapper (`gradlew`, `gradlew.bat`)**: A lightweight script bundled directly with the repo that automatically downloads the exact correct Gradle version, requiring zero installation from the developer.

### Gradle installation and guide

There are two ways to use gradle:

- **Method 1 - `gradle` CLI**: install the `gradle` CLI on your laptop and initialize projects with that and use the CLI for building projects.
- **Method 2 - IntelliJ managed Gradle**: IntelliJ will create gradle configuration for you and `./gradleew` (Linux and Mac) and `./gradleew.bat` (Windows) scripts files to install gradle and run it in the context of your project, removing the need for a global `gradle` CLI.

### Core gradle structure

Let's start with an introduction to the key concepts in Gradle: **projects** and **tasks**.

- A **project** might represent either **something to be built** (e.g. a JAR file or ZIP archive) or **a thing to do** (e.g. deploying the application). Every Gradle build contains one or more projects.
    
- A **task** is a single piece of work that a build performs. This can include compiling classes, running tests, generating docs, and so on. Every project is essentially a collection of one or several tasks.

Here are the steps to setup a project in gradle:

1. Create a new gradle project with `gradle init`:

```bash
gradle init
```

2. You should now see a structure like so:

```
.
├── build.gradle
├── gradle
│   └── wrapper
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
├── gradlew
├── gradlew.bat
└── settings.gradle
```

Here is brief info about all the generated files:

- The `build.gradle` file is a primary file that specifies the Gradle's project, including its tasks and external libraries. Here, it is located in the `gradle-demo` folder and can be created after invoking the `gradle init` command. For now, this file doesn't contain anything useful, but in real projects it is often updated with new information.
    
- The files `gradle-wrapper.jar`, `gradle-wrapper.properties`, `gradlew` and `gradlew.bat` belong to Gradle Wrapper which allows you to run Gradle without its manual installation.
    
- The `settings.gradle` file specifies which projects to include in your build. This file is optional for a build that has only one project, but it is mandatory for a multi-project build.

> [!NOTE]
> You can also invoke `build` and other commands like `./gradlew build` for Unix-based systems and `gradlew.bat build` for Windows. It will automatically download Gradle and run the specified command. Using wrappers allows developers to start working with a Gradle-based project without having to install it manually.

#### Gradle CLI

```bash
# Force refresh of all dynamic/cached dependencies
./gradlew build --refresh-dependencies

# Print stacktrace on failure
./gradlew build --stacktrace

# Print info/debug logs
./gradlew build --info
./gradlew build --debug

# Stop background Gradle Daemons if stuck
./gradlew --stop
```

- `./gradlew build`: builds the project
- `./gradlew test`: tests the project
- `./gradlew run`: run the app
- `./gradlew clean`: delete build output
#### Gradle library storage

Unlike Maven which uses `~/.m2/repository/`, Gradle stores its downloaded dependency cache at:

- Windows: `C:\Users\<Username>\.gradle\caches\modules-2\files-2.1\`
- Mac/Linux: `~/.gradle/caches/modules-2/files-2.1/`

> [!NOTE]
> Gradle uses SHA-1 content-addressable hash directories to ensure that multiple projects on your machine never corrupt each other's downloaded libraries.

### Using gradle with Groovy DSL

Groovy DSL is more obsolete and relies on the `build.gradle` file:

```groovy
plugins {
    id 'org.jetbrains.kotlin.jvm' version '1.9.20'
}

repositories {
    mavenCentral()
    maven { url 'https://download.jetbrains.com/teamcity-repository' }
}

dependencies {
    implementation 'org.jetbrains.kotlin:kotlin-stdlib:1.9.20'
    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.0'
}
```

### Using gradle with kotlin DSL

Kotlin DSL with gradle is so much better because of these three main reasons:

1. **Type Safety & Auto-complete**: In IntelliJ IDEA, pressing `Ctrl+Space` in a `.kts` file gives you full autocomplete, type checking, and instant documentation.
2. **Refactoring**: Renaming symbols across your codebase safely updates `.kts` build scripts.
3. **Compile-time Error Detection**: Syntax or type mistakes are highlighted in red _before_ running the build.

Here's how to create a project with Kotlin DSL and Gradle

- Open IntelliJ IDEA
- Click **New Project**
- Select **Kotlin**
- Select **Gradle**
- Choose **Kotlin DSL**
- Click **Create**

You'll get a project structure similar to:


```
my-project/
├── build.gradle.kts
├── settings.gradle.kts
├── gradlew
├── gradlew.bat
└── src
    ├── main
    │   └── kotlin
    └── test
        └── kotlin
```

- `gradlew`: bash script CLI for linux and MacOS to control gradle project dependencies, including installation, running scripts, and uninstallation
- `gradlew.bat`: the windows script version of the `gradlew` bash script.
- `build.gradle.kts`: the main gradle config, and where you add **plugins**, **repositories**, and **dependencies**.

```kts title="build.gradle.kts"
// list of plugins to use
plugins {
    kotlin("jvm") version "2.2.20"
}

// list of code repos to add
repositories {
    mavenCentral()
}

// list of dependencies to install
dependencies {
    testImplementation(kotlin("test"))
}
```

- `settings.gradle.kts`: project settings:

```kts title="settings.gradle.kts"
rootProject.name = "my-project"
```

#### basics

In Maven, you had `<scope>compile</scope>`, `<scope>test</scope>`, etc. In Gradle, dependencies are assigned to **Configurations**:

| Configuration            | What it Means                                                                               | Maven Equivalent          |
| :----------------------- | :------------------------------------------------------------------------------------------ | :------------------------ |
| **`implementation`**     | Used to compile and run your code. Hidden from downstream projects depending on you.        | `<scope>compile</scope>`  |
| **`api`**                | Used to compile and exposed transitively to downstream projects.                            | `<scope>compile</scope>`  |
| **`compileOnly`**        | Needed at compile-time only (not packaged at runtime).                                      | `<scope>provided</scope>` |
| **`runtimeOnly`**        | Needed to run the app, but not needed to compile source code (e.g., database JDBC drivers). | `<scope>runtime</scope>`  |
| **`testImplementation`** | Needed only when running tests.                                                             | `<scope>test</scope>`     |

#### Gradle plugins

**Gradle plugins**

The `plugins` section adds plugins to the gradle project

```kotlin
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("kotlin-parcelize")
    // 1. install ksp plugin
    id("com.google.devtools.ksp") version "1.9.0-1.0.13"
}
```


#### Gradle repository

**Gradle repository**

The `repository` section in your `settings.gradle.kts` allows you to specify any online repositories to pull dependencies from.

```kotlin
repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
```

#### Gradle dependencies

Here are the steps to add new dependencies and install them so you can use third-party packages in your Kotlin project:

1. Add a new dependency to the `dependencies` block in the `build.gradle.kts`:

```kts title="build.gradle.kts"
dependencies {
    implementation("com.google.code.gson:gson:2.13.1")
}
```

2. Save the file
3. Click **Load Gradle Changes** in IntelliJ or click the Gradle refresh button, which then downloads the library automatically.
4. Import the library into your code and use it:

```kts title="src/main.kt"
import com.google.gson.Gson

fun main() {
    val gson = Gson()
    println(gson.toJson(listOf(1, 2, 3)))
}
```




#### All together

1. Write your main kotlin code in `main.kt`

```kts title="main.kt"
fun main() {
    println("Hello Gradle + Kotlin!")
}
```

2. Add configuration to the `build.gradle.kts` and specify the `application` block entrypoint to be `MainKt`

```kts
plugins {
    kotlin("jvm") version "2.2.20"
    application
}

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(kotlin("test"))
}

application {
    mainClass.set("MainKt")
}
```

3. Run the app (which automatically builds it)

```bash
./gradlew run
```

### Maven vs Gradle

| Concept                           | Maven                                             | Gradle (Kotlin DSL)                               |
| :-------------------------------- | :------------------------------------------------ | :------------------------------------------------ |
| **Build Configuration File**      | `pom.xml`                                         | `build.gradle.kts` (or `build.gradle`)            |
| **Project Settings / Submodules** | `<modules>` in root `pom.xml`                     | `settings.gradle.kts` (`include("subproject")`)   |
| **Local Cache Directory**         | `~/.m2/repository/`                               | `~/.gradle/caches/`                               |
| **Add Central Repository**        | Built-in by default                               | `repositories { mavenCentral() }`                 |
| **Add Custom HTTPS Repo**         | `<repository><url>https://...</url></repository>` | `repositories { maven("https://...") }`           |
| **Compile Code**                  | `mvn compile`                                     | `./gradlew compileKotlin` or `./gradlew assemble` |
| **Clean Output**                  | `mvn clean`                                       | `./gradlew clean`                                 |
| **Run Tests**                     | `mvn test`                                        | `./gradlew test`                                  |
| **Full Build & Package**          | `mvn package` or `mvn install`                    | `./gradlew build`                                 |
| **Force Dependency Refresh**      | `mvn compile -U`                                  | `./gradlew build --refresh-dependencies`          |
| **View Dependency Tree**          | `mvn dependency:tree`                             | `./gradlew dependencies`                          |



## IntelliJ basics

### Code actions

#### Most common actions

- `CTRL + ENTER`: code completion
- `ALT + ENTER`: apply quick fix or apply "intention"

### Command palette

Press `shift` twice or `CTRL + SHIFT + A` to bring up the command palette. Within the command palette, you can search in these subcategories:

- `CTRL + N`: search classes
- `CTRL + SHIFT + N`: search files
- `CTRL + ALT + SHIFT + N`: search symbols


In summary:

- **classes**: to search class names only, do `CTRL + N`, then when hovering over a class definition, you can press `CTRL + Q` to view documentation of the class, then press `esc` to close th epopup
- **symbols**: 

### Logpoints

Log points allow you to do dynamically add print statements that get outputted to the console without you writing any code, and you can add log points during runtime as well.

### IntelliJ CLI

You can launch IntelliJ IDEA directly from the terminal or command prompt using its **command-line launcher**. This is useful for quickly opening projects, files, or even jumping to a specific line in a file.

```bash
# Open a project folder
idea ~/MyProject
# Open a specific file at line 42
idea --line 42 ~/MyProject/scripts/app.js
```

The basic syntax is as follows:

```
idea <path-to-project-or-file>
```

You have these options:

- `--wait` → Waits until the file is closed before returning control to the terminal.
    
- `--nosplash` → Skips the splash screen.
    
- `--disableNonBundledPlugins` → Starts without custom plugins (useful for troubleshooting).

- `--line <n>`: open a file at a specific line number

### IntelliJ Project basics

#### IntelliJ environment

IntelliJ is not just a text editor; it maintains a living, semantic symbol graph of your entire codebase.

To do this, IntelliJ maintains its own internal configuration in the **`.idea/`** folder:

| File / Folder                            | Purpose in IntelliJ                                                                                             |
| :--------------------------------------- | :-------------------------------------------------------------------------------------------------------------- |
| **`.idea/misc.xml`**                     | Defines the **Project SDK** (which JDK is used, e.g. JDK 19) and language level.                                |
| **`.idea/modules.xml`**                  | Lists all modules that make up the project.                                                                     |
| **`*.iml` (e.g. `PrismModern_dsl.iml`)** | Module definition: lists source folders, test folders, excluded folders (`target/`), and attached library JARs. |
| **`.idea/jarRepositories.xml`**          | Caches remote Maven repository URLs extracted from `pom.xml`.                                                   |
| **`.idea/libraries/*.xml`**              | XML descriptors pointing to exact `.jar` paths inside `~/.m2/repository/`.                                      |

There is a difference between IntelliJ and traditional build tools like Maven:

- **Maven / Gradle CLI**: reads a configuration file like `pom.xml` and wraps something like `kotlinc` or `javac` to provide the classpath behind the scenes for you
	- **example**: When you run `mvn compile`, **Maven** runs independently in a separate JVM process.
- **IntelliJ**: reads configuration from the `.idea` folder in the project directory to surface compiler errors in the UI.
	- **example**: When you edit code in the editor, **IntelliJ** uses its own in-memory index of configured libraries to highlight syntax and check types.

**The Bridge**: IntelliJ imports your `pom.xml` (or `build.gradle.kts`) and automatically generates its internal `.idea` library descriptors based on what Maven declared.

#### Fixing bad imports

When your imports are red (`Unresolved reference: jetbrains...`), one of these 6 things is broken:

```
                                  WHY IS MY CODE RED?
                                          │
            ┌─────────────────────────────┼─────────────────────────────┐
            ▼                             ▼                             ▼
   [1. Missing JDK/SDK]         [2. Failed Dependency]        [3. Unsynced Maven]
  Project Structure has no       pom.xml has dead URL,         pom.xml was edited,
   JDK assigned (red JDK).     JAR never reached ~/.m2/.      IDE hasn't reloaded yet.
            │                             │                             │
            ▼                             ▼                             ▼
   [4. Unmarked Sources]        [5. Blocked HTTP Repo]        [6. Corrupt Index]
 Folder is plain yellow/gray,   Maven 3.8+ refused HTTP;      IntelliJ cache desynced
  not blue "Sources Root".       JAR download aborted.        from disk state.
```

- Cause 1: Missing or Incompatible JDK / Project SDK
	- **Symptom**: Even basic Java/Kotlin classes (`String`, `List`, `println`) are red.
	- **Check**: Press `Ctrl+Alt+Shift+S` (Project Structure) $\rightarrow$ **Project** $\rightarrow$ Verify **SDK** is set to a valid JDK (e.g., JDK 17 or JDK 19).

- Cause 2: Failed Dependency Download (The `.teamcity` Issue!)

	- **Symptom**: Standard Kotlin works, but `import jetbrains.buildServer...` is red.
	- **Why**: Maven could not download the `.jar` (due to network timeout, wrong URL, or HTTP block). Since the `.jar` is not in `~/.m2/repository/`, IntelliJ has nothing to index!

- Cause 3: Maven Project Not Imported / Out of Sync

	- **Symptom**: You added a `<dependency>` to `pom.xml`, but IntelliJ still shows the class in red.
	- **Why**: IntelliJ does not auto-reindex instantly on every keystroke in `pom.xml`.

- Cause 4: Source Roots Not Configured
	- **Symptom**: Files in your project cannot see classes in adjacent folders.
	- **Why**: The directory is not marked as a **Sources Root** (marked in blue in IntelliJ's project tree).

- Cause 5: Maven 3.8+ Security Blocking Insecure `http://` URLs
	- **Symptom**: Maven refuses to connect with `Blocked mirror for repositories`.
	- **Why**: Modern Maven versions disable plain HTTP repositories by default for security.

 - Cause 6: Stale / Corrupted IDE Cache
	- **Symptom**: The JAR exists in `~/.m2/repository`, `mvn compile` passes in the terminal, but the IDE editor still shows red lines.



Here are three techniques to fix these causes:

- **method 1 - reload maven project**: reload all maven projects via IntelliJ toolbar
	1. Click the **Maven** tool window tab.
	2. Click the **Reload All Maven Projects** button (the two circular arrows 🔄 at the top left of the Maven pane).
	3. Watch the bottom status bar: IntelliJ will read `pom.xml`, download any missing JARs, and update its library indexes.
- **method 2 - register `pom.xml` as a maven project**: Right-click `pom.xml` in the Project Explorer → Select **Add as Maven Project** (or **Maven** → **Reload Project**).
- **method 3 - invalidate caches**: If the terminal passes `mvn compile` but the IDE editor remains stuck, then go to `File` $\rightarrow$ `Invalidate Caches...` $\rightarrow$ Check all options $\rightarrow$ Click **Invalidate and Restart**.

Whenever you face a build issue in any Java/Kotlin repository in the future, follow this 5-step checklist:

1. **Check Java Version**: Run `java -version` and `javac -version` (ensure matching JDK 17/21).
2. **Check Repository URLs**: Ensure all URLs in `pom.xml` or `build.gradle.kts` use `https://` and are reachable in a browser/terminal.
3. **Run CLI Build with Debug Logs**: Run `mvn compile -X` or `./gradlew build --info` to see the exact HTTP failure or missing GAV.
4. **Purge Failed Downloads**: Delete any `.lastUpdated` files in `~/.m2/repository` and run `mvn compile -U`.
5. **Sync IntelliJ**: Click the 🔄 **Reload All Maven Projects** button in the IntelliJ Maven tool window.
## IntelliJ with Git

<iframe width="560" height="315" src="https://www.youtube.com/embed/TNZgwJaVu4E?si=U-7b-sNUAM-oDYX8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>


### Basics

#### 1 - Clone a project

You can clone a project like so: you go to **File**, then to **New**, then to **Project from Version Control**. 


![](https://i.imgur.com/kjEXO0y.jpeg)

You can either authenticate with a repository URL and SSH or with a Github or Gitlab account so you have direct integration with your remote Github/Gitlab account and your local IDE and git.

#### 2 - Make a commit, view changes, create a branch

When clicking on the top bar branch view, you have three categories of branch groupings available:

- **Recent**: shows you the top 5 most recently accessed branches
- **Local**: shows you all your local branches
- **Remote**: shows you all the remote branches

A cool feature that IntelliJ offers on top of Git is the ability to group branches into folders via a `<foldername>/<branchname>` syntax, which is semantically meaningless in normal git, but in IntelliJ, it lets you group branches into subfolders.

![](https://i.imgur.com/TImP0Ri.jpeg)
1. Once you make a change, you can press **Alt + 0** to open the commit view (shows staged and modified/unstaged files) or just manually go to the commit sidebar.


![](https://i.imgur.com/3DcWjCY.jpeg)
2. You can create a new branch if you don't want to commit on Main. You can do so manually by clicking on the branch picker, or by pressing `CTRL + ALT + N`

![](https://i.imgur.com/uMxHXPb.jpeg)

### Git Log View

The **Git Log View** at the bottom can be used tot view the log to undo, squash, and drop specific commits for any individual commit.

> [!NOTE]
> You can also open up the git log view with `ALT + 9`

Here's what you can do for individual commits:

- **undo commit**: removes the commit by performing a `git reset --soft HEAD~1`
- **edit commit message**: amends the commit with a new message

#### Undoing commits


![](https://i.imgur.com/NJbXpeu.jpeg)


## IntelliJ with AI

### Setting up completion

1. Go to **Tools** -> **AI** -> **JetBrains AI** and then fill out the completion endpoint with an OpenAI compatible endpoint or connect your Jetbrains AI account


![](https://i.imgur.com/4aYExCY.jpeg)


### Setting up skills

![](https://i.imgur.com/zTNH1U8.jpeg)

THen in a chat you can use slash commands to refer to specific skills and force AI to use those skills.