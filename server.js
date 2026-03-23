import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

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

    const imageBuffer = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype || "image/png";

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `You are a professional trader.

Analyze this chart screenshot and return plain readable text only.

Use this exact format:

Trade Bias:
Confidence:
Trend:
Entry Idea:
Stop Loss:
Take Profit:
Mistakes:
Improvements:

Rules:
- No markdown
- No bullet symbols
- No JSON
- No code blocks
- Plain clean text only`
              },
              {
                type: "input_image",
                image_url: `data:${mimeType};base64,${imageBuffer}`
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

    if (Array.isArray(data.output)) {
      for (const item of data.output) {
        if (Array.isArray(item.content)) {
          for (const part of item.content) {
            if (part.type === "output_text" && part.text) {
              outputText += part.text + "\n";
            }
          }
        }
      }
    }

    if (!outputText && typeof data.output_text === "string") {
      outputText = data.output_text;
    }

    if (!outputText) {
      return res.status(500).json({
        error: "No analysis returned",
        raw: data
      });
    }

    res.send(outputText.trim());
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
