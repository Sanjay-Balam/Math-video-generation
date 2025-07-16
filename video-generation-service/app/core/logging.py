"""
Logging configuration
"""

import logging
import sys
import os
from typing import Dict, Any

def setup_logging(level: str = "INFO") -> None:
    """
    Setup application logging with Unicode support
    """
    # Ensure logs directory exists
    log_dir = "logs"
    os.makedirs(log_dir, exist_ok=True)
    
    # Configure logging with Unicode support
    logging.basicConfig(
        level=getattr(logging, level.upper()),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler("logs/app.log", mode="a", encoding="utf-8")
        ]
    )
    
    # Set up Unicode-safe error handler for console output
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, level.upper()))
    console_handler.setFormatter(logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s"))
    
    # Override the default handlers to ensure Unicode support
    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    root_logger.addHandler(console_handler)
    root_logger.addHandler(logging.FileHandler("logs/app.log", mode="a", encoding="utf-8"))
    
    # Suppress noisy loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING) 