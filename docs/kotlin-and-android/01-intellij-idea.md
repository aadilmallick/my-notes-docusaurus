## The Enterprise Java Ecosystem

### JVM

Using the JVM, you can create bytecode using JVM, and that bytecode can run on any machine that has the JVM.

Kotlin is fully interoperable with Java, which means Kotlin works great with all existing Java [source code](https://hyperskill.org/learn/step/4350 "In Kotlin, a source code is a set of instructions and statements written in the Kotlin programming language. | These instructions are used to create programs, functions, and data structures. Source code can include various elements such as keywords, identifiers, expressions, blocks, and comments. Keywords are reserved words that have special meanings in the language, while identifiers are names given to variables, functions, and classes. Expressions are pieces of code that produce a single value, and blocks are groups of statements enclosed in curly braces. Comments are ignored by the compiler and are used to explain parts of the code.") and libraries. It also allows companies to make a gradual migration from Java to Kotlin because Java code can access Kotlin code, too. At the same time, developers can use Kotlin as the only language for their projects without Java at all.

- The _JRE_ provides all the necessary built-in Java libraries and includes JVM
- The _JDK_ includes JRE

A **build tool** is a program that automates the process of creating executable applications from source code.

Here are the two main build tools: Maven and Gradle.


### JAR files

```embed
title: "Hyperskill — Learn programming, create apps"
image: "https://hyperskill.org/static/hyperskill-hypercover.png"
description: "Get theory, practice coding, and move beyond programming challenges to building your own working projects. Join over 700 000 learners at Hyperskill."
url: "https://hyperskill.org/learn/step/4311"
favicon: ""
aspectRatio: "52.5"
```


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

WHat makes gradle so great is that you can specify as many dependencies as you want, and gradle will install them all and handle any conflicts for you

There are two different versions of the gradle language: the newer kotlin version and the groovy version:

```kotlin
apply plugin: "application"   // for Groovy DSL
apply(plugin = "application") // for Kotlin DSL

// ❌ Groovy
implementation 'com.google.guava:guava:33.0.0-jre'

// ✔️ Kotlin
implementation("com.google.guava:guava:33.0.0-jre")
```

Nowadays, especially for Kotlin projects, many developers prefer the **Kotlin DSL**, because instead of something like `build.gradle`, you use `build.gradle.kts`, which means the build script itself is written in Kotlin.

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

## Gradle

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



### Using gradle with kotlin DSL

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

#### Gradle scripts

- `./gradlew build`: builds the project
- `./gradlew test`: tests the project
- `./gradlew run`: run the app
- `./gradlew clean`: delete build output

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

