## Intro to 3D graphics

### Main concepts

**rasterization vs raytracing**

Rasterization and raytracing are both techniques of displaying 3D scenes on a 2D screen, but have different behaviors:

- **rasterization:** drawing each individual pixel and coloring it. It’s fast, but doesn’t look realistic.
- **raytracing:** Using light and tracing the paths of light rays to produce photorealistic images, but is computationally expensive.

### **raster images**

Raster images are non-vector images, which means they are not SVGs. They can be downscaled, but lose quality when upscaled.

There are two types of compression raster images can have:

- **Lossless compression:** When you reduce filesize by reducing the number of instructions it takes to create the image.
    - The image loses no actual quality
- **Lossy compression:** When you reduce filesize by erasing pixel data and reducing quality
    - Image loses some quality, but barely noticeable to our eyes
    - More compression that lossless compression

**color**

Basic color is on a RGB spectrum from `rgb(0, 0, 0)` to `rgb(255, 255, 255)`, which is called **low dynamic range** (LDR).

If you want colors brighter than the standard white, there is **high dynamic range** (HDR)

- LDR can be 8-bit color from 0 to 255 or 16-bit color
- HDR has 16 or 32 bit floating point numbers to represent colors

> [!NOTE]
> 8-bit LDR is the most common format since it's hard for humans to differentiate if the color differences gets any more granular than that.

There are two different ways raster images encode color for their pixels:

- **interleaving**: Where each pixel has an R,G, and B value, making each pixel effectively 24 bits. This is the most common format and is best for compression.
- **separation**: Where an image becomes 3 dimensions, height x width x color channel. This splits up each image into a red channel, blue channel, and green channel, that when combined, make the intended image.
	- This is popular in machine learning for convolutional networks.


**different types of raster images**

- **BMP**: bitmap image file - uncompressed, either 8-bit pixels (separation) or 24-bit pixels (interleaving)
- **PPM**: portable pixmap image file - uncompressed, LDR, 8-16 bits per channel
- **PNG**: Lossless compression, LDR 8/16 bits per channel.
- **JPEG**: lossy compression, 8 bits per channel

PNGs use color tables for compression. Each color table stores a maximum of 256 colors from the image and is a dictionary mapping the index to the color value. Each pixel then refers to the index from the color table, making each pixel effectively one byte instead of three.

If an image has more than 256 colors, there are two things that can happen:

- any color left out of the color map will be encoded as a normal 3-byte pixel. 
- any color left out of the color map will be mapped to the most similar color in the color map, which is lossy compression.

> [!NOTE]
> This means that if you have an image with elss than 256 colors, PNG is the most efficient way to compress that image.



### Math

#### Sets and mappings

If you have a point $(a, f(a))$, then $f(a)$ is called the **image** of $a$. The image of a domain is the range.

#### Trig

These are the ranges of the inverse trig functions:
![[Pasted image 20250704170022.png]]

Here are the main laws and trig identities:

![](https://i.imgur.com/0Q9w7Kc.jpeg)

#### Projections

Projections are based off the dot product: the projection of vector $\vec a$ on $\vec b$ producing the projected vector $\vec u$ is as follows:

$$ \vec u = \frac{\vec a \cdot \vec b}{\| b \|}$$

Using the equivalence below, we can get an even easier formula for the projection:

$$\vec a \cdot \vec b = \| a \| \| b \| \cos \theta$$

![](https://i.imgur.com/vYYrjKj.png)

#### Coordinate Frames

A **coordinate frame** is a way of creating a coordinate space based on orthonormal basis vectors based off two random vectors $\vec a$ and $\vec b$ and ending up with three orthormal basis vectors to each other, $\vec w$, $\vec u$, and $\vec v$.

1. Create the unit basis vector in the direction of $\vec a$
    
    $$ \hat w = \frac{\vec a}{\| a \|} $$
    
2. Find the orthonormal basis vector orthogonal to both $\hat w$ and $\vec b$
    
    $$ \hat u = \frac{\hat w \times \vec b}{\| \hat w \times \vec b \|} $$
    
3. Find the orthonormal basis vector orthogonal to both $\hat w$ and $\hat u$
    
    $$ \hat v = \hat u \times \hat w $$
    

> [!NOTE]
> The cross product of two unit vectors results in a unit vector, since the area of the parallelepiped would be 1.

