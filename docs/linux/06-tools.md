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
