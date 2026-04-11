import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import random
import os
import heapq
from typing import List

ZONES = ["Gates", "Concourse_A", "Concourse_B", "Food_Court", "Seating"]

GRAPH = {
    "Gates": ["Concourse_A", "Concourse_B"],
    "Concourse_A": ["Gates", "Food_Court", "Seating"],
    "Concourse_B": ["Gates", "Food_Court", "Seating"],
    "Food_Court": ["Concourse_A", "Concourse_B", "Seating"],
    "Seating": ["Concourse_A", "Concourse_B", "Food_Court"]
}

CAPACITIES = {
    "Gates": 2000,
    "Concourse_A": 3000,
    "Concourse_B": 3000,
    "Food_Court": 1500,
    "Seating": 15000
}

class ZoneDensity(BaseModel):
    zone: str
    current_occupancy: int
    max_capacity: int
    density_percentage: float
    status: str

def get_status(percentage: float) -> str:
    if percentage < 0.5:
        return "green"
    elif percentage < 0.8:
        return "yellow"
    else:
        return "red"

current_occupancies = {z: int(CAPACITIES[z] * random.uniform(0.1, 0.6)) for z in ZONES}

async def simulation_task():
    global current_occupancies
    while True:
        for zone in ZONES:
            max_cap = CAPACITIES[zone]
            change = int(max_cap * random.uniform(-0.05, 0.05))
            new_occ = max(0, min(max_cap, current_occupancies[zone] + change))
            current_occupancies[zone] = new_occ
        await asyncio.sleep(2.0)

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(simulation_task())
    yield
    task.cancel()

app = FastAPI(title="FlowSync Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/zones/density", response_model=List[ZoneDensity])
def get_densities():
    """Returns the current simulated density representing the real-time crowd."""
    result = []
    for zone in ZONES:
        occ = current_occupancies[zone]
        max_cap = CAPACITIES[zone]
        pct = occ / max_cap
        
        result.append(ZoneDensity(
            zone=zone,
            current_occupancy=occ,
            max_capacity=max_cap,
            density_percentage=round(pct * 100, 2),
            status=get_status(pct)
        ))
    return result

class RouteRequest(BaseModel):
    start: str
    end: str

@app.get("/route")
def get_route(start: str, end: str):
    """Pathfinding endpoint utilizing Dijkstra's algorithm where density acts as edge weight."""
    if start not in ZONES or end not in ZONES:
        raise HTTPException(status_code=400, detail="Invalid start or end zone")

    node_costs = {}
    for zone in ZONES:
        pct = current_occupancies[zone] / CAPACITIES[zone]
        if pct > 0.8:
            cost = 1 + 10 * pct
        elif pct > 0.5:
            cost = 1 + 5 * pct
        else:
            cost = 1 + pct
        node_costs[zone] = cost

    pq = [(0, start, [start])]
    visited = set()

    while pq:
        cost, current, path = heapq.heappop(pq)
        
        if current == end:
            return {"route": path, "total_cost": cost}
            
        if current in visited:
            continue
            
        visited.add(current)
        
        for neighbor in GRAPH[current]:
            if neighbor not in visited:
                ncost = cost + node_costs[neighbor]
                heapq.heappush(pq, (ncost, neighbor, path + [neighbor]))

    raise HTTPException(status_code=404, detail="Route not found")

@app.get("/health")
def health():
    return {"status": "ok"}

frontend_build = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.isdir(frontend_build):
    assets_path = os.path.join(frontend_build, "assets")
    if os.path.isdir(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        return FileResponse(os.path.join(frontend_build, "index.html"))
