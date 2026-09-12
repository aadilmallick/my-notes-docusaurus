## Complex numbers basics - the shit you should have learned in high school

### Absolute basics

You can represent complex numbers as the sum of their real parts and their imaginary parts, which also lets you write it in vector notation:

$$  
z = a + bi  
$$

$$  
z = \begin{bmatrix} a \\ b\end{bmatrix}  
$$

We can represent complex conjugates with * notation:

$$  
z^* = (a+bi)^* = a - bi  
$$

Using conjugates, we can find the imaginary and real parts of a number quite easily, using these simple formulas:

#### $Re(z)$ and $Im(z)$


For $z = x + yi$ and $z^* = x - yi$, you can extract the real and imaginary scalar components via two functions:

- $Re : \mathbb{C} \rightarrow \mathbb{R}$: takes in a complex number and returns the scalar that multiples the real number component
- $Im : \mathbb{C} \rightarrow \mathbb{R}$: takes in a complex number and returns the scalar that multiples the imaginary number component


![](https://i.imgur.com/stcJR3i.jpeg)

- **getting the real component from a complex number:** By adding a complex number and its conjugate together then dividing the sum by 2, we can isolate just the real number component of the complex number.
- **getting the imaginary component from a complex number:** By subtracting the conjugate of a complex number from the complex number itself, then dividing the sum by $2i$, we can isolate just the imaginary number component of the complex number.

#### Square and absolute value of a complex number

You also have this property of conjugates concerning the absolute value:

$$  
|z|^2 = |a + bi|^2 = a^2 + b^2 = z^*z  
$$

From this, we also get this basic formula of the absolute value of a complex number:

$$  
|a + bi| = \sqrt{a^2 + b^2} \\ |a + bi|^2 = a^2 + b^2  
$$


### Polar representation

From this, we also get this basic formula of the absolute value of a complex number:

$$  
|a + bi| = \sqrt{a^2 + b^2} \\ |a + bi|^2 = a^2 + b^2  
$$


> [!NOTE]
> **key insight: $\theta$** represents the rotation in radians of the complex number vector rotated around the origin. Think about it as the angle the vector makes with the X (real number) axis.

