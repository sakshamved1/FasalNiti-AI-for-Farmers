# 🌾 FasalNiti AI (फसलनीति)
### National Farmer Decision Intelligence, Real-Time Market Linkage & Fair Price Discovery Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Database](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?logo=mongodb&logoColor=white)](https://cloud.mongodb.com/)
[![WebSockets](https://img.shields.io/badge/Real--Time-Socket.IO_4.7-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![Python Microservice](https://img.shields.io/badge/Python_Microservice-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Regional Languages](https://img.shields.io/badge/Languages-9_Indian_Regional-E65100)](#-multilingual-kisanmitra-voice--chat-assistant)

> *"Better Price. Better Decisions. Better Farming."*  
> *"From Harvest to Highest-Value Sale."*

---

## 📌 Table of Contents

- [Overview & Problem Statement](#-overview--problem-statement)
- [System Architecture](#-system-architecture)
- [Core Engineering & Flagship Features](#-core-engineering--flagship-features)
  - [1. Flagship Farmer Decision Engine](#1-flagship-farmer-decision-engine)
  - [2. Multi-Horizon Price Forecasting Engine](#2-multi-horizon-price-forecasting-engine)
  - [3. Multilingual KisanMitra Voice & Chat Assistant](#3-multilingual-kisanmitra-voice--chat-assistant)
  - [4. AI Vision Crop Quality Scanner](#4-ai-vision-crop-quality-scanner)
  - [5. Real-Time Buyer Marketplace & Socket Negotiation](#5-real-time-buyer-marketplace--socket-negotiation)
  - [6. Government Schemes RAG & Grievance Redressal](#6-government-schemes-rag--grievance-redressal)
  - [7. Logistics Optimizer & WDRA Storage Linkage](#7-logistics-optimizer--wdra-storage-linkage)
  - [8. FPO Aggregation Hub](#8-fpo-aggregation-hub)
  - [9. Governance & Admin Portal](#9-governance--admin-portal)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Authentication & Role-Based Access Control](#-authentication--role-based-access-control)
- [Environment Configuration](#-environment-configuration)
- [Quick Start & Setup Instructions](#-quick-start--setup-instructions)
  - [Prerequisites](#prerequisites)
  - [Automated Full-Stack Launch](#automated-full-stack-launch)
  - [Individual Service Setup](#individual-service-setup)
  - [Database Operations & Seeding](#database-operations--seeding)
- [API Reference](#-api-reference)
  - [RESTful Endpoints](#restful-endpoints)
  - [WebSocket Real-Time Events](#websocket-real-time-events)
- [Trust, Integrity & Production Principles](#-trust-integrity--production-principles)
- [License](#-license)

---

## 🌟 Overview & Problem Statement

Smallholder farmers across India encounter severe **distress sales** at harvest time. This systemic issue is driven by:
1. **Opaque Price Discovery**: Wide, uncoordinated price variations across nearby APMC mandis without actionable net-return comparisons.
2. **High Logistics Overhead**: Hidden transport costs that consume unexpected percentages of gross harvest revenue.
3. **Storage Spoilage & Premature Sales**: Inability to evaluate whether warehousing costs outweigh expected price appreciation.
4. **Information Asymmetry**: Unawareness of government Minimum Support Prices (MSP), procurement subsidies, and accredited WDRA pledge financing.
5. **Language & Digital Barriers**: Existing software is often English-centric, desktop-first, and text-heavy.

### How FasalNiti AI Solves This
**FasalNiti AI** replaces passive mandi tickers with an **Active Decision Intelligence Engine**. It directly answers the farmer's core harvest dilemma:

> **"WHAT SHOULD I DO WITH MY HARVEST TODAY?"**
> - **Where to Sell:** Indore Mandi (₹4,520/qtl, 28 km) vs. Dewas Mandi (₹4,600/qtl, 42 km) vs. Ujjain Mandi.
> - **When to Sell:** Sell immediately at the farmgate vs. hold 5 days in a WDRA dry warehouse.
> - **Real Net Margin:** Precise net profit calculation subtracting exact freight deductions (Tractor, Bolero Pickup, Mini Truck) and daily storage costs.
> - **Whom to Trust:** Direct connection with verified corporate/FPO buyers with transparent trust scores and counter-offer negotiation rooms.
> - **How to Access Support:** Real-time eligibility evaluation for central and state schemes (PM-KISAN, PMFBY, AIF) and voice-first interaction in **9 Indian regional languages**.

---

## 🏗️ System Architecture

FasalNiti AI follows a decoupled, resilient 3-tier architecture with real-time bidirectional messaging and dedicated machine learning intelligence:

```
                                      ┌─────────────────────────────────────────────────────────┐
                                      │              CLIENT TIER (React 18 + Vite)              │
                                      │  • Tailwind CSS UI  • Recharts Trends  • Leaflet GIS    │
                                      │  • Web Speech STT/TTS (9 Regional Languages)  • PWA     │
                                      └──────────────┬────────────────────────────┬─────────────┘
                                                     │ HTTP REST                  │ WebSocket
                                                     ▼                            ▼
┌─────────────────────────┐           ┌───────────────────────────────────────────┬─────────────┐
│  AI / ML MICROSERVICE   │           │         API GATEWAY & BACKEND TIER        │  SOCKET.IO  │
│  (Python FastAPI:8000)  │◄─────────►│              (Node.js / Express)          │   GATEWAY   │
│  • Time-Series Proj.    │  Internal │  • JWT / Bcrypt Auth   • Helmet / CORS    │ (Port 5001) │
│  • Pydantic Schemas     │  Service  │  • Decision Engine     • Schemas RAG      │ • Live Bids │
│  • Harvest Inference    │           │  • Logistics Tariff    • Audit Logging    │ • Room Sync │
└─────────────────────────┘           └──────────────────────┬────────────────────┴─────────────┘
                                                             │ Mongoose Connection Pool
                                                             ▼
                                      ┌─────────────────────────────────────────────────────────┐
                                      │                PERSISTENT DATA STORE                    │
                                      │                  MongoDB Atlas                          │
                                      │  • Commodities & MSP  • 36 States Master • APMC Mandis  │
                                      │  • WDRA Warehouses    • User Profiles    • Audit Logs   │
                                      └─────────────────────────────────────────────────────────┘
```

---

## 🚀 Core Engineering & Flagship Features

### 1. Flagship Farmer Decision Engine
- **Mathematical Net-Return Evaluation**: Replaces guesswork with a deterministic financial formula:
  $$\text{Net Return} = \text{Gross Produce Value} - \text{Transport Freight} - \text{Storage Expenses} - \text{Platform Fee} + \text{Forecast Potential}$$
- **Geodesic Haversine Distance**: Calculates exact straight-line and road-approximated distance from the farmer's registered GPS/village to surrounding APMC mandis.
- **Dynamic Vehicle Tariff Allocation**:
  - **Tractor Trolley** ($\le 25\text{ quintals}$): Base ₹250 + ₹18/km
  - **Bolero Pickup** ($\le 15\text{ quintals}$): Base ₹300 + ₹22/km
  - **Mini Truck** ($> 25\text{ quintals}$): Base ₹500 + ₹30/km
- **FAQ Grade Price Adjustment**: Dynamic multiplier applied to base modal rate (Grade A: $+2\%$, Grade B: $-2\%$, Grade C: $-8\%$).
- **Clear Actionable Verdicts**: Explicit, high-confidence recommendations:
  - `SELL_TODAY_MANDI` (Identifies the highest net-profit market after freight deduction)
  - `WAIT_AND_STORE` (Calculates warehouse storage fee vs. projected 5-day price appreciation)
  - `SELL_DIRECT_BUYER` (Evaluates buyer farmgate pickup offers without transport costs)

### 2. Multi-Horizon Price Forecasting Engine
- **Multi-Day Projection Window**: Forecasts price curves across **1-day, 3-day, 7-day, 14-day, and 30-day horizons**.
- **Real Fundamental Market Indicators**:
  - Crushing demand from solvent extraction plants.
  - Daily mandi arrival volume surges and deficits.
  - Global edible oil futures (CBOT Soy Oil, BMD Palm Oil).
  - Government MSP floors and buffer replenishment targets.
- **Strict Disclaimers & Confidence Scores**: Every forecast is explicitly tagged with statistical confidence (e.g., $86\%$) and mandatory regulatory risk notices.

### 3. Multilingual KisanMitra Voice & Chat Assistant
- **Complete 9-Language Ecosystem**:
  1. **Hindi** (`hi` - हिन्दी)
  2. **English** (`en`)
  3. **Gujarati** (`gu` - ગુજરાતી)
  4. **Marathi** (`mr` - मराठी)
  5. **Punjabi** (`pa` - ਪੰਜਾਬੀ)
  6. **Bengali** (`bn` - বাংলা)
  7. **Tamil** (`ta` - தமிழ்)
  8. **Telugu** (`te` - తెలుగు)
  9. **Kannada** (`kn` - ಕನ್ನಡ)
- **Voice-First Interaction (STT & TTS)**: Built on the Web Speech API with regional dialect recognition, speech synthesis, and audio level visualization.
- **Agricultural RAG Architecture**: Answers farmer queries grounded in live MongoDB data:
  - Live mandi modal, min, and max rates.
  - MSP benchmark comparisons.
  - Localized weather alerts via Open-Meteo.
  - Agronomic advisory (NPK ratios, sowing schedules, pest management).

### 4. AI Vision Crop Quality Scanner
- **Directorate of Marketing & Inspection (DMI) Fair Average Quality (FAQ)** standards for Indian agricultural commodities.
- **Rigorous Anti-Hallucination Guardrails**:
  - Base64 image payload sanity and aspect check.
  - Production produce validation: rejects non-agricultural images (vehicles, documents, portraits).
- **Quality Attribute Diagnostics**:
  - Grain moisture percentage estimation.
  - Foreign matter and inorganic debris detection.
  - Uniformity score and kernel discoloration analysis.
  - Direct calculation of mandi premium/discount (e.g., $+₹120/\text{quintal}$ for milling grade).

### 5. Real-Time Buyer Marketplace & Socket Negotiation
- **Direct Farmgate Trade Linkage**: Farmers list harvest lots with photos, expected prices, quantity, and grade; verified buyers submit competitive bids.
- **Live Bid Counter-Offering (Socket.IO)**:
  - Dedicated negotiation channels (`listing_{listingId}`).
  - Instant price counter-offers, real-time typing indicators, and message history.
  - Deal locking mechanism converting agreed offers into binding orders.

### 6. Government Schemes RAG & Grievance Redressal
- **Dynamic Rule Engine**: Matches user profile attributes (state, district, landholding size in acres, crop types, category, irrigation type, annual income, KCC status) against central and state agricultural schemes.
- **Coverage**: PM-KISAN, PM Fasal Bima Yojana (PMFBY), Agriculture Infrastructure Fund (AIF 3% interest subsidy), SMAM (farm machinery subsidies), e-NAM, and state-specific portals.
- **Official Source Verification**: Links directly to authentic `.gov.in` and `.nic.in` domains with verification stamps.
- **Citizen Grievance Redressal Subsystem**: Generates unique tracking IDs (`GRV-XXXXXX`), allowing farmers to submit, track, and receive official admin responses to platform/scheme grievances.

### 7. Logistics Optimizer & WDRA Storage Linkage
- **Accredited WDRA Directory**: Locate verified cold storages and dry warehouses with daily per-quintal rates.
- **e-NWR Warehouse Receipt Pledge Financing**: Computes potential collateral loan advances up to **76%** of stored produce value, providing emergency liquidity without forcing a distress sale.
- **Interactive Leaflet GIS Mapping**: Visualizes mandis, warehouses, and storage hubs on OpenStreetMap tile layers.

### 8. FPO Aggregation Hub
- Dedicated interface for Farmer Producer Organizations to pool smallholder harvest lots into commercial bulk quantities, negotiate volume premiums with institutional buyers, and track collective member earnings.

### 9. Governance & Admin Portal (`/admin`)
- **Restricted Access**: Strictly guarded by JWT authentication and the `ADMIN` role.
- **Platform Telemetry**: Real-time aggregated metrics covering active users, verified listings, active offers, open support tickets, and total volume traded.
- **User Governance**: Verification badge management and account status toggling (`Active` / `Suspended`).
- **Scheme CMS**: Admin-level creation, modification, and rule tuning for government schemes.
- **Tamper-Evident Audit Logs**: Comprehensive audit records capturing administrative actor, target entity, client IP address, user agent, and timestamp.

---

## 💻 Technology Stack

| Layer | Technologies & Libraries | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18.3, Vite 5.3 | Client application core & fast modular builds |
| **Styling & Design** | Tailwind CSS 3.4, Lucide React, Clsx, Tailwind Merge | Responsive agricultural UI design & styling |
| **Data Visualization** | Recharts 2.12 | Multi-horizon price curves, arrival trends, and distribution charts |
| **Geospatial & Maps** | Leaflet 1.9, React-Leaflet 4.2 | Mandi and warehouse GIS mapping with custom markers |
| **Client State & Cache**| React Context API, TanStack React Query 5.45 | Global auth, language, location, and socket state |
| **Speech & Audio** | Web Speech API (`SpeechRecognition`, `speechSynthesis`) | Voice-first interaction in 9 Indian languages |
| **Backend Runtime** | Node.js (v18+), Express 4.19 | REST API gateway, business logic, and security middleware |
| **Real-Time Gateway** | Socket.IO 4.7 | Bilateral live price negotiations and counter-offers |
| **Security & Auth** | JSON Web Tokens (JWT), Bcrypt.js, Helmet, CORS, Morgan | Authentication, password hashing, and API hardening |
| **Database & ODM** | MongoDB Atlas, Mongoose 8.4 | Enterprise cloud document database with connection pooling |
| **ML Microservice** | Python 3.10+, FastAPI, Pydantic, Uvicorn | Microservice for time-series forecasting and inference |

---

## 📁 Project Directory Structure

```
FasalNiti-AI for Farmers/
├── package.json                   # Root monorepo orchestration scripts
├── .env.example                   # Master environment template
├── README.md                      # Comprehensive project documentation
│
├── client/                        # Frontend Web Application (React + Vite)
│   ├── package.json               # Client dependencies and build scripts
│   ├── vite.config.js             # Vite configuration
│   ├── tailwind.config.js         # Tailwind configuration & agricultural palette
│   ├── public/                    # Static assets, favicon, manifest
│   └── src/
│       ├── App.jsx                # Application root with client-side routing
│       ├── main.jsx               # React entry point
│       ├── components/            # Reusable UI widgets
│       │   ├── DecisionEngineCard.jsx     # Flagship decision evaluation card
│       │   ├── VoiceAssistantModal.jsx    # 9-language voice dialog modal
│       │   ├── FloatingAiChatWidget.jsx   # Persistent KisanMitra chat widget
│       │   ├── CropQualityAnalyzer.jsx    # Vision crop grading uploader
│       │   ├── LeafletMapView.jsx         # Interactive APMC GIS map
│       │   ├── NegotiationPanel.jsx       # Real-time Socket.IO counter-offers
│       │   ├── PriceTrendChart.jsx        # Recharts price projection graphs
│       │   ├── WhatIfSimulator.jsx        # Scenario sensitivity slider simulator
│       │   └── Navbar.jsx / MobileBottomNav.jsx
│       ├── contexts/              # Global state contexts
│       │   ├── AuthContext.jsx            # User credentials and session state
│       │   ├── LanguageContext.jsx        # 9-language localization engine
│       │   ├── LocationContext.jsx        # Selected district / GPS coordinates
│       │   └── SocketContext.jsx          # Shared Socket.IO connection
│       ├── locales/               # Multilingual i18n JSON catalogs
│       │   ├── en.json, hi.json, gu.json, mr.json, pa.json, bn.json, ta.json, te.json, kn.json
│       ├── pages/                 # Full-page views
│       │   ├── LandingPage.jsx            # Homepage and platform value overview
│       │   ├── FarmerDashboard.jsx        # Farmer command center
│       │   ├── DecisionEnginePage.jsx     # Standalone Harvest Decision Engine
│       │   ├── MarketIntelligencePage.jsx # APMC live prices and forecast charts
│       │   ├── GovernmentSchemesPage.jsx  # Scheme eligibility RAG & grievances
│       │   ├── BuyerMarketplacePage.jsx   # Produce listings and trade orders
│       │   ├── LogisticsStoragePage.jsx   # Freight calculator & WDRA storage
│       │   ├── FPODashboard.jsx           # Collective harvest pooling
│       │   ├── BuyerDashboard.jsx         # Buyer bids and logistics tracker
│       │   ├── ProfilePage.jsx            # Profile & agricultural preferences
│       │   └── HelpContactPage.jsx        # Support center & FAQ
│       ├── layouts/               # Admin layout wrapper
│       │   └── AdminLayout.jsx
│       └── pages/admin/           # Protected Administrative Governance Portal
│           ├── AdminDashboard.jsx         # System KPI metrics overview
│           ├── AdminUsers.jsx             # User verification and management
│           ├── AdminSchemes.jsx           # Scheme database management
│           ├── AdminTickets.jsx           # Unified grievance & dispute queue
│           └── AdminAuditLogs.jsx         # Tamper-evident admin action audit trails
│
├── server/                        # Backend REST & WebSocket Server (Node.js)
│   ├── package.json               # Backend dependencies and utility scripts
│   ├── server.js                  # Main Express & Socket.IO server setup
│   ├── config/
│   │   └── db.js                  # MongoDB Atlas connection manager & diagnostics
│   ├── controllers/               # Business controllers (auth, decision, ai, admin, etc.)
│   ├── middleware/
│   │   └── auth.js                # JWT verification and role-based guards
│   ├── models/                    # Mongoose schemas (User, Market, Listing, Offer, etc.)
│   ├── routes/                    # Express route definitions
│   ├── services/                  # Business & domain services
│   │   ├── decisionEngine.js          # Core harvest decision optimization algorithm
│   │   ├── pricePredictionService.js  # Multi-horizon price projections
│   │   ├── aiAssistantService.js      # KisanMitra multilingual RAG engine
│   │   ├── cropQualityService.js      # DMI Agmarknet crop grading validator
│   │   ├── ragSchemeService.js        # Scheme eligibility rule engine
│   │   └── liveWeatherService.js      # Open-Meteo weather API integration
│   ├── sockets/
│   │   └── negotiationSocket.js       # Real-time room negotiation handlers
│   ├── data/                      # Reference agricultural masters
│   │   ├── cropMaster.js              # Supported crops, aliases, and MSP baseline
│   │   └── locationMaster.js          # 36 Indian states and districts catalog
│   └── scripts/                   # Database maintenance & master seeding scripts
│       ├── seedMaster.js              # Populates master infrastructure (zero fake data)
│       ├── checkDatabase.js           # Validates Atlas collection health
│       ├── syncMarkets.js             # APMC reference mandi synchronizer
│       └── syncCommodities.js         # Commodity master synchronizer
│
└── ai-service/                    # Python ML Microservice (FastAPI)
    ├── main.py                    # FastAPI prediction service
    └── requirements.txt           # Python microservice dependencies
```

---

## 🔐 Authentication & Role-Based Access Control

FasalNiti AI operates under a **Clean Slate Policy**: zero dummy farmers, fake listings, or mocked bids are seeded into the database.

### User Roles & Permissions

| Role | Access Level | Key Capabilities |
| :--- | :--- | :--- |
| **Public / Guest** | Read-Only | Browse APMC mandi prices, view government schemes, run decision engine simulations. |
| **FARMER** | Authenticated | Create produce listings, receive bids, join counter-offer rooms, save profile land details. |
| **BUYER** | Authenticated | Browse listings, submit binding bids, negotiate counter-offers, view seller contact info upon agreement. |
| **FPO** | Authenticated | Aggregate crop volumes across member farmers, negotiate institutional bulk deals. |
| **ADMIN** | High Privilege | Access `/admin` dashboard, verify users, manage scheme records, resolve grievances, inspect audit logs. |

### Default Live Administrator Credentials
A single master administrator account is created during master seeding:
- **Email**: `kisan@admin.com`
- **Phone**: `9999999999`
- **Password**: `Admin@12345`
- **Role**: `ADMIN`

---

## ⚙️ Environment Configuration

Create a `.env` file in the `server/` directory (or use `.env.example` as a reference):

```env
# Server Network Configuration
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database (Mandatory MongoDB Atlas Connection String)
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/fasalniti?retryWrites=true&w=majority

# JWT Authentication Secret
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters

# AI / Vision APIs (Optional - falls back to genuine DMI Agmarknet zero-key rules)
AI_API_KEY=your_gemini_api_key_here

# Cloudinary Storage (Optional - falls back to inline base64 previews)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_URL=

# Leaflet Map API Key (Optional - uses OpenStreetMap public tiles by default)
MAP_API_KEY=
```

> [!IMPORTANT]
> The database connection module in `server/config/db.js` adheres to strict production standards: it connects directly to MongoDB Atlas and will fail-fast with actionable diagnostics if `MONGO_URI` is missing or IP access is not whitelisted.

---

## 🛠️ Quick Start & Setup Instructions

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **MongoDB Atlas Cluster**: Active connection URI
- **Python**: `3.10+` *(Optional, required only when running the standalone Python ML microservice)*

---

### Automated Full-Stack Launch
From the root directory:

```bash
# 1. Install dependencies across root, server, and client
npm run install-all

# 2. Seed verified agricultural master data (States, Mandis, Commodities, MSP, Schemes, Admin)
npm run seed

# 3. Start both backend server and frontend client concurrently
npm run dev
```

- **Client App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5001](http://localhost:5001)
- **Health Check**: [http://localhost:5001/api/health](http://localhost:5001/api/health)

---

### Individual Service Setup

#### 1. Backend Server
```bash
cd server
npm install
npm run dev
```
*Server starts on `http://localhost:5001` with Socket.IO enabled.*

#### 2. Frontend Client
```bash
cd client
npm install
npm run dev
```
*Client starts on `http://localhost:5173` via Vite.*

#### 3. Python AI Microservice *(Optional)*
```bash
cd ai-service
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python main.py
```
*Microservice starts on `http://localhost:8000` with Swagger docs at `/docs`.*

---

### Database Operations & Seeding

The server includes pre-configured maintenance scripts in `server/scripts/`:

```bash
# Seed master agricultural data (36 States, APMC Mandis, Commodities, MSP, Schemes, Admin)
npm run db:seed-master --prefix server

# Verify database connection, active cluster host, and collection count
npm run db:check --prefix server

# Sync latest APMC mandi listings
npm run db:sync-markets --prefix server

# Sync agricultural commodities and MSP benchmarks
npm run db:sync-commodities --prefix server

# Clean up temporary demo entries while safeguarding master infrastructure
npm run db:cleanup-demo --prefix server
```

---

## 📡 API Reference

### RESTful Endpoints


#### Authentication & Profile (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new Farmer, Buyer, or FPO account | No |
| `POST` | `/api/auth/login` | Authenticate with mobile/email and password | No |
| `GET` | `/api/auth/me` | Retrieve profile of the current authenticated user | Yes |
| `PUT` | `/api/auth/profile` | Update profile, landholdings, or language preferences | Yes |

#### Decision Intelligence (`/api/decision`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/decision/evaluate` | Evaluate harvest: compare mandi vs. storage vs. buyer | No |

#### Market Intelligence & Forecasts (`/api/markets` & `/api/predictions`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/markets` | Fetch verified APMC mandis and facilities | No |
| `GET` | `/api/markets/prices` | Fetch current mandi prices by crop and state | No |
| `GET` | `/api/markets/history` | 30-day historical prices and arrival volumes | No |
| `GET` | `/api/predictions/:crop` | Multi-horizon forecast (1d, 3d, 7d, 14d, 30d) | No |

#### Produce Listings & Trade Orders (`/api/listings`, `/api/offers`, `/api/orders`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/listings` | Search and filter produce listings | No |
| `POST` | `/api/listings` | Create a new crop listing with photos and grade | Farmer / FPO |
| `POST` | `/api/offers` | Submit purchase bid for a crop listing | Buyer |
| `POST` | `/api/offers/:id/accept` | Accept bid and transition into an active order | Farmer / Buyer |
| `GET` | `/api/orders` | List user orders and transaction states | Yes |

#### Government Schemes & Grievance (`/api/schemes`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/schemes` | Fetch active central and state schemes | No |
| `POST` | `/api/schemes/eligibility` | Evaluate scheme eligibility against user profile | No |
| `POST` | `/api/schemes/grievance` | Register a citizen grievance (returns `GRV-...`) | No |
| `GET` | `/api/schemes/grievance/:id` | Track grievance status and resolution replies | No |

#### AI Services (`/api/ai`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/ai/chat` | KisanMitra multilingual agricultural RAG reasoning | No |
| `POST` | `/api/ai/quality` | DMI FAQ vision inspection and quality grading | No |

#### Administrative Portal (`/api/admin`) — *Requires `ADMIN` Role*
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/admin/overview` | Platform telemetry and KPI counts | Admin |
| `GET` | `/api/admin/users` | List platform users with filter options | Admin |
| `PUT` | `/api/admin/users/:id/status` | Update account status (`Active` / `Suspended`) | Admin |
| `GET` | `/api/admin/tickets` | View combined support tickets and grievances | Admin |
| `PUT` | `/api/admin/tickets/:id/reply` | Submit official resolution reply to ticket | Admin |
| `GET` | `/api/admin/schemes` | Fetch all schemes for administration | Admin |
| `POST` | `/api/admin/schemes` | Create new government scheme record | Admin |
| `GET` | `/api/admin/audit-logs` | Retrieve tamper-evident administrative audit trail | Admin |

---

### WebSocket Real-Time Events

The negotiation gateway powers real-time bilateral bargaining rooms:

| Event Name | Direction | Payload | Description |
| :--- | :---: | :--- | :--- |
| `join_listing` | Client → Server | `listingId` | Joins the designated negotiation room for a listing |
| `leave_listing` | Client → Server | `listingId` | Leaves the negotiation room |
| `send_negotiation_message` | Client → Server | `{ listingId, sender, text, price }` | Broadcasts a counter-offer or chat message |
| `receive_negotiation_message` | Server → Client | `{ id, sender, text, price, timestamp }` | Dispatches incoming counter-offer to all peers |
| `typing` | Client → Server | `{ listingId, user }` | Emits typing notification |
| `user_typing` | Server → Client | `{ user }` | Notifies the counterpart of typing activity |

---

## ⚖️ Trust, Integrity & Production Principles

1. **Anti-Hallucination Government Data**: All scheme recommendations provide direct canonical URLs linking to official `.gov.in` and `.nic.in` domains. Schemes clearly present eligibility criteria, benefit amounts, and application steps.
2. **Explainable AI**: The Harvest Decision Engine exposes the complete financial breakdown (gross price, freight deduction per quintal, daily warehousing tariff, and platform fee). It does not output black-box scores without showing the math.
3. **Mandatory Predictive Uncertainty Notices**: Every multi-horizon price forecast includes an explicit statistical disclaimer: *"AI prediction — actual market prices may vary based on weather conditions, local arrivals, and market dynamics."*
4. **Resilient Production Fallback**: The vision crop grading service uses genuine DMI Agmarknet Fair Average Quality (FAQ) grading rules in zero-key environments, preventing external API failures from breaking user workflows.
5. **Clean Slate Architecture**: Zero mocked, fake, or synthetic transactions clutter the database upon initialization. Master seeds populate only real geographic locations, accredited mandis, and standard commodity catalogs.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for full details.

---

<div align="center">
  <b>FasalNiti AI Core Team</b><br>
  <i>Empowering Indian farmers with transparent market intelligence and fair price realization.</i>
</div>
