const timestamp = () => {
  return new Date().toISOString();
};

const logger = {
  info(message) {
    console.log(`[INFO] ${timestamp()} - ${message}`);
  },

  success(message) {
    console.log(`[SUCCESS] ${timestamp()} - ${message}`);
  },

  error(message, error) {
    console.error(`[ERROR] ${timestamp()} - ${message}`);

    if (error) {
      console.error(error);
    }
  },
};

module.exports = logger;