
## Intro to linear algebra

### Spans and linear combinations

A linear combination of two vectors ($\vec v$, $\vec w$) is, where (a,b) are scalars:

$$a\vec v + b\vec w$$

The span of two vectors $\vec{v}$ and $\vec{w}$ is the set of all their linear combinations.

- In 2D, two non-collinear vectors typically span the whole plane.
- If two vectors line up (one is a scalar multiple of the other), they span only a **line**.

Based on span, we have the concept of linear dependence vs independence:

- **Linearly dependent:** one vector can be expressed as a linear combination of others (redundant).
- **Linearly independent:** no vector in the set is redundant.

#### Checking for linear independence

Given two vectors $\vec x$ and $\vec y$, you test for linear independence by setting their linear combination equal to the zero vector.

$$c_1 \vec x + c_2 \vec y = \vec 0$$

- If the only solution is that both  $\vec x$ and $\vec y$ are $\vec 0$, then they are linearly dependent.
- If there is a solution with either $\vec x$ and $\vec y$ not being the zero vector, then they are linearly dependent.

### Matrices as linear transformations

A matrix has its columns as basis vectors, and applies a transformation to vectors by using the matrix's basis vectors as the basis vectors for the vector it wants to transform, mapping that vector into the matrix's coordinate space.

Here is how a matrix $A$ translates a vector $\vec x$ in standard coordinate space (basis vectors are $\vec i$ and $\vec j$) into a vector $\vec v$. 

$$A\vec x = \vec v$$

You can describe a linear transformation by just recording what happens to the $\hat i$ and $\hat j$ basis vectors of the original coordinate space and how they get transformed.

For example, if a linear transformation scales $\hat i$ to $2 \hat i$, then the matrix representation of the linear transformation is $\begin{matrix} 2 & 0 \\ 0 & 1 \end{matrix}$, or $[2 \hat i^T, \hat j^T]$


For this example, let's assume $A = \begin{matrix} 2 & 0 \\ 0 & 1 \end{matrix}$ and $\vec x = \begin{matrix} -7 \\ 5 \end{matrix}$.

1. The basis vectors of $A$, let's call them $\hat a_1 = \begin{matrix} 2 \\ 0 \end{matrix}$ and $\hat a_2 = \begin{matrix} 0 \\ 1 \end{matrix}$
2. When we transform $\vec x$ into the coordinate space of $A$, basically we're going to change the linear combination representation of $\vec x$ from using the standard coordinate space basis vectors ($\hat i$ and $\hat j$) to the basis vectors of $A$:

$$\vec x = \begin{matrix} -7 \\ 5 \end{matrix} = -7 \hat i + 5 \hat j$$

$$A \vec x = -7 \hat a_1 + 5 \hat a_2 = \begin{matrix} -7 \\ 5 \end{matrix}$$

3. But this $\begin{matrix} -7 \\ 5 \end{matrix}$ is now in the "language" of the non-standard basis vectors $\hat a_1$ and $\hat a_2$, and the only way for us to understand what truly happened to $\vec x$ is to translate the basis vectors into the standard coordinate space and then rewrite everything as a linear combination in the standard space:

$$A \vec x = -7 \hat a_1 + 5 \hat a_2 = -7 \begin{pmatrix} 2 \\ 0 \end{pmatrix} + 5 \begin{pmatrix} 0 \\ 1 \end{pmatrix}  = \begin{matrix} -14 \\ 5 \end{matrix} = \vec v$$

#### Matrix multiplication properties

- **Not commutative:** (AB \ne BA) in general.
- **Associative:** (A(BC)=(AB)C).
- **applied right to left**: Applying one transformation after another is composition. If you first apply (B) then apply (A), the combined transformation is (AB), because matrix multiplication is applied right to left.

#### Change of basis

Let's assume

### Determinants and invertible matrices

#### The geometric meaning of a determinant

For a 2×2 matrix, ($|\det(A)|$) is how much areas scale.

- ($|\det(A)| > 1$): areas expand
- ($0 < |\det(A)| < 1$): areas shrink
- ($\det(A) < 0$): orientation flips (a “mirror”/reflection component)

But what if the determinant is 0, meaning the basis vectors are collinear with each other? That's where determinants connect to linear independence and dependence and singular matrices:

- $\det(A)=0$: space gets “squished” into a lower dimension (e.g., plane → line).
	- **linearly dependent**: basis vectors become linearly dependent.
	- **singular**: since the columns of the matrix (basis vectors) are linearly dependent, matrix is singular.
- $\det(A) \ne 0$: the parallelogram formed by the basis vectors has non-zero area
	- **linearly dependent**: basis vectors are not collinear, since that is the only way for the parallelogram formed by the basis vectors to have non-zero area
	- **singular**: since the columns of the matrix (basis vectors) are linearly dependent, matrix is singular.

#### Invertible and singular matrices

To represent a system of equations, you can use a coefficient matrix, multiply it by a variable vector, and set it equal to a constants vector: $A\vec{x}=\vec{v}$.

