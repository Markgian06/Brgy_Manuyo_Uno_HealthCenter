import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: String,
  status: String,
  favorite: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  image: { type: Buffer }, // store image binary
  imageType: { type: String } 
});

PostSchema.virtual("imageSrc").get(function () {
  if (this.image && this.imageType) {
    return `data:${this.imageType};base64,${this.image.toString("base64")}`;
  }
});

export default mongoose.model("services", PostSchema);
