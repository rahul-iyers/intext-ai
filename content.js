function injectButton(text, x, y) {
  const existing = document.getElementById("intext-ai-button");
  if (existing) existing.remove();

  const btn = document.createElement("button");
  btn.innerText = "Ask Intext AI";
  btn.id = "intext-ai-button";
  btn.style.position = "absolute";
  btn.style.top = `${y + 10}px`;
  btn.style.left = `${x + 10}px`;
  btn.style.zIndex = 10000;
  btn.style.padding = "6px 10px";
  btn.style.borderRadius = "6px";
  btn.style.background = "#222";
  btn.style.color = "#fff";
  btn.style.border = "none";
  btn.style.cursor = "pointer";
  btn.style.fontSize = "14px";
  document.body.appendChild(btn);

  btn.onclick = async () => {
    const question = prompt("Ask a question based on your selection:");
    if (!question) return;

    const intext = document.body.innerText.slice(0, 4000);

    const loadingDiv = document.createElement("div");
    loadingDiv.innerText = "Thinking...";
    loadingDiv.id = "intext-ai-loading";
    loadingDiv.style.position = "absolute";
    loadingDiv.style.top = `${y + 40}px`;
    loadingDiv.style.left = `${x + 10}px`;
    loadingDiv.style.background = "#f4f4f4";
    loadingDiv.style.padding = "8px";
    loadingDiv.style.borderRadius = "6px";
    loadingDiv.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
    loadingDiv.style.zIndex = 10001;
    loadingDiv.style.fontFamily = "sans-serif";
    document.body.appendChild(loadingDiv);

    btn.disabled = true;
    btn.innerText = "Loading...";

    const answer = await fetchAIResponse(question, intext, text);
    loadingDiv.remove();
    showResponse(answer, x, y + 40);
    btn.remove();
  };
}

function showResponse(text, x, y) {
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.top = `${y}px`;
  container.style.left = `${x}px`;
  container.style.background = "#fff";
  container.style.padding = "10px";
  container.style.borderRadius = "8px";
  container.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
  container.style.maxWidth = "400px";
  container.style.zIndex = 10001;
  container.style.fontFamily = "sans-serif";

  const closeBtn = document.createElement("button");
  closeBtn.innerText = "✕";
  closeBtn.style.float = "right";
  closeBtn.style.border = "none";
  closeBtn.style.background = "transparent";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.fontSize = "16px";
  closeBtn.onclick = () => container.remove();

  const content = document.createElement("div");
  content.innerText = text;
  content.style.marginTop = "10px";
  content.style.whiteSpace = "pre-wrap";

  container.appendChild(closeBtn);
  container.appendChild(content);
  document.body.appendChild(container);
}

async function fetchAIResponse(question, intext, selection) {
  const apiKey = OPENAI_API_KEY;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You're an assistant that helps users by answering questions based on the full intext of a webpage. Use both the highlighted selection and surrounding page text to form intelligent answers."
        },
        {
          role: "user",
          content: `Webpage content:\n${intext}\n\nUser's highlighted selection: "${selection}"\n\nQuestion: ${question}`
        }
      ]
    })
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "No response";
}

document.addEventListener("mouseup", (e) => {
  const selection = window.getSelection().toString().trim();

  // 🛑 Ignore clicks on the button itself
  if (e.target.id === "intext-ai-button") return;

  if (selection.length > 0) {
    injectButton(selection, e.pageX, e.pageY);
  }
});

