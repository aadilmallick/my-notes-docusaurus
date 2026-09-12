
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

> [!NOTE]
> $A\vec x = \vec b$ has a solution if $\vec b$ is in the span of the columns of $A$.


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
    - **example**: full rank for an $\mathbb{R}^4$ space is 4.

> [!IMPORTANT]
> Matrices are full rank iff they are injective, meaning its null space only has the trivial solution $\vec x = \vec 0$.


**column space**

Column space is the span of the columns of the matrix, with the max column space for a $m \times n$ matrix being $\mathbb{R}^n$. 

- **when a matrix is singular based on column space**: If your column space dimensions are less than the dimensions of the matrix, meaning less dimensional than $\mathbb{R}^n$ , then the matrix is singular.


**null space**

The null space is the set of all possible vectors that become null, or $\vec 0$ after a linear transformation. 

Geometrically, it's the set of all vectors that land on the origin after a linear transformation, and has two types of solutions:

- **trivial solution**: the only vector that maps to the origin is the origin itself, $\vec 0$, since by nature of a linear transformation the origin (zero vector) always stays fixed.
- **nontrivial solution**: there is a non-empty set of non-zero vectors called the **kernel** that gets transformed into the $\vec 0$.

You can find the null space by solving a system of equations and setting the post-transformed vector to the $\vec 0$.

$$  
A\vec x = \vec 0  
$$

> [!NOTE]
> The kernel is the set of all solutions to the null space equation, and a trivial solution leads to a **trivial kernel**, and a nontrivial solution leads to a **nontrivial kernel**.

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

#### Cramer's rule

Cramer's rule comes into play when we have an equation $A \vec x = \vec b$, where $A$ and $\vec b$ are known.


### Dot product

For two vectors $\vec v$ and $\vec w$, the dot product $\vec v \cdot \vec w$ can be thought of as the length of projected $\vec w$ on $\vec v$ times the length of $\vec v$

- When two vectors point in generally the same direction, their dot product is positive
- Whe two vectors point in generally the opposite directions, their dot product is negative.

This is another formula for the cot product that lets you find the angle between two vectors:

$$\vec{a} \cdot \vec{b} = \|\vec a\|\|\vec b\|cos{\theta}$$

#### Orthonormal transformations

here's a thought: in the standard coordinate space, we can represent an arbitrary vector like so:

$$\begin{pmatrix} x \\ y \end{pmatrix} = x \hat i + y \hat j = \begin{pmatrix} x \\ y \end{pmatrix} \cdot \begin{pmatrix} 1 \\ 0 \end{pmatrix} + \begin{pmatrix} x \\ y \end{pmatrix} \cdot \begin{pmatrix} 0 \\ 1 \end{pmatrix} = \begin{pmatrix} x \\ y \end{pmatrix} \cdot \hat i + \begin{pmatrix} x \\ y \end{pmatrix} \cdot \hat j $$

So we would naively think that we can represent any vector $\vec x$ as the sum of its dot products with each basis vector of a matrix.

But that only works in one special case: orthonormal transformations.

**Orthonormal transformations** are those in which the dot product of two vectors is preserved even after the same matrix transformation is applied to those two vectors.


![](https://i.imgur.com/er3lmSt.jpeg)

The only matrices $U$ that provide orthonormal transformations are of the **orthogonal** family of matrices, where vectors 1) are not stretched and 2) maintain the same angle. 

More formally, matrices $U$ that provide orthonormal transformations must satisfy these two properties:

1. $det(U) = 1$: Because the basis vectors are uniform, transformed vectors are not stretched.
2. 

In the case of orthonormal transformations you can very easily find an input vector that results in a corresponding known output vector via these steps:


