const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Serve static files like dashboard.html, index.html, etc
app.use(express.static(path.join(__dirname)));

// ✅ Global music setting
let globalMusicUrl = "";

app.post("/api/music", (req, res) => {
  const { url } = req.body;
  globalMusicUrl = url;
  console.log("🎵 Music URL updated:", url);
  res.json({ success: true });
});

app.get("/api/music", (req, res) => {
  res.json({ url: globalMusicUrl });
});

// ✅ Optional: default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard.html"));
});






const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
