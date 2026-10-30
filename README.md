# Dental WhatsApp Assistant

An automated WhatsApp assistant designed for dental clinics to handle common patient inquiries and appointment requests.

## Features

- Automated WhatsApp messaging using `whatsapp-web.js`
- English and Arabic message handling
- Automated responses to common dental clinic inquiries
- Dental services and treatment information
- Clinic opening hours and location information
- Payment and insurance inquiries
- Appointment request collection
- Human receptionist support
- Emergency-related message handling
- Express server with health-check endpoint

## Tech Stack

- **Backend:** Node.js, Express.js
- **WhatsApp Integration:** whatsapp-web.js
- **Browser Automation:** Puppeteer
- **Environment Configuration:** dotenv

## Project Structure

```text
src/
├── config/
├── data/
├── services/
├── utils/
└── server.js
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Amirali-projects/dental-whatsapp-bot.git
cd dental-whatsapp-bot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=5000
NODE_ENV=development
CLINIC_NAME=Smile Dental Clinic
HEADLESS=false
CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
```

### 4. Start the application

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Application status |
| GET | `/health` | Application and WhatsApp health |

## Security Notes

- Keep `.env` private.
- Never commit WhatsApp authentication files.
- Keep `.wwebjs_auth` and `.wwebjs_cache` out of version control.

## Project Status

Prototype for demonstrating automated dental clinic WhatsApp support and appointment request handling.

## Author

**Amir Ali**

GitHub: [Amirali-projects](https://github.com/Amirali-projects)