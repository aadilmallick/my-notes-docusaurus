# 10 - 3rd party linux tools

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