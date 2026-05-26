import os
import re
import pickle
import numpy as np
from sentence_transformers import SentenceTransformer

print("[TESNSOR CORE] Booting local embedding model...")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("[TENSOR CORE] Model loaded. Latent space initialized (d=384).")

SERVER_DIR = "../server"

def extract_js_function(filepath):
    """
    A lightweight parser to extract functions from JavaScript files.
    It looks for 'const functionName = async (req, res) => {...}'
    or standard function blocks.
    """
    with open(filepath, 'r', encoding='utf-8') as file:
        content = file.read()

    # regex to find arrow functions and standard functions (basic knowing)
    # this grabs the function signature and the block of code inside it
    pattern = re.compile(r'(?:const|let|var|async function|function)\s+([a-zA-Z0-9_]+)\s*=?\s*(?:async)?\s*(?:\([^)]*\))?\s*=>?\s*\{([\s\S]*?)\n\};?', re.MULTILINE)

    function = []
    for match in pattern.finditer(content):
        func_name = match.group(1)
        # reconstruct the function string
        func_body = match.group(0)
        function.append({"name": func_name, "code": func_body, "file": filepath})

    return function

def map_codebase():
    print(f"\n[MAPPER] Scanning directory: {SERVER_DIR}")

    manifold_db = []

    # walk through controller and models
    target_folders = ['controllers', 'models']

    for folder in target_folders:
        folder_path = os.path.join(SERVER_DIR, folder)
        if not os.path.exists(folder_path):
            print(f"[!] Warning: could not find {folder_path}")
            continue

        for root, _, files in os.walk(folder_path):
            for file in files:
                if file.endswith('.js'):
                    filepath = os.path.join(root, file)
                    print(f" -> Indexing: {file}")

                    # extract function
                    functions = extract_js_function(filepath)

                    # vectorize each function
                    for func in functions:
                        vector = model.encode(func['code'])

                        #store the coordinate metadata
                        manifold_db.append({
                            "id": f"{filepath}::{func['name']}",
                            "file": filepath,
                            "function_name": func['name'],
                            "code": func['code'],
                            "vector": vector
                        })
    return manifold_db

if __name__ == "__main__":
    #build the database
    database = map_codebase()

    print(f"\n[TENSOR CORE] Mapped {len(database)} unique functional nodes.")

    #saves the manifold to a binary pickle file
    memory_path = "manifold.pkl"
    with open(memory_path, 'wb') as f:
        pickle.dump(database, f)

    print(f"[TENSOR CORE Static Manifold saved to {memory_path}. Memory is persistent.")