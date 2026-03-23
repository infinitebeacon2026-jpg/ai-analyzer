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

app.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    // ✅ FIX IS HERE
    const imageBuffer = req.file.buffer.toString("base64");

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
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
                text: `
You are a professional trader.

Return clean output:

Trade Bias:
Confidence:

Trend:
Entry:
Stop Loss:
Take Profit:

Mistakes:
Improvements:

(No symbols, clean text)
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

    const outputText =
      data.output?.[0]?.content?.[0]?.text || "No analysis returned.";

    res.send(outputText);

  } catch (error) {
    res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
