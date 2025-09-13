const API_URL = "http://localhost:5000/api/posts";
let allPosts = [];


document.addEventListener("DOMContentLoaded", () => {
  let currentPage = 1;
  const pageSize = 6;
  const postForm = document.getElementById("postForm");
  const postImage = document.getElementById("postImage"); // file input
  const previewImg = document.getElementById("previewImg"); // img tag for preview

  // --------------------
  // Load all posts
  // --------------------
  async function loadPosts() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch posts");
      allPosts = await res.json();
      applyFilters();
    } catch (err) {
      console.error("Error loading posts:", err);
      document.getElementById("postsContainer").innerHTML =
        "<p style='color:red'>Error loading posts.</p>";
    }
  }

  // --------------------
  // Apply search + filter
  // --------------------
  function applyFilters() {
    const searchValue = document.getElementById("searchInput").value.toLowerCase();
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
        ? !!p.favorite
        : p.status === statusValue;

      return matchesSearch && matchesStatus;
    });

    renderPosts(filtered);
  }

  // --------------------
  // Render posts
  // --------------------
function renderPosts(posts) {
  const container = document.getElementById("postsContainer");
  const searchResultText = document.getElementById("searchResultText");
  container.innerHTML = ""; // clear once before the loop

  if (posts.length === 0) {
    container.innerHTML = `<p>No posts found.</p>`;
    searchResultText.textContent = "Showing 0 posts";
    renderPagination(0);
    return;
  }

  // Pagination logic
  const totalItems = posts.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const paginatedPosts = posts.slice(start, end);

  paginatedPosts.forEach((p) => {
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
        ${p.imageSrc ? `<img src="${p.imageSrc}" class="post-image" />` : ""}
      </div>
      <div class="post-meta">
        <span><i class="fas fa-calendar"></i> Created: ${new Date(p.createdAt).toLocaleDateString()}</span>
        <span><i class="fas fa-tag"></i> ${p.category}</span>
      </div>
      <div class="post-actions">
        <button class="action-btn edit" onclick="startInlineEdit('${p._id}')"><i class="fas fa-pen"></i> Edit</button>
        <button class="action-btn delete" onclick="deletePost('${p._id}')"><i class="fas fa-trash"></i> Delete</button>
        <select class="favorite-toggle" onchange="toggleFavorite('${p._id}', this)">
          <option value="0" ${!p.favorite ? "selected" : ""}>☆ Favorite</option>
          <option value="1" ${p.favorite ? "selected" : ""}>⭐ Favorited</option>
        </select>
      </div>
    `;
    container.appendChild(div); // append each post
  });

  searchResultText.textContent = `Showing ${start + 1} to ${Math.min(end, totalItems)} of ${totalItems} posts`;
  renderPagination(totalItems);
  document.getElementById("postCount").textContent = `(${posts.length})`;

}



  // --------------------
  // Create post with image
  // -------------------
  if (postForm) {
    postForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("postTitle").value.trim();
      const content = document.getElementById("postContent").value.trim();
      const category = document.getElementById("postCategory").value;
      const status = document.getElementById("postStatus").value;

      if (!title || !content) {
        alert("Title and content are required.");
        return;
      }

      let imageBase64 = "";
      let imageType = "";

      if (postImage && postImage.files[0]) {
        const file = postImage.files[0];
        const reader = new FileReader();
        reader.onload = async () => {
          imageBase64 = reader.result;
          imageType = file.type;

          const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content, category, status, imageBase64, imageType }),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to create post");

          postForm.reset();
          previewImg.src = "";
          previewImg.style.display = "none";

          await loadPosts();
          alert("Post created successfully!");
        };
        reader.readAsDataURL(file);
      } else {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, category, status }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create post");

        postForm.reset();
        loadPosts();
        alert("Post created successfully!");
      }
    });
  }
  
  // --------------------
  // Image preview
  // --------------------
  if (postImage && previewImg) {
    postImage.addEventListener("change", () => {
      const file = postImage.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          previewImg.src = e.target.result;
          previewImg.style.display = "block";
        };
        reader.readAsDataURL(file);
      } else {
        previewImg.src = "";
        previewImg.style.display = "none";
      }
    });
    
  }

  // --------------------
  // Search + filter events
  // --------------------
  document.getElementById("searchInput").addEventListener("input", applyFilters);
  document.getElementById("statusFilter").addEventListener("change", applyFilters);


 window.toggleFavorite = async function(id, selectElement) {
  try {
    const res = await fetch(`http://localhost:5000/api/posts/${id}/favorite`, {
      method: "PATCH",
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to toggle favorite");

    selectElement.value = data.favorite ? "1" : "0";

    console.log("Favorite toggled:", data.favorite);
  } catch (err) {
    console.error("Error toggling favorite:", err);
    alert("Failed to toggle favorite");
    selectElement.value = selectElement.value === "1" ? "0" : "1";
  }
};


// EDIT POST
window.startInlineEdit = function (id) {
  const postCard = document.querySelector(`.post-card[data-id='${id}']`);
  if (!postCard) return;

  const titleEl = postCard.querySelector(".post-title");
  const contentEl = postCard.querySelector(".post-text");

  // Save current values
  const currentTitle = titleEl.textContent;
  const currentContent = contentEl.textContent;

  // Replace with input fields
  titleEl.innerHTML = `<input type="text" class="edit-title" value="${currentTitle}" />`;
  contentEl.innerHTML = `<textarea class="edit-content">${currentContent}</textarea>`;

  // Change edit button to save button
  const editBtn = postCard.querySelector(".edit");
  editBtn.innerHTML = `<i class="fas fa-save"></i> Save`;
  editBtn.onclick = async () => {
    const newTitle = postCard.querySelector(".edit-title").value.trim();
    const newContent = postCard.querySelector(".edit-content").value.trim();
    if (!newTitle || !newContent) {
      alert("Title and content cannot be empty.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, content: newContent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update post");

      // Update UI
      titleEl.textContent = data.title;
      contentEl.textContent = data.content;
      editBtn.innerHTML = `<i class="fas fa-pen"></i> Edit`;
      editBtn.onclick = () => startInlineEdit(id);

      alert("Post updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating post");
    }
  };
};

// DELETE POST
window.deletePost = async function (id) {
  if (!confirm("Are you sure you want to delete this post?")) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete post");

    // Remove post from UI
    const postCard = document.querySelector(`.post-card[data-id='${id}']`);
    if (postCard) postCard.remove();

    alert(data.message || "Post deleted successfully!");
  } catch (err) {
    console.error(err);
    alert("Error deleting post");
  }
};


// --------------------
// Render pagination buttons
// --------------------
function renderPagination(totalItems) {
  const paginationEl = document.getElementById("paginationControls");
  if (!paginationEl) return;
  paginationEl.innerHTML = "";

  const totalPages = Math.ceil(totalItems / pageSize);

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "⬅ Prev";
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      applyFilters(); // re-render posts
    }
  };

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next ➡";
  nextBtn.disabled = currentPage === totalPages || totalPages === 0;
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      applyFilters(); // re-render posts
    }
  };

  paginationEl.appendChild(prevBtn);
  paginationEl.appendChild(document.createTextNode(` Page ${currentPage} of ${totalPages} `));
  paginationEl.appendChild(nextBtn);
}

  // --------------------
  // Auto load posts
  // --------------------
  loadPosts();
});
