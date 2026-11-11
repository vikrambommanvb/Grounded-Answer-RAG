"""Structured logging configuration."""
import logging
import sys

def setup_logging(log_level: str = "INFO") -> logging.Logger:
    """Configure root and app logger."""
    level = getattr(logging, log_level.upper(), logging.INFO)
    
    formatter = logging.Formatter(
        fmt="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)
    
    logger = logging.getLogger("grounded_answer")
    logger.setLevel(level)
    if not logger.handlers:
        logger.addHandler(handler)
        
    return logger

logger = setup_logging()
