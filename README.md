# 🌱 AgroVision AI

**AgroVision AI** is a smart, AI-powered agricultural assistant designed to empower farmers with advanced disease detection, real-time advisory, and collaborative tools. Built with a modern FastAPI backend and a responsive React frontend, it leverages Google's Gemini AI to provide expert-level insights for crop management.

## 🚀 Key Features

- **Disease Detection**: Snapshot a leaf image to instantly identify plant diseases with confidence scores and severity levels.
- **AI Advisory**: Get detailed, AI-generated explanations and organic/chemical treatment advice for detected issues.
- **Interactive Heatmap**: Visualize disease spread across geographical locations to anticipate and prevent outbreaks.
- **AI Chat Assistant**: A multi-modal chat interface (text, voice, and image) for real-time agricultural support.
- **Weather Insights**: Live weather monitoring with specialized advisory for planting and harvesting conditions.
- **Fertilizer Calculator**: Data-driven calculations for optimal nutrient application based on crop type and acreage.
- **Community Hub**: A social platform for farmers to share posts, ask questions, and get feedback from agricultural experts.
- **Finance Tracker**: Manage your farm's productivity by tracking income and expenses per crop.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), Lucide Icons, Chart.js, Leaflet (Maps), Framer Motion.
- **Backend**: FastAPI (Python 3.10+), SQLAlchemy (SQLite), Python-jose (JWT).
- **AI**: Google Gemini AI (Generative AI & Vision).

---

## 🏁 Getting Started

To run AgroVision AI on your local machine, follow these steps.

### Prerequisites
- **Node.js** (v20 or later) & **npm**
- **Python** (3.10 or later)
- **Git**

### 1. Clone & Install Dependencies

First, clone the repository and install the packages for both the backend and frontend.

**Backend Setup:**
```bash
# Create a virtual environment
python -m venv .venv
source .venv/Scripts/activate  # Windows: .venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

**Frontend Setup:**
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

AgroVision requires several API keys to function correctly. Create a `.env` file in the **root directory**.

```env
# AI Configuration
AI_PROVIDER=gemini
AI_API_KEY=YOUR_GEMINI_API_KEY_HERE

# Security
JWT_SECRET=generate-a-random-secret-here
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database
DATABASE_URL=sqlite:///./agrovision.db
```

> [!TIP]
> Get your free Gemini API key from [Google AI Studio](https://aistudio.google.com/).

### 3. Initialize the Database

Run the migration script to set up your SQLite database tables.

```bash
python migrate_db.py
```

### 4. Run the Application

You need to run both the backend and frontend servers simultaneously.

**Start Backend (Root Directory):**
```bash
python -m uvicorn backend.main:app --port 8000 --reload
```

**Start Frontend (Frontend Directory):**
```bash
cd frontend
npm run dev
```

The application will be accessible at:
- **Frontend**: `http://localhost:3000`
- **API Documentation**: `http://localhost:8000/docs`

---

## 📄 License
This project is for educational and demonstrative purposes. Feel free to fork and enhance!
