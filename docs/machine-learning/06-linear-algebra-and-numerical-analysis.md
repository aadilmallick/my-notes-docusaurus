
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

#### Matrix multiplication properties

- **Not commutative:** (AB \ne BA) in general.
- **Associative:** (A(BC)=(AB)C).
- **applied right to left**: Applying one transformation after another is composition. If you first apply (B) then apply (A), the combined transformation is (AB), because matrix multiplication is applied right to left.

### Determinants and invertible matrics

#### The geometric meaning of a determinant

For a 2×2 matrix, ($|\det(A)|$) is how much areas scale.

- ($|\det(A)| > 1$): areas expand
- ($0 < |\det(A)| < 1$): areas shrink
- ($\det(A) < 0$): orientation flips (a “mirror”/reflection component)

But what if the determinant is 0, meaning the basis vectors are collinear with each other? That's where determinants connect to linear independence and dependence and singular matrices:

