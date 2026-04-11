import asyncio
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
import random
import os
import heapq
from typing import List, Dict

ZONES: List[str] = ["Gates", "Concourse_A", "Concourse_B", "Food_Court", "Seating"]

GRAPH: Dict[str, List[str]] = {
    "Gates": ["Concourse_A", "Concourse_B"],
    "Concourse_A": ["Gates", "Food_Court", "Seating"],
    "Concourse_B": ["Gates", "Food_Court", "Seating"],
    "Food_Court": ["Concourse_A", "Concourse_B", "Seating"],
    "Seating": ["Concourse_A", "Concourse_B", "Food_Court"]
}

CAPACITIES: Dict[str, int] = {
    "Gates": 2000,
    "Concourse_A": 3000,
    "Concourse_B": 3000,
    "Food_Court": 1500,
    "Seating": 15000
}

class ZoneDensity(BaseModel):
    """Data model representing the density analytics strictly tracked per zone."""
    zone: str = Field(..., description="The unique identifier of the stadium zone.")
    current_occupancy: int = Field(..., description="Current detected volume of entities.")
    max_capacity: int = Field(..., description="The theoretical maximum load of the zone.")
    density_percentage: float = Field(..., description="Calculated percentage load.")
    status: str = Field(..., description="Risk status identifier: green, yellow, or red.")

class RouteResponse(BaseModel):
    """Data model for returning the optimal calculated traversal path."""
    route: List[str] = Field(..., description="Sequential list of zones forming the route.")
    total_cost: float = Field(..., description="The aggregated temporal/density resistance cost of this route.")

class HealthResponse(BaseModel):
    """Standard health ping response model."""
    status: str

def get_status(percentage: float) -> str:
    """
    Evaluates the risk classification based on percentage threshold limitations.
    Returns:
        str: Enum-like string 'green', 'yellow', or 'red'
    """
    if percentage < 0.5:
        return "green"
    elif percentage < 0.8:
        return "yellow"
    else:
        return "red"

current_occupancies: Dict[str, int] = {z: int(CAPACITIES[z] * random.uniform(0.1, 0.6)) for z in ZONES}

async def simulation_task() -> None:
    """
    Asynchronous background daemon shifting the crowd analytics dataset smoothly over time.
    Provides temporal consistency for connected frontend clients without mutation on GET.
    """
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
    """Manages the startup and shutdown execution timeline, activating background daemons."""
    task = asyncio.create_task(simulation_task())
    yield
    task.cancel()

app = FastAPI(title="FlowSync Analytics Engine", version="2.0", lifespan=lifespan)

# Security Implementation: Explicitly locking down CORS middleware
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://promptwars.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Security Implementation: Generic API Rate Limiter
RATE_LIMIT_CACHE: Dict[str, float] = {}
RATE_LIMIT_TIME = 0.5 # Minimal anti-spam constraint

def rate_limiter(request: Request):
    """Validates the temporal threshold limit to prevent DDoS traffic flooding."""
    client_ip = request.client.host if request.client else "unknown"
    current_t = time.time()
    if client_ip in RATE_LIMIT_CACHE and current_t - RATE_LIMIT_CACHE[client_ip] < RATE_LIMIT_TIME:
         raise HTTPException(status_code=429, detail="Too Many Requests. Rate Limit Exceeded.")
    RATE_LIMIT_CACHE[client_ip] = current_t

@app.get("/zones/density", response_model=List[ZoneDensity], dependencies=[Depends(rate_limiter)])
def get_densities():
    """
    Returns the current simulated density representing the real-time crowd tracked from CCTV cameras.
    """
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

@app.get("/route", response_model=RouteResponse, dependencies=[Depends(rate_limiter)])
def get_route(start: str, end: str):
    """
    Core Pathfinding Engine. Utilizing an edge-weight modified Dijkstra algorithm
    to route attendees efficiently considering immediate node density thresholds.
    """
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
            return RouteResponse(route=path, total_cost=cost)
            
        if current in visited:
            continue
            
        visited.add(current)
        
        for neighbor in GRAPH[current]:
            if neighbor not in visited:
                ncost = cost + node_costs[neighbor]
                heapq.heappush(pq, (ncost, neighbor, path + [neighbor]))

    raise HTTPException(status_code=404, detail="Route not found")

@app.get("/health", response_model=HealthResponse)
def health():
    """Standard orchestrator hook to confirm app daemon stability."""
    return HealthResponse(status="ok")

frontend_build = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.isdir(frontend_build):
    assets_path = os.path.join(frontend_build, "assets")
    if os.path.isdir(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        return FileResponse(os.path.join(frontend_build, "index.html"))
