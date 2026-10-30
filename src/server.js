const express = require("express");

const config = require("./config/env");
const logger = require("./utils/logger");

const {
  client,
  initializeWhatsApp,
  shutdownWhatsApp,
  isWhatsAppReady,
} = require("./services/whatsapp");

const { handleMessage } = require("./services/bot");

// --------------------------------------------------
// Express App
// --------------------------------------------------

const app = express();

app.use(express.json());

// --------------------------------------------------
// Routes
// --------------------------------------------------

app.get("/", (req, res) => {
  res.json({
    status: "running",
    service: "Dental WhatsApp Bot",
  });
});

app.get("/health", (req, res) => {
  const whatsappReady = isWhatsAppReady();

  res.status(whatsappReady ? 200 : 503).json({
    status: whatsappReady ? "healthy" : "starting",
    service: "Dental WhatsApp Bot",
    whatsapp: whatsappReady
      ? "connected"
      : "disconnected",
  });
});

// --------------------------------------------------
// WhatsApp Message Handler
// --------------------------------------------------

client.on("message", handleMessage);

// --------------------------------------------------
// Start Server
// --------------------------------------------------

const server = app.listen(config.port, () => {
  logger.success(
    `Express server running on http://localhost:${config.port}`
  );

  // Start WhatsApp after Express is ready.
  initializeWhatsApp();
});

// --------------------------------------------------
// Graceful Shutdown
// --------------------------------------------------

let shuttingDown = false;

async function shutdown(signal) {
  // Prevent shutdown from running twice.
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  logger.info(
    `${signal} received. Shutting down application...`
  );

  // Stop accepting new HTTP requests.
  server.close(async () => {
    try {
      // Properly close WhatsApp.
      await shutdownWhatsApp();

      logger.success(
        "Application shut down successfully."
      );

      process.exit(0);
    } catch (error) {
      logger.error(
        "Error during application shutdown.",
        error
      );

      process.exit(1);
    }
  });
}

// --------------------------------------------------
// Process Signals
// --------------------------------------------------

process.once("SIGINT", () => {
  shutdown("SIGINT");
});

process.once("SIGTERM", () => {
  shutdown("SIGTERM");
});