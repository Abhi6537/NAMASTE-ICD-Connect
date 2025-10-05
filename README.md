# NAMASTE-ICD-FHIR Terminology Integration System

A modern web platform that bridges **AYUSH medical terminologies** (Ayurveda, Yoga, Unani, Siddha, Homeopathy) with international healthcare standards — integrating **NAMASTE**, **ICD-11**, and **FHIR R4** for interoperability in electronic health records (EHRs).

---

## 🚀 Overview

This system maps traditional NAMASTE medical terminologies to ICD-11 codes and generates **FHIR-compliant resources**, enabling interoperability between AYUSH systems and modern healthcare IT standards.

---

## ✨ Features

- 🔍 **Terminology Search** across NAMASTE & ICD-11 databases  
- 🔄 **Single / Bulk Mapping** between NAMASTE and ICD-11  
- 🧩 **FHIR R4 Resource Generation** (Condition resources)  
- 📊 **Real-time API Statistics** and monitoring  
- 💡 **Interactive API Documentation**  
- 🌿 **Supports all AYUSH systems**

---

## 🛠 Tech Stack

**Frontend**
- React 18 (TypeScript, Vite)
- Tailwind CSS + shadcn/ui
- Framer Motion, Recharts
- Axios, React Router v6

**Backend**
- FastAPI (Python)
- OpenAPI / Swagger Docs
- FHIR R4, ICD-11 standards
- CORS Middleware, Uvicorn

---

## ⚙️ Setup

### 1️⃣ Clone Repository
```bash
git clone https://github.com/Abhi6537/NAMASTE-ICD-EMR-.git
cd NAMASTE-ICD-EMR-
2️⃣ Frontend Setup
bash
Copy code
npm install
npm run dev
Runs on http://localhost:5173

3️⃣ Backend Setup
bash
Copy code
cd backend
python -m venv venv
venv\Scripts\activate  # (Windows)
source venv/bin/activate  # (Mac/Linux)
pip install -r requirements.txt
uvicorn main:app --reload
Runs on http://localhost:8000

🌐 API Overview
Base URL: https://namaste-icd-api.vercel.app

Endpoint	Method	Description
/health	GET	API health check
/api/v1/search	GET	Search NAMASTE / ICD-11 terms
/api/v1/map	POST	Map single NAMASTE term
/api/v1/bulk-map	POST	Bulk mapping
/api/v1/fhir/condition	GET	Get FHIR Condition resource
/api/v1/stats	GET	API statistics

🚢 Deployment
Frontend:

Deploy via Vercel or Netlify

Build: npm run build

Output: dist

Backend:

Deploy on Vercel, Railway, or Render

Update requirements.txt

Configure environment variables if needed

🌱 Environment Variables
Frontend (.env)

env
Copy code
VITE_API_BASE_URL=https://namaste-icd-api.vercel.app
Backend (.env)

env
Copy code
ICD11_API_KEY=your_key_here
🤝 Contributing
Fork the repository

Create a feature branch (git checkout -b feature-name)

Commit your changes

Push and open a Pull Request

📄 License
This project is licensed under the MIT License.

🙌 Acknowledgments
WHO – ICD-11

Ministry of AYUSH, Govt. of India – NAMASTE

HL7 International – FHIR R4