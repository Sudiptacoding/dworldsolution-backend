// const express = require("express");
// const { ObjectId } = require("mongodb");

// module.exports = function (VideoAndShortsCollection) {
//   const router = express.Router();

//   // ------------------- GET (Read all videos) -------------------
//   router.get("/", async (req, res) => {
//     try {
//       const videos = await VideoAndShortsCollection.find().toArray();
//       res.json(videos);
//     } catch (err) {
//       console.error("GET /header-video-upload error:", err.message);
//       res.status(500).json({ error: "Failed to fetch videos" });
//     }
//   });

//   // ------------------- POST (Upload new video) -------------------
//   router.post("/", async (req, res) => {
//     try {
//       const { videoURL, category, thumbnailURL } = req.body;
//       if (!videoURL || !category || !thumbnailURL) {
//         return res.status(400).json({ error: "Missing required fields" });
//       }

//       const newVideo = {
//         src: videoURL,
//         category,
//         thumbnail: thumbnailURL,
//       };

//       const result = await VideoAndShortsCollection.insertOne(newVideo);
//       res.status(201).json({
//         message: "Video uploaded successfully",
//         video: { _id: result.insertedId, ...newVideo },
//       });
//     } catch (err) {
//       console.error("POST /header-video-upload error:", err.message);
//       res.status(500).json({ error: "Failed to upload video" });
//     }
//   });

//   // ------------------- PUT (Update video) -------------------
//   router.put("/:id", async (req, res) => {
//     try {
//       const { id } = req.params;
//       const { src, category, thumbnail } = req.body;

//       const result = await VideoAndShortsCollection.updateOne(
//         { _id: new ObjectId(id) },
//         { $set: { src, category, thumbnail } }
//       );

//       if (result.matchedCount === 0) {
//         return res.status(404).json({ error: "Video not found" });
//       }

//       res.json({ message: "Video updated successfully" });
//     } catch (err) {
//       console.error("PUT /header-video-upload/:id error:", err.message);
//       res.status(500).json({ error: "Failed to update video" });
//     }
//   });

//   // ------------------- DELETE (Delete video) -------------------
//   router.delete("/:id", async (req, res) => {
//     try {
//       const { id } = req.params;

//       const result = await VideoAndShortsCollection.deleteOne({ _id: new ObjectId(id) });
//       if (result.deletedCount === 0) {
//         return res.status(404).json({ error: "Video not found" });
//       }

//       res.json({ message: "Video deleted successfully" });
//     } catch (err) {
//       console.error("DELETE /header-video-upload/:id error:", err.message);
//       res.status(500).json({ error: "Failed to delete video" });
//     }
//   });

//   return router;
// };



const express = require("express");
const { ObjectId } = require("mongodb");

module.exports = function (VideoAndShortsCollection) {
  const router = express.Router();

  // ------------------- GET (Read all videos/projects) -------------------
  router.get("/", async (req, res) => {
    try {
      const videos = await VideoAndShortsCollection.find().toArray();
      res.json(videos);
    } catch (err) {
      console.error("GET /header-video-upload error:", err.message);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  // ------------------- POST (Upload new project) -------------------
  router.post("/", async (req, res) => {
    try {
      const { title, src, thumbnail, category, type, topics } = req.body;

      // প্রয়োজনীয় ফিল্ডগুলোর ভ্যালিডেশন
      if (!title || !src || !category || !type) {
        return res.status(400).json({ error: "Missing required fields (title, src, category, type)" });
      }

      // Topics হ্যান্ডলিং: অ্যারে অথবা কমা সেপারেটেড স্ট্রিং উভয়কেই অ্যারে ফরম্যাটে রূপান্তর করবে
      let formattedTopics = [];
      if (Array.isArray(topics)) {
        formattedTopics = topics;
      } else if (typeof topics === "string" && topics.trim() !== "") {
        formattedTopics = topics.split(",").map(t => t.trim()).filter(Boolean);
      }

      const newProject = {
        title,
        src,
        thumbnail: thumbnail || "", // কাস্টম ইমেজ না থাকলে ফাঁকা থাকবে, যা ইউটিউব ফলব্যাক ট্রিগার করবে
        category,
        type, // video, short, image, pdf
        topics: formattedTopics,
      };

      const result = await VideoAndShortsCollection.insertOne(newProject);
      res.status(201).json({
        message: "Project uploaded successfully",
        project: { _id: result.insertedId, ...newProject },
      });
    } catch (err) {
      console.error("POST /header-video-upload error:", err.message);
      res.status(500).json({ error: "Failed to upload project" });
    }
  });

  // ------------------- PUT (Update project) -------------------
  router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { title, src, thumbnail, category, type, topics } = req.body;

      // Topics আপডেট হ্যান্ডলিং
      let formattedTopics;
      if (topics !== undefined) {
        if (Array.isArray(topics)) {
          formattedTopics = topics;
        } else if (typeof topics === "string") {
          formattedTopics = topics.split(",").map(t => t.trim()).filter(Boolean);
        } else {
          formattedTopics = [];
        }
      }

      // শুধুমাত্র যেসব ফিল্ড বডিতে পাঠানো হয়েছে, সেগুলো আপডেট করার অবজেক্ট তৈরি
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (src !== undefined) updateData.src = src;
      if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
      if (category !== undefined) updateData.category = category;
      if (type !== undefined) updateData.type = type;
      if (topics !== undefined) updateData.topics = formattedTopics;

      const result = await VideoAndShortsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.json({ message: "Project updated successfully" });
    } catch (err) {
      console.error("PUT /header-video-upload/:id error:", err.message);
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  // ------------------- DELETE (Delete project) -------------------
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const result = await VideoAndShortsCollection.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.json({ message: "Project deleted successfully" });
    } catch (err) {
      console.error("DELETE /header-video-upload/:id error:", err.message);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  return router;
};