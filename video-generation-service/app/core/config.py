"""
Application configuration settings
"""

import os
from typing import List
from pydantic import field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    Application settings
    """
    # Basic settings
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    PORT: int = int(os.getenv("PORT", "8001"))
    
    # CORS settings
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]
    
    # File storage settings
    SCRIPTS_INPUT_DIR: str = os.getenv("SCRIPTS_INPUT_DIR", "./input_scripts")
    VIDEOS_OUTPUT_DIR: str = os.getenv("VIDEOS_OUTPUT_DIR", "./output_videos")
    TEMP_DIR: str = os.getenv("TEMP_DIR", "./temp")
    
    # Manim settings
    MANIM_QUALITY: str = os.getenv("MANIM_QUALITY", "medium_quality")  # low_quality, medium_quality, high_quality
    MANIM_FORMAT: str = os.getenv("MANIM_FORMAT", "mp4")
    MANIM_FRAME_RATE: int = int(os.getenv("MANIM_FRAME_RATE", "30"))
    
    # Queue settings (for future scalability)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    QUEUE_NAME: str = os.getenv("QUEUE_NAME", "video_generation")
    
    # Security settings
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", "10485760"))  # 10MB
    ALLOWED_SCRIPT_EXTENSIONS: List[str] = [".py"]
    
    # Timeout settings
    COMPILATION_TIMEOUT: int = int(os.getenv("COMPILATION_TIMEOUT", "300"))  # 5 minutes
    
    @field_validator("ALLOWED_ORIGINS", mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        return v

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings() 