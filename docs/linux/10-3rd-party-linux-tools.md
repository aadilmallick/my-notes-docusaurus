# 10 - 3rd party linux tools

## Package Managers

### NVM

NVM is a way to manage different versions of node. 

#### Installation

You can install NVM through a curl command to the git repo. NVM also adds lines of code to the `~/.bashrc` in order to source the NVM and run it upon startup.

#### Git Bash

For git bash, you can install NVM as normal but then you must add the sourcing code to `~/.bash_profile` as that is what is run at the start of every session instead of `~/.bashrc`.

#### Usage

You can install node with `nvm install node` or `nvm install <version>`.

You can use a specific version with `nvm use <version>`:

- `nvm install 20`: installs node version 20
- `nvm install --lts`: installs the current lts version of node

## `gog`: manage google ecosystem

### Setup

To use `gog`, you first need OAuth permissions. Follow these steps:

 1. Go to the Google Cloud Console (https://console.cloud.google.com/apis).
 2. Create or select a project.                                                                                        
 3. Enable the Gmail API and Google Calendar API:                                                                      
     - Go to "APIs & Services" > Library.                                                                              
     - Search for "Gmail API" and "Google Calendar API," then enable both.
 4. Create OAuth 2.0 credentials:                                                                                      
     - Go to "APIs & Services" > "Credentials."                                                                        
     - Click "Create Credentials" > "OAuth Client ID."                                                                 
     - Choose "Desktop App" or "Other" as the application type.
     - Download the client_secret.json file after it’s created.

### CLI setup

You can use `gog` to manage multiple google email workspaces at the same time. To do so, you must first login:

```bash
gog login <email>
```

## Obsidian CLI

The obsidian cli is run with the `obsidian` command which brings up a TUI (interactive CLI). The TUI and CLI are only available if the Obsidian app is currently open.

### Vault Commands

These commands run in the context of the current vault you have open in obsidian

- `daily`: opens today's daily note in the current vault
- `daily:append`: appends content to the daily note, and then you can pass in `key=value` arguments.
- `search`: searches the current vault, and then you can pass in `key=value` arguments.
- `create`: creates a new note, and then you can pass in `key=value` arguments.

```bash
# Open today's daily note
obsidian daily

# Add a task to your daily note
obsidian daily:append content="- [ ] Buy groceries"

# Search your vault
obsidian search query="meeting notes"

# Read the active file
obsidian read

# List all tasks from your daily note
obsidian tasks daily

# Create a new note from a template
obsidian create name="Trip to Paris" template=Travel

# Create a new note with content
obsidian create name=Note content="# Title\n\nBody text"

# List all tags in your vault with counts
obsidian tags counts

# Compare two versions of a file
obsidian diff file=README from=1 to=3
```

### Switching vaults

you can run vault commands in a different vault by specifying the vault name you want to target with the `vault=` command:

```shell
obsidian vault=Notes daily
```

### Opening a vault

Open a vault from the TUI with the `vault:open` command, passing the name of the vault:

```bash
vault:open name=<name>        # (required) vault name
```

## ImageMagick

You can install this CLI tool using brew on mac.

The basics of using it follow this pattern:

```sh
magick [input-options] input-file [output-options] output-file
```

### Basics

Here are the 9 most common use cases:

1. Convert an image to a different format

To convert a JPEG to a PNG, simply specify the new file extension in the output file name. 

```
magick input.jpg output.png
```


2. Resize an image

- **Resize to specific dimensions:** To fit an image within a given width and height while maintaining its aspect ratio, use the `-resize` option.
    
    
    ```
    magick input.png -resize 800x600 output.png
    ```
    
    
- **Force specific dimensions:** To stretch or shrink an image to an exact size, ignoring the aspect ratio, add an exclamation mark (`!`).
    
    
    ```
    magick input.png -resize 800x600! output.png
    ```
    
    
- **Resize by percentage:** Use a percentage value to scale the image proportionally.
    
    
    ```
    magick input.png -resize 50% output.png
    ```
    
    
     

3. Crop an image

Crop an image by specifying the width, height, and starting position (`+x+y`). The coordinates are from the top-left corner. 


```
magick input.png -crop 200x200+50+50 output.png
```


4. Rotate and flip an image

- **Rotate:** Rotate an image by a specified number of degrees.
    
    
    ```
    magick input.png -rotate 90 output.png
    ```
    
    
- **Flip (vertical):** Flip the image along its horizontal axis.
    
    
    ```
    magick input.png -flip output.png
    ```
    
    
- **Flop (horizontal):** Flip the image along its vertical axis.
    
    
    ```
    magick input.png -flop output.png
    ```
    
    
     

5. Add text to an image

Use the `-annotate` and `-draw` options to add text. The example below adds "Hello World" at a specific location. 


```
magick input.png -pointsize 48 -fill white -annotate +20+50 "Hello World" output.png
```


6. Add a watermark or composite images

The `composite` command overlays one image on another. 


```
composite watermark.png input.png output.png
```


You can also do this with `magick`, which can be more versatile for complex operations. 


```
magick input.png watermark.png -composite output.png
```


7. Create a GIF animation

Combine a series of images into a single animated GIF. The `-delay` option sets the time between frames in hundredths of a second. 


```
magick -delay 20 -loop 0 image1.png image2.png image3.png animation.gif
```


- `-delay 20`: 20 hundredths of a second (0.2 seconds) between frames.
- `-loop 0`: Infinite loop. 

8. Batch processing with `mogrify`

To apply the same change to many files at once, use `mogrify`. It directly modifies files, so it's a good idea to back up your images first. 

- **Resize all JPEGs in a directory:**
    
    
    ```
    magick mogrify -resize 800x600 *.jpg
    ```
    
    
- **Convert all JPEGs to PNGs:**
    
    
    ```
    magick mogrify -format png *.jpg
    ```
    
    

9. Identify image information

Use the `identify` command to get detailed information about an image. 


```
magick identify -verbose input.png
```

## Playing sounds

**Playing sounds on a mac**

This is some built in code for zsh that allows us to play system sounds:

```
afplay /System/Library/Sounds/Glass.aiff
```

**saying text**

This is how to do robotic text to speech: use the `say` command

```
say 'process complete'
```

## Apple CLI

### remindctl

The `remindctl` tool is used to create apple reminders.

```embed
title: "Fetching"
image: "data:image/svg+xml;base64,PHN2ZyBjbGFzcz0ibGRzLW1pY3Jvc29mdCIgd2lkdGg9IjgwcHgiICBoZWlnaHQ9IjgwcHgiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCI+PGcgdHJhbnNmb3JtPSJyb3RhdGUoMCkiPjxjaXJjbGUgY3g9IjgxLjczNDEzMzYxMTY0OTQxIiBjeT0iNzQuMzUwNDU3MTYwMzQ4ODIiIGZpbGw9IiNlMTViNjQiIHI9IjUiIHRyYW5zZm9ybT0icm90YXRlKDM0MC4wMDEgNDkuOTk5OSA1MCkiPgogIDxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZU5hbWU9InRyYW5zZm9ybSIgdHlwZT0icm90YXRlIiBjYWxjTW9kZT0ic3BsaW5lIiB2YWx1ZXM9IjAgNTAgNTA7MzYwIDUwIDUwIiB0aW1lcz0iMDsxIiBrZXlTcGxpbmVzPSIwLjUgMCAwLjUgMSIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIGR1cj0iMS41cyIgYmVnaW49IjBzIj48L2FuaW1hdGVUcmFuc2Zvcm0+CjwvY2lyY2xlPjxjaXJjbGUgY3g9Ijc0LjM1MDQ1NzE2MDM0ODgyIiBjeT0iODEuNzM0MTMzNjExNjQ5NDEiIGZpbGw9IiNmNDdlNjAiIHI9IjUiIHRyYW5zZm9ybT0icm90YXRlKDM0OC4zNTIgNTAuMDAwMSA1MC4wMDAxKSI+CiAgPGFuaW1hdGVUcmFuc2Zvcm0gYXR0cmlidXRlTmFtZT0idHJhbnNmb3JtIiB0eXBlPSJyb3RhdGUiIGNhbGNNb2RlPSJzcGxpbmUiIHZhbHVlcz0iMCA1MCA1MDszNjAgNTAgNTAiIHRpbWVzPSIwOzEiIGtleVNwbGluZXM9IjAuNSAwIDAuNSAxIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgZHVyPSIxLjVzIiBiZWdpbj0iLTAuMDYyNXMiPjwvYW5pbWF0ZVRyYW5zZm9ybT4KPC9jaXJjbGU+PGNpcmNsZSBjeD0iNjUuMzA3MzM3Mjk0NjAzNiIgY3k9Ijg2Ljk1NTE4MTMwMDQ1MTQ3IiBmaWxsPSIjZjhiMjZhIiByPSI1IiB0cmFuc2Zvcm09InJvdGF0ZSgzNTQuMjM2IDUwIDUwKSI+CiAgPGFuaW1hdGVUcmFuc2Zvcm0gYXR0cmlidXRlTmFtZT0idHJhbnNmb3JtIiB0eXBlPSJyb3RhdGUiIGNhbGNNb2RlPSJzcGxpbmUiIHZhbHVlcz0iMCA1MCA1MDszNjAgNTAgNTAiIHRpbWVzPSIwOzEiIGtleVNwbGluZXM9IjAuNSAwIDAuNSAxIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgZHVyPSIxLjVzIiBiZWdpbj0iLTAuMTI1cyI+PC9hbmltYXRlVHJhbnNmb3JtPgo8L2NpcmNsZT48Y2lyY2xlIGN4PSI1NS4yMjEwNDc2ODg4MDIwNyIgY3k9Ijg5LjY1Nzc5NDQ1NDk1MjQxIiBmaWxsPSIjYWJiZDgxIiByPSI1IiB0cmFuc2Zvcm09InJvdGF0ZSgzNTcuOTU4IDUwLjAwMDIgNTAuMDAwMikiPgogIDxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZU5hbWU9InRyYW5zZm9ybSIgdHlwZT0icm90YXRlIiBjYWxjTW9kZT0ic3BsaW5lIiB2YWx1ZXM9IjAgNTAgNTA7MzYwIDUwIDUwIiB0aW1lcz0iMDsxIiBrZXlTcGxpbmVzPSIwLjUgMCAwLjUgMSIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIGR1cj0iMS41cyIgYmVnaW49Ii0wLjE4NzVzIj48L2FuaW1hdGVUcmFuc2Zvcm0+CjwvY2lyY2xlPjxjaXJjbGUgY3g9IjQ0Ljc3ODk1MjMxMTE5NzkzIiBjeT0iODkuNjU3Nzk0NDU0OTUyNDEiIGZpbGw9IiM4NDliODciIHI9IjUiIHRyYW5zZm9ybT0icm90YXRlKDM1OS43NiA1MC4wMDY0IDUwLjAwNjQpIj4KICA8YW5pbWF0ZVRyYW5zZm9ybSBhdHRyaWJ1dGVOYW1lPSJ0cmFuc2Zvcm0iIHR5cGU9InJvdGF0ZSIgY2FsY01vZGU9InNwbGluZSIgdmFsdWVzPSIwIDUwIDUwOzM2MCA1MCA1MCIgdGltZXM9IjA7MSIga2V5U3BsaW5lcz0iMC41IDAgMC41IDEiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiBkdXI9IjEuNXMiIGJlZ2luPSItMC4yNXMiPjwvYW5pbWF0ZVRyYW5zZm9ybT4KPC9jaXJjbGU+PGNpcmNsZSBjeD0iMzQuNjkyNjYyNzA1Mzk2NDE1IiBjeT0iODYuOTU1MTgxMzAwNDUxNDciIGZpbGw9IiNlMTViNjQiIHI9IjUiIHRyYW5zZm9ybT0icm90YXRlKDAuMTgzNTUyIDUwIDUwKSI+CiAgPGFuaW1hdGVUcmFuc2Zvcm0gYXR0cmlidXRlTmFtZT0idHJhbnNmb3JtIiB0eXBlPSJyb3RhdGUiIGNhbGNNb2RlPSJzcGxpbmUiIHZhbHVlcz0iMCA1MCA1MDszNjAgNTAgNTAiIHRpbWVzPSIwOzEiIGtleVNwbGluZXM9IjAuNSAwIDAuNSAxIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgZHVyPSIxLjVzIiBiZWdpbj0iLTAuMzEyNXMiPjwvYW5pbWF0ZVRyYW5zZm9ybT4KPC9jaXJjbGU+PGNpcmNsZSBjeD0iMjUuNjQ5NTQyODM5NjUxMTc2IiBjeT0iODEuNzM0MTMzNjExNjQ5NDEiIGZpbGw9IiNmNDdlNjAiIHI9IjUiIHRyYW5zZm9ybT0icm90YXRlKDEuODY0NTcgNTAgNTApIj4KICA8YW5pbWF0ZVRyYW5zZm9ybSBhdHRyaWJ1dGVOYW1lPSJ0cmFuc2Zvcm0iIHR5cGU9InJvdGF0ZSIgY2FsY01vZGU9InNwbGluZSIgdmFsdWVzPSIwIDUwIDUwOzM2MCA1MCA1MCIgdGltZXM9IjA7MSIga2V5U3BsaW5lcz0iMC41IDAgMC41IDEiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiBkdXI9IjEuNXMiIGJlZ2luPSItMC4zNzVzIj48L2FuaW1hdGVUcmFuc2Zvcm0+CjwvY2lyY2xlPjxjaXJjbGUgY3g9IjE4LjI2NTg2NjM4ODM1MDYiIGN5PSI3NC4zNTA0NTcxNjAzNDg4NCIgZmlsbD0iI2Y4YjI2YSIgcj0iNSIgdHJhbnNmb3JtPSJyb3RhdGUoNS40NTEyNiA1MCA1MCkiPgogIDxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZU5hbWU9InRyYW5zZm9ybSIgdHlwZT0icm90YXRlIiBjYWxjTW9kZT0ic3BsaW5lIiB2YWx1ZXM9IjAgNTAgNTA7MzYwIDUwIDUwIiB0aW1lcz0iMDsxIiBrZXlTcGxpbmVzPSIwLjUgMCAwLjUgMSIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIGR1cj0iMS41cyIgYmVnaW49Ii0wLjQzNzVzIj48L2FuaW1hdGVUcmFuc2Zvcm0+CjwvY2lyY2xlPjxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZU5hbWU9InRyYW5zZm9ybSIgdHlwZT0icm90YXRlIiBjYWxjTW9kZT0ic3BsaW5lIiB2YWx1ZXM9IjAgNTAgNTA7MCA1MCA1MCIgdGltZXM9IjA7MSIga2V5U3BsaW5lcz0iMC41IDAgMC41IDEiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiBkdXI9IjEuNXMiPjwvYW5pbWF0ZVRyYW5zZm9ybT48L2c+PC9zdmc+"
description: "Fetching https://github.com/openclaw/remindctl"
url: "https://github.com/openclaw/remindctl"
favicon: ""
```



## Dev tunnel utilities

### `ngrok`

`ngrok` is a tool used to enable HTTPS in development by creating a temporary HTTPS url that forwards to your dev server. This is useful for stuff like registering webhooks.

To get a HTTPS dev url that forwards to a dev process you have running on a port, use this command:

```bash
ngrok http <port_number>
```

### `dev-tunnel` 

The `devtunnel` CLI from microsoft allows you to authenticate with your microsoft account to set up devtunnels and can be easier than ngrok.

1. Install the CLI

```bash
brew install --cask devtunnel host -p 3978
```

2. Expose a port 

```bash
devtunnel host -p 3978
```

You can also use these commands to manage your dev tunnels.


```
Commands:
  list                 List tunnels
  show <tunnel-id>     Show tunnel details
  create <tunnel-id>   Create a tunnel
  update <tunnel-id>   Update tunnel properties
  delete <tunnel-id>   Delete a tunnel
  delete-all           Delete all tunnels
  token <tunnel-id>    Issue tunnel access token
  set <tunnel-id>      Set default tunnel
  unset                Clear default tunnel
  access               Manage tunnel access control entries
  user                 Manage user credentials
  port                 Manage tunnel ports
  host <tunnel-id>     Host a tunnel, if tunnel ID is not specified a new 
                       tunnel will be created
  connect <tunnel-id>  Connect to an existing tunnel
  limits               List user limits
  clusters             List available service clusters by location
  echo <protocol>      Run a diagnostic echo server on a local port
  ping <uri>           Send diagnostic messages to a remote echo server
```
## Filesystem utilities

### Tree

```bash
npm install -g tree-console
tree-cli -d ./my-project --ignore node_modules,.git
```