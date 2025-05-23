## you-get

The `you-get` utility can scrape pretty much anything ont he web and downloads it.

### videos

To download a youtube video, you can use this command:

```bash
you-get <youtube-url>
```

- `-i` : shows all the possible video formats to download

Here is how you can download a video as a different filename and to a different file path:

```bash
you-get --output-dir ~/Videos --output-filename zoo.webm 'https://www.youtube.com/watch?v=jNQXAC9IVRw'
```

## nagios plugins

Nagios plugins are useful CLI tools for dealing with HTTP and are more powerful than basic curl. Here is how to install:

```bash
sudo apt install nagios-plugins # linux
brew install nagios-plugins # mac
```

All nagios plugins do is follow a ruleset based on how a script exits.. They follow a simple but strict interface:

**Exit Codes:**

- 0 = OK (service is working normally)
- 1 = WARNING (service has minor issues)
- 2 = CRITICAL (service has major problems)
- 3 = UNKNOWN (plugin couldn't determine service status)
### `check_http`

https://nagios-plugins.org/doc/man/check_http.html

