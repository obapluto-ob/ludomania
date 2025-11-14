from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os

# Add parent directory to path to import from python-backend
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from python_backend.config import get_settings
from python_backend.utils.email_service import (
    send_verification_code,
    send_login_code,
    send_password_reset_code,
    send_welcome_email,
    send_new_device_alert,
    send_admin_new_user_notification
)
from python_backend.utils.otp_service import generate_otp, store_otp, verify_otp, clear_otp
from python_backend.utils.device_tracker import check_device, get_user_devices

settings = get_settings()

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import all routes from main.py
from python_backend.main import (
    RegisterRequest,
    VerifyEmailRequest,
    ResendVerificationRequest,
    RequestOTPLoginRequest,
    VerifyOTPLoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    CheckDeviceRequest
)

# Copy all route handlers from main.py
@app.get("/")
async def root():
    return {"message": "Ludomania Security API", "status": "running"}

@app.post("/auth/register")
async def register(data: RegisterRequest):
    from supabase import create_client
    supabase = create_client(settings.supabase_url, settings.supabase_key)
    
    try:
        # Check if user exists
        existing = supabase.table('profiles').select('email').eq('email', data.email).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create auth user
        auth_response = supabase.auth.sign_up({
            "email": data.email,
            "password": data.password
        })
        
        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Failed to create user")
        
        # Create profile
        supabase.table('profiles').insert({
            "id": auth_response.user.id,
            "username": data.username,
            "email": data.email,
            "balance": 0,
            "email_verified": False
        }).execute()
        
        # Generate and send OTP
        otp = generate_otp()
        store_otp(data.email, otp, "verification")
        send_verification_code(data.email, otp, data.username)
        
        return {
            "success": True,
            "message": "Registration successful. Please check your email for verification code.",
            "user_id": auth_response.user.id
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/auth/verify-email")
async def verify_email(data: VerifyEmailRequest):
    from supabase import create_client
    supabase = create_client(settings.supabase_url, settings.supabase_service_key)
    
    # Verify OTP
    if not verify_otp(data.email, data.code, "verification"):
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")
    
    # Clear OTP
    clear_otp(data.email, "verification")
    
    # Update profile
    supabase.table('profiles').update({
        "email_verified": True
    }).eq('email', data.email).execute()
    
    # Send welcome email and notify admin
    user_data = supabase.table('profiles').select('username, id').eq('email', data.email).single().execute()
    if user_data.data:
        send_welcome_email(data.email, user_data.data['username'])
        send_admin_new_user_notification(
            user_data.data['username'],
            data.email,
            user_data.data['id']
        )
    
    return {
        "success": True,
        "message": "Email verified successfully"
    }

# Add all other endpoints from main.py...
# (I'll create a complete version if you want to use this approach)

# Vercel serverless handler
handler = app

