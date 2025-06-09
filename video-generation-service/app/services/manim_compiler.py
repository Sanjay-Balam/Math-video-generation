"""
Manim compilation service
"""

import os
import asyncio
import logging
import subprocess
import shutil
from pathlib import Path
from typing import Optional, Dict, Any, Tuple
from datetime import datetime
import uuid

from app.core.config import settings
from app.core.exceptions import (
    CompilationError, 
    ScriptNotFoundError, 
    InvalidScriptError,
    TimeoutError
)
from app.models.schemas import QualityLevel, VideoFormat

logger = logging.getLogger(__name__)

class ManimCompiler:
    """
    Service for compiling Manim scripts into videos
    """
    
    def __init__(self):
        self.ensure_directories()
    
    def ensure_directories(self) -> None:
        """Ensure required directories exist"""
        for directory in [settings.SCRIPTS_INPUT_DIR, settings.VIDEOS_OUTPUT_DIR, settings.TEMP_DIR]:
            Path(directory).mkdir(parents=True, exist_ok=True)
    
    async def compile_script(
        self, 
        script_content: str, 
        script_name: Optional[str] = None,
        quality: QualityLevel = QualityLevel.MEDIUM,
        format: VideoFormat = VideoFormat.MP4,
        frame_rate: int = 30,
        custom_args: Optional[Dict[str, Any]] = None
    ) -> Tuple[str, str]:
        """
        Compile a Manim script to video
        
        Returns:
            Tuple of (job_id, output_file_path)
        """
        job_id = str(uuid.uuid4())
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Generate script filename
        if not script_name:
            script_name = f"manim_script_{timestamp}"
        
        script_name = self._sanitize_filename(script_name)
        script_file = Path(settings.TEMP_DIR) / f"{script_name}_{job_id}.py"
        
        try:
            # Write script to file
            await self._write_script_file(script_file, script_content)
            
            # Validate script
            await self._validate_script(script_file)
            
            # Compile script
            output_file = await self._compile_manim_script(
                script_file, 
                job_id,
                quality, 
                format, 
                frame_rate, 
                custom_args
            )
            
            # Clean up temp script file
            script_file.unlink(missing_ok=True)
            
            logger.info(f"Successfully compiled script {script_name} with job_id {job_id}")
            return job_id, output_file
            
        except Exception as e:
            # Clean up on error
            script_file.unlink(missing_ok=True)
            logger.error(f"Compilation failed for job {job_id}: {str(e)}")
            raise
    
    async def compile_script_file(
        self, 
        script_path: str,
        quality: QualityLevel = QualityLevel.MEDIUM,
        format: VideoFormat = VideoFormat.MP4,
        frame_rate: int = 30
    ) -> Tuple[str, str]:
        """
        Compile an existing script file
        """
        script_file = Path(script_path)
        if not script_file.exists():
            raise ScriptNotFoundError(f"Script file not found: {script_path}")
        
        job_id = str(uuid.uuid4())
        
        try:
            await self._validate_script(script_file)
            output_file = await self._compile_manim_script(
                script_file, job_id, quality, format, frame_rate
            )
            
            logger.info(f"Successfully compiled script file {script_path} with job_id {job_id}")
            return job_id, output_file
            
        except Exception as e:
            logger.error(f"Compilation failed for job {job_id}: {str(e)}")
            raise
    
    async def _write_script_file(self, script_file: Path, content: str) -> None:
        """Write script content to file"""
        try:
            script_file.write_text(content, encoding='utf-8')
        except Exception as e:
            raise InvalidScriptError(f"Failed to write script file: {str(e)}")
    
    async def _validate_script(self, script_file: Path) -> None:
        """Validate Manim script syntax"""
        try:
            # Basic syntax check
            with open(script_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Compile to check syntax
            compile(content, str(script_file), 'exec')
            
            # Check for required Manim imports
            if "from manim import" not in content and "import manim" not in content:
                raise InvalidScriptError("Script must import manim")
            
            # Check for Scene class
            if "class" not in content or "Scene" not in content:
                raise InvalidScriptError("Script must contain a Scene class")
                
        except SyntaxError as e:
            raise InvalidScriptError(f"Script syntax error: {str(e)}")
        except Exception as e:
            raise InvalidScriptError(f"Script validation failed: {str(e)}")
    
    async def _compile_manim_script(
        self, 
        script_file: Path, 
        job_id: str,
        quality: QualityLevel,
        format: VideoFormat,
        frame_rate: int,
        custom_args: Optional[Dict[str, Any]] = None
    ) -> str:
        """Compile Manim script using subprocess"""
        
        # Build manim command - use just filename since we'll run from temp dir
        cmd = self._build_manim_command(
            Path(script_file.name), quality, format, frame_rate, custom_args
        )
        
        logger.info(f"Executing command: {' '.join(cmd)}")
        
        try:
            # Run manim command with timeout from temp directory
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=settings.TEMP_DIR
            )
            
            try:
                stdout, stderr = await asyncio.wait_for(
                    process.communicate(), 
                    timeout=settings.COMPILATION_TIMEOUT
                )
            except asyncio.TimeoutError:
                process.kill()
                raise TimeoutError(f"Compilation timed out after {settings.COMPILATION_TIMEOUT} seconds")
            
            if process.returncode != 0:
                error_msg = stderr.decode('utf-8') if stderr else "Unknown compilation error"
                raise CompilationError(f"Manim compilation failed: {error_msg}")
            
            # Find and move the generated video
            output_file = await self._find_and_move_output(script_file, job_id, format)
            
            return output_file
            
        except (CompilationError, TimeoutError):
            raise
        except Exception as e:
            raise CompilationError(f"Unexpected compilation error: {str(e)}")
    
    def _build_manim_command(
        self, 
        script_file: Path, 
        quality: QualityLevel,
        format: VideoFormat,
        frame_rate: int,
        custom_args: Optional[Dict[str, Any]] = None
    ) -> list:
        """Build the manim command"""
        
        cmd = ["manim"]
        
        # Quality flag
        quality_flags = {
            QualityLevel.LOW: "-ql",
            QualityLevel.MEDIUM: "-qm", 
            QualityLevel.HIGH: "-qh"
        }
        cmd.append(quality_flags[quality])
        
        # Output format
        if format != VideoFormat.MP4:
            cmd.extend(["--format", format.value])
        
        # Frame rate
        if frame_rate != 30:
            cmd.extend(["--frame_rate", str(frame_rate)])
        
        # Custom arguments
        if custom_args:
            for key, value in custom_args.items():
                if key.startswith("-"):
                    cmd.append(key)
                    if value and value != True:
                        cmd.append(str(value))
        
        # Script file
        cmd.append(str(script_file))
        
        return cmd
    
    async def _find_and_move_output(
        self, 
        script_file: Path, 
        job_id: str, 
        format: VideoFormat
    ) -> str:
        """Find the generated video and move it to output directory"""
        
        # Manim typically outputs to media/videos/script_name/quality/
        script_name = script_file.stem
        media_dir = Path(settings.TEMP_DIR) / "media" / "videos" / script_name
        
        if not media_dir.exists():
            raise CompilationError("No output directory found after compilation")
        
        # Find video files
        video_files = []
        for quality_dir in media_dir.iterdir():
            if quality_dir.is_dir():
                for file in quality_dir.glob(f"*.{format.value}"):
                    video_files.append(file)
        
        if not video_files:
            raise CompilationError(f"No {format.value} files found in output")
        
        # Take the first (or most recent) video file
        source_file = video_files[0]
        
        # Create output filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"{script_name}_{job_id}_{timestamp}.{format.value}"
        output_path = Path(settings.VIDEOS_OUTPUT_DIR) / output_filename
        
        # Move file to output directory
        shutil.move(str(source_file), str(output_path))
        
        # Clean up media directory
        shutil.rmtree(media_dir.parent.parent, ignore_errors=True)
        
        return str(output_path)
    
    def _sanitize_filename(self, filename: str) -> str:
        """Sanitize filename for filesystem"""
        import re
        # Remove or replace invalid characters
        filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
        filename = re.sub(r'\s+', '_', filename)
        return filename[:50]  # Limit length
    
    def get_output_file_info(self, file_path: str) -> Dict[str, Any]:
        """Get information about an output file"""
        file_path = Path(file_path)
        if not file_path.exists():
            return {}
        
        stat = file_path.stat()
        return {
            "filename": file_path.name,
            "size": stat.st_size,
            "created_at": datetime.fromtimestamp(stat.st_ctime),
            "modified_at": datetime.fromtimestamp(stat.st_mtime)
        } 