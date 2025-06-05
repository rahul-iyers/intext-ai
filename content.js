// Add fadeInOut animation to page if not already present
if (!document.getElementById("fadeInOut-style")) {
  const style = document.createElement("style");
  style.id = "fadeInOut-style";
  style.textContent = `
    @keyframes fadeInOut {
      0%, 100% { opacity: 0.2; }
      50% { opacity: 1; }
    }
    .thinking-animation {
      animation: fadeInOut 1.5s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}

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
  // dialog.style.border = "3px solid #ccc";
  dialog.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
  dialog.style.zIndex = 10002;
  dialog.style.width = "300px";
  dialog.style.fontFamily = "sans-serif";

  // Header
  const header = document.createElement("div");
  header.style.cursor = "move";
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";
  header.style.marginBottom = "8px";

  const title = document.createElement("div");
  title.innerText = "Intext AI";
  title.style.fontStyle = 'italic';
  title.style.fontSize = "20px";
  title.style.fontWeight = "bold";

  const closeBtn = document.createElement("button");
  closeBtn.innerText = "✕";
  closeBtn.style.border = "none";
  closeBtn.style.background = "transparent";
  closeBtn.style.cursor = "pointer";
  closeBtn.onclick = () => {
    dialog.remove();
    createFloatingIcon(() => showQueryDialog(selection, context, x, y));
  };


  header.appendChild(title);
  header.appendChild(closeBtn);
  dialog.appendChild(header);

  const textarea = document.createElement("textarea");
  textarea.placeholder = "Type your question...";
  textarea.style.width = "100%";
  textarea.style.height = "80px";
  textarea.style.padding = "6px";
  textarea.style.fontSize = "14px";
  textarea.style.border = "1px solid #ccc";
  textarea.style.borderRadius = "6px";
  textarea.style.resize = "none";

  // Submit button
  const submitBtn = document.createElement("button");
  submitBtn.innerText = "Ask";
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

    dialog.remove();
    const responseContainer = showResponse("Loading...", x, y + 40);

    try {
      const answer = await fetchAIResponse(question, context, selection);
      updateResponseContent(responseContainer, answer);
    } catch (err) {
      updateResponseContent(responseContainer, "Error fetching response.");
    }
  };

  dialog.appendChild(textarea);
  dialog.appendChild(submitBtn);
  document.body.appendChild(dialog);

  // Dragging
  let isDragging = false, offsetX = 0, offsetY = 0;
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
    dialog.style.right = "auto";
  });
  document.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.style.userSelect = "auto";
  });
}

function createFloatingIcon(reopenCallback) {
  // Check if already exists
  if (document.getElementById("intext-floating-icon")) return;

  const icon = document.createElement("div");
  icon.id = "intext-floating-icon";
  icon.style.position = "fixed";
  icon.style.top = "20px";
  icon.style.right = "20px";
  icon.style.zIndex = 10000;
  icon.style.background = "#222";
  icon.style.color = "#fff";
  icon.style.padding = "8px 12px";
  icon.style.borderRadius = "20px";
  icon.style.display = "flex";
  icon.style.alignItems = "center";
  icon.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
  icon.style.fontFamily = "sans-serif";
  icon.style.cursor = "pointer";

  const label = document.createElement("span");
  label.innerText = "💬 Intext AI";
  label.style.marginRight = "8px";
  label.style.userSelect = "none";

  const closeBtn = document.createElement("button");
  closeBtn.innerText = "✕";
  closeBtn.style.border = "none";
  closeBtn.style.background = "transparent";
  closeBtn.style.color = "#fff";
  closeBtn.style.fontSize = "14px";
  closeBtn.style.cursor = "pointer";

  // Reopen dialog
  icon.onclick = () => {
    reopenCallback();
    icon.remove();
  };

  // Stop propagation for close button
  closeBtn.onclick = (e) => {
    e.stopPropagation();
    icon.remove(); // fully remove
  };

  icon.appendChild(label);
  icon.appendChild(closeBtn);
  document.body.appendChild(icon);
}

function showResponse(text, x, y) {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "20px";
  container.style.right = "20px";
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

  // Header
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

  // Content
  const content = document.createElement("div");
  content.innerText = text === "Loading..." ? "Thinking" : text;
  if (text === "Loading...") {
    content.classList.add("thinking-animation");
  } else {
    content.classList.remove("thinking-animation");
  }
  content.style.padding = "10px";
  content.style.whiteSpace = "pre-wrap";
  content.style.flex = "1";
  content.style.overflowY = "auto";
  container._contentDiv = content;
  container.appendChild(content);

  const followUpContainer = document.createElement("div");
  followUpContainer.style.display = "flex";
  followUpContainer.style.borderTop = "1px solid #ddd";
  followUpContainer.style.padding = "8px";

  const followUpInput = document.createElement("input");
  followUpInput.type = "text";
  followUpInput.placeholder = "Ask a follow-up...";
  followUpInput.style.flex = "1";
  followUpInput.style.padding = "6px";
  followUpInput.style.border = "1px solid #ccc";
  followUpInput.style.borderRadius = "4px";
  followUpInput.style.marginRight = "6px";

  const sendBtn = document.createElement("button");
  sendBtn.innerText = "Send";
  sendBtn.style.padding = "6px 10px";
  sendBtn.style.border = "none";
  sendBtn.style.background = "#222";
  sendBtn.style.color = "#fff";
  sendBtn.style.borderRadius = "4px";
  sendBtn.style.cursor = "pointer";

  const initialMessages = [
    {
      role: "system",
      content:
        "You're an assistant that helps users by answering questions based on the full intext of a webpage. Use both the highlighted selection and surrounding page text to form intelligent answers."
    },
    {
      role: "user",
      content: `Webpage content:\n${document.body.innerText.slice(0, 4000)}\n\nUser's highlighted selection: "${text}"\n\nQuestion: ${text}`
    }
  ];


  sendBtn.onclick = async () => {
    const newQuestion = followUpInput.value.trim();
    if (!newQuestion) return;

    const messages = container._chatMessages || [...initialMessages];
    messages.push({ role: "user", content: newQuestion });
    content.innerText += `\n\nYou: ${newQuestion}\nIntext AI: Thinking...`;
    followUpInput.value = "";
    content.scrollTop = content.scrollHeight;

    try {
      const answer = await fetchFollowUpResponse(messages);
      messages.push({ role: "assistant", content: answer });
      content.innerText += `\n\nIntext AI: ${answer}`;
      content.scrollTop = content.scrollHeight;
      container._chatMessages = messages;
    } catch (e) {
      content.innerText += "\n\nIntext AI: Error fetching response.";
    }
  };

  followUpContainer.appendChild(followUpInput);
  followUpContainer.appendChild(sendBtn);
  container.appendChild(followUpContainer);

  document.body.appendChild(container);

  // Dragging
  let isDragging = false, offsetX, offsetY;
  header.addEventListener("mousedown", (e) => {
    isDragging = true;
    const rect = container.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    document.body.style.userSelect = "none";
  });
  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    container.style.left = `${e.clientX - offsetX}px`;
    container.style.top = `${e.clientY - offsetY}px`;
    container.style.right = "auto";
  });
  document.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.style.userSelect = "auto";
  });

  closeBtn.onclick = () => container.remove();

  let minimized = false;
  minimizeBtn.onclick = () => {
    minimized = !minimized;
    content.style.display = minimized ? "none" : "block";
    container.style.height = minimized ? "auto" : "200px";
    minimizeBtn.innerText = minimized ? "+" : "—";
  };

  return container;
}

function updateResponseContent(container, newText) {
  if (container && container._contentDiv) {
    const content = container._contentDiv;
    content.innerText = newText;
    content.classList.remove("thinking-animation");
    content.style.display = "block";
    container.style.height = "200px";

    const minimizeBtn = container.querySelector("button");
    if (minimizeBtn) minimizeBtn.innerText = "—";
  }
}

async function fetchFollowUpResponse(messages) {
  const apiKey = OPENAI_API_KEY;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: messages
    })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "No response.";
}

// injecting button near the selection
function injectButton(text, x, y) {
  const existing = document.getElementById("intext-ai-button");
  if (existing) existing.remove();

  const btn = document.createElement("button");
  btn.id = "intext-ai-button";
  btn.innerText = "Ask Intext AI";
  btn.style.position = "absolute";
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

// fetch openai response
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
  return data.choices?.[0]?.message?.content || "No response.";
}

// Auto-inject logic on text selection
let suppressClick = false;

document.addEventListener("mouseup", () => {
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
    } catch {}
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
