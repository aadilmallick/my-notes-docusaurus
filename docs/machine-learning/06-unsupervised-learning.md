## Clustering

Clustering is unsupervised learning where the algorithm separates data points into separate unlabeled clusters

  

It's up to the domain expert to actually provide significance to those clusters and label them. The only thing unsupervised learning does is group data points into clusters.


As the machine learning engineer, we have two tasks:

1. Give significance to the clusters and label them.
2. Decide how many clusters we want to separate the data into
### KMeans

**Rules**

- Each point must belong to a cluster
- Each point can belong to only a single cluster at a time.

**Steps**

1. Choose $k$ clusters to partition data into.
2. Assign each point to a random cluster
3. Calculate the cluster mean for each cluster
4. If a data point is closer to one cluster mean than another, assign that data point to that cluster it's nearest to.
5. Repeat steps 3 and 4 until there are no more reassignments


![](https://i.imgur.com/slYpO6J.jpeg)


#### **Determining cluster number**

Determining a reasonable $k$ value relies on your domain knowledge. 

However, we can also determine a suitable error metric for KMeans

The error for KMeans is the sum of the squared distances of each point from its assigned cluster's center.

We plot an elbow graph of KMeans error on y-axis and cluster number $k$ on the X-axis, and we look for the **elbow** to determine the optimal k value before going any further provides insignificant gains.


> [!NOTE]
> Clusters are good if they minimize distance from assigned points to cluster centers, up to a certain point.

We plot an elbow graph of KMeans error on y-axis and cluster number $k$ on the X-axis, and we look for the **elbow** to determine the optimal k value before going any further provides insignificant gains.


1. Determine range of k values you want to test

2. For each k, train kmeans model, store the error stored in `kmeans.inertia_` to an error array

3. Plot the error values against the range of k values.

```py
image = np.asarray(
	url_to_image(
	"https://woofwell.com/cdn/shop/files/Golden-Retriever-Health-WoofWell-Breed-Specific-Dog-Supplements_1600x.jpg?v=1621360789"
	)
)

height, width, num_color_channels = image.shape
flattened_image_data = image.reshape(height*width, num_color_channels)

from sklearn.cluster import KMeans

max_clusters = 12
kmean_errors = []

# test 4 - 12 clusters
for k in range(4, max_clusters):
  kmeans = KMeans(n_clusters=k)
  cluster_labels = kmeans.fit_predict(flattened_image_data)

  # 1. get model error
  model_error = kmeans.inertia_
  kmean_errors.append(model_error)

  # 2. show image
  rgb_centers = kmeans.cluster_centers_.astype(int)
  kmeans_data = rgb_centers[cluster_labels]
  kmeans_image = kmeans_data.reshape(height, width, num_color_channels)
  fig = plt.figure(figsize=(4,4))
  plt.title(f"k = {k}")
  plt.imshow(kmeans_image)

# plot elbow plot
plt.plot(range(4, max_clusters), kmean_errors, 'o--')
```