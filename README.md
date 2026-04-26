<div align="center">
  <h1>🌟 HaqDaar (Team Neon)</h1>
  <p><i>Empowering citizens with AI-driven discovery and access to government welfare schemes.</i></p>
</div>

<br />

![HaqDaar Dashboard Overview](https://via.placeholder.com/1000x400.png?text=HaqDaar+Platform)

## ⚠️ The Problem

Millions of citizens—particularly migrant workers, laborers, and marginalized communities—are entirely unaware of the government welfare schemes designed specifically to support them. Even when they are aware, several massive hurdles prevent them from actually claiming their benefits:
1. **Bureaucratic Jargon:** Scheme documentation is often complex, long, and difficult to comprehend.
2. **Language Barriers:** Information is rarely available in local, native languages.
3. **Complex Eligibility:** Figuring out if you qualify based on age, income, gender, and occupation is an overwhelming manual process.
4. **Migration Loss:** When migrant workers move from their Home State to a Current State for work, they often lose track of which benefits are "portable" and which are lost.

## 💡 The Solution

**HaqDaar** bridges this massive information gap. We aggregate over **57,000+ government schemes** into a single, highly intuitive platform. By leveraging cutting-edge Artificial Intelligence (Google Gemini), HaqDaar automatically cross-references a user's unique demographic profile with complex scheme rules to instantly determine eligibility. It breaks down bureaucratic barriers by providing simple, native-language guidance on exactly how to apply.

---

## 🚀 Key Features

- **AI Eligibility Matcher**: Uses Google Gemini to analyze user profiles (age, income, occupation, gender) and generates a `0-100%` eligibility score with a personalized, one-sentence explanation for any given scheme.
- **Interactive AI Roadmaps**: Automatically digests complex government documentation to generate step-by-step, actionable application guides for the common citizen.
- **Multilingual Support**: AI insights, match reasoning, and roadmaps are dynamically translated into **English, Hindi, and Marathi**.
- **Migrant Portability Check**: Intelligently compares schemes between a user's Home State and Current State to ensure critical benefits (like rations or health insurance) aren't lost during migration.
- **Category Filtering**: A robust, accurate classification system to instantly filter schemes by sectors like Agriculture, Education, Women & Child, and more.
- **Personalized Bookmarks**: Securely save and track schemes across sessions using Clerk Authentication.

## 🛠️ Technology Stack

**Frontend:**
- **React (Vite):** Blazing fast rendering.
- **TailwindCSS:** Sleek, responsive, dark-mode styling.
- **Framer Motion:** High-fidelity micro-animations & transitions.
- **React i18next:** Seamless Internationalization.
- **Clerk:** Secure User Authentication.

**Backend:**
- **Python (Flask):** Robust API routing.
- **Google GenAI SDK (Gemini-2.0-Flash):** Powers the core semantic matching and chatbot features.
- **Pandas:** Lightning-fast, in-memory data processing for the 57k+ dataset.
- **Gunicorn:** Production-ready WSGI server.

---

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
# Return to the root directory
cd ..
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
