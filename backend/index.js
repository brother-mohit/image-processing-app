// Backend: Express.js Server
require("dotenv").config();
const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const { Queue, Worker } = require("bullmq");
const cloudinary = require("cloudinary").v2;
const csv = require("csv-parser");
const fs = require("fs");
const cors = require("cors");
const Redis = require("ioredis");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_DB_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Redis Connection
const redisConnection = new Redis(process.env.REDIS_URL.trim(), {
  maxRetriesPerRequest: null,
  tls: {}, // Needed for Upstash
  retryStrategy: (times) => Math.min(times * 50, 2000), // Retry on failure
});

const imageQueue = new Queue("image-processing", {
  connection: redisConnection,
});

// MongoDB Schema
const requestSchema = new mongoose.Schema({
  requestId: String,
  status: String,
  products: [
    { productName: String, inputUrls: [String], outputUrls: [String] },
  ],
});
const Request = mongoose.model("Request", requestSchema);

// check server running...
app.get("/", (req, res) => res.send("Server is running"));

// Upload API
app.post("/upload", upload.single("file"), async (req, res) => {
  const requestId = new mongoose.Types.ObjectId();
  const products = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {
      products.push({
        productName: row["Product Name"],
        inputUrls: row["Input Image Urls"].split(","),
      });
    })
    .on("end", async () => {
      await Request.create({ requestId, status: "Processing", products });
      products.forEach((product) => {
        product.inputUrls.forEach((url) => {
          imageQueue.add("process-image", {
            requestId,
            productName: product.productName,
            imageUrl: url,
          });
        });
      });
      res.json({ requestId });
    });
});

// Status API
app.get("/status/:requestId", async (req, res) => {
  const request = await Request.findOne({ requestId: req.params.requestId });
  res.json(request);
});

// Image Processing Worker
const worker = new Worker(
  "image-processing",
  async (job) => {
    const { requestId, productName, imageUrl } = job.data;
    const response = await cloudinary.uploader.upload(imageUrl, {
      quality: "50",
    });
    await Request.updateOne(
      { requestId, "products.productName": productName },
      { $push: { "products.$.outputUrls": response.secure_url } }
    );
  },
  {
    connection: redisConnection,
    settings: {
      stalledInterval: 0, // Avoid unnecessary stalled job checks
    },
  }
);

// Webhook API
app.post("/webhook", (req, res) => {
  console.log("Webhook received:", req.body);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
