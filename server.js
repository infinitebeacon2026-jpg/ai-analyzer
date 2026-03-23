import cors from "cors";
import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Analyzer Running");
});

app.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const imageBase64 = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype || "image/png";

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1",
      input: [
  {
    role: "user",
    content: [
      {
        type: "input_text",
        text: `
You are a professional institutional trader.

Analyze this chart and return a CLEAN structured breakdown.

Format EXACTLY like this:

Trade Bias: (Bullish / Bearish / Neutral)
Confidence: (0–100%)

Trend:
- Short explanation

Entry Idea:
- Where and why

Stop Loss:
- Where invalidation is

Take Profit:
- Logical target

Mistakes:
- What trader did wrong (if any)

Improvements:
- What would make this A+ setup

Rules:
- No markdown symbols
- No ** or ###
- Clean readable text only
`
      },
      {
        type: "input_image",
        image_base64: imageBuffer
      }
    ]
  }
]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "OpenAI API error",
        details: data
      });
    }

    let outputText = "";

    if (data.output && Array.isArray(data.output)) {
      for (const item of data.output) {
        if (item.content && Array.isArray(item.content)) {
          for (const contentItem of item.content) {
            if (contentItem.type === "output_text" && contentItem.text) {
              outputText += contentItem.text + "\n";
            }
          }
        }
      }
    }

   res.send(outputText.trim() || "No analysis returned.");
  } catch (error) {
    res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
