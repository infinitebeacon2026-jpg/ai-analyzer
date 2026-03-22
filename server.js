import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const upload = multer();

app.use(express.json());

app.post("/analyze", upload.single("image"), async (req, res) => {
  try {
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
              { type: "input_text", text: "Analyze this trade screenshot and give breakdown, entry, exit, mistakes, improvements." },
              { type: "input_image", image_base64: imageBuffer }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    res.json({ result: data.output_text });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error analyzing trade");
  }
});

app.get("/", (req, res) => {
  res.send("AI Analyzer Running");
});

app.listen(10000, () => console.log("Server running"));