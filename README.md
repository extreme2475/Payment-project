# Nexa Payment & P2P Lending Platform

A full-stack MERN application providing a secure digital wallet, peer-to-peer (P2P) lending marketplace, and real-time social features.

## 🚀 Key Features

### 1. Internal Digital Wallet
* **DB-to-DB Transfers:** Secure money transfers handled directly via database logic and Mongoose transactions.
* **Atomic Integrity:** Uses MongoDB sessions to ensure that money is never lost during a transfer—either both accounts update, or neither does.
* **Transaction Limits:** Built-in controls for minimum (10) and maximum (5,000) transfer amounts.
* **Wallet Security:** A secondary Wallet PIN system with failed attempt tracking and account blocking.

### 2. P2P Lending & EMI Engine
* **Marketplace:** Borrowers can request loans and lenders can fund them through an internal offer system.
* **Sequential EMIs:** A strict repayment engine that ensures EMIs are paid in the correct chronological order.
* **Credit Scoring:** An automated scoring system that rewards on-time repayments and loan settlements.

### 3. Authentication & Real-Time Features
* **Terminal-Based OTP:** OTPs for registration and verification are generated and displayed in the server terminal for simplified development.
* **Live Chat:** Real-time messaging between users powered by Socket.io, featuring message status tracking.
* **Scheduled Tasks:** Integrated background workers for processing recurring payments or reminders.

## 🛠️ Tech Stack

**Frontend:**
* React 19, Vite, Tailwind CSS, Framer Motion, Recharts, Three.js.

**Backend:**
* Node.js, Express 5, Socket.io, MongoDB (Mongoose).

## ⚙️ Setup & Development

1. **Clone & Install:**
   ```bash
   git clone [https://github.com/extreme2475/payment-project.git](https://github.com/extreme2475/payment-project.git)
   npm install
   cd backend && npm install
