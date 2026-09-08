## The Enterprise Java Ecosystem

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

#### Groovy

**Groovy** is a programming language that was traditionally used to write Gradle build scripts.

Historically, Gradle files looked like this:

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