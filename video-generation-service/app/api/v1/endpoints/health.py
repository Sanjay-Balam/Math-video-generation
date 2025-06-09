"""
Health check endpoints
"""

from fastapi import APIRouter
from datetime import datetime

from app.models.schemas import HealthResponse
from app.services.health import HealthService

router = APIRouter()

@router.get("/", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint
    """
    health_service = HealthService()
    dependencies = await health_service.check_dependencies()
    status = health_service.get_health_status()
    
    return HealthResponse(
        status=status["status"],
        timestamp=status["timestamp"],
        dependencies=dependencies,
        version=status["version"]
    )

@router.get("/dependencies")
async def check_dependencies():
    """
    Detailed dependency check
    """
    health_service = HealthService()
    dependencies = await health_service.check_dependencies()
    
    return {
        "dependencies": dependencies,
        "all_healthy": all(dependencies.values()),
        "timestamp": datetime.now()
    } 