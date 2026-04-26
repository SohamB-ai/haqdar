# HaqDaar (Team Neon) 🌟

HaqDaar is a state-of-the-art, AI-powered platform designed to seamlessly connect citizens, especially migrant workers, with government welfare schemes. By leveraging artificial intelligence and data from over 57,000+ schemes, HaqDaar personalizes the discovery, eligibility checking, and application process.

![HaqDaar Dashboard Overview](https://via.placeholder.com/1000x500.png?text=HaqDaar+Platform)

## 🚀 Key Features

- **AI Eligibility Matcher**: Uses Google Gemini to analyze user profiles (age, income, occupation, gender) and generates a 0-100% eligibility score with a personalized explanation for any given scheme.
- **Interactive AI Roadmaps**: Automatically generates step-by-step, actionable application guides for schemes based on complex government documentation.
- **Multilingual Support**: AI insights, match reasoning, and roadmaps are dynamically translated into **English, Hindi, and Marathi**.
- **Migrant Portability Check**: Compares schemes between a user's Home State and Current State to ensure benefits aren't lost during migration.
- **Category Filtering**: A robust, accurate classification system to instantly filter schemes by sectors like Agriculture, Education, Women & Child, and more.
- **Personalized Bookmarks**: Securely save and track schemes across sessions using Clerk Authentication.

## 🛠️ Technology Stack

**Frontend:**
- React (Vite)
- TailwindCSS (Styling)
- Framer Motion (Micro-animations & transitions)
- React i18next (Internationalization)
- Clerk (User Authentication)
- Axios

**Backend:**
- Python (Flask)
- Google GenAI SDK (Gemini-2.0-Flash)
- Pandas (In-memory Data Processing)
- Gunicorn (Production deployment)

## 💻 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Clerk Account
- Google Gemini API Key

### 1. Clone & Setup Backend
```bash
git clone https://github.com/Odyssey-26/Team-Neon.git
cd Team-Neon/backend

# Install dependencies
pip install -r requirements.txt

# Run the Flask API
python app.py
```
*(The backend will run on `http://localhost:5001`)*

### 2. Setup Frontend
```bash
# From the root directory
npm install

# Create a .env.local file with your keys:
# VITE_CLERK_PUBLISHABLE_KEY=your_key
# VITE_GEMINI_API_KEY=your_key
# VITE_GEMINI_CHATBOT_API_KEY=your_key
# VITE_API_URL=http://localhost:5001

# Run the Vite server
npm run dev
```

## ☁️ Deployment
- **Frontend** is configured for seamless deployment on **Vercel**.
- **Backend** is configured for deployment as a Web Service on **Render** using Gunicorn.

---
*Built with ❤️ by Team Neon for Odyssey-26*
