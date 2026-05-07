import time
import json
import os
import google.generativeai as genai
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

genai.configure(api_key="AIzaSyC7rZ-X3gELFV9IphjW-9e7573dqCWGQWA")
model = genai.GenerativeModel('gemini-3-flash-preview')

IPC_DIR = "../server/ipc_link"
CRASH_FILE = os.path.join(IPC_DIR, "crash.json")
FIX_FILE = os.path.join(IPC_DIR, "fix.json")

print("[SYMBIOTE] Booting Cloud-Powered Autonomous Engine...")
print("[SYMBIOTE] Listening for hardware interrupts...")

class CrashHandler(FileSystemEventHandler):
    def on_created(self, event):
        if event.src_path.endswith("crash.json"):
            time.sleep(0.05)

            try:
                with open(CRASH_FILE, "r") as f:
                    data = json.load(f)
            except (FileNotFoundError, json.JSONDecodeError):
                return 
            
            with open(CRASH_FILE, "r") as f:
                data = json.load(f)

            start_time = time.time()
            print(f"\n[INTERRUPT] Crash detected in {data['file']}")

            prompt = f"""
You are an autonomous Node.js debugging agent. 
The system crashed with this exact error: {data['error']}

Analyze the code, figure out the logical flaw, and fix it.
Output ONLY the corrected JavaScript function. No markdown, no backticks, no explanations. Just the raw code.

BROKEN FUNCTION:
{data['code_chunk']}
"""
            print("[SYMBIOTE] Transmitting to Cloud Brain...")
            
            # The API Call
            response = model.generate_content(prompt)
            
            # Clean up any accidental markdown the model might add
            fixed_code = response.text.replace("```javascript", "").replace("```", "").strip()

            execution_time = time.time() - start_time
            print(f"[⏱METRICS] Patch synthesized via Cloud in {execution_time:.2f} seconds.")

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