In plain english: 

>We are looking for a vector $\vec{x}$ that when transformed by $A$, lands on $\vec{v}$.

To solve this system of equations, we can use inverse matrices: **Inverse matrices** are the inverse transformation of a matrix.

By applying a transformation, then subsequently applying the inverse of that transformation, you end up back where you started: $A^{-1}A=I$.

- If a matrix rotates space clockwise by 90 degrees, an inverse matrix of that matrix would rotate space counterclockwise 90 degrees.
- doing a transformation $A$ then doing the transformation $A^{-1}$ is the same thing as doing nothing.

By using the inverse, you can find the variable vector like so

$$\vec{x} = A^{-1} \vec{v}$$.

**when matrices don’t have an inverse**

If the determinant of matrix is 0, then it does not have an inverse because it squishes all of space onto one line irreversibly. The area of the parallelogram formed by the basis vectors is 0. You cannot un-squish a line.

Also, a matrix transformation being injective and surjective plays a role in if its invertible or not.

- **injective:** A linear map is injective iff the only vector mapped to (0) is the zero vector.
    - Basically, no transformed vector besides the zero vector should transform to the zero vector, otherwise the linear transformation is not injective.
- **surjective:** Once transformed, the new basis matrix has the same span as the original basis matrix. Basically, the transformation matrix must be full rank and a square matrix.

Transformation matrices will only have inverses if they are bijective - meaning both injective and surjective.

So in summary, here are the three cases where a transformation matrix $M$ will not have an inverse:

1. $det(M) = 0$: transformation matrix is not injective, because some vectors will get squished to the zero vector as a result of this transformation.
2. **nonsquare matrices**: Not surjective, since their column space is not full rank.
3. **matrices that transform some vectors to the $\vec 0$:** These matrices are not injective by definition.


#### Rank, column space, null space

- **Rank:** number of dimensions in the output / the dimension of the column space.
- **Column space:** the span of the columns of ($A$).
- **null space**: The null space is all vectors mapped to zero, which can be found through this equation:

$$A\vec x = \vec 0$$

**rank**

**rank** means the **number of dimensions in the output of the transformation,** and is used to differentiate between transformations that either take up all the possible dimensions or have a zero-determinant and thus squish all vectors into a lower dimension.

- When the output of a transformation is a line, the rank is 1.
- When the output of a transformation is a plane, the rank is 2.
- When the output of a transformation is all of space, the rank is 3.
- Full rank means that the number of dimensions matches the number of columns.
    - full rank for an $\mathbb{R}^4$ space is 4.

#### Mathematical properties of determinants

- **multiplicative rule**
    
    $$  
    det(AB) = det(A) \cdot det(B)  
    $$
    
- **inverse rule**
    
    $$  
    det(A^{-1}) = \frac{1}{det(A)}  
    $$
    
- **additive rule**
    
    $$  
    det(A-B) = det(A) - det(B)  
    $$

### Eigenvectors and Eigenvalues



## Vector and matrix norms

### Vector norms

A vector norm is a function that transforms a vector of any size into a scalar.

A vector norm is only valid if it satisfies these four properties:

![](https://i.imgur.com/9B4CJau.jpeg)

1. **positive**: the norm returns a positive real number
2. **injective**: the norm is 0 only if the input is $\vec 0$.
3. **preservation of scalars**: scalars in scalar multiplication can be taken out of the norm.
4. **satisfies triangle inequality**

There are three vectors norms:

- **L1 norm**: the sum of the absolute value of all the elements in the vector
- **L2 norm**: the magnitude of the vector
- **infinity norm**: the element with the maximum absolute value out of all the elements in the vector.

#### **1 norm**

The 1-norm is simply the sum of the absolute value of all the elements in the vector

$$  
\| \mathbf{x}\|_1 =\sum_{i=1}^{n} |x_i|  
$$

#### **2 norm**

The 2-norm is the most common vector norm, which is just the magnitude of the vector

$$  
\| \mathbf{x}\|_2 = \left( \sum_{i=1}^{n} x_i^2 \right)^{1/2}  
$$

#### **infinity-norm**

The infinity-norm is simply the maximum absolute value of the elements in the vector.

$$  
\|\mathbf{x}\|_\infty = \max_{1 \le i \le n} |x_i|  
$$


#### Norm comparisons

$$  
\| x \|_\infty \le \| x \|_2 \le \sqrt n \| x \|_\infty  
$$


### Matrix norms

Matrix norm is a function that takes in a matrix and returns a single scalar value. 

A matrix norm aggregates all the values inside it, and must have these properties:


![](https://i.imgur.com/GoQjaIS.jpeg)



Matrix norms measure how much a matrix can stretch a vector:

$$  
\|A\| = \max_{x\ne 0} \frac{\|Ax\|}{\|x\|}.  
$$

Common induced norms include $\|A\|_1, \|A\|_\infty, \|A\|_2$.