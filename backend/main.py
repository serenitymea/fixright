from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routers import bookings

# app
app = FastAPI(
    title="FixRight Appliance Repair API",
    description="REST API for managing repair requests",
    version="1.0.0",
)

# cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://localhost:80"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

#routers
app.include_router(bookings.router, prefix="/api")

# startup
@app.on_event("startup")
def on_startup():
    init_db()

# health check
@app.get("/health", tags=["System"])
def health_check():
    return {"status": "ok", "service": "fixright-api"}