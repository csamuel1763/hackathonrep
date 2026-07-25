# CareerPilot AI — Cybersecurity Career Intelligence Operating System

CareerPilot AI is an AI-powered Cybersecurity Career Intelligence OS powered by a local Ollama Llama 3.1 8B neural engine. Candidates upload their resumes, generate a 10-Dimensional Digital Twin, receive AI-powered career health telemetry, discover live cybersecurity job openings, execute week-by-week learning roadmaps, and chat with an interactive AI Mentor.

---

## 🦙 Local Ollama Setup Instructions

CareerPilot AI operates locally using **Ollama** and **Llama 3.1 8B**.

### 1. Install & Start Ollama
1. Download and install Ollama from [https://ollama.com](https://ollama.com).
2. Pull the Llama 3.1 8B model:
   ```bash
   ollama pull llama3.1:8b
   ```
3. Start the Ollama server (running on `http://localhost:11434`):
   ```bash
   ollama serve
   ```

---

## ⚡ Judge Quickstart — Run Complete App with One Command

Run the complete production stack (Frontend, FastAPI Backend, PostgreSQL Database, and pgAdmin) with a single command:

```bash
docker compose up --build
```

> ⏱️ **Expected Startup Time**: ~30-45 seconds (includes automatic database health check verification and container orchestration).

---

## 🌐 Application Services & Ports

Once `docker compose up --build` completes, the following services are live:

| Service | Host URL | Description |
| :--- | :--- | :--- |
| **Frontend Application** | [http://localhost:5173](http://localhost:5173) | Primary Cyber OS UI (React 18 + Vite + Nginx) |
| **Alternative Frontend Port** | [http://localhost:3000](http://localhost:3000) | Secondary web port mapping |
| **FastAPI Backend Server** | [http://localhost:8000](http://localhost:8000) | REST API & Ollama Local AI Pipeline |
| **Interactive API Documentation** | [http://localhost:8000/api/docs](http://localhost:8000/api/docs) | OpenAPI / Swagger documentation |
| **Local Ollama Engine** | [http://localhost:11434](http://localhost:11434) | Local LLM Engine (Llama 3.1 8B) |
| **PostgreSQL Database** | `localhost:5432` | PostgreSQL 16 persistent database |
| **pgAdmin Management** | [http://localhost:5050](http://localhost:5050) | Database UI (Login: `admin@careerpilot.ai` / `admin123`) |

---

## 🛑 Stop Application

To gracefully stop all services and containers:

```bash
docker compose down
```

To stop containers and reset persistent volumes:

```bash
docker compose down -v
```

---

## 🔑 Environment Variables Configuration

Docker automatically configures default environment secrets. You can customize `.env` in the root folder or use `.env.docker`:

```env
# Backend Environment
DATABASE_URL=postgresql+asyncpg://careerpilot:careerpilot_pass@db:5432/careerpilot_db
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

# Frontend Environment
VITE_API_BASE_URL=http://localhost:8000
```

---

## 💻 Local Development Setup (Non-Docker)

### 1. Backend Local Setup (Python 3.11/3.12)
```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\Activate.ps1
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Local Setup (Node 20+)
```bash
cd frontend
npm install
npm run dev
```
Access local dev server at [http://localhost:5173/](http://localhost:5173/).

---

## 🛠️ Verification & Test Suite

Run full E2E system validation tests against the live API:

```bash
python test_e2e_endpoints.py
```
