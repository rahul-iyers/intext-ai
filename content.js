function showQueryDialog(selection, context, x, y) {
  // Avoid duplicates
  const oldDialog = document.getElementById("context-ai-query-box");
  if (oldDialog) oldDialog.remove();

  const dialog = document.createElement("div");
  dialog.id = "context-ai-query-box";
  dialog.style.position = "fixed";
  dialog.style.top = "20px";
  dialog.style.right = "20px";
  dialog.style.background = "#fff";
  dialog.style.padding = "16px";
  dialog.style.borderRadius = "10px";
  dialog.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
  dialog.style.zIndex = 10002;
  dialog.style.width = "300px";
  dialog.style.fontFamily = "sans-serif";

  const title = document.createElement("div");
  title.innerText = "Ask Context AI";
  title.style.fontSize = "16px";
  title.style.fontWeight = "bold";
  title.style.marginBottom = "8px";

  const closeBtn = document.createElement("button");
  closeBtn.innerText = "✕";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "8px";
  closeBtn.style.right = "8px";
  closeBtn.style.border = "none";
  closeBtn.style.background = "transparent";
  closeBtn.style.cursor = "pointer";
  closeBtn.onclick = () => dialog.remove();

  const textarea = document.createElement("textarea");
  textarea.placeholder = "Type your question...";
  textarea.style.width = "100%";
  textarea.style.height = "80px";
  textarea.style.padding = "6px";
  textarea.style.marginTop = "4px";
  textarea.style.fontSize = "14px";
  textarea.style.border = "1px solid #ccc";
  textarea.style.borderRadius = "6px";
  textarea.style.resize = "none";

  const submitBtn = document.createElement("button");
  submitBtn.innerText = "Submit";
  submitBtn.style.marginTop = "10px";
  submitBtn.style.padding = "8px 12px";
  submitBtn.style.background = "#222";
  submitBtn.style.color = "#fff";
  submitBtn.style.border = "none";
  submitBtn.style.borderRadius = "6px";
  submitBtn.style.cursor = "pointer";

  submitBtn.onclick = async () => {
    const question = textarea.value.trim();
    if (!question) return;

    dialog.innerHTML = "<em>Thinking...</em>";

    const answer = await fetchAIResponse(question, context, selection);
    dialog.remove();
    showResponse(answer, x, y + 40);
  };

  dialog.appendChild(closeBtn);
  dialog.appendChild(title);
  dialog.appendChild(textarea);
  dialog.appendChild(submitBtn);
  document.body.appendChild(dialog);
}


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
    const context = document.body.innerText.slice(0, 4000);
    showQueryDialog(text, context, x, y);
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

let suppressClick = false;

document.addEventListener("mouseup", (e) => {
  setTimeout(() => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (!selectedText) return;

    try {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      if (!rect || (rect.width === 0 && rect.height === 0)) return;

      const x = rect.right + window.scrollX;
      const y = rect.bottom + window.scrollY;

      suppressClick = true;
      injectButton(selectedText, x, y);
    } catch (err) {
      // no-op
    }
  }, 10);
});

document.addEventListener("click", (e) => {
  if (suppressClick) {
    suppressClick = false;
    return;
  }

  const btn = document.getElementById("intext-ai-button");
  const dialog = document.getElementById("intext-ai-query-box");

  if (btn && !btn.contains(e.target)) btn.remove();
  if (dialog && !dialog.contains(e.target)) dialog.remove();
});

