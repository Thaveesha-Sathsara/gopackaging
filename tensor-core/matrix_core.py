import pickle
import numpy as np
from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer

app = Flask(__name__)

print("[METRIC CORE] Booting local embedding model...")

model = SentenceTransformer('all-MiniLM-L6-v2')

# load the manifold memory into RAM
try:
    with open('manifold.pkl', 'rb') as  f:
        manifold_db = pickle.load(f)
    print(f"[METRIX CORE] Loaded {len(manifold_db)} nodes into active memory.")
except FileNotFoundError:
    print("[FETAL] manifold.pkl not found. Run indexer.py first.")
    exit()

@app.route('/diagnose', methods=['POST'])
def diagnose_fault():
    """
    This takes the broken code from Node.js, vectorizes it instantly, and compares it to the healthy manifold.
    """
    data = request.json
    broken_code = data.get('brokenCode')
    error_message = data.get('errorMessage')

    print(f"\n[SIGNAL RECEIVED] Analyzing structural fault...")

    # convert the broken code into a vector coordinate
    broken_vector = model.encode(broken_code)

    # calculate the distance (Cosine similarity) to all knowsn healthy nodes
    best_match = None
    highest_similarity = -1.0

    for node in manifold_db:
        healthy_vector = node['vector']
        similarity = np.dot(broken_vector, healthy_vector) / (np.linalg.norm(broken_vector) * np.linalg.norm(healthy_vector))

        if similarity > highest_similarity:
            highest_similarity = similarity
            best_match = node

    print(f"[GEOMETRY] Nearest stable manifold point found: {best_match['id']} (Similarity: {highest_similarity:.4f})")

    return jsonify({
        "status": "success",
        "closest_manifold_node": best_match['id'],
        "similarity_score": float(highest_similarity),
        "healed_code": best_match['code']
    })
    
if __name__ == '__main__':
    print("[MATRIX CORE] Engine online. Listening on local port 5050...")
    app.run(host='127.0.0.1', port=5050, debug=False)