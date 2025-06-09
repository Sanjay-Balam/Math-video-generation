"""
Custom exceptions and exception handlers
"""

import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException

logger = logging.getLogger(__name__)

class VideoGenerationError(Exception):
    """Base exception for video generation errors"""
    pass

class ScriptNotFoundError(VideoGenerationError):
    """Raised when script file is not found"""
    pass

class CompilationError(VideoGenerationError):
    """Raised when Manim compilation fails"""
    pass

class InvalidScriptError(VideoGenerationError):
    """Raised when script is invalid or malformed"""
    pass

class TimeoutError(VideoGenerationError):
    """Raised when compilation times out"""
    pass

def setup_exception_handlers(app: FastAPI) -> None:
    """
    Setup global exception handlers
    """
    
    @app.exception_handler(VideoGenerationError)
    async def video_generation_exception_handler(request: Request, exc: VideoGenerationError):
        logger.error(f"Video generation error: {str(exc)}")
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": "Video Generation Error", "detail": str(exc)}
        )
    
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.error(f"Validation error: {exc.errors()}")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"error": "Validation Error", "detail": exc.errors()}
        )
    
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        logger.error(f"HTTP error: {exc.detail}")
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": "HTTP Error", "detail": exc.detail}
        )
    
    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "Internal Server Error", "detail": "An unexpected error occurred"}
        ) 