import time
import json
import os
import torch
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from transformers import AutoModelForCausalLM, AutoTokenizer

# The shared memory path
IPC_DIR = "../ipc_link"
CRASH_FILE = os.path.join(IPC_DIR, "crash.json")
FIX_FILE = os.path.join(IPC_DIR, "fix.json")

print ("[SYMBIOTE] Booting Background Daemon...")
model_name = "Qwen/Qwen2.5-Coder-1.5B"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float32,
    device_map="cpu"
)
print("[SYMBIOTE] Model injected into RAM. Listening for hardware interrupts...")

class CrashHandler(FileSystemEventHandler):
    def on_created(self, event):
        # Hardware interrupt triggered
        if event.src_path.endswith("crash.json"):
            time.sleep(0.05)

            with open(CRASH_FILE, "r") as f:
                data = json.load(f)
            
            start_time = time.time()
            print(f"\n[INTERRUPT] Crash detected in {data['file']}")

            # The surgical prompt
            prompt = f"""Fix this specific JavaScript function that threw this error: {data['error']}.
             Output ONLY the corrected function code. No markdown. No explanations.
             
             BROKEN FUNCTION:
             {data['code_chunk']}

             FIXED FUNCTION:"""
            
            inputs = tokenizer(prompt, return_tensors="pt")

            print("[SYMBIOTE] Generating patch...")
            outputs = model.generate(**inputs, 
                                     max_new_tokens=400, 
                                     temperature=0.1, 
                                     pad_token_id=tokenizer.eos_token_id)
            
            response = tokenizer.decode(outputs[0], skip_special_tokens=True)
            fixed_code = response.split("FIXED FUNCTION:")[1].strip()

            execution_time = time.time() - start_time
            print(f"[SYMBIOTE] Patch synthesized in {execution_time:.2f} seconds.")

            # Wirte the fix back to the shared memory
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