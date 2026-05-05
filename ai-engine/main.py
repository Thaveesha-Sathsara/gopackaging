from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
import time

app = FastAPI()

print("Booting up AI Engine")
print("Loading Qwen2.5-Coder-1.5B into RAM")

# Load the model and tokenizer directly into cpu memory
model_name = "Qwen/Qwen2.5-Coder-1.5B"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float32,
    device_map="cpu"
)

print("AI Model loaded successfully. Awaiting crashes.")

# The data structure Node.js will send us
class CrashReport(BaseModel):
    error: str
    code: str

@app.post("/diagnose-and-patch")
def heal_system(report: CrashReport):
    start_time = time.time()
    print(f"\n Incoming crash {report.error}")

    # Format the prompt for the AI
    prompt = f"""You are an autonomous self-healing system. 
    You will be given a JavaScript error and the broken code. 
    Output ONLY the fully corrected JavaScript code. Do not output markdown or explanations.
    
    ERROR: {report.error}

    BROKEN CODE:
    {report.code}

    FIXED CODE:"""

    inputs = tokenizer(prompt, return_tensors="pt")

    print("Analyzing and generating fix")
    outputs = model.generate(
        **inputs,
        max_new_tokens=550,
        temperature=0.1,
        pad_token_id=tokenizer.eos_token_id
    )

    full_response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    fixed_code = full_response.split("FIXED CODE:")[1].strip()

    execution_time = time.time() - start_time
    print(f"Fix generared in {execution_time:.2f} seconds.")

    # Send it back to Node.js
    return {
        "fixed_code": fixed_code,
        "time_taken": execution_time
    }