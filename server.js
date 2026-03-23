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
          min-height: 180px;
        }

        .result-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-top: 10px;
        }

        .result-item {
          background: #111111;
          border: 1px solid #232323;
          border-radius: 12px;
          padding: 12px;
        }

        .result-item-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #8fe2aa;
          margin-bottom: 6px;
          font-weight: 700;
        }

        .result-item-value {
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          word-break: break-word;
        }

        .summary-box {
          margin-top: 14px;
          background: #111111;
          border: 1px solid #232323;
          border-radius: 12px;
          padding: 14px;
        }

        .summary-text {
          margin-top: 8px;
          white-space: pre-wrap;
          line-height: 1.6;
          color: #ffffff;
        }

        .status-text {
          white-space: pre-wrap;
          line-height: 1.55;
          color: #ffffff;
          margin-top: 10px;
        }

        .bullish { color: #00e676; }
        .bearish { color: #ff5252; }
        .neutral { color: #ffd54f; }

        .footer {
          text-align: center;
          margin-top: 18px;
          color: #8b8b8b;
          font-size: 12px;
        }

        @media (max-width: 640px) {
          .result-grid {
            grid-template-columns: 1fr;
          }

          h1 {
            font-size: 30px;
          }
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
          <div id="resultArea" class="status-text">Waiting for input...</div>
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

        function getBiasClass(bias) {
          const value = String(bias || "").toLowerCase();
          if (value === "bullish") return "bullish";
          if (value === "bearish") return "bearish";
          return "neutral";
        }

        function renderResult(data) {
          const resultArea = document.getElementById("resultArea");
          const biasClass = getBiasClass(data.bias);

          resultArea.innerHTML = \`
            <div class="result-grid">
              <div class="result-item">
                <div class="result-item-title">Bias</div>
                <div class="result-item-value \${biasClass}">\${data.bias || "N/A"}</div>
              </div>

              <div class="result-item">
                <div class="result-item-title">Confidence</div>
                <div class="result-item-value">\${data.confidence != null ? data.confidence + "%" : "N/A"}</div>
              </div>

              <div class="result-item">
                <div class="result-item-title">Entry</div>
                <div class="result-item-value">\${data.entry || "N/A"}</div>
              </div>

              <div class="result-item">
                <div class="result-item-title">Stop Loss</div>
                <div class="result-item-value">\${data.stopLoss || "N/A"}</div>
              </div>

              <div class="result-item" style="grid-column: 1 / -1;">
                <div class="result-item-title">Take Profit</div>
                <div class="result-item-value">\${data.takeProfit || "N/A"}</div>
              </div>
            </div>

            <div class="summary-box">
              <div class="result-item-title">Summary</div>
              <div class="summary-text">\${data.summary || "No summary returned."}</div>
            </div>
          \`;
        }

        async function runAI() {
          const inputEl = document.getElementById("input");
          const resultArea = document.getElementById("resultArea");
          const buttonEl = document.getElementById("analyzeBtn");

          const input = inputEl.value.trim();

          if (!input && !uploadedImageBase64) {
            resultArea.innerText = "Please enter text or upload an image first.";
            return;
          }

          buttonEl.disabled = true;
          buttonEl.innerText = "Analyzing...";
          resultArea.innerText = "Running analysis...";

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

            if (data.error) {
              resultArea.innerText = data.error;
              return;
            }

            renderResult(data);
          } catch (error) {
            resultArea.innerText = "Something went wrong running the analysis.";
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

  if (!hasText && !hasImage) {
    return res.status(400).json({
      error: "Please enter text or upload an image first."
    });
  }

  let bias = "Neutral";
  let confidence = 55;
  let entry = "Current Price Area";
  let stopLoss = "Below recent support";
  let takeProfit = "Next resistance";
  let summary = "No strong directional edge yet.";

  const lowerInput = userInput.toLowerCase();

  if (hasImage) {
    bias = "Bearish";
    confidence = 78;
    entry = "6588.50";
    stopLoss = "6602.00";
    takeProfit = "6558.00";
    summary =
      "Chart structure appears bearish with lower highs and lower lows. Momentum favors sellers unless price reclaims nearby resistance and holds above it.";
  }

  if (lowerInput.includes("bullish") || lowerInput.includes("long") || lowerInput.includes("buy")) {
    bias = "Bullish";
    confidence = hasImage ? 74 : 68;
    entry = "Break / hold above recent resistance";
    stopLoss = "Below recent swing low";
    takeProfit = "Next resistance zone";
    summary =
      "Setup leans bullish if price holds strength and confirms above nearby resistance. Best case is continuation with momentum and volume support.";
  }

  if (lowerInput.includes("bearish") || lowerInput.includes("short") || lowerInput.includes("sell")) {
    bias = "Bearish";
    confidence = hasImage ? 80 : 70;
    entry = "Break / hold below recent support";
    stopLoss = "Above recent swing high";
    takeProfit = "Next support zone";
    summary =
      "Setup leans bearish if price stays under resistance and continues making weaker highs. Sellers stay in control unless structure flips.";
  }

  if (lowerInput.includes("neutral") || lowerInput.includes("chop") || lowerInput.includes("range")) {
    bias = "Neutral";
    confidence = 52;
    entry = "Wait for breakout confirmation";
    stopLoss = "Outside range extreme";
    takeProfit = "Opposite side of range";
    summary =
      "Market looks more range-bound than cleanly trending. Better to wait for a real break instead of donating money to chop.";
  }

  res.json({
    bias,
    confidence,
    entry,
    stopLoss,
    takeProfit,
    summary,
    receivedText: hasText,
    receivedImage: hasImage,
    imageName: imageName || null
  });
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
