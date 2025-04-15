const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require("path");

const authRoutes = require('./routes/authRoutes');
const investmentRoutes = require('./routes/investment');
const cmsRoutes = require("./routes/cmsRoutes");
const notificationRoute = require('./routes/notificationRoute');

const app = express();
app.use(cors());

// ✅ Allow CORS (Debugging Mode)
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Parse JSON request body
app.use(express.json());

// ✅ Middleware to log all incoming requests
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    next();
});

// ✅ Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/investment', investmentRoutes);
app.use("/api/cms", cmsRoutes);
app.use('/api/notifications', notificationRoute);


app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ✅ Handle 404 for unmatched routes
app.use((req, res) => {
    console.log("❌ 404 Not Found:", req.method, req.url);
    res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 3000;


mongoose.connect('mongodb+srv://chaitanya:pawar123@cluster0.lap6zh4.mongodb.net/myDatabase', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
