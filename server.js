import express from "express";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Infinite Beacon AI</title>
      <style>
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background: #111111;
          color: #ffffff;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 24px;
        }

        .card {
          width: 100%;
          max-width: 720px;
          background: #1b1b1b;
          border: 1px solid #2b2b2b;
          border-radius: 18px;
          padding: 28px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
        }

        h1 {
          margin: 0 0 10px;
          font-size: 32px;
          text-align: center;
        }

        p {
          margin: 0 0 20px;
          text-align: center;
          color: #cfcfcf;
          line-height: 1.5;
        }

        textarea {
          width: 100%;
          min-height: 150px;
          resize: vertical;
          border-radius: 12px;
          border: 1px solid #3a3a3a;
          background: #0f0f0f;
          color: #ffffff;
          padding: 14px;
          font-size: 16px;
          outline: none;
        }

        textarea:focus {
          border-color: #00c853;
        }

        .actions {
          display: flex;
          justify-content: center;
          margin-top: 18px;
        }

        button {
          border: none;
          border-radius: 12px;
          background: #00c853;
          color: #ffffff;
          padding: 14px 28px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
        }

        button:hover {
          opacity: 0.95;
        }

        button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .result {
          margin-top: 24px;
          padding: 16px;
          border-radius: 12px;
          background: #0f0f0f;
          border: 1px solid #2c2c2c;
          min-height: 64px;
          white-space: pre-wrap;
          line-height: 1.5;
        }

        .label {
          font-size: 13px;
          font-weight: 700;
          color: #9ad8ad;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .footer {
          margin-top: 18px;
          text-align: center;
          font-size: 13px;
          color: #8f8f8f;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>🚀 Infinite Beacon AI</h1>
        <p>Paste your trade idea, chart notes, or market question below and click Analyze.</p>

        <textarea id="input" placeholder="Example: ES broke above resistance, NQ is lagging, volume is picking up near VWAP. Is this a valid long setup?"></textarea>

        <div class="actions">
          <button id="analyzeBtn" onclick="runAI()">Analyze</button>
        </div>

        <div class="result">
          <div class="label">Result</div>
          <div id="resultText">Waiting for input...</div>
        </div>

        <div class="footer">Infinite Beacon AI Analyzer</div>
      </div>

      <script>
        async function runAI() {
          const inputEl = document.getElementById("input");
          const resultEl = document.getElementById("resultText");
          const buttonEl = document.getElementById("analyzeBtn");
          const input = inputEl.value.trim();

          if (!input) {
            resultEl.innerText = "Please enter something first.";
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
              body: JSON.stringify({ input })
            });

            if (!response.ok) {
              throw new Error("Request failed.");
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

  const result = [
    "Analysis Summary:",
    "",
    "Input received: " + userInput,
    "",
    "Basic read:",
    "- Trend context needs confirmation",
    "- Volume and market structure should align before entry",
    "- Wait for clean confirmation instead of forcing a trade",
    "",
    "Next step:",
    "Use this placeholder response for now. After this works, plug in real OpenAI logic."
  ].join("\\n");

  res.json({ result });
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
