"""
Main API router
"""

from fastapi import APIRouter
from app.api.v1.endpoints import generation, health, files

api_router = APIRouter()

# Include endpoint routers
api_router.include_router(
    generation.router, 
    prefix="/generate", 
    tags=["Video Generation"]
)

api_router.include_router(
    health.router, 
    prefix="/health", 
    tags=["Health"]
)

api_router.include_router(
    files.router, 
    prefix="/files", 
    tags=["File Management"]
) 