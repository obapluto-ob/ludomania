from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Supabase
    supabase_url: str
    supabase_key: str
    supabase_service_key: str
    
    # SMTP
    smtp_host: str
    smtp_port: int
    smtp_user: str
    smtp_password: str
    admin_email: str
    
    # Security
    secret_key: str
    otp_expiry_minutes: int = 10
    
    # App
    app_url: str
    backend_url: str
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings():
    return Settings()

