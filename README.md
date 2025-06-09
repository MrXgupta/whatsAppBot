# 📤 WhatsAppBot – Bulk WhatsApp Message Sender

A full-stack WhatsApp bot that allows users to send bulk WhatsApp messages through a web dashboard. Built using React,
Tailwind CSS, Redux Toolkit, Express, and `whatsapp-web.js`.

---

## 🚀 Features

- Upload contacts via CSV or add manually
- Preview message queue and logs
- Send bulk messages via WhatsApp Web client
- Auto reconnect and re-scan QR if session expires
- Message status tracking (success/failed)
- Persistent state with Redux and localStorage
- Beautiful UI with Tailwind CSS

---

## 🛠️ Tech Stack

### 🔧 Backend

- **Node.js**
- **Express.js**
- **whatsapp-web.js** – To connect to WhatsApp
- **Socket.IO** – Real-time communication between client and server
- **cors** – For frontend-backend communication

### 🖥️ Frontend

- **React.js**
- **Vite** – Fast dev server and build tool
- **Tailwind CSS** – Utility-first CSS
- **Redux Toolkit** – State management
- **SweetAlert2** – For user feedback modals
- **QRCode.react** – To render WhatsApp QR code

---

## 📂 Project Structure

```bash
wa-bulk-sender/
├── client/         # React frontend
├── server/         # Express backend
├── docker-compose.yml
├── .gitignore
├── README.md
└── package.json
```

# 🚀 How to Run the Project

1. Running Locally (Development Mode)
   You can run backend and frontend independently with hot reload for fast development:

```
# Clone the repo

git clone https://github.com/MrXgupta/whatsAppBot.git
cd whatsAppBot

# Backend setup & run

cd server
npm install
npm run dev # or `node app.js` for production mode

# Open a new terminal for frontend

cd ../client
npm install
npm run dev # Starts frontend dev server with hot reload
```

2. Running with Docker

```aiignore
# Clone the repo
git clone https://github.com/MrXgupta/whatsAppBot.git
cd whatsAppBot

# Build and start containers
docker compose up --build
```

Frontend will be available on http://localhost:5173 (or mapped port in your docker-compose.yml)

Backend API will run on http://localhost:3001 (or mapped port)

Notes:

Docker Compose builds and runs both client and server containers.

Environment variables and other configs are managed inside Dockerfiles and compose.

For local code changes during development, you may prefer running npm run dev separately to get live reload (unless you
set up volumes for hot reloading in Docker).

🧑‍💻 Development Tips
For quick development feedback, run backend and frontend with npm run dev locally.

Use Docker Compose to simulate production or share your app environment with teammates or on your server.

If running with Docker, rebuild images (docker compose build) after dependency or config changes.

