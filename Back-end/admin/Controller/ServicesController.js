import Post from "../Models/ServicesModels.js";

// GET all posts
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE post
export const createPost = async (req, res) => {
  try {
    const { title, content, category, status } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const newPost = new Post({ title, content, category, status });
    await newPost.save();

    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE post
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, status } = req.body;

    const updated = await Post.findByIdAndUpdate(
      id,
      { title, content, category, status },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Post not found" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE post
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Post.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ error: "Post not found" });

    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// TOGGLE favorite
export const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) return res.status(404).json({ error: "Post not found" });

    post.favorite = !post.favorite;
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
