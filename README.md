# FlowSync - Stadium Crowd Management

FlowSync is an intelligent "next-generation" crowd management platform built to predict crowd bottlenecks, deploy early-warning capacity alerts, and seamlessly redirect stadium attendees along optimal, uncrowded paths using live data simulations.

## The Problem It Solves
Managing thousands of fans within stadium concourses leads to unpredictable crowding. This application is divided into two synchronous applications resolving the issue from both ends:
1. **Attendee Map**: Intuitively directs fans across the least-crowded path by measuring active zone densities as Dijkstra traversal cost weights.
2. **Organizer Dashboard**: A command center supplying venue operators with rolling historical flow analytics, dynamic capacity charting, and critical visual alerts to deploy staff preemptively before a true bottleneck can occur.

## Tech Stack
- **Backend Analytics Engine**: Python / FastAPI (Pydantic models, uvicorn)
- **Frontend Architecture**: React 18, Vite
- **Data Visualization**: Recharts, Framer-Motion (fluid kinetic transitions) 
- **Styling**: Tailwind CSS (featuring extensive UI custom tokens and Glassmorphism effects)

## Local Setup & Development

Ensure you have both Python 3.10+ and Node.js installed.

### 1. Launch the Analytics Engine (Backend)
Navigate into the backend directory relative to the repository base:
```bash
cd backend
python -m venv venv
# Windows: .\venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Launch the Application Interface (Frontend)
Open a separate terminal and navigate into the frontend directory:
```bash
cd frontend
npm install
npm run dev
```

The React dashboard will actively listen on `http://localhost:5173`.

## Additional Improvements
- **CI/CD Workflows**: Configured GitHub Actions to trigger automated backend (`pytest`) and frontend (`vitest`/`npm test`) validations on every push to the `main` branch, showcasing thorough testing workflows.
