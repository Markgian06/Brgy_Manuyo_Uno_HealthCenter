const API_URL = "http://localhost:5000/api/posts";
let allPosts = []; // store all posts globally

document.addEventListener("DOMContentLoaded", () => {
  // Load all posts
  async function loadPosts() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch posts");
      allPosts = await res.json(); // store globally
      applyFilters(); // render with filter/search
    } catch (err) {
      console.error("Error loading posts:", err);
      document.getElementById("postsContainer").innerHTML =
        "<p style='color:red'>Error loading posts.</p>";
    }
  }

  // Apply search + filter
  function applyFilters() {
    const searchValue = document
      .getElementById("searchInput")
      .value.toLowerCase();
    const statusValue = document.getElementById("statusFilter").value;

    let filtered = allPosts.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchValue) ||
        p.content.toLowerCase().includes(searchValue) ||
        p.category.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusValue === "all"
          ? true
          : statusValue === "favorite"
          ? p.favorite === true
          : p.status === statusValue;

      return matchesSearch && matchesStatus;
    });

    renderPosts(filtered);
  }

  // Render posts
  function renderPosts(posts) {
    const container = document.getElementById("postsContainer");
    container.innerHTML = "";

    if (posts.length === 0) {
      container.innerHTML = `<p>No posts found.</p>`;
      document.getElementById("postCount").textContent = `(0)`;
      return;
    }

    posts.forEach((p) => {
      const div = document.createElement("div");
      div.className = "post-card";
      div.setAttribute("data-id", p._id);

      div.innerHTML = `
        <div class="post-header">
          <div class="post-id">ID: #${p._id.slice(-4)}</div>
          <div class="post-status status-${p.status}">${p.status}</div>
        </div>
        <div class="post-content">
          <div class="post-title">${p.title}</div>
          <div class="post-text">${p.content}</div>
        </div>
        <div class="post-meta">
          <span><i class="fas fa-calendar"></i> Created: ${new Date(
            p.createdAt
          ).toLocaleDateString()}</span>
          <span><i class="fas fa-tag"></i> ${p.category}</span>
        </div>
        <div class="post-actions">
          <button class="action-btn edit" onclick="startInlineEdit('${p._id}')">
            <i class="fas fa-pen"></i> Edit
          </button>
          <button class="action-btn delete" onclick="deletePost('${p._id}')">
            <i class="fas fa-trash"></i> Delete
          </button>
          <select class="favorite-toggle" onchange="toggleFavorite('${p._id}', this)">
            <option value="0" ${!p.favorite ? "selected" : ""}>☆ Favorite</option>
            <option value="1" ${p.favorite ? "selected" : ""}>⭐ Favorited</option>
          </select>
        </div>
      `;
      container.appendChild(div);
    });

    document.getElementById("postCount").textContent = `(${posts.length})`;
  }

  // Inline edit
  window.startInlineEdit = function (id) {
    const card = document.querySelector(`.post-card[data-id="${id}"]`);
    const post = allPosts.find((p) => p._id === id);

    card.querySelector(".post-content").innerHTML = `
      <input type="text" id="editTitle-${id}" value="${post.title}" />
      <textarea id="editContent-${id}">${post.content}</textarea>
      <input type="text" id="editCategory-${id}" value="${post.category}" />
      <select id="editStatus-${id}">
        <option value="draft" ${post.status === "draft" ? "selected" : ""}>Draft</option>
        <option value="published" ${post.status === "published" ? "selected" : ""}>Published</option>
      </select>
    `;

    card.querySelector(".post-actions").innerHTML = `
      <button class="action-btn save" onclick="saveInlineEdit('${id}')">
        💾 Save
      </button>
      <button class="action-btn cancel" onclick="cancelInlineEdit('${id}')">
        ❌ Cancel
      </button>
    `;
  };

  // Cancel inline edit → reload posts
  window.cancelInlineEdit = function (id) {
    renderPosts(allPosts);
  };

  // Save inline edit
  window.saveInlineEdit = async function (id) {
    const title = document.getElementById(`editTitle-${id}`).value.trim();
    const content = document.getElementById(`editContent-${id}`).value.trim();
    const category = document.getElementById(`editCategory-${id}`).value.trim();
    const status = document.getElementById(`editStatus-${id}`).value;

    const postData = { title, content, category, status };

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (!res.ok) throw new Error("Failed to update post");

      // Reload posts
      await loadPosts();
    } catch (err) {
      console.error("Error updating post:", err);
      alert("Error saving changes.");
    }
  };

  // Delete post
  window.deletePost = async function (id) {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete post");
      loadPosts();
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Error deleting post. Check server logs.");
    }
  };

  // Toggle favorite
  window.toggleFavorite = async function (id, selectEl) {
    try {
      const res = await fetch(`${API_URL}/${id}/favorite`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to toggle favorite");
      loadPosts();
    } catch (err) {
      console.error("Error toggling favorite:", err);
      alert("Error updating favorite. Check server logs.");
    }
  };

  // Create post
  const postForm = document.getElementById("postForm");
  if (postForm) {
    postForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const title = document.getElementById("postTitle").value.trim();
      const content = document.getElementById("postContent").value.trim();
      const category = document.getElementById("postCategory").value;
      const status = document.getElementById("postStatus").value;

      const postData = { title, content, category, status };

      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postData),
        });

        if (!res.ok) throw new Error("Failed to create post");

        e.target.reset();
        loadPosts();
      } catch (err) {
        console.error("Error creating post:", err);
        alert("Error saving post. Check server logs.");
      }
    });
  }

  // Attach search + filter events
  document
    .getElementById("searchInput")
    .addEventListener("input", applyFilters);
  document
    .getElementById("statusFilter")
    .addEventListener("change", applyFilters);

  // Auto load posts
  loadPosts();
});
