import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.post("/ai", async (req, res) => {
    try {
        const userMessage = req.body.message;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are AiLK Assistant, a helpful fast AI." },
                    { role: "user", content: userMessage }
                ]
            })
        });

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || "AI failed to respond.";

        res.json({ reply });

    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("AiLK Server running on port " + (process.env.PORT || 3000));
});
