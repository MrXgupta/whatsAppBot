# 📤 WhatsAppBot – Bulk WhatsApp Message Sender

A full-stack WhatsApp bot that allows users to send bulk WhatsApp messages through a web dashboard. Built using React, Tailwind CSS, Redux Toolkit, Express, and `whatsapp-web.js`.

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
├── .gitignore
├── README.md
└── package.json
```

# Clone the repository
```
git clone https://github.com/MrXgupta/whatsAppBot.git
cd whatsAppBot
```
# Backend setup
```
cd server
npm install
node index.js
```
# Open a new terminal for frontend
```
cd ../client
npm install
npm run dev
```
