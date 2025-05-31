const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require("path");

const authRoutes = require('./routes/authRoutes');
const investmentRoutes = require('./routes/investment');
const cmsRoutes = require("./routes/cmsRoutes");
const notificationRoute = require('./routes/notificationRoute');

const app = express();

// ✅ Allow CORS
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key"]
}));

// ✅ Parse JSON body
app.use(express.json());

// ✅ Middleware to log requests
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    next();
});

// ✅ Middleware to check API Key
const API_KEY = "forexexchange@xyz12"; 
const apiKeyMiddleware = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({ error: "API key missing" });
    }

    if (apiKey !== API_KEY) {
        return res.status(403).json({ error: "Invalid API key" });
    }

    next();
};
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(apiKeyMiddleware);

// ✅ Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/investment', investmentRoutes);
app.use("/api/cms", cmsRoutes);
app.use('/api/notifications', notificationRoute);


// ✅ Handle 404
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
