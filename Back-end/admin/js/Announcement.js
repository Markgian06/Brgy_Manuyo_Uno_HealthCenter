const API_URL = "http://localhost:5000/api/announcements";

const announcementController = {
  currentFilter: "all",

  async create() {
    const textArea = document.getElementById("newAnnouncementText");
    const text = textArea.value.trim();
    if (!text) return alert("Please enter an announcement.");

    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, type: "unfavorite" }),
    });

    textArea.value = "";
    this.load(this.currentFilter);
  },

  async load(filter = "all") {
    this.currentFilter = filter;

    try {
      const res = await fetch(API_URL);
      const result = await res.json();
      let announcements = result.data || result;

      if (filter !== "all") {
        announcements = announcements.filter(a => a.type === filter);
      }

      const container = document.getElementById("announcementsContainer");
      container.innerHTML = "";

      if (!announcements || announcements.length === 0) {
        container.innerHTML = `<p>No announcements found.</p>`;
        return;
      }

      announcements.forEach((a) => {
        const div = document.createElement("div");
        div.classList.add("announcement-card");
        if (a.type === "favorite") div.classList.add("favorite");

        div.innerHTML = `
          <p class="announcement-text" id="text-${a._id}">${a.text}</p>
          <div class="announcement-meta">
            <span class="type">Type: ${a.type}</span>
            <span class="date" id="date-${a._id}">${new Date(a.createdAt).toLocaleString()}</span>
          </div>
          <div class="announcement-actions" id="actions-${a._id}">
            <button onclick="announcementController.toggleType('${a._id}', '${a.type}')">
              ${a.type === "favorite" ? "Unfavorite" : "Favorite"}
            </button>
            <button onclick="announcementController.startEdit('${a._id}', \`${a.text.replace(/`/g,'\\`')}\`)">Edit</button>
            <button onclick="announcementController.remove('${a._id}')">Delete</button>
          </div>
        `;
        container.appendChild(div);
      });

      this.updateStats(announcements);
    } catch (err) {
      console.error("Error loading announcements:", err);
    }
  },

  async toggleType(id, currentType) {
    const newType = currentType === "favorite" ? "unfavorite" : "favorite";

    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: newType }),
    });

    this.load(this.currentFilter);
  },

  filter(type, button) {
    document.querySelectorAll(".filter-btn").forEach(btn =>
      btn.classList.remove("active")
    );
    button.classList.add("active");

    this.load(type);
  },

  startEdit(id, currentText) {
    const textEl = document.getElementById(`text-${id}`);
    const actionsEl = document.getElementById(`actions-${id}`);
    const dateEl = document.getElementById(`date-${id}`);

    if (!textEl || !actionsEl || !dateEl) return console.error("Element not found for id:", id);

    textEl.innerHTML = `<input type="text" id="edit-input-${id}" value="${currentText}" style="width: 100%;">`;

    actionsEl.innerHTML = `
      <button id="save-btn-${id}">Save</button>
      <button id="cancel-btn-${id}">Cancel</button>
    `;

    // Save button
    document.getElementById(`save-btn-${id}`).addEventListener("click", async () => {
      const inputEl = document.getElementById(`edit-input-${id}`);
      const newText = inputEl.value.trim();
      if (!newText) return alert("Text cannot be empty.");

      const now = new Date().toISOString();

      await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newText, updatedAt: now }),
      });

      textEl.textContent = newText;
      dateEl.textContent = new Date(now).toLocaleString();

      this.resetActions(id, newText);
    });

    // Cancel button
    document.getElementById(`cancel-btn-${id}`).addEventListener("click", () => {
      textEl.textContent = currentText;
      this.resetActions(id, currentText);
    });
  },

  resetActions(id, text) {
    const actionsEl = document.getElementById(`actions-${id}`);
    actionsEl.innerHTML = `
      <button onclick="announcementController.toggleType('${id}', 'unfavorite')">Favorite</button>
      <button onclick="announcementController.startEdit('${id}', \`${text.replace(/`/g,'\\`')}\`)">Edit</button>
      <button onclick="announcementController.remove('${id}')">Delete</button>
    `;
  },

  async remove(id) {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    this.load(this.currentFilter);
  },

  updateStats(announcements) {
    document.getElementById("totalCount").textContent = announcements.length;
    document.getElementById("favoriteCount").textContent =
      announcements.filter(a => a.type === "favorite").length;
    document.getElementById("unfavoriteCount").textContent =
      announcements.filter(a => a.type === "unfavorite").length;
  },
};

// Auto-load on page start
window.onload = () => {
  announcementController.load("all");
};
