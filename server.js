const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== FRONTEND PAGE =====
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Infinite Beacon AI</title>
        <style>
          body {
            font-family: Arial;
            background: #111;
            color: #fff;
            text-align: center;
            padding: 50px;
          }
          textarea {
            width: 80%;
            height: 120px;
            border-radius: 10px;
            padding: 10px;
          }
          button {
            margin-top: 20px;
            padding: 12px 25px;
            border-radius: 10px;
            border: none;
            background: #00c853;
            color: white;
            font-size: 16px;
            cursor: pointer;
          }
          #result {
            margin-top: 30px;
            font-size: 18px;
          }
        </style>
      </head>
      <body>
        <h1>🚀 Infinite Beacon AI</h1>
        <p>Paste your trade idea or question:</p>

        <textarea id="input"></textarea><br>

        <button onclick="runAI()">Analyze</button>

        <div id="result"></div>

        <script>
          async function runAI() {
            const input = document.getElementById("input").value;

            const res = await fetch("/analyze", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ input })
            });

            const data = await res.json();
            document.getElementById("result").innerText = data.result;
          }
        </script>
      </body>
    </html>
  `);
});

// ===== AI ENDPOINT =====
app.post("/analyze", (req, res) => {
  const userInput = req.body.input;

  // 🔥 replace this later with real AI logic
  res.json({
    result: "Analysis: " + userInput + " looks like a potential setup 👍"
  });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
