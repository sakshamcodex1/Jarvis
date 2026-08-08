const form = document.getElementById("chatForm");
const input = document.getElementById("messageInput");
const chat = document.getElementById("chat");
const typing = document.getElementById("typing");
const clearBtn = document.getElementById("clearBtn");
const micBtn = document.getElementById("micBtn");

let history = [];

function addMessage(text, role) {
  const row = document.createElement("div");
  row.className = `message ${role}`;
  row.innerHTML = `
    <div class="avatar">${role === "user" ? "👤" : "🤖"}</div>
    <div class="bubble"></div>
  `;
  row.querySelector(".bubble").textContent = text;
  chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  history.push({ role: "user", content: text });
  input.value = "";
  typing.classList.remove("hidden");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, history })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed");

    addMessage(data.reply, "ai");
    history.push({ role: "assistant", content: data.reply });
  } catch (error) {
    addMessage("Error: " + error.message, "ai");
  } finally {
    typing.classList.add("hidden");
  }
});

clearBtn.addEventListener("click", () => {
  history = [];
  chat.innerHTML = "";
  addMessage("Chat cleared. How can I help?", "ai");
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;

  micBtn.addEventListener("click", () => recognition.start());
  recognition.onresult = (event) => {
    input.value = event.results[0][0].transcript;
    input.focus();
  };
} else {
  micBtn.disabled = true;
  micBtn.title = "Voice input is not supported by this browser";
}
