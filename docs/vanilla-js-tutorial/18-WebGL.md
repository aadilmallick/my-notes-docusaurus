## Intro to 3D graphics

### Main concepts

**rasterization vs raytracing**

Rasterization and raytracing are both techniques of displaying 3D scenes on a 2D screen, but have different behaviors:

- **rasterization:** drawing each individual pixel and coloring it. It’s fast, but doesn’t look realistic.
- **raytracing:** Using light and tracing the paths of light rays to produce photorealistic images, but is computationally expensive.

**raster images**

Raster images are non-vector images, which means they are not SVGs. They can be downscaled, but lose quality when upscaled.

There are two types of compression raster images can have:

- **Lossless compression:** When you reduce filesize by reducing the number of instructions it takes to create the image.
    - The image loses no actual quality
- **Lossy compression:** When you reduce filesize by erasing pixel data and reducing quality
    - Image loses some quality, but barely noticeable to our eyes
    - More compression that lossless compression

### Math

#### Projections

Projections are based off the dot product: the projection of vector $\vec a$ on $\vec b$ producing the projected vector $\vec u$ is as follows:

$$ \vec u = \frac{\vec a \cdot \vec b}{\| b \|}$$



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

