"""
Video generation endpoints
"""

import logging
from fastapi import APIRouter, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.responses import FileResponse
from typing import Dict, Any

from app.models.schemas import (
    GenerateVideoRequest, 
    VideoGenerationResponse, 
    JobStatusResponse,
    CompilationStatus
)
from app.services.manim_compiler import ManimCompiler
from app.services.file_manager import FileManager
from app.core.exceptions import (
    VideoGenerationError, 
    ScriptNotFoundError, 
    CompilationError
)

logger = logging.getLogger(__name__)
router = APIRouter()

# In-memory job storage (in production, use Redis or database)
job_storage: Dict[str, Dict[str, Any]] = {}

@router.post("/script", response_model=VideoGenerationResponse)
async def generate_video_from_script(
    request: GenerateVideoRequest,
    background_tasks: BackgroundTasks
):
    """
    Generate video from Manim script content
    """
    try:
        compiler = ManimCompiler()
        
        # Start compilation in background
        background_tasks.add_task(
            compile_script_background,
            compiler,
            request.script_content,
            request.script_name,
            request.quality,
            request.format,
            request.frame_rate,
            request.custom_args
        )
        
        # Create temporary job entry
        job_id = "temp_" + str(hash(request.script_content))[:8]
        job_storage[job_id] = {
            "status": CompilationStatus.PENDING,
            "message": "Job queued for processing",
            "created_at": None,
            "script_name": request.script_name or "untitled"
        }
        
        return VideoGenerationResponse(
            job_id=job_id,
            status=CompilationStatus.PENDING,
            message="Video generation started",
            created_at=datetime.now(),
            estimated_duration=120  # 2 minutes estimate
        )
        
    except VideoGenerationError as e:
        logger.error(f"Video generation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def compile_script_background(
    compiler: ManimCompiler,
    script_content: str,
    script_name: str,
    quality,
    format,
    frame_rate: int,
    custom_args: Dict[str, Any]
):
    """Background task for script compilation"""
    job_id = "temp_" + str(hash(script_content))[:8]
    
    try:
        # Update job status
        job_storage[job_id].update({
            "status": CompilationStatus.PROCESSING,
            "message": "Compiling script...",
            "started_at": datetime.now()
        })
        
        # Compile script
        actual_job_id, output_file = await compiler.compile_script(
            script_content=script_content,
            script_name=script_name,
            quality=quality,
            format=format,
            frame_rate=frame_rate,
            custom_args=custom_args
        )
        
        # Update job with success
        job_storage[job_id].update({
            "status": CompilationStatus.COMPLETED,
            "message": "Video generation completed successfully",
            "completed_at": datetime.now(),
            "output_file": output_file,
            "actual_job_id": actual_job_id
        })
        
    except Exception as e:
        # Update job with error
        job_storage[job_id].update({
            "status": CompilationStatus.FAILED,
            "message": "Video generation failed",
            "completed_at": datetime.now(),
            "error_message": str(e)
        })

@router.post("/upload", response_model=VideoGenerationResponse)
async def generate_video_from_upload(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
):
    """
    Generate video from uploaded script file
    """
    try:
        # Validate file
        if not file.filename.endswith('.py'):
            raise HTTPException(status_code=400, detail="Only Python files are allowed")
        
        # Read file content
        content = await file.read()
        script_content = content.decode('utf-8')
        
        # Save file
        file_manager = FileManager()
        saved_path = await file_manager.save_script(script_content, file.filename)
        
        # Generate video
        compiler = ManimCompiler()
        job_id, output_file = await compiler.compile_script_file(saved_path)
        
        return VideoGenerationResponse(
            job_id=job_id,
            status=CompilationStatus.COMPLETED,
            message="Video generated successfully from uploaded file",
            created_at=datetime.now()
        )
        
    except VideoGenerationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process uploaded file")

@router.get("/status/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    """
    Get the status of a video generation job
    """
    if job_id not in job_storage:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job_data = job_storage[job_id]
    
    return JobStatusResponse(
        job_id=job_id,
        status=job_data["status"],
        message=job_data["message"],
        created_at=job_data.get("created_at"),
        started_at=job_data.get("started_at"),
        completed_at=job_data.get("completed_at"),
        error_message=job_data.get("error_message"),
        output_file=job_data.get("output_file")
    )

@router.get("/download/{job_id}")
async def download_video(job_id: str):
    """
    Download the generated video file
    """
    if job_id not in job_storage:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job_data = job_storage[job_id]
    
    if job_data["status"] != CompilationStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Video not ready for download")
    
    output_file = job_data.get("output_file")
    if not output_file or not Path(output_file).exists():
        raise HTTPException(status_code=404, detail="Video file not found")
    
    return FileResponse(
        path=output_file,
        media_type="video/mp4",
        filename=Path(output_file).name
    )

from datetime import datetime
from pathlib import Path 