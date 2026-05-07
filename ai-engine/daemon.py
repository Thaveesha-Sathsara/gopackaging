import time
import json
import os
import torch
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from transformers import AutoModelForCausalLM, AutoTokenizer

IPC_DIR = "../server/ipc_link"
CRASH_FILE = os.path.join(IPC_DIR, "crash.json")
FIX_FILE = os.path.join(IPC_DIR, "fix.json")

print("[SYMBIOTE] Booting Autonomous Engine...")

model_name = "Qwen/Qwen2.5-Coder-1.5B-Instruct"
tokenizer = AutoTokenizer.from_pretrained(model_name)

model = AutoModelForCausalLM.from_pretrained(
    model_name, 
    torch_dtype=torch.float32, 
    device_map="cpu"
)

# THE LATENT SPACE MEMORY BANK
class LatentMemory:
    def __init__(self):
        self.past_key_values = None
        self.current_file = None

latent_cache = LatentMemory()

print("[SYMBIOTE] Latent Space allocated. Listening for hardware interrupts...")

class CrashHandler(FileSystemEventHandler):
    def on_created(self, event):
        if event.src_path.endswith("crash.json"):
            time.sleep(0.05) 
            
            with open(CRASH_FILE, "r") as f:
                data = json.load(f)

            start_time = time.time()
            print(f"\n[INTERRUPT] Crash detected in {data['file']}")

            is_retry = (latent_cache.current_file == data['file'])

            if is_retry:
                print("[SYMBIOTE] Reflexion Loop triggered. Processing Bouncer feedback...")
                
                prompt = f"""<|im_start|>user
You previously tried to fix this function, but the AST Validator rejected it.
Error: {data['error']}

Fix it again. Output ONLY the corrected function inside a markdown block. No explanations.

BROKEN FUNCTION:
```javascript
{data['code_chunk']}
```<|im_end|>
<|im_start|>assistant
```javascript
"""
            else:
                print("[SYMBIOTE] Processing isolated code chunk...")
                
                prompt = f"""<|im_start|>user
Fix this specific JavaScript function that threw this error: {data['error']}.
Output ONLY the corrected function inside a markdown block. No explanations.

BROKEN FUNCTION:
```javascript
{data['code_chunk']}
```<|im_end|>
<|im_start|>assistant
```javascript
"""
            
            inputs = tokenizer(prompt, return_tensors="pt")
            
            # Clean generation without forced tensor mismatch
            outputs = model.generate(
                **inputs, 
                max_new_tokens=400, 
                temperature=0.1, 
                pad_token_id=tokenizer.eos_token_id
            )
            
            latent_cache.current_file = data['file']

            # Safely decode ignoring the prompt inputs
            input_length = inputs["input_ids"].shape[1]
            generated_tokens = outputs[0][input_length:]
            response = tokenizer.decode(generated_tokens, skip_special_tokens=True)
            
            try:
                fixed_code = response.split("```")[0].strip()
                print("[SYMBIOTE] Sliced AI output natively.")
            except IndexError:
                print("[SYMBIOTE] Markdown slice failed. Attempting raw fallback.")
                fixed_code = response.replace("<|im_start|>", "").replace("<|im_end|>", "").strip()

            execution_time = time.time() - start_time
            print(f"[⏱METRICS] Patch synthesized in {execution_time:.2f} seconds.")

            with open(FIX_FILE, "w") as f:
                json.dump({
                    "fixed_code": fixed_code,
                    "time_taken": execution_time
                }, f)
            
            os.remove(CRASH_FILE) 

if not os.path.exists(IPC_DIR):
    os.makedirs(IPC_DIR)

observer = Observer()
observer.schedule(CrashHandler(), path=IPC_DIR, recursive=False)
observer.start()

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    observer.stop()
observer.join()