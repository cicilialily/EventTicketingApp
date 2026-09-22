import express from "express";

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "EventTicketing API is running",
        data: {
            status: "OK"
        }
    });
});

export default app;