import Announcement from "../Models/AnnouncementModels.js";


export const getAnnouncements = async (req, res) => {
  const announcements = await Announcement.find({});
  res.json(announcements);
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


