const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const logger = require("../utils/logger");

// --------------------------------------------------
// Configuration
// --------------------------------------------------

const CHROME_PATH =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const CLIENT_ID = "dental-bot-2";

const HEADLESS =
  String(process.env.HEADLESS).toLowerCase() === "true";

// --------------------------------------------------
// WhatsApp Client
// --------------------------------------------------

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: CLIENT_ID,
  }),

  puppeteer: {
    executablePath: CHROME_PATH,

    // Local demo: false
    // VPS/server: true
    headless: HEADLESS,

    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",

      // Performance / stability
      "--disable-gpu",
      "--disable-extensions",
      "--disable-background-networking",
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
      "--disable-features=Translate,BackForwardCache",
    ],

    // Allow enough time for WhatsApp Web to start.
    timeout: 120000,
  },
});

// --------------------------------------------------
// State
// --------------------------------------------------

let initialized = false;
let initializing = false;
let isReady = false;
let shuttingDown = false;
let eventHandlersRegistered = false;

// --------------------------------------------------
// Event Handlers
// --------------------------------------------------

function registerEventHandlers() {
  // Prevent duplicate event listeners.
  if (eventHandlersRegistered) {
    return;
  }

  eventHandlersRegistered = true;

  // ------------------------------------------------
  // QR Code
  // ------------------------------------------------

  client.on("qr", (qr) => {
    logger.info(
      "Scan the QR code below with WhatsApp:"
    );

    qrcode.generate(qr, {
      small: true,
    });
  });

  // ------------------------------------------------
  // Loading
  // ------------------------------------------------

  client.on("loading_screen", (percent, message) => {
    logger.info(
      `WhatsApp loading: ${percent}% - ${message}`
    );
  });

  // ------------------------------------------------
  // Authenticated
  // ------------------------------------------------

  client.on("authenticated", () => {
    logger.success(
      "WhatsApp authenticated successfully."
    );
  });

  // ------------------------------------------------
  // Authentication Failure
  // ------------------------------------------------

  client.on("auth_failure", (message) => {
    isReady = false;
    initialized = false;

    logger.error(
      `WhatsApp authentication failed: ${message}`
    );
  });

  // ------------------------------------------------
  // Ready
  // ------------------------------------------------

  client.on("ready", () => {
    isReady = true;
    initialized = true;

    logger.success(
      "WhatsApp bot is ready!"
    );
  });

  // ------------------------------------------------
  // Disconnected
  // ------------------------------------------------

  client.on("disconnected", (reason) => {
    isReady = false;
    initialized = false;

    logger.error(
      `WhatsApp disconnected: ${reason}`
    );
  });

  // ------------------------------------------------
  // WhatsApp State
  // ------------------------------------------------

  client.on("change_state", (state) => {
    logger.info(
      `WhatsApp state: ${state}`
    );
  });
}

// --------------------------------------------------
// Initialize WhatsApp
// --------------------------------------------------

async function initializeWhatsApp() {
  // Prevent duplicate initialization.
  if (initialized || initializing) {
    logger.info(
      "WhatsApp client is already initialized or initializing."
    );

    return;
  }

  // Don't initialize while shutting down.
  if (shuttingDown) {
    logger.info(
      "WhatsApp initialization skipped because shutdown is in progress."
    );

    return;
  }

  initializing = true;

  try {
    registerEventHandlers();

    logger.info(
      "Starting WhatsApp client..."
    );

    await client.initialize();

    // Do not mark the client as ready here.
    // The "ready" event is the real confirmation.
    logger.success(
      "WhatsApp client initialization completed. Waiting for ready event..."
    );
  } catch (error) {
    initialized = false;
    isReady = false;

    logger.error(
      "WhatsApp initialization failed.",
      error
    );
  } finally {
    initializing = false;
  }
}

// --------------------------------------------------
// Connection Status
// --------------------------------------------------

function isWhatsAppReady() {
  return isReady;
}

// --------------------------------------------------
// Graceful Shutdown
// --------------------------------------------------

async function shutdownWhatsApp() {
  if (shuttingDown) {
    return;
  }

  if (!initialized && !initializing) {
    return;
  }

  shuttingDown = true;

  try {
    logger.info(
      "Closing WhatsApp client..."
    );

    isReady = false;

    await client.destroy();

    initialized = false;

    logger.success(
      "WhatsApp client closed successfully."
    );
  } catch (error) {
    logger.error(
      "Error while closing WhatsApp client.",
      error
    );
  } finally {
    shuttingDown = false;
  }
}

// --------------------------------------------------
// Process-Level Error Protection
// --------------------------------------------------

process.on(
  "unhandledRejection",
  (reason) => {
    logger.error(
      "Unhandled promise rejection.",
      reason
    );
  }
);

process.on(
  "uncaughtException",
  (error) => {
    logger.error(
      "Uncaught exception.",
      error
    );

    // In production, allow PM2/systemd to restart
    // the application after a fatal exception.
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
);

// --------------------------------------------------
// Exports
// --------------------------------------------------

module.exports = {
  client,
  initializeWhatsApp,
  shutdownWhatsApp,
  isWhatsAppReady,
};