import random
import string
from datetime import datetime, timedelta
from typing import Optional
from config import get_settings

settings = get_settings()

# In-memory OTP storage (use Redis in production)
otp_store = {}


def generate_otp(length: int = 6) -> str:
    """Generate random OTP code"""
    return ''.join(random.choices(string.digits, k=length))


def store_otp(email: str, otp: str, purpose: str = 'verification'):
    """Store OTP with expiry time"""
    expiry = datetime.now() + timedelta(minutes=settings.otp_expiry_minutes)
    key = f"{email}:{purpose}"
    otp_store[key] = {
        'code': otp,
        'expiry': expiry,
        'attempts': 0
    }


def verify_otp(email: str, otp: str, purpose: str = 'verification') -> tuple[bool, str]:
    """Verify OTP code"""
    key = f"{email}:{purpose}"
    
    if key not in otp_store:
        return False, "No OTP found. Please request a new code."
    
    stored = otp_store[key]
    
    # Check expiry
    if datetime.now() > stored['expiry']:
        del otp_store[key]
        return False, "OTP expired. Please request a new code."
    
    # Check attempts (max 5)
    if stored['attempts'] >= 5:
        del otp_store[key]
        return False, "Too many failed attempts. Please request a new code."
    
    # Verify code
    if stored['code'] != otp:
        otp_store[key]['attempts'] += 1
        remaining = 5 - otp_store[key]['attempts']
        return False, f"Invalid code. {remaining} attempts remaining."
    
    # Success - remove OTP
    del otp_store[key]
    return True, "OTP verified successfully"


def clear_otp(email: str, purpose: str = 'verification'):
    """Clear OTP for email"""
    key = f"{email}:{purpose}"
    if key in otp_store:
        del otp_store[key]

