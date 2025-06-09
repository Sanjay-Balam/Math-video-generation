"""
Health check service
"""

import logging
import shutil
import subprocess
from typing import Dict
from datetime import datetime

logger = logging.getLogger(__name__)

class HealthService:
    """
    Service for health checks and dependency validation
    """
    
    async def check_dependencies(self) -> Dict[str, bool]:
        """Check if all required dependencies are available"""
        dependencies = {
            "manim": await self._check_manim(),
            "python": await self._check_python(),
            "ffmpeg": await self._check_ffmpeg(),
        }
        
        logger.info(f"Dependency check results: {dependencies}")
        return dependencies
    
    async def _check_manim(self) -> bool:
        """Check if Manim is installed and accessible"""
        try:
            result = subprocess.run(
                ["manim", "--version"], 
                capture_output=True, 
                text=True, 
                timeout=10
            )
            return result.returncode == 0
        except Exception as e:
            logger.error(f"Manim check failed: {str(e)}")
            return False
    
    async def _check_python(self) -> bool:
        """Check Python version"""
        try:
            result = subprocess.run(
                ["python", "--version"], 
                capture_output=True, 
                text=True, 
                timeout=5
            )
            return result.returncode == 0
        except Exception:
            try:
                result = subprocess.run(
                    ["python3", "--version"], 
                    capture_output=True, 
                    text=True, 
                    timeout=5
                )
                return result.returncode == 0
            except Exception as e:
                logger.error(f"Python check failed: {str(e)}")
                return False
    
    async def _check_ffmpeg(self) -> bool:
        """Check if FFmpeg is available"""
        try:
            return shutil.which("ffmpeg") is not None
        except Exception as e:
            logger.error(f"FFmpeg check failed: {str(e)}")
            return False
    
    def get_health_status(self) -> Dict[str, any]:
        """Get overall health status"""
        return {
            "status": "healthy",
            "timestamp": datetime.now(),
            "version": "1.0.0"
        } 