const dotenv = require("dotenv");

dotenv.config();

const config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  clinicName: process.env.CLINIC_NAME || "Dental Clinic",
};

module.exports = config;