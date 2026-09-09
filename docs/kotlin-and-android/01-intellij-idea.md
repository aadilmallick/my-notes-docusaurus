## The Enterprise Java Ecosystem

### JVM

Using the JVM, you can create bytecode using JVM, and that bytecode can run on any machine that has the JVM.

- The _JRE_ provides all the necessary built-in Java libraries and includes JVM
- The _JDK_ includes JRE

A **build tool** is a program that automates the process of creating executable applications from source code.

Here are the two main build tools: Maven and Gradle.

### Gradle, Groovy, Maven

#### Gradle

**Gradle** is a build automation tool. Think of it as the project manager for your code.

Gradle can:

- Download dependencies (libraries)
- Compile your code
- Run tests
- Package applications
- Create JAR files
- Build Android apps
- Automate repetitive tasks

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

#### Using gradle with kotlin DSL

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

