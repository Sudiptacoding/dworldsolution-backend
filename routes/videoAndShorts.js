

// const express = require("express");
// const { ObjectId } = require("mongodb");

// module.exports = function (VideoAndShortsCollection) {
//   const router = express.Router();

//   // ------------------- GET (Read all videos/projects) -------------------
// // ------------------- GET (সাজানো অনুযায়ী ডাটা রিড করা) -------------------
// // ------------------- GET (সাজানো ডাটা রিড করা) -------------------
//   router.get("/", async (req, res) => {
//     try {
//       const videos = await VideoAndShortsCollection.find().toArray();
      
//       // position অনুযায়ী ছোট থেকে বড় ক্রমে সাজানো
//       videos.sort((a, b) => {
//         const posA = a.position !== undefined && a.position !== null ? a.position : Infinity;
//         const posB = b.position !== undefined && b.position !== null ? b.position : Infinity;
//         return posA - posB;
//       });

//       res.json(videos);
//     } catch (err) {
//       console.error("GET /header-video-upload error:", err.message);
//       res.status(500).json({ error: "Failed to fetch projects" });
//     }
//   });

//   // ------------------- POST (Upload new project) -------------------
//   router.post("/", async (req, res) => {
//     try {
//       const { title, src, thumbnail, category, type, topics } = req.body;

//       // প্রয়োজনীয় ফিল্ডগুলোর ভ্যালিডেশন
//       if (!title || !src || !category || !type) {
//         return res.status(400).json({ error: "Missing required fields (title, src, category, type)" });
//       }

//       // Topics হ্যান্ডলিং: অ্যারে অথবা কমা সেপারেটেড স্ট্রিং উভয়কেই অ্যারে ফরম্যাটে রূপান্তর করবে
//       let formattedTopics = [];
//       if (Array.isArray(topics)) {
//         formattedTopics = topics;
//       } else if (typeof topics === "string" && topics.trim() !== "") {
//         formattedTopics = topics.split(",").map(t => t.trim()).filter(Boolean);
//       }

//       const newProject = {
//         title,
//         src,
//         thumbnail: thumbnail || "", // কাস্টম ইমেজ না থাকলে ফাঁকা থাকবে, যা ইউটিউব ফলব্যাক ট্রিগার করবে
//         category,
//         type, // video, short, image, pdf
//         topics: formattedTopics,
//       };

//       const result = await VideoAndShortsCollection.insertOne(newProject);
//       res.status(201).json({
//         message: "Project uploaded successfully",
//         project: { _id: result.insertedId, ...newProject },
//       });
//     } catch (err) {
//       console.error("POST /header-video-upload error:", err.message);
//       res.status(500).json({ error: "Failed to upload project" });
//     }
//   });

//   // ------------------- PUT (Update project) -------------------
//   router.put("/:id", async (req, res) => {
//     try {
//       const { id } = req.params;
//       const { title, src, thumbnail, category, type, topics } = req.body;

//       // Topics আপডেট হ্যান্ডলিং
//       let formattedTopics;
//       if (topics !== undefined) {
//         if (Array.isArray(topics)) {
//           formattedTopics = topics;
//         } else if (typeof topics === "string") {
//           formattedTopics = topics.split(",").map(t => t.trim()).filter(Boolean);
//         } else {
//           formattedTopics = [];
//         }
//       }

//       // শুধুমাত্র যেসব ফিল্ড বডিতে পাঠানো হয়েছে, সেগুলো আপডেট করার অবজেক্ট তৈরি
//       const updateData = {};
//       if (title !== undefined) updateData.title = title;
//       if (src !== undefined) updateData.src = src;
//       if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
//       if (category !== undefined) updateData.category = category;
//       if (type !== undefined) updateData.type = type;
//       if (topics !== undefined) updateData.topics = formattedTopics;

//       const result = await VideoAndShortsCollection.updateOne(
//         { _id: new ObjectId(id) },
//         { $set: updateData }
//       );

//       if (result.matchedCount === 0) {
//         return res.status(404).json({ error: "Project not found" });
//       }

//       res.json({ message: "Project updated successfully" });
//     } catch (err) {
//       console.error("PUT /header-video-upload/:id error:", err.message);
//       res.status(500).json({ error: "Failed to update project" });
//     }
//   });

//   // ------------------- DELETE (Delete project) -------------------
//   router.delete("/:id", async (req, res) => {
//     try {
//       const { id } = req.params;

//       const result = await VideoAndShortsCollection.deleteOne({ _id: new ObjectId(id) });
//       if (result.deletedCount === 0) {
//         return res.status(404).json({ error: "Project not found" });
//       }

//       res.json({ message: "Project deleted successfully" });
//     } catch (err) {
//       console.error("DELETE /header-video-upload/:id error:", err.message);
//       res.status(500).json({ error: "Failed to delete project" });
//     }
//   });

  


