import express from "express";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Infinite Beacon AI</title>
      <style>
        * { box-sizing: border-box; }

        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background: #050505;
          color: #ffffff;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 24px;
        }

        .card {
          width: 100%;
          max-width: 760px;
          background: #141414;
          border: 1px solid #242424;
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 14px 34px rgba(0,0,0,0.45);
        }

        h1 {
          margin: 0 0 10px;
          text-align: center;
          font-size: 38px;
        }

        .subtext {
          text-align: center;
          color: #c8c8c8;
          margin-bottom: 24px;
          line-height: 1.5;
        }

        .label {
          font-size: 12px;
          font-weight: 700;
          color: #8fe2aa;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        textarea {
          width: 100%;
          min-height: 140px;
          resize: vertical;
          border-radius: 14px;
          border: 1px solid #2f2f2f;
          background: #0a0a0a;
          color: #ffffff;
          padding: 14px;
          font-size: 15px;
          outline: none;
        }

        textarea:focus {
          border-color: #00c853;
        }

        .upload-wrap {
          margin-top: 18px;
          padding: 16px;
          border-radius: 14px;
          border: 1px dashed #3a3a3a;
          background: #0a0a0a;
        }

        input[type="file"] {
          width: 100%;
          color: #d7d7d7;
          margin-top: 8px;
        }

        .preview-wrap {
          margin-top: 14px;
          display: none;
        }

        .preview-wrap img {
          width: 100%;
          max-height: 350px;
          object-fit: contain;
          border-radius: 12px;
          border: 1px solid #2d2d2d;
          background: #000;
        }

        .file-name {
          margin-top: 8px;
          color: #bfbfbf;
          font-size: 13px;
        }

        .actions {
          display: flex;
          justify-content: center;
          margin-top: 22px;
        }

        button {
          border: none;
          border-radius: 12px;
          background: #00c853;
          color: white;
          padding: 14px 30px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
        }

        button:hover {
          opacity: 0.96;
        }

        button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .result-box {
          margin-top: 24px;
          padding: 18px;
          border-radius: 14px;
          border: 1px solid #262626;
          background: #090909;
          min-height: 120px;
        }

        .result-text {
          white-space: pre-wrap;
          line-height: 1.55;
          color: #ffffff;
          margin-top: 10px;
        }

        .footer {
          text-align: center;
          margin-top: 18px;
          color: #8b8b8b;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>🚀 Infinite Beacon AI</h1>
        <div class="subtext">
          Paste your trade idea, chart notes, or market question below.<br />
          You can also upload a chart screenshot.
        </div>

        <div class="label">Trade Notes / Question</div>
        <textarea id="input" placeholder="Example: ES broke above resistance, NQ is lagging, volume is picking up near VWAP. Is this a valid long setup?"></textarea>

        <div class="upload-wrap">
          <div class="label">Upload Chart Image</div>
          <input id="imageInput" type="file" accept="image/*" />
          <div class="preview-wrap" id="previewWrap">
            <img id="previewImage" src="" alt="Preview" />
            <div class="file-name" id="fileName"></div>
          </div>
        </div>

        <div class="actions">
          <button id="analyzeBtn" onclick="runAI()">Analyze</button>
        </div>

        <div class="result-box">
          <div class="label">Result</div>
          <div class="result-text" id="resultText">Waiting for input...</div>
        </div>

        <div class="footer">Infinite Beacon AI Analyzer</div>
      </div>

      <script>
        let uploadedImageBase64 = "";
        let uploadedImageName = "";

        const imageInput = document.getElementById("imageInput");
        const previewWrap = document.getElementById("previewWrap");
        const previewImage = document.getElementById("previewImage");
        const fileName = document.getElementById("fileName");

        imageInput.addEventListener("change", function (event) {
          const file = event.target.files && event.target.files[0];

          if (!file) {
            uploadedImageBase64 = "";
            uploadedImageName = "";
            previewWrap.style.display = "none";
            previewImage.src = "";
            fileName.innerText = "";
            return;
          }

          uploadedImageName = file.name;

          const reader = new FileReader();
          reader.onload = function (e) {
            uploadedImageBase64 = e.target.result || "";
            previewImage.src = uploadedImageBase64;
            fileName.innerText = "Selected file: " + uploadedImageName;
            previewWrap.style.display = "block";
          };
          reader.readAsDataURL(file);
        });

        async function runAI() {
          const inputEl = document.getElementById("input");
          const resultEl = document.getElementById("resultText");
          const buttonEl = document.getElementById("analyzeBtn");

          const input = inputEl.value.trim();

          if (!input && !uploadedImageBase64) {
            resultEl.innerText = "Please enter text or upload an image first.";
            return;
          }

          buttonEl.disabled = true;
          buttonEl.innerText = "Analyzing...";
          resultEl.innerText = "Running analysis...";

          try {
            const response = await fetch("/analyze", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                input,
                image: uploadedImageBase64,
                imageName: uploadedImageName
              })
            });

            if (!response.ok) {
              throw new Error("Request failed");
            }

            const data = await response.json();
            resultEl.innerText = data.result || "No result returned.";
          } catch (error) {
            resultEl.innerText = "Something went wrong running the analysis.";
          } finally {
            buttonEl.disabled = false;
            buttonEl.innerText = "Analyze";
          }
        }
      </script>
    </body>
    </html>
  `);
});

app.post("/analyze", (req, res) => {
  const userInput = req.body.input || "";
  const image = req.body.image || "";
  const imageName = req.body.imageName || "";

  const hasText = userInput.trim().length > 0;
  const hasImage = image.trim().length > 0;

  let result = "Analysis Summary:\\n\\n";

  if (hasText) {
    result += "Text received: " + userInput + "\\n\\n";
  }

  if (hasImage) {
    result += "Image received: " + (imageName || "uploaded chart image") + "\\n\\n";
  }

  result += "Basic read:\\n";
  result += "- Upload feature is now working\\n";
  result += "- Text and image can now be submitted together\\n";
  result += "- Current image handling is placeholder only\\n";
  result += "- Real chart/image AI analysis gets added next\\n\\n";
  result += "Next step:\\n";
  result += "Connect OpenAI vision so uploaded screenshots get real analysis instead of placeholder output.";

  res.json({ result });
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
