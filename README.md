Image Processing System

📌 Overview

This project is a full-stack image processing system that allows users to upload a CSV file containing product names and image URLs. The images are compressed and stored asynchronously, and users can check the processing status via an API.

🔥 Tech Stack

Layer
Technology
Frontend
React.js (Vite)
Backend
Node.js, Express.js
Database
MongoDB Atlas (Mongoose)
Queue
Redis (BullMQ)
Image Processing
Cloudinary API
Deployment
Render (Backend), Vercel (Frontend)

📊 Architecture Diagram

[React Frontend] → [Express Backend] → [MongoDB Atlas]
↳ [Redis Queue] → [Cloudinary Processing]

📂 Project Structure

/image-processing-app
├── /backend # Node.js backend
│ ├── server.js # Main server file
│ ├── routes.js # API routes
│ ├── worker.js # Redis worker
│ ├── models/ # Mongoose models
│ ├── config/ # Configuration files
│ ├── .env # Environment variables
│ ├── package.json # Backend dependencies
│
├── /frontend # React frontend (Vite)
│ ├── src/
│ ├── public/
│ ├── App.jsx # Main React component
│ ├── package.json # Frontend dependencies
│
├── README.md # Main project documentation

🚀 Setup & Installation

🔹 1️⃣ Clone Repository

git clone https://github.com/brother-mohit/image-processing-app.git
cd image-processing-app

🔹 2️⃣ Setup Backend (Node.js)

cd backend
npm install

✨ Configure Environment Variables (.env in /backend)

MONGO_DB_URL=mongodb+srv://your_username:your_password@cluster.mongodb.net/your_db_name
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
REDIS_URL=redis://default:your_password@your_redis_url:6379
PORT=3000

🔹 Start Backend

node server.js

✅ Server should be running on http://localhost:3000

🔹 3️⃣ Setup Frontend (React.js)

cd ../frontend
npm install

🔹 Update API URL in App.jsx

Replace localhost URL with Render Backend URL:

const backendURL = "https://your-backend.onrender.com";

🔹 Start Frontend

npm run dev

✅ Frontend should be running on http://localhost:5173

🌍 Deployment

🔹 Deploy Backend (Render)
🔹 Deploy Frontend (Vercel)

📡 API Endpoints

🔹 1️⃣ Upload CSV

POST /upload

Request: multipart/form-data with CSV file.
Response:
{"requestId": "12345"}

🔹 2️⃣ Check Processing Status

GET /status/:requestId
Response:
{
"requestId": "12345",
"status": "Processing",
"products": [
{
"productName": "Laptop",
"inputUrls": ["https://example.com/image1.jpg"],
"outputUrls": []
}
]
}

Future Improvements

- Add authentication (JWT)

- Improve UI for upload & status checking

- Optimize image processing performance
