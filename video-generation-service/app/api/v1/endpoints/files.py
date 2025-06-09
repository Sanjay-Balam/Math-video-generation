"""
File management endpoints
"""

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from typing import Optional
from pathlib import Path

from app.models.schemas import VideoListResponse
from app.services.file_manager import FileManager

router = APIRouter()

@router.get("/videos", response_model=VideoListResponse)
async def list_videos(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    List generated videos with pagination
    """
    file_manager = FileManager()
    result = file_manager.list_videos(page=page, limit=limit)
    
    return VideoListResponse(**result)

@router.get("/videos/{filename}")
async def download_video_by_filename(filename: str):
    """
    Download video by filename
    """
    file_manager = FileManager()
    video_file = file_manager.get_video_file(filename)
    
    if not video_file:
        raise HTTPException(status_code=404, detail="Video file not found")
    
    return FileResponse(
        path=str(video_file),
        media_type="video/mp4",
        filename=filename
    )

@router.delete("/videos/{filename}")
async def delete_video(filename: str):
    """
    Delete a video file
    """
    file_manager = FileManager()
    success = file_manager.delete_video(filename)
    
    if not success:
        raise HTTPException(status_code=404, detail="Video file not found")
    
    return {"message": f"Video {filename} deleted successfully"}

@router.get("/scripts")
async def list_scripts():
    """
    List saved script files
    """
    file_manager = FileManager()
    scripts = file_manager.list_scripts()
    
    return {"scripts": scripts, "total": len(scripts)}

@router.get("/storage")
async def get_storage_info():
    """
    Get storage usage information
    """
    file_manager = FileManager()
    storage_info = file_manager.get_storage_info()
    
    return storage_info

@router.post("/cleanup")
async def cleanup_temp_files(older_than_hours: int = Query(24, ge=1, description="Clean files older than hours")):
    """
    Clean up temporary files
    """
    file_manager = FileManager()
    cleaned_count = file_manager.cleanup_temp_files(older_than_hours)
    
    return {
        "message": f"Cleaned up {cleaned_count} temporary files",
        "cleaned_count": cleaned_count
    } 