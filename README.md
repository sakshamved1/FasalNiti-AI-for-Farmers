# 🌾 KisanSetu AI
### AI-Powered Farmer Decision Intelligence & Market Linkage Platform

> *"Better Price. Better Decisions. Better Farming."*  
> *"From Harvest to Highest-Value Sale."*

---

## 🌟 Executive Summary & Mission
Smallholder farmers in India frequently face **distress sales** due to lack of market intelligence, opaque price discovery across APMC mandis, unverified middleman deductions, high post-harvest storage losses, and lack of awareness of government procurement subsidies.

Most existing applications are basic e-commerce directories or raw mandi rate tickers that leave the farmer confused. **KisanSetu AI transcends generic marketplaces** by answering the central, pivotal question:

> **"WHAT SHOULD I DO WITH MY HARVEST TODAY?"**
> - **Where should I sell?** (Indore vs Dewas vs Ujjain Mandi)
> - **When should I sell?** (Sell now vs Hold 5 days)
> - **Should I store my crop?** (Warehouse vs Cold Storage profit comparison)
> - **Which buyer is trustworthy?** (Audited GST & 94/100 Trust Score)
> - **Which government scheme am I eligible for?** (PM-KISAN, PMFBY, AIF 3% subsidy)
> - **What is the real profit after transportation?** (Exact freight deduction per quintal)
> - **How can I communicate in my own language?** (Voice-first in 9 Indian regional languages)

---

## 🚀 Flagship Platform Features

### 1. 🧠 Flagship Farmer Decision Engine
- **The Core Innovation**: Evaluates the full financial equation:
  $$\text{Net Return} = \text{Market Price} - \text{Transport Cost} - \text{Storage Cost} - \text{Platform Fees} + \text{Forecast Potential}$$
- Delivers a single, clear, unambiguous recommendation: **"WAIT 5 DAYS & STORE"** or **"SELL TODAY AT INDORE MANDI"** or **"SELL DIRECTLY TO VERIFIED BUYER"**.
- Displays ranked options with transparent net profits, transport deductions, confidence scores, and risk flags.

### 2. 📈 Multi-Horizon Price Forecasting
- AI price forecasts across **1, 3, 7, 14, and 30-day horizons**.
- Contextual market rationale factoring crushing demand, rainfall anomalies, and port imports.
- Responsible, transparent AI disclaimers on all predictions.

### 3. 🎙️ 9-Language KisanMitra AI Assistant (Voice & Text)
- Full voice recognition and speech synthesis in 9 Indian languages:
  **English, Hindi, Gujarati, Marathi, Punjabi, Bengali, Tamil, Telugu, and Kannada**.
- Responds natively with concrete market prices, transport tariffs, and verified government schemes.

### 4. 🤝 Verified Buyer Marketplace & Direct Negotiations
- Direct negotiation room with live Socket.IO counter-offers and instant deal acceptance.
- Escrow protection safeguards farmer funds prior to dispatch.

### 5. 🏛️ Government Schemes RAG & Help Desk
- Matches farmer landholding, crops, and state with authentic central and state schemes (PM-KISAN, PMFBY, AIF, e-NAM, SMAM).
- Direct official portal links, eligibility checklist, and citizen grievance redressal filing.

### 6. 🚚 Transport & WDRA Storage Linkage
- Live freight tariff calculator for Tractor Trolleys, Bolero Pickups, and Trucks.
- Accredited WDRA cold storage and dry warehouse directory with e-NWR warehouse receipt pledge loan facilities up to 76%.

---

## 🔐 Authentication & Data Model

By default, **KisanSetu operates on a Clean Slate model**:
- **Single Live Administrator**:
  - **Email**: `kisan@admin.com`
  - **Password**: `Admin@12345`
  - Has access to National Agri Analytics, Mandi telemetry, and dispute monitoring.
- **Farmers & Buyers**:
  - Unregistered users can browse public mandi prices, schemes, and run the decision engine.
  - Farmers and buyers must register their account to create crop listings, submit bids, accept offers, and access personal dashboards.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Leaflet GIS, Canvas Confetti |
| **Backend** | Node.js, Express, Socket.IO, JWT, Bcrypt, Helmet, CORS |
| **Database** | MongoDB (Mongoose) with automatic high-performance In-Memory fallback |
| **AI / Speech** | Web Speech API (9 Indian languages), Time-series forecasting algorithms |

---

## 💻 Quick Start & Running Locally

### Prerequisites
- Node.js (v18+) and npm

### Run Application
```bash
# Terminal 1: Backend Server (Port 5001)
cd server
npm install
npm run dev

# Terminal 2: Frontend Client (Port 5173)
cd client
npm install
npm run dev
```

- **Client Application**: http://localhost:5173
- **Backend API Gateway**: http://localhost:5001
- **Health Check**: http://localhost:5001/api/health

---

## 📡 Core API Endpoints

- `POST /api/auth/login` — Login with mobile/email and password
- `POST /api/auth/register` — Register new Farmer, Buyer, or FPO
- `POST /api/decision/evaluate` — Flagship Harvest Decision Engine calculation
- `GET /api/markets` — List APMC mandis and facilities
- `GET /api/markets/prices` — Live crop prices across mandis
- `GET /api/markets/history?crop=Soybean&days=30` — 30-Day historical prices & arrival volumes
- `GET /api/predictions/:crop` — Multi-horizon AI price forecast (1d, 3d, 7d, 14d, 30d)
- `GET /api/listings` & `POST /api/listings` — Farmer harvest listings
- `GET /api/offers` & `POST /api/offers` — Buyer bids and counter-offers
- `POST /api/offers/:id/accept` — Accept offer and lock deal into order
- `GET /api/schemes` & `POST /api/schemes/eligibility` — Verified government scheme discovery
- `POST /api/schemes/grievance` — Citizen grievance registration
- `POST /api/logistics/calculator` — Real Profit Calculator (Sell Now vs Wait vs Buyer)
- `POST /api/ai/chat` — 9-Language KisanMitra AI reasoning engine
- `POST /api/ai/quality` — AI vision crop grading
- `GET /api/analytics/impact` — National Market Impact Dashboard metrics

---

## ⚖️ Ethical & Trust Principles
- **No Hallucinated Data**: All government schemes link to verified ministry domains (`.gov.in` / `.nic.in`) with explicit "Last Verified" timestamps.
- **Clear Disclaimers**: All time-series price forecasts are explicitly labeled as *"AI prediction — actual market prices may vary."*
- **Transparent Formula**: Real net profit is calculated transparently with visible transport freight and daily storage rates.
