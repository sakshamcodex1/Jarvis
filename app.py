import os
from flask import Flask, request, jsonify, send_from_directory
from openai import OpenAI

app = Flask(__name__, static_folder=".")

# Set your API key as an environment variable:
# Windows PowerShell: $env:OPENAI_API_KEY="your-key"
# macOS/Linux: export OPENAI_API_KEY="your-key"
api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=api_key) if api_key else None

@app.get("/")
def home():
    return send_from_directory(".", "index.html")

@app.post("/api/chat")
def chat():
    if not client:
        return jsonify({
            "error": "OPENAI_API_KEY is not configured. Set your API key and restart the server."
        }), 500

    data = request.get_json(silent=True) or {}
    message = str(data.get("message", "")).strip()
    history = data.get("history", [])

    if not message:
        return jsonify({"error": "Message cannot be empty."}), 400

    # Keep a reasonable amount of conversation history.
    messages = []
    for item in history[-20:]:
        role = item.get("role")
        content = item.get("content")
        if role in ("user", "assistant") and isinstance(content, str):
            messages.append({"role": role, "content": content})

    try:
        response = client.responses.create(
            model="gpt-5.4",
            instructions="You are a helpful, friendly AI assistant. Give clear and useful answers.",
            input=messages
        )
        return jsonify({"reply": response.output_text})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
