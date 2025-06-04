function showQueryDialog(selection, context, x, y) {
  const oldDialog = document.getElementById("intext-ai-query-box");
  if (oldDialog) oldDialog.remove();

  const dialog = document.createElement("div");
  dialog.id = "intext-ai-query-box";
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

  // Header / Title bar (used for dragging)
  const header = document.createElement("div");
  header.style.cursor = "move";
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";
  header.style.marginBottom = "8px";

  const title = document.createElement("div");
  title.innerText = "Ask Intext AI";
  title.style.fontSize = "16px";
  title.style.fontWeight = "bold";

  const closeBtn = document.createElement("button");
  closeBtn.innerText = "✕";
  closeBtn.style.border = "none";
  closeBtn.style.background = "transparent";
  closeBtn.style.cursor = "pointer";
  closeBtn.onclick = () => dialog.remove();

  header.appendChild(title);
  header.appendChild(closeBtn);
  dialog.appendChild(header);

  // Body
  const textarea = document.createElement("textarea");
  textarea.placeholder = "Type your question...";
  textarea.style.width = "100%";
  textarea.style.height = "80px";
  textarea.style.padding = "6px";
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

  dialog.appendChild(textarea);
  dialog.appendChild(submitBtn);
  document.body.appendChild(dialog);

  // ✨ Dragging logic
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  header.addEventListener("mousedown", (e) => {
    isDragging = true;
    const rect = dialog.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    dialog.style.left = `${e.clientX - offsetX}px`;
    dialog.style.top = `${e.clientY - offsetY}px`;
    dialog.style.right = "auto"; // override fixed right so it can move
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.style.userSelect = "auto";
  });
}


function injectButton(text, x, y) {
  const existing = document.getElementById("intext-ai-button");
  if (existing) existing.remove();

  const btn = document.createElement("button");
  btn.innerText = "Ask Intext AI";
  btn.id = "intext-ai-button";
  btn.style.position = "absolute"; // <- fix here
  btn.style.top = `${y}px`;
  btn.style.left = `${x}px`;
  btn.style.zIndex = 10000;
  btn.style.padding = "6px 10px";
  btn.style.borderRadius = "6px";
  btn.style.background = "#222";
  btn.style.color = "#fff";
  btn.style.border = "none";
  btn.style.cursor = "pointer";
  btn.style.fontSize = "14px";

  btn.onclick = async (e) => {
    e.stopPropagation();
    const context = document.body.innerText.slice(0, 4000);
    showQueryDialog(text, context, x, y);
  };

  document.body.appendChild(btn);
}

function showResponse(text, x, y) {
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.top = `${y}px`;
  container.style.left = `${x}px`;
  container.style.background = "#fff";
  container.style.border = "1px solid #ccc";
  container.style.borderRadius = "8px";
  container.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
  container.style.width = "300px";
  container.style.height = "200px";
  container.style.zIndex = 10001;
  container.style.fontFamily = "sans-serif";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.resize = "both";
  container.style.overflow = "auto";

  // Header (drag handle)
  const header = document.createElement("div");
  header.style.cursor = "move";
  header.style.padding = "6px 10px";
  header.style.background = "#f2f2f2";
  header.style.borderBottom = "1px solid #ddd";
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";

  const title = document.createElement("div");
  title.innerText = "AI Response";
  title.style.fontWeight = "bold";

  // Close and Minimize buttons
  const controls = document.createElement("div");

  const minimizeBtn = document.createElement("button");
  minimizeBtn.innerText = "—";
  minimizeBtn.style.marginRight = "6px";
  minimizeBtn.style.border = "none";
  minimizeBtn.style.background = "transparent";
  minimizeBtn.style.cursor = "pointer";
  minimizeBtn.style.fontSize = "16px";

  const closeBtn = document.createElement("button");
  closeBtn.innerText = "✕";
  closeBtn.style.border = "none";
  closeBtn.style.background = "transparent";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.fontSize = "16px";

  controls.appendChild(minimizeBtn);
  controls.appendChild(closeBtn);

  header.appendChild(title);
  header.appendChild(controls);
  container.appendChild(header);

  // Content (toggle visibility)
  const content = document.createElement("div");
  content.innerText = text;
  content.style.padding = "10px";
  content.style.whiteSpace = "pre-wrap";
  content.style.flex = "1";
  container.appendChild(content);

  document.body.appendChild(container);

  // Draggable Logic
  let isDragging = false;
  let offsetX, offsetY;

  header.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - container.getBoundingClientRect().left;
    offsetY = e.clientY - container.getBoundingClientRect().top;
    document.body.style.userSelect = "none"; // prevent text selection
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    container.style.left = `${e.clientX - offsetX}px`;
    container.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.style.userSelect = "auto";
  });

  // Close
  closeBtn.onclick = () => container.remove();

  // Minimize/Expand
  let minimized = false;
  minimizeBtn.onclick = () => {
    minimized = !minimized;
    content.style.display = minimized ? "none" : "block";
    container.style.height = minimized ? "auto" : "200px";
    minimizeBtn.innerText = minimized ? "+" : "—";
  };
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

      // Remove previous button if it exists
      const oldBtn = document.getElementById("intext-ai-button");
      if (oldBtn) oldBtn.remove();

      const x = rect.right + window.scrollX;
      const y = rect.bottom + window.scrollY;

      suppressClick = true;
      injectButton(selectedText, x, y);
    } catch (err) {
      // do nothing, invalid selection
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

