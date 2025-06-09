"""
Pydantic models for request/response validation
"""

from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, validator
from enum import Enum
import uuid
from datetime import datetime

class QualityLevel(str, Enum):
    LOW = "low_quality"
    MEDIUM = "medium_quality"
    HIGH = "high_quality"

class VideoFormat(str, Enum):
    MP4 = "mp4"
    MOV = "mov"
    AVI = "avi"

class CompilationStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class GenerateVideoRequest(BaseModel):
    """Request model for video generation"""
    script_content: str = Field(..., description="Manim Python script content")
    script_name: Optional[str] = Field(None, description="Custom name for the script")
    quality: QualityLevel = Field(QualityLevel.MEDIUM, description="Video quality level")
    format: VideoFormat = Field(VideoFormat.MP4, description="Output video format")
    frame_rate: Optional[int] = Field(30, ge=15, le=60, description="Video frame rate")
    custom_args: Optional[Dict[str, Any]] = Field(None, description="Custom Manim arguments")
    
    @validator("script_content")
    def validate_script_content(cls, v):
        if not v.strip():
            raise ValueError("Script content cannot be empty")
        if "from manim import" not in v and "import manim" not in v:
            raise ValueError("Script must import manim")
        return v

class UploadScriptRequest(BaseModel):
    """Request model for script upload"""
    filename: str = Field(..., description="Script filename")
    quality: QualityLevel = Field(QualityLevel.MEDIUM)
    format: VideoFormat = Field(VideoFormat.MP4)
    frame_rate: Optional[int] = Field(30, ge=15, le=60)

class VideoGenerationResponse(BaseModel):
    """Response model for video generation"""
    job_id: str = Field(..., description="Unique job identifier")
    status: CompilationStatus = Field(..., description="Current compilation status")
    message: str = Field(..., description="Status message")
    created_at: datetime = Field(..., description="Job creation timestamp")
    estimated_duration: Optional[int] = Field(None, description="Estimated completion time in seconds")

class JobStatusResponse(BaseModel):
    """Response model for job status"""
    job_id: str
    status: CompilationStatus
    progress: Optional[float] = Field(None, ge=0, le=100, description="Completion percentage")
    message: str
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    output_file: Optional[str] = None
    file_size: Optional[int] = None

class HealthResponse(BaseModel):
    """Response model for health check"""
    status: str
    timestamp: datetime
    dependencies: Dict[str, bool]
    version: str

class VideoListResponse(BaseModel):
    """Response model for listing generated videos"""
    videos: List[Dict[str, Any]]
    total: int
    page: int
    limit: int

class ErrorResponse(BaseModel):
    """Response model for errors"""
    error: str
    detail: str
    timestamp: datetime = Field(default_factory=datetime.now) 