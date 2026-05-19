const express = require("express");
const app     = express();
const http    = require("http");
const https   = require("https");
const PORT    = process.env.PORT || 3000;

// ─── صفحة الحالة ────────────────────────────────────────────
app.get("/", (req, res) => {
  const up = process.uptime();
  const h  = Math.floor(up / 3600);
  const m  = Math.floor((up % 3600) / 60);
  const s  = Math.floor(up % 60);
  const mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
  res.send(
    `<html><body style="font-family:monospace;background:#0d0d0d;color:#00ff88;padding:40px">` +
    `<h2>⚡ lwsyw — Online</h2>` +
    `<p>🕐 Uptime: ${h}h ${m}m ${s}s</p>` +
    `<p>💾 Memory: ${mem} MB</p>` +
    `<p>🟢 Status: Running 24/7</p>` +
    `</body></html>`
  );
});

app.get("/ping", (req, res) => {
  res.json({
    status : "alive",
    uptime : process.uptime(),
    memory : process.memoryUsage().heapUsed,
    time   : new Date().toISOString()
  });
});

// ─── تشغيل السيرفر ──────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});

// ─── Self-Ping كل 90 ثانية ──────────────────────────────────
const BOT_URL = process.env.REPLIT_DEV_DOMAIN
  ? `https://${process.env.REPLIT_DEV_DOMAIN}`
  : `http://localhost:${PORT}`;

let pingFails = 0;

function doPing() {
  try {
    const isHttps = BOT_URL.startsWith("https");
    const mod     = isHttps ? https : http;
    const req     = mod.get(`${BOT_URL}/ping`, (res) => {
      res.resume();
      pingFails = 0;
      console.log(`[KEEP-ALIVE] Ping OK — uptime ${Math.floor(process.uptime())}s`);
    });
    req.on("error", () => {
      pingFails++;
      console.warn(`[KEEP-ALIVE] Ping failed (${pingFails})`);
    });
    req.setTimeout(12000, () => { req.destroy(); });
  } catch(e) {}
}

// أول بينج بعد 30 ثانية من التشغيل
setTimeout(doPing, 30 * 1000);
// ثم كل 90 ثانية
setInterval(doPing, 90 * 1000);

// ─── حماية شاملة من الكراش ──────────────────────────────────
process.on("uncaughtException", (err) => {
  console.error("[CRASH GUARD] uncaughtException:", err.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("[CRASH GUARD] unhandledRejection:", String(reason));
});


module.exports = server;
