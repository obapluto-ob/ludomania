from fastapi import APIRouter, Request
from datetime import datetime
import logging

router = APIRouter()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@router.post("/debug-log")
async def receive_debug_log(request: Request):
    """
    Receive debug logs from frontend and log them to Render logs
    This allows admins to see detailed error information without exposing it to users
    """
    try:
        data = await request.json()
        
        step = data.get('step', 'Unknown')
        error = data.get('error', {})
        email = data.get('email', 'N/A')
        username = data.get('username', 'N/A')
        user_id = data.get('userId', 'N/A')
        timestamp = data.get('timestamp', datetime.utcnow().isoformat())
        
        # Log detailed error information
        logger.error(f"""
        ==================== FRONTEND ERROR ====================
        Timestamp: {timestamp}
        Step: {step}
        Email: {email}
        Username: {username}
        User ID: {user_id}
        Error Details: {error}
        ========================================================
        """)
        
        return {"success": True, "message": "Debug log received"}
        
    except Exception as e:
        logger.error(f"Error receiving debug log: {str(e)}")
        return {"success": False, "error": str(e)}