//   // ------------------- PUT (Reorder Videos) -------------------
//   // ড্র্যাগ অ্যান্ড ড্রপ করার পর ডাটাবেজে পজিশন আপডেট করার নতুন API
// // ------------------- PUT (Reorder Videos) -------------------
//   router.put("/reorder", async (req, res) => {
//     try {
//       const { orderedIds } = req.body;
//       console.log("১. ফ্রন্টএন্ড থেকে পাওয়া আইডিগুলো:", orderedIds); // কনসোল লগ

//       if (!Array.isArray(orderedIds)) {
//         return res.status(400).json({ error: "Invalid data format. Expected an array." });
//       }

//       const operations = orderedIds.map((id, index) => {
//         let filterId;
//         try {
//           // সাধারণ ObjectId তে কনভার্ট করার চেষ্টা করবে
//           filterId = new ObjectId(id);
//         } catch (e) {
//           // যদি ID টি সাধারণ String হিসেবে সেভ থাকে তবে সরাসরি স্ট্রিং ব্যবহার করবে
//           filterId = id; 
//         }

//         return {
//           updateOne: {
//             filter: { _id: filterId },
//             update: { $set: { position: index + 1 } },
//           },
//         };
//       });

//       const result = await VideoAndShortsCollection.bulkWrite(operations);
      
//       // ডাটাবেজে কয়টি ম্যাচ করেছে এবং আপডেট হয়েছে তা কনসোলে দেখাবে
//       console.log("২. ডাটাবেজ আপডেট রেজাল্ট:", {
//         matchedCount: result.matchedCount,
//         modifiedCount: result.modifiedCount
//       });

//       res.json({ message: "Positions updated successfully", result });
//     } catch (err) {
//       console.error("PUT /reorder error:", err.message);
//       res.status(500).json({ error: "Failed to update order" });
//     }
//   });



//   return router;
// };







const express = require("express");
const { ObjectId } = require("mongodb");

module.exports = function (VideoAndShortsCollection) {
  const router = express.Router();

  // ------------------- ১. GET (Read & Sort by Position) -------------------
  router.get("/", async (req, res) => {
    try {
      const videos = await VideoAndShortsCollection.find().toArray();
      
      // পজিশন অনুযায়ী সাজানো হচ্ছে যাতে রিলোড দিলে সঠিক অর্ডার দেখায়
      videos.sort((a, b) => {
        const posA = a.position !== undefined && a.position !== null ? a.position : Infinity;
        const posB = b.position !== undefined && b.position !== null ? b.position : Infinity;
        return posA - posB;
      });

      res.json(videos);
    } catch (err) {
      console.error("GET /header-video-upload error:", err.message);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  // ------------------- ২. POST (Upload new project) -------------------
  router.post("/", async (req, res) => {
    try {
      const { title, src, thumbnail, category, type, topics } = req.body;

      if (!title || !src || !category || !type) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      let formattedTopics = [];
      if (Array.isArray(topics)) {
        formattedTopics = topics;
      } else if (typeof topics === "string" && topics.trim() !== "") {
        formattedTopics = topics.split(",").map(t => t.trim()).filter(Boolean);
      }

      const newProject = {
        title,
        src,
        thumbnail: thumbnail || "",
        category,
        type,
        topics: formattedTopics,
        position: Date.now(), // ডিফল্ট শেষে রাখার জন্য টাইমস্ট্যাম্প
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

  // ------------------- ৩. PUT (Reorder - অবশ্যই /:id এর উপরে থাকতে হবে) -------------------
  router.put("/reorder", async (req, res) => {
    try {
      const { orderedIds } = req.body;
      console.log("১. ফ্রন্টএন্ড থেকে পাওয়া আইডিগুলো:", orderedIds);

      if (!Array.isArray(orderedIds)) {
        return res.status(400).json({ error: "Invalid data format. Expected an array." });
      }

      const operations = orderedIds.map((id, index) => {
        let filterId;
        try {
          filterId = new ObjectId(id);
        } catch (e) {
          filterId = id; 
        }

        return {
          updateOne: {
            filter: { _id: filterId },
            update: { $set: { position: index + 1 } },
          },
        };
      });

      const result = await VideoAndShortsCollection.bulkWrite(operations);
      
      console.log("২. ডাটাবেজ আপডেট রেজাল্ট:", {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      });

      res.json({ message: "Positions updated successfully", result });
    } catch (err) {
      console.error("PUT /reorder error:", err.message);
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  // ------------------- ৪. PUT (Update single project) -------------------
  router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { title, src, thumbnail, category, type, topics, position } = req.body;

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

      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (src !== undefined) updateData.src = src;
      if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
      if (category !== undefined) updateData.category = category;
      if (type !== undefined) updateData.type = type;
      if (topics !== undefined) updateData.topics = formattedTopics;
      if (position !== undefined) updateData.position = position;

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

  // ------------------- ৫. DELETE (Delete project) -------------------
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