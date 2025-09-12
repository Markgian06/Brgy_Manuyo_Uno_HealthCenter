import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, enum: ["announcement", "news"], default: "announcement" },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    favorite: { type: Boolean, default: false },
    },
  { timestamps: true }
);

const Post = mongoose.model("Services", postSchema);
export default Post;
