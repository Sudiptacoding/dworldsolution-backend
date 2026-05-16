const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const axios = require('axios'); 
const UAParser = require('user-agent-parser');
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const adminAuthRoutes = require("./adminLogin/adminAuth");
const headerVideoRoutes = require("./routes/headerVideoRoutes");
const aboutUs = require("./routes/aboutUs");
const videoAndShorts = require("./routes/videoAndShorts");
const contactRoutes = require("./routes/contactRoutes");
const influencerRoutes = require("./routes/influencerRoutes");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection URI
const uri = process.env.MONGO_URI;

// MongoDB Client Setup
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Mail Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("dworldsoluation");
    const MonthlyKeepAlive = db.collection("MonthlyKeepAlive");
    const collection = db.collection("admin");
    const HeaderSingleVideo = db.collection("HeaderSingleVideo");
    const AboutUs = db.collection("AboutUs");
    const VideoAndShortsCollection = db.collection("VideoAndShorts");

    const Contract = db.collection("contact");
    const Influencer = db.collection("influencer");

    // Test Route

app.get("/", async (req, res) => {
  try {
    // MongoDB ping
    await db.command({ ping: 1 });

    // চাইলে একটি collection touch করতে পারেন
    const currentTime = new Date();

    await db.collection("server_health").updateOne(
      { name: "uptime-monitor" },
      {
        $set: {
          lastChecked: currentTime,
          status: "running",
        },
      },
      { upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Server & MongoDB running",
      time: currentTime,
      mongodb: "connected",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "MongoDB connection failed",
      error: error.message,
    });
  }
});

    // ✅ Admin Auth Routes (imported)
    adminAuthRoutes(app, collection, transporter, process.env.EMAIL_USER);
    app.use("/header-video", headerVideoRoutes(HeaderSingleVideo));
    app.use("/about-us", aboutUs(AboutUs));
    app.use("/header-video-upload", videoAndShorts(VideoAndShortsCollection));
    app.use("/contact", contactRoutes(Contract));
    app.use("/influencers", influencerRoutes(Influencer));

    // Monthly cron with new collection
    cron.schedule("0 0 0 */10 * *", async () => {
      try {
        const now = new Date();
        const dummyData = {
          message: "Monthly auto insert to keep DB active",
          createdAt: now,
        };
        await MonthlyKeepAlive.insertOne(dummyData);
      } catch (error) {
        console.error("Error inserting monthly data:", error);
      }
    });


// ... আগের ইমপোর্টগুলো

// ট্র্যাকিং এন্ডপয়েন্ট
app.post('/api/track', async (req, res) => {
    try {
        const { url, referrer, sessionDuration } = req.body;
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const targetIp = (ip === '::1' || ip === '127.0.0.1') ? '103.149.160.1' : ip;

        let country = 'Bangladesh', city = 'Dhaka';
        try {
            const geo = await axios.get(`http://ip-api.com/json/${targetIp}`);
            if(geo.data.status === 'success') {
                country = geo.data.country;
                city = geo.data.city;
            }
        } catch (e) {}

        const parser = new UAParser(req.headers['user-agent']);
        await db.collection('visitors').insertOne({
            ip: ip === '::1' ? 'Localhost' : ip,
            page: url,
            country,
            city,
            referrer: referrer || 'Direct',
            sessionDuration: sessionDuration || 0,
            timestamp: new Date()
        });
        res.status(200).json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ডাটা দেখার রাউট
app.get('/api/analytics', async (req, res) => {
    const data = await db.collection('visitors').find().toArray();
    res.json(data);
});

// ক্লিনআপ রাউট (POST ব্যবহার করেছি যাতে এরর না আসে)
app.post('/api/cleanup', async (req, res) => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const result = await db.collection('visitors').deleteMany({ timestamp: { $lt: oneMonthAgo } });
    res.json({ message: `Deleted ${result.deletedCount} records` });
});




    // Start Server
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Error:", error);
  }
}

run().catch(console.dir);
