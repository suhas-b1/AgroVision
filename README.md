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

<img width="957" height="963" alt="image" src="https://github.com/user-attachments/assets/0dae5bec-506c-4477-8f38-8e3d99ce17f7" />

<img width="1919" height="967" alt="Screenshot 2026-02-21 163817" src="https://github.com/user-attachments/assets/58a2ec28-d8be-4c40-a372-c0ed5b3fe862" />

<img width="1919" height="972" alt="Screenshot 2026-02-21 165446" src="https://github.com/user-attachments/assets/ba414e7b-51d2-4bca-be25-3cb6759ef1e2" />

<img width="1919" height="963" alt="Screenshot 2026-02-21 165659" src="https://github.com/user-attachments/assets/6c8a29f5-bd46-4cef-b6e3-39c6dc39161e" />

<img width="1919" height="968" alt="Screenshot 2026-02-21 165948" src="https://github.com/user-attachments/assets/b04250b0-550a-45d7-8237-76fad798753c" />

<img width="1918" height="958" alt="Screenshot 2026-02-21 170152" src="https://github.com/user-attachments/assets/fc5ef11c-69f8-4533-8861-fb9f212db9e1" />

<img width="1919" height="965" alt="Screenshot 2026-02-21 170218" src="https://github.com/user-attachments/assets/8ecff33a-01cd-4278-81c7-640a3946f13a" />
