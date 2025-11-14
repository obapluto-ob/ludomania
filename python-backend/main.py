from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
from passlib.context import CryptContext
from supabase import create_client
from config import get_settings
from utils.email_service import (
    send_verification_code,
    send_login_code,
    send_password_reset_code,
    send_welcome_email,
    send_new_device_alert,
    send_admin_new_user_notification
)
from utils.otp_service import generate_otp, store_otp, verify_otp, clear_otp
from utils.device_tracker import check_device, get_user_devices

settings = get_settings()
supabase = create_client(settings.supabase_url, settings.supabase_service_key)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI(title="Ludomania Security API", version="1.0.0")

# CORS - Allow localhost and Vercel deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        settings.app_url,         # Production frontend
        "https://*.vercel.app",   # All Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic Models
class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str


class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RequestOTPLoginRequest(BaseModel):
    email: EmailStr


class VerifyOTPLoginRequest(BaseModel):
    email: EmailStr
    code: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str


# Helper Functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_client_info(request: Request) -> tuple[str, str]:
    """Extract user agent and IP from request"""
    user_agent = request.headers.get('user-agent', 'Unknown')
    ip_address = request.client.host if request.client else 'Unknown'
    return user_agent, ip_address


# API Endpoints
@app.get("/")
async def root():
    return {"message": "Ludomania Security API", "status": "running"}

@app.get("/ping")
async def ping():
    """Endpoint for UptimeRobot to keep server awake"""
    from datetime import datetime
    return {
        "status": "alive",
        "timestamp": datetime.utcnow().isoformat(),
        "message": "Server is awake and running"
    }


@app.post("/auth/register")
async def register(data: RegisterRequest):
    """Register new user and send verification email"""
    try:
        # Check if user exists
        existing = supabase.table('profiles').select('*').eq('email', data.email).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Check username
        existing_username = supabase.table('profiles').select('*').eq('username', data.username).execute()
        if existing_username.data:
            raise HTTPException(status_code=400, detail="Username already taken")
        
        # Generate OTP
        otp = generate_otp()
        store_otp(data.email, otp, 'verification')
        
        # Send verification email
        send_verification_code(data.email, otp, data.username)
        
        # Store temporary user data (will be created after verification)
        # For now, we'll use Supabase auth but mark as unverified
        hashed_pw = hash_password(data.password)
        
        return {
            "success": True,
            "message": "Verification code sent to your email",
            "email": data.email
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/auth/verify-email")
async def verify_email(data: VerifyEmailRequest):
    """Verify email with OTP code"""
    try:
        # Verify OTP
        is_valid, message = verify_otp(data.email, data.code, 'verification')

        if not is_valid:
            raise HTTPException(status_code=400, detail=message)

        # Mark user as verified
        result = supabase.table('profiles').update({
            'email_verified': True
        }).eq('email', data.email).execute()

        # Send welcome email and notify admin
        user_data = supabase.table('profiles').select('username, id').eq('email', data.email).single().execute()
        if user_data.data:
            send_welcome_email(data.email, user_data.data['username'])
            # Notify admin of new user
            send_admin_new_user_notification(
                user_data.data['username'],
                data.email,
                user_data.data['id']
            )

        return {
            "success": True,
            "message": "Email verified successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/auth/resend-verification")
async def resend_verification(data: RequestOTPLoginRequest):
    """Resend verification code"""
    try:
        # Check if user exists
        user_data = supabase.table('profiles').select('*').eq('email', data.email).single().execute()
        if not user_data.data:
            raise HTTPException(status_code=404, detail="User not found")

        if user_data.data.get('email_verified'):
            raise HTTPException(status_code=400, detail="Email already verified")

        # Generate new OTP
        otp = generate_otp()
        store_otp(data.email, otp, 'verification')

        # Send email
        send_verification_code(data.email, otp, user_data.data['username'])

        return {
            "success": True,
            "message": "Verification code resent"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/auth/request-otp-login")
async def request_otp_login(data: RequestOTPLoginRequest):
    """Request OTP for passwordless login"""
    try:
        # Check if user exists and is verified
        user_data = supabase.table('profiles').select('*').eq('email', data.email).single().execute()
        if not user_data.data:
            raise HTTPException(status_code=404, detail="User not found")

        if not user_data.data.get('email_verified'):
            raise HTTPException(status_code=400, detail="Please verify your email first")

        # Generate OTP
        otp = generate_otp()
        store_otp(data.email, otp, 'login')

        # Send login code
        send_login_code(data.email, otp, user_data.data['username'])

        return {
            "success": True,
            "message": "Login code sent to your email"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/auth/verify-otp-login")
async def verify_otp_login(data: VerifyOTPLoginRequest, request: Request):
    """Verify OTP and login user"""
    try:
        # Verify OTP
        is_valid, message = verify_otp(data.email, data.code, 'login')

        if not is_valid:
            raise HTTPException(status_code=400, detail=message)

        # Get user data
        user_data = supabase.table('profiles').select('*').eq('email', data.email).single().execute()
        if not user_data.data:
            raise HTTPException(status_code=404, detail="User not found")

        # Check device
        user_agent, ip_address = get_client_info(request)
        is_new_device, device_info = await check_device(user_data.data['id'], user_agent, ip_address)

        # Send alert if new device
        if is_new_device:
            send_new_device_alert(data.email, user_data.data['username'], device_info)

        return {
            "success": True,
            "message": "Login successful",
            "user": {
                "id": user_data.data['id'],
                "email": user_data.data['email'],
                "username": user_data.data['username']
            },
            "new_device": is_new_device
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/auth/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    """Request password reset code"""
    try:
        # Check if user exists
        user_data = supabase.table('profiles').select('*').eq('email', data.email).single().execute()
        if not user_data.data:
            # Don't reveal if email exists
            return {
                "success": True,
                "message": "If the email exists, a reset code has been sent"
            }

        # Generate OTP
        otp = generate_otp()
        store_otp(data.email, otp, 'password_reset')

        # Send reset code
        send_password_reset_code(data.email, otp, user_data.data['username'])

        return {
            "success": True,
            "message": "Password reset code sent to your email"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/auth/reset-password")
async def reset_password(data: ResetPasswordRequest):
    """Reset password with OTP code"""
    try:
        # Verify OTP
        is_valid, message = verify_otp(data.email, data.code, 'password_reset')

        if not is_valid:
            raise HTTPException(status_code=400, detail=message)

        # Hash new password
        hashed_pw = hash_password(data.new_password)

        # Update password in Supabase Auth
        # Note: This requires admin privileges
        user_data = supabase.table('profiles').select('id').eq('email', data.email).single().execute()
        if not user_data.data:
            raise HTTPException(status_code=404, detail="User not found")

        # Update via Supabase admin API
        supabase.auth.admin.update_user_by_id(
            user_data.data['id'],
            {"password": data.new_password}
        )

        return {
            "success": True,
            "message": "Password reset successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/auth/check-device")
async def check_user_device(request: Request, user_id: str):
    """Check if device is known for user"""
    try:
        user_agent, ip_address = get_client_info(request)
        is_new_device, device_info = await check_device(user_id, user_agent, ip_address)

        return {
            "is_new_device": is_new_device,
            "device_info": device_info
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/auth/devices/{user_id}")
async def get_devices(user_id: str):
    """Get all devices for a user"""
    try:
        devices = get_user_devices(user_id)
        return {
            "success": True,
            "devices": devices
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

