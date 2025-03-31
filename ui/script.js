function setRole(role) {
  const listItems = document.getElementById("listItems");
  const sidebarTitle = document.getElementById("sidebarTitle");
  const userNameSpan = document.getElementById("userName");

  if (role === "provider") {
    document.getElementById("providerPanel").classList.remove("hidden");
    document.getElementById("providerActions").classList.remove("hidden");
    document.getElementById("patientPanel").classList.add("hidden");
    document.getElementById("patientActions").classList.add("hidden");

    sidebarTitle.innerHTML =  `<i class="fas fa-users me-2 text-primary"></i>Patients`;  
    userNameSpan.innerText = "Dr. Smith";

const patients = [
  { name: "Ava Thompson", tag: "Diabetic" },
  { name: "Miguel Santiago", tag: "Cardiac" },
  { name: "Chloe Zhang", tag: "Pediatric" },
];

listItems.innerHTML = "";
patients.forEach((p) => {
  const initials = p.name.split(" ").map(w => w[0]).join("");
  const tagBadge = `<span class="badge bg-light text-dark border ms-2">${p.tag}</span>`;
  listItems.innerHTML += `
    <li class="nav-item">
      <a class="nav-link text-dark d-flex align-items-center justify-content-between" href="#">
        <div><i class='fas fa-user me-2 text-secondary'></i>${p.name}${tagBadge}</div>
      </a>
    </li>`;
});
    
  } else {
    document.getElementById("providerPanel").classList.add("hidden");
    document.getElementById("providerActions").classList.add("hidden");
    document.getElementById("patientPanel").classList.remove("hidden");
    document.getElementById("patientActions").classList.remove("hidden");

    sidebarTitle.innerHTML = `<i class="fas fa-folder-open me-2 text-primary"></i>Past Records`;
    userNameSpan.innerText = "John Doe";

    listItems.innerHTML = `
        <div class="sidebar-section-title">Today</div>
        <li class="nav-item"><a class="nav-link text-dark d-flex justify-content-between align-items-center" href="#">
        <span><i class='fas fa-file-alt me-2'></i>Visit Notes</span><span class="badge bg-light text-muted border">PDF</span></a></li>
        <div class="sidebar-section-title">Yesterday</div>
        <li class="nav-item"><a class="nav-link text-dark d-flex justify-content-between align-items-center" href="#">
        <span><i class='fas fa-file-alt me-2'></i>Chest XRay</span><span class="badge bg-light text-muted border">DCM</span></a></li>
        <div class="sidebar-section-title">Previous 7 Days</div>
        <li class="nav-item"><a class="nav-link text-dark d-flex justify-content-between align-items-center" href="#">
        <span><i class='fas fa-file-alt me-2'></i>Lab Report</span><span class="badge bg-light text-muted border">TXT</span></a></li>
        <li class="nav-item"><a class="nav-link text-dark d-flex justify-content-between align-items-center" href="#">
        <span><i class='fas fa-file-alt me-2'></i>Discharge Summary</span><span class="badge bg-light text-muted border">DOC</span></a></li>
      `;
  }
  // Highlight clicked sidebar item
  setTimeout(() => {
    const sidebarLinks = document.querySelectorAll(
      ".sidebar #listItems .nav-link"
    );
    sidebarLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault(); // optional, prevents # jump
        sidebarLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
      });
    });
  }, 0); 
}

window.onload = () => setRole("provider");

document.getElementById("fileUpload")?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  const preview = document.getElementById("docPreview");

  if (file && file.type.startsWith("text")) {
    const reader = new FileReader();
    reader.onload = () => {
      preview.innerText = reader.result.substring(0, 1000);
    };
    reader.readAsText(file);
  } else {
    preview.innerText = "Unsupported file type. Please upload a text file.";
  }
});

document.getElementById("dropzone").addEventListener("click", (e) => {
  document.getElementById("fileUpload").click();
});

document.getElementById("translateButton")?.addEventListener("click", () => {
  alert("Translate functionality coming soon!");
});

document.getElementById("simplifyButton")?.addEventListener("click", () => {
  alert("Simplify functionality coming soon!");
});

document.getElementById("generateQR")?.addEventListener("click", () => {
  alert("QR Code generation coming soon!");
});

document.getElementById("sendButton")?.addEventListener("click", () => {
  const input = document.getElementById("chatInput");
  const chatWindow = document.getElementById("chatWindow");
  const userMsg = input.value.trim();

  if (userMsg) {
    const userDiv = document.createElement("div");
    userDiv.className = "chat-msg chat-user";
    userDiv.innerText = userMsg;
    chatWindow.appendChild(userDiv);

    input.value = "";
    chatWindow.scrollTop = chatWindow.scrollHeight;

    setTimeout(() => {
      const botDiv = document.createElement("div");
      botDiv.className = "chat-msg chat-bot";
      botDiv.innerText = "Sure! Let me help you with that.";
      chatWindow.appendChild(botDiv);
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }, 600);
  }
});
