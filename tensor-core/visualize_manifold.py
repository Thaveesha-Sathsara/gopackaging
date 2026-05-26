import pickle
import numpy as np
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA

print("[VISUALIZER] Loading Latent Manifold...")

# Load the Memory saved earlier
with open('manifold.pkl', 'rb') as f:
    database = pickle.load(f)

# Extract the vectors and the function names
vectors = np.array([item['vector'] for item in database])
names = [item['function_name'] for item in database]

print(f"[VISUALIZER] Found {len(vectors)} functional nodes in 384-dimensional space.")
print("[VISUALIZER] Squashing to 2D for human viewing via PCA...")

# Squash 384 dimensions down to 2 dimensions
pca = PCA(n_components=2)
reduced_vectors = pca.fit_transform(vectors)

# Plot the graph
plt.figure(figsize=(12, 8))
plt.scatter(reduced_vectors[:, 0], reduced_vectors[:, 1], c='cyan', edgecolors='black', s=100, alpha=0.7)

# Add the function names as labels next to the dots
for i, name in enumerate(names):
    plt.annotate(name, (reduced_vectors[i, 0], reduced_vectors[i, 1]), 
                 fontsize=9, xytext=(5, 5), textcoords='offset points', alpha=0.8)

# Formatting the chart for research paper
plt.title('Latent Space Manifold: System Topography (2D PCA Projection)', fontsize=14, fontweight='bold')
plt.xlabel('Principal Component 1 (Semantic Variance)', fontsize=12)
plt.ylabel('Principal Component 2 (Structural Variance)', fontsize=12)
plt.grid(True, linestyle='--', alpha=0.5)

# Show the window
plt.show()