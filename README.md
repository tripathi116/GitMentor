# 🤖 GitMentor

**GitMentor** is an AI-powered MERN stack application designed to help developers of all skill levels instantly analyze, understand, and evaluate any GitHub repository. By leveraging Google's **Gemini AI**, GitMentor generates comprehensive breakdowns tailored for beginners (in both English and Hinglish) and professionals, alongside quantitative repository health scores.

---

## ✨ Features

- **🎯 AI-Driven Analysis:** Instantly analyze codebase folders, README, and repository metadata.
- **📚 Multi-Level Explanations:**
  - **Beginner English:** Simple, jargon-free explanations of how the project works and how to read the code.
  - **Beginner Hinglish:** Friendly, conversational Hindi written in the English script (e.g., *"Yeh project ek task manager hai..."*) for developers who find Hinglish more approachable.
  - **Professional Developer:** Deep-dive architectural breakdowns, design patterns, and system design rationales.
- **📊 Repository Health Metrics:** Standardized 0-100 scores across:
  - Overall Quality
  - Code Quality & Modularity
  - Documentation Clarity (README & setup guide)
  - Git Practices & Standard Layouts
  - Security Considerations
  - Project Structure Organization
- **🔒 Protected Routes & JWT Auth:** Built-in secure user authentication (Register, Login) with persistent sessions.

---

## 🛠️ Tech Stack

### Frontend
- **React (v19)** & **Vite**
- **Framer Motion** (for premium, responsive animations)
- **React Router Dom (v7)**
- **TailwindCSS (v4)**
- **Axios** (API requests)

### Backend
- **Node.js** & **Express**
- **MongoDB** & **Mongoose** (database)
- **Google Generative AI SDK** (Gemini 2.5 Flash)
- **JSON Web Tokens (JWT)** & **Bcryptjs** (secure authentication)
- **Cookie Parser** & **Cors**

---

## 📁 Project Structure

```text
GitMentor/
├── Backend/               # Express API server
│   ├── src/
│   │   ├── config/        # Database configurations
│   │   ├── controllers/   # Auth & GitHub Report logic
│   │   ├── middlewares/   # JWT Auth middleware
│   │   ├── models/        # User & Report MongoDB models
│   │   ├── routes/        # Router files
│   │   ├── services/      # Gemini AI & GitHub API integrations
│   │   └── utils/
│   ├── app.js
│   └── server.js
├── Frontend/              # React single-page app
│   ├── public/
│   ├── src/
│   │   ├── assets/        # Visual assets & images
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Auth state management
│   │   ├── pages/         # Login, Register, Home, Report
│   │   ├── services/      # API communication layer
│   │   ├── styles/        # Global & page-specific styles
│   │   ├── App.jsx
│   │   └── main.jsx
└── .gitignore             # Root gitignore excluding builds & credentials
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js installed on your local machine
- MongoDB instance (Atlas or local server)
- Gemini API Key from Google AI Studio

### Setup Environment Variables

#### 1. Backend Setup
Create a `.env` file inside the `Backend/` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
```

#### 2. Frontend Setup
Create a `.env` file inside the `Frontend/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🏃 Running the Application

You need to start both the backend server and the frontend client.

### Start Backend
```bash
cd Backend
npm install
npm run dev
```

### Start Frontend
```bash
cd Frontend
npm install
npm run dev
```

The application will be running locally at `http://localhost:5173`.

---

## 📄 License
This project is licensed under the ISC License.