![](https://i.imgur.com/KNu0lgY.jpeg)

### Cross product

The cross product of two vectors $\vec a$ and $\vec b$ measures the area of the parallelogram formed by those two vectors:

$$  
\vec a \times \vec b = \| \vec a \| \| \vec b \| \sin{\theta}  
$$

Here are the behaviors of a cross product:

- **greatest when two vectors are orthogonal:** This is because $\sin90 = 1$.
- $\vec a \times \vec a = 0$: this is because the angle between a vector and itself is 0, therefore $\sin 0 = 0$
### Eigenvectors and Eigenvalues

Eigenvectors are simply vectors that stay on their span after a linear transformation. More formally, they satisfy the equation $A\vec v = \lambda \vec v$:

- **Eigenvector:** a vector $\vec v$ that stays on its own span after transformation.
- **Eigenvalue:** the factor $\lambda$ by which that eigenvector is scaled.
- **Eigenpair**: the pair of an eigenvector and its corresponding eigenvalue $(\lambda, \vec v)$

To compute eigenvalues, we can try to find the null space of $A\vec v - \lambda \vec v= \vec 0$, which will then give us all the eigenpairs possible.

So we start off with this:


$$(A-\lambda I)\vec v = \vec 0$$
Which then gives us the **characteristic equation** we can solve for as a polynomial:

$$\det(A-\lambda I)=0$$

#### Solving for eigenpairs

Here are the general steps:

1. Rewrite $A\vec v = \lambda \vec v$ to $A\vec v - \lambda \vec v = \vec 0$
    
2. Since comparing matrix-vector multiplication with scalar-vector multiplication is awkward, we can rewrite $\lambda$ as $\lambda I$, which will just put the eigenvalues $\lambda$ along the diagonal of the matrix.
    
    $$  
    (A - \lambda I)\vec v = \vec 0  
    $$
    
3. If $(A - \lambda I)\vec v = \vec 0$, then $det(A-\lambda I) = 0$. The reasoning is that the only way for a matrix times a vector to be the $\vec 0$ is if the matrix has a null space and is therefore non-invertible and therefore has a determinant = 0. Use this equation to find the eigenvalues.
    
4. Plug back in the eigenvalues you found when you solved for $\lambda$ back into the equation and solve for the eigenvectors:
    
    $$  
    (A - \lambda I)\vec v = \vec 0  
    $$
#### Determinant and eigenvalues

**proof: The determinant of a matrix $A$ is equal to product of its eigenvalues**

The determinant of a matrix $A$ is equal to product of its eigenvalues:

$$  
det(A) = \Pi_{i=1}^n \lambda_i  
$$

How do we prove this?



Coming from this theorem, if a matrix has an eigenvalue $\lambda = 0$, then it has a determinant = 0 and is thus noninvertible (the product of eigenvalues becomes 0, thus determinant becomes 0).

#### Diagonal matrics and eigenvalues

If $A - \lambda I$ produces a triangular matrix or a diagonal matrix, then the eigenvalues simply lie along the diagonal.

That is because if a matrix is diagonal, the standard basis vectors are eigenvectors and diagonal entries are eigenvalues.



#### Eigenvalue proof

Prove that if λ is an eigenvalue of A, then λ² is an eigenvalue of A².

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

## Special matrices

### Diagonal matrices

Diagonal matrices have these three core properties:

- **eigenvalues lie along the diagonal:** 
	- The product of the diagonals of a diagonal matrix is equal to the product of the eigenvalues.
	- the trace of a diagonal matrix is equal to the sum of the eigenvalues of the diagonal matrix.

$$Tr(D) = \sum_{i = 0}^n \lambda_i$$

- **diagonal matrix exponents are just exponentiating the diagonal elements:** This means it’s trivial to calculate something like $A^n$.
    
- **matrix multiplication is commutative:** If you have a diagonal matrix $D$ and a nondiagonal matrix $A$, then matrix multiplication is commutative with diagonal matrices.
    
    $$  
    AD = DA  
    $$
#### Diagonal proofs

**determinant of a diagonal matrix is product of its diagonal elements and thus eigenvalues** 

A matrix’s determinant is equal to the product of its eigenvalues, so since diagonal elements in a diagonal matrix are the eigenvalues, the determinant of a diagonal matrix is equal to the product of its diagonal values.
### Orthogonal, unitary, and Hermitian matrices



## Decompositions

### Cholesky decomposition

### Eigendecomposition

You can represent any $n \times n$ matrix $A$ with $n$ linearly independent eigenvectors as its **eigendecomposition**, which you can get by manipulating the eigenvector formula $Ax = \lambda x$, which only works for square and invertible matrices $A$.

Starting from a $n \times n$ invertible matrix $A$:

- $\lambda$: the diagonal matrix with eigenvalues of $A$ along the diagonal.
- $U$: the matrix of eigenvectors of $A$, which we often normalize to be unit vectors.
- $\Lambda$: the diagonal matrix with the corresponding eigenvalues of $U$ along the diagonal, gotten from the neat trick of $\Lambda = \lambda I$

Here are the steps:

1. Find the eigenpairs of $A$
2. We can form the matrix $U$ as the matrix whose columns are the eigenvectors of $A$.
3. From the standard eigenvector equation $A \vec v = \lambda \vec v$, that corresponds to the matrix version $A U = U \Lambda$ , where $\Lambda = \lambda I$, the diagonal matrix with the corresponding eigenvalues of $U$ along the diagonal.
4. Multiply both sides by $U^{-1}$

From these to steps, we arrive this equation:

$$  
A = U\lambda U^{-1}  
$$
