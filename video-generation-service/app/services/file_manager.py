"""
File management service
"""

import os
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
import shutil

from app.core.config import settings

logger = logging.getLogger(__name__)

class FileManager:
    """
    Service for managing input scripts and output videos
    """
    
    def __init__(self):
        self.ensure_directories()
    
    def ensure_directories(self) -> None:
        """Ensure all required directories exist"""
        directories = [
            settings.SCRIPTS_INPUT_DIR,
            settings.VIDEOS_OUTPUT_DIR,
            settings.TEMP_DIR,
            "logs"
        ]
        
        for directory in directories:
            Path(directory).mkdir(parents=True, exist_ok=True)
    
    async def save_script(self, content: str, filename: str) -> str:
        """Save script content to file"""
        script_path = Path(settings.SCRIPTS_INPUT_DIR) / filename
        
        try:
            script_path.write_text(content, encoding='utf-8')
            logger.info(f"Script saved: {script_path}")
            return str(script_path)
        except Exception as e:
            logger.error(f"Failed to save script {filename}: {str(e)}")
            raise
    
    def list_scripts(self) -> List[Dict[str, Any]]:
        """List all saved scripts"""
        scripts = []
        script_dir = Path(settings.SCRIPTS_INPUT_DIR)
        
        for script_file in script_dir.glob("*.py"):
            stat = script_file.stat()
            scripts.append({
                "filename": script_file.name,
                "path": str(script_file),
                "size": stat.st_size,
                "created_at": datetime.fromtimestamp(stat.st_ctime),
                "modified_at": datetime.fromtimestamp(stat.st_mtime)
            })
        
        return sorted(scripts, key=lambda x: x["modified_at"], reverse=True)
    
    def list_videos(self, page: int = 1, limit: int = 20) -> Dict[str, Any]:
        """List generated videos with pagination"""
        videos = []
        video_dir = Path(settings.VIDEOS_OUTPUT_DIR)
        
        # Get all video files
        video_extensions = [".mp4", ".mov", ".avi"]
        all_videos = []
        
        for ext in video_extensions:
            all_videos.extend(video_dir.glob(f"*{ext}"))
        
        # Sort by modification time (newest first)
        all_videos.sort(key=lambda x: x.stat().st_mtime, reverse=True)
        
        # Paginate
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_videos = all_videos[start_idx:end_idx]
        
        for video_file in paginated_videos:
            stat = video_file.stat()
            videos.append({
                "filename": video_file.name,
                "path": str(video_file),
                "size": stat.st_size,
                "size_mb": round(stat.st_size / (1024 * 1024), 2),
                "created_at": datetime.fromtimestamp(stat.st_ctime),
                "modified_at": datetime.fromtimestamp(stat.st_mtime)
            })
        
        return {
            "videos": videos,
            "total": len(all_videos),
            "page": page,
            "limit": limit,
            "total_pages": (len(all_videos) + limit - 1) // limit
        }
    
    def get_video_file(self, filename: str) -> Optional[Path]:
        """Get video file path if it exists"""
        video_path = Path(settings.VIDEOS_OUTPUT_DIR) / filename
        return video_path if video_path.exists() else None
    
    def delete_video(self, filename: str) -> bool:
        """Delete a video file"""
        video_path = Path(settings.VIDEOS_OUTPUT_DIR) / filename
        
        try:
            if video_path.exists():
                video_path.unlink()
                logger.info(f"Deleted video: {filename}")
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to delete video {filename}: {str(e)}")
            return False
    
    def cleanup_temp_files(self, older_than_hours: int = 24) -> int:
        """Clean up temporary files older than specified hours"""
        temp_dir = Path(settings.TEMP_DIR)
        cutoff_time = datetime.now().timestamp() - (older_than_hours * 3600)
        cleaned_count = 0
        
        try:
            for item in temp_dir.iterdir():
                if item.stat().st_mtime < cutoff_time:
                    if item.is_file():
                        item.unlink()
                        cleaned_count += 1
                    elif item.is_dir():
                        shutil.rmtree(item)
                        cleaned_count += 1
            
            logger.info(f"Cleaned up {cleaned_count} temporary files/directories")
            return cleaned_count
            
        except Exception as e:
            logger.error(f"Failed to cleanup temp files: {str(e)}")
            return 0
    
    def get_storage_info(self) -> Dict[str, Any]:
        """Get storage information"""
        def get_dir_size(path: Path) -> int:
            total = 0
            try:
                for item in path.rglob("*"):
                    if item.is_file():
                        total += item.stat().st_size
            except Exception:
                pass
            return total
        
        scripts_dir = Path(settings.SCRIPTS_INPUT_DIR)
        videos_dir = Path(settings.VIDEOS_OUTPUT_DIR)
        temp_dir = Path(settings.TEMP_DIR)
        
        return {
            "scripts": {
                "path": str(scripts_dir),
                "size_bytes": get_dir_size(scripts_dir),
                "file_count": len(list(scripts_dir.glob("*.py")))
            },
            "videos": {
                "path": str(videos_dir),
                "size_bytes": get_dir_size(videos_dir),
                "file_count": len(list(videos_dir.glob("*")))
            },
            "temp": {
                "path": str(temp_dir),
                "size_bytes": get_dir_size(temp_dir),
                "file_count": len(list(temp_dir.glob("*")))
            }
        } 