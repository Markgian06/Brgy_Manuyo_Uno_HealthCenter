import Announcement from "../Models/AnnouncementModels.js";

export const getAnnouncements = async (req, res) => {
  try {
    const { q } = req.query;
    let filter = {};

    if (q) {
      filter = { text: { $regex: q, $options: "i" } };
    }

    const announcements = await Announcement.find(filter).sort({ createdAt: -1 });
    res.json({ data: announcements });
  } catch (error) {
    res.status(500).json({ message: "Error fetching announcements", error });
  }
};


export const createAnnouncement = async (req, res) => {
  const { text, type } = req.body;

  if (!text) {
    res.status(400);
    throw new Error("Announcement text is required");
  }

  const announcement = new Announcement({ text, type });
  const created = await announcement.save();
  res.status(201).json(created);
};


export const updateAnnouncement = async (req, res) => {
  const { text, type } = req.body;
  const announcement = await Announcement.findById(req.params.id);

  if (announcement) {
    announcement.text = text || announcement.text;
    announcement.type = type || announcement.type;
    announcement.updatedAt = new Date(); 

    const updated = await announcement.save();
    res.json(updated);
  } else {
    res.status(404);
    throw new Error("Announcement not found");
  }
};


export const deleteAnnouncement = async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (announcement) {
    await announcement.deleteOne();
    res.json({ message: "Announcement removed" });
  } else {
    res.status(404);
    throw new Error("Announcement not found");
  }
};