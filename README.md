# 🤖 AI Career Coach Chatbot

---

**An interactive chatbot built using React & Flask that helps users with resume feedback, LinkedIn optimization, and job interview preparation.**

> 💡 Powered by LLaMA-3 mock responses (can be extended to Hugging Face models or OpenAI API).

---

## 📌 Project Overview

The **AI Career Coach Chatbot** simulates a conversational assistant that helps job seekers with:
- Resume improvement tips
- LinkedIn profile optimization
- Job interview preparation guidance

This is a full-stack project demonstrating real-time communication between a **React frontend** and a **Flask backend**, built with modularity and clarity for learning, deployment, and expansion.

---

## 🚀 Demo

📍 Run locally: `http://localhost:3000`  
🧠 Ask: *"How to improve my resume?"*, *"Tips for LinkedIn?"*, or *"Interview prep help?"*

---

## 🗂️ Project Structure

```

career-coach-chatbot/
├── frontend/               # React Frontend (Chat UI)
│   ├── src/
│   │   ├── App.js
│   │   └── App.css
├── backend/                # Flask Backend (API + LLaMA mock logic)
│   ├── app.py
│   ├── requirements.txt
│   └── venv/
└── README.md               # Project Documentation

````

---

## 🧑‍💻 Technologies Used

### Frontend:
- React.js (Functional components, Hooks)
- Vanilla CSS

### Backend:
- Flask (REST API)
- flask-cors
- Transformers & Torch (mocking LLaMA-3, extendable to Hugging Face)
- sentence-transformers + FAISS (planned semantic search support)

---

## 🛠️ Setup Instructions

### ⚙️ Prerequisites
Ensure you have:
- Node.js & npm
- Python 3.7+
- `pip` & `venv`

---

### 🧪 1. Clone the Repo

```bash
git clone https://github.com/your-username/career-coach-chatbot.git
cd career-coach-chatbot
````

---

### 🖼️ 2. Frontend Setup (React)

```bash
cd frontend
npm install
npm start
```

Visit [http://localhost:3000](http://localhost:3000)

---

### 🔌 3. Backend Setup (Flask)

```bash
cd ../backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Your API will run at `http://localhost:5000`

---

### 🔄 Testing Locally

1. Run backend: `python app.py`
2. Run frontend: `npm start` in the `frontend` folder
3. Open browser → `localhost:3000`
4. Try asking:

   * `How to improve my LinkedIn profile?`
   * `Resume feedback please`
   * `Help me prep for interviews`

---

## 🔮 Future Enhancements

* ✅ Replace mock responses with actual LLaMA-3 or OpenAI/Gemini API
* 🧠 Add semantic search with FAISS & vector embeddings
* 💾 Store chats for analytics and progress tracking
* 🌐 Deploy to Vercel (frontend) + Render/AWS/GCP (backend)

---

## 🤝 Contribution Guide

Contributions are welcome!
Feel free to:

* Fork this repo
* Open an Issue for suggestions
* Submit a Pull Request for improvements or new features

---

## 📜 License

MIT License — use it, modify it, share it.
Please credit the original author when using this repo in public work.

---

## 🙋‍♀️ About the Author

Made with 💚 by **[Maheswari Pinneti](https://github.com/maheswari-pinneti)**
An aspiring Web Developer | AI Enthusiast | Frontend Specialist
🌐 Portfolio: [maheswari-pinneti.github.io](https://maheswari-pinneti.github.io)

---

