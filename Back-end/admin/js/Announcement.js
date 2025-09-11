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
        <p class="announcement-text">${a.text}</p>
        <div class="announcement-meta">
          <span class="type">Type: ${a.type}</span>
          <span class="date">${new Date(a.createdAt).toLocaleDateString()}</span>
        </div>
        <div class="announcement-actions">
          <button onclick="announcementController.toggleType('${a._id}', '${a.type}')">
            ${a.type === "favorite" ? "Unfavorite" : "Favorite"}
          </button>
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
