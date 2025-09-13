const API_URL = "http://localhost:5000/api/announcements";

const announcementController = {
  announcements: [],
  currentPage: 1,
  pageSize: 6,
  currentFilter: "all",
  currentQuery: "", 

updateStats() {
  const total = this.announcements.length; 
  const statCard = document.querySelector(".stat-number");
  if (statCard) {
    statCard.textContent = total;
  }

   if (!this.announcements) return;
  const favoriteCount = this.announcements.filter(a => a.type === "favorite").length;
  const unfavoriteCount = this.announcements.filter(a => a.type === "unfavorite").length;
  const favEl = document.getElementById("favoriteCount");
  const unfavEl = document.getElementById("unfavoriteCount");

  if (favEl) favEl.textContent = favoriteCount;
  if (unfavEl) unfavEl.textContent = unfavoriteCount;
},
 
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

async load(filter = "all", query = null,  updateStats = true) {    
  this.currentFilter = filter;
    if (query !== null) this.currentQuery = query;

  try {
    const url = query
      ? `${API_URL}?q=${encodeURIComponent(query)}`
      : API_URL;

    const res = await fetch(url);
    const result = await res.json();
    let announcements = result.data || result;

    if (filter !== "all") {
      announcements = announcements.filter(a => a.type === filter);
    }

        this.announcements = announcements;  
        const totalCount = announcements.length;



    const container = document.getElementById("announcementsContainer");
    container.innerHTML = "";

    if (!announcements || announcements.length === 0) {
      container.innerHTML = `<p>No announcements found.</p>`;
      return totalCount;
    }

    // 📌 Pagination slice
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    const paginatedAnnouncements = announcements.slice(start, end);

    paginatedAnnouncements.forEach((a) => {
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

    this.renderPagination(announcements.length);

      if (updateStats) this.updateStats();
      
      return totalCount;
    } catch (err) {
    console.error("Error loading announcements:", err);
  }
},


   async search() {
    this.currentPage = 1;
    const query = document.getElementById("searchInput").value.trim();

    const total = await this.load(this.currentFilter, query, false);

    const searchText = document.getElementById("searchResultText");
      if (query) {
         const total = this.announcements.length;
         searchText.textContent = `Showing ${total} result${total !== 1 ? "s" : ""} for "${query}"`;
     } else {
        searchText.textContent = "";
       }
  },

  async toggleType(id, currentType) {
    const newType = currentType === "favorite" ? "unfavorite" : "favorite";

    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: newType }),
    });
    this.load(this.currentFilter);  this.load(this.currentFilter, query, true);
  },

    filter(type, button) {
      document.querySelectorAll(".filter-btn").forEach(btn =>
        btn.classList.remove("active")
      );
      button.classList.add("active");

      this.load(type, this.currentQuery, false);
    },

  startEdit(id, currentText) {
    const textEl = document.getElementById(`text-${id}`);
    const actionsEl = document.getElementById(`actions-${id}`);
    const dateEl = document.getElementById(`date-${id}`);

    if (!textEl || !actionsEl || !dateEl) return console.error("Element not found for id:", id);

      textEl.innerHTML = `
    <textarea 
      id="edit-input-${id}" 
      style="width: 90%; height: 80px; font-size: 16px; 
             overflow-y: auto; resize: vertical; line-height: 1.4; 
             max-height: 150px;"
    >${currentText}</textarea>
  `;
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

    renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / this.pageSize);
    const paginationEl = document.getElementById("paginationControls");

    if (!paginationEl) return;
    paginationEl.innerHTML = "";

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "⬅ Prev";
    prevBtn.disabled = this.currentPage === 1;
    prevBtn.onclick = () => {
      this.currentPage--;
      this.load(this.currentFilter); 
      announcementController.load(announcementController.currentFilter);
    };

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next ➡";
    nextBtn.disabled = this.currentPage === totalPages;
    nextBtn.onclick = () => {
      this.currentPage++;
      this.load(this.currentFilter); 
      announcementController.load(announcementController.currentFilter);
    };

    paginationEl.appendChild(prevBtn);
    paginationEl.appendChild(document.createTextNode(` Page ${this.currentPage} of ${totalPages} `));
    paginationEl.appendChild(nextBtn);
  },
};

// Auto-load on page start
window.onload = () => {
  announcementController.load("all", null, true);
};
