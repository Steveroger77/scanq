# scanq

**Ask plain-English questions about your data. Get instant AI-powered answers.**

scanq is a lightweight full-stack web app that lets you upload a CSV or Excel file and query it in plain English — no SQL, no code, no formulas required. The AI reads your dataset, writes the Pandas code, runs it securely, and returns a clear human-readable answer along with a supporting data table.

---

## What it does

1. **Upload your file** — drag and drop or click to browse. Supports `.csv` and `.xlsx`.
2. **Get instant suggestions** — the AI reads your column names and data sample, then automatically suggests 3 relevant questions to help you get started.
3. **Ask anything** — type a question like *"Which region had the highest profit last quarter?"* or click a suggestion chip.
4. **See the answer** — the AI writes and executes Python/Pandas code behind the scenes and returns a clean text answer plus a data table.

---

## Tech Stack

### Frontend
| Tool | Purpose |
|------|---------|
| React 19 + TypeScript | UI framework |
| Vite | Build tool and dev server |
| Tailwind CSS | Utility-class styling |
| OGL (WebGL) | Aurora animated background |
| Axios | HTTP requests to the backend |

### Backend
| Tool | Purpose |
|------|---------|
| FastAPI | REST API framework |
| Pandas + NumPy | Data processing |
| OpenRouter API | LLM access (free tier) |
| Uvicorn | ASGI server |
| python-dotenv | Environment variable loading |

---

## Project Structure

```
scanq/
├── backend/
│   ├── main.py          # FastAPI app — /upload and /ask endpoints
│   ├── agent.py         # Calls OpenRouter LLM to generate code and suggestions
│   ├── executor.py      # Securely executes the AI-generated Pandas code
│   ├── prompts.py       # System prompts sent to the AI
│   └── requirements.txt # Python dependencies
│
├── frontend/
│   ├── index.html       # App entry point (title, meta tags)
│   ├── src/
│   │   ├── App.tsx              # Main application logic and state
│   │   ├── index.css            # Global styles and glassmorphism design
│   │   └── components/
│   │       ├── Upload.tsx       # File upload card with drag-and-drop
│   │       ├── DatasetInfo.tsx  # Shows file metadata and column list
│   │       ├── QuestionBox.tsx  # Question input with AI suggestion chips
│   │       ├── AnswerCard.tsx   # Displays the AI text answer
│   │       ├── TableView.tsx    # Displays the supporting data table
│   │       └── Aurora.tsx       # Animated WebGL background
│   └── package.json
│
├── .env                 # Your real secrets (never commit this)
├── .env.example         # Template showing required variables
└── README.md
```

---

## Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- Python 3.9+
- An [OpenRouter](https://openrouter.ai) account (free)

### 1. Clone and set up environment variables

```bash
git clone https://github.com/your-username/scanq.git
cd scanq
cp .env.example .env
```

Open `.env` and fill in your OpenRouter API key:

```
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxxxxxxx
```

### 2. Start the backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

### 3. Start the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

> **Sample Dataset:** You can test the app immediately using the sample dataset provided in the repository code: `top_10_cricket_teams_stats.csv`.

---

## How it Works (Under the Hood)

```
User uploads file
       ↓
Backend reads CSV/Excel → builds schema + 3 sample rows
       ↓
AI is asked to generate 3 relevant questions (suggestion chips)
       ↓
User asks a question (typed or via chip)
       ↓
AI receives: column names, data types, sample rows, and the question
       ↓
AI returns: Pandas code as JSON
       ↓
Backend executes the code in a sandboxed environment
       ↓
Result (text answer + data table) sent back to browser
```

The code execution is sandboxed — AI-generated code only has access to a limited set of safe Python built-ins and the uploaded DataFrame. It cannot access the filesystem, make network requests, or import arbitrary libraries.

> **Note on Data Accuracy (No Hallucinations):** scanq does NOT use the AI to guess or hallucinate answers based on its training data. The AI only writes the *code*. The actual mathematical computation (counting, averaging, filtering) is performed exactly by the Pandas engine running locally on the server. This guarantees 100% accurate mathematical results based purely on the data you upload.

---

## Deployment Recommendation

### ✅ Recommended: **Render** (for this project)

| | Render | Vercel |
|---|--------|--------|
| **Backend (FastAPI/Python)** | ✅ Native support | ❌ Requires serverless adapters — Vercel Functions don't support long-running Python processes well |
| **Frontend (React/Vite)** | ✅ Static site deploy | ✅ Excellent |
| **Free tier** | ✅ Available (spins down after inactivity) | ✅ Available |
| **Environment variables** | ✅ Set in dashboard | ✅ Set in dashboard |
| **Best for** | Full-stack apps with Python backends | Pure frontend or Next.js apps |

**Use Render because:** scanq has a Python/FastAPI backend that needs to run as a persistent server. Vercel is designed for frontend and Next.js — it doesn't natively support FastAPI as a standalone web service without complex workarounds.

### How to deploy on Render

**Backend (Web Service):**
1. Create a new **Web Service** on Render
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Set **Build Command**: `pip install -r requirements.txt`
5. Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variable: `OPENROUTER_API_KEY` → your key
7. After deploy, copy the public URL (e.g. `https://scanq-api.onrender.com`)

**Frontend (Static Site):**
1. Create a new **Static Site** on Render
2. Connect the same repo
3. Set **Root Directory** to `frontend`
4. Set **Build Command**: `npm install && npm run build`
5. Set **Publish Directory**: `dist`
6. Add environment variable: `VITE_API_URL` → your backend Render URL

Then update `App.tsx`:
```ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

Also update `main.py` CORS to allow your frontend Render URL:
```python
allow_origins=["https://your-scanq-frontend.onrender.com"]
```

---

## Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `OPENROUTER_API_KEY` | Backend `.env` | Your OpenRouter API key. Get one free at openrouter.ai |

---

## Known Limitations

- **Single user at a time** — the uploaded dataset is stored in memory and shared globally. Concurrent users will overwrite each other's data. Fine for personal use, needs a session store for multi-user production.
- **Free LLM tier** — OpenRouter's free models may be rate-limited. If you see a "Too Many Requests" error, wait a moment and try again.
- **Speed vs. Cost** — Because this project is configured to use a completely free, massive open-source AI model (Nvidia Nemotron 340B), answers may take a little longer to generate than with a paid model like GPT-4. It's well worth the wait — you get enterprise-grade reasoning entirely for free, and it always gets the job done.
- **Code execution** — AI-generated Pandas code is sandboxed but not fully isolated. For production with untrusted inputs, consider running execution in a Docker container or serverless sandbox.

---

## License

MIT — free to use, modify, and distribute.
