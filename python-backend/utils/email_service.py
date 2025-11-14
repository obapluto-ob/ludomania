import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import get_settings

settings = get_settings()


def send_email(to_email: str, subject: str, html_content: str):
    """Send email using SMTP"""
    try:
        msg = MIMEMultipart('alternative')
        msg['From'] = settings.smtp_user
        msg['To'] = to_email
        msg['Subject'] = subject
        
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)
        
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
        
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False


def send_verification_code(email: str, code: str, username: str):
    """Send verification code email"""
    subject = "Verify Your Ludomania Account"
    html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">Ludomania</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
                <h2 style="color: #333;">Welcome, {username}!</h2>
                <p style="color: #666; font-size: 16px;">
                    Thank you for signing up! Please verify your email address with the code below:
                </p>
                <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #667eea; font-size: 48px; margin: 0; letter-spacing: 10px;">
                        {code}
                    </h1>
                </div>
                <p style="color: #666; font-size: 14px;">
                    This code will expire in {settings.otp_expiry_minutes} minutes.
                </p>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">
                    If you didn't create this account, please ignore this email.
                </p>
            </div>
        </body>
    </html>
    """
    return send_email(email, subject, html)


def send_login_code(email: str, code: str, username: str):
    """Send login OTP code"""
    subject = "Your Ludomania Login Code"
    html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">Ludomania</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
                <h2 style="color: #333;">Login Request</h2>
                <p style="color: #666; font-size: 16px;">
                    Hi {username}, here's your login code:
                </p>
                <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #667eea; font-size: 48px; margin: 0; letter-spacing: 10px;">
                        {code}
                    </h1>
                </div>
                <p style="color: #666; font-size: 14px;">
                    This code will expire in {settings.otp_expiry_minutes} minutes.
                </p>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">
                    If you didn't request this code, please secure your account immediately.
                </p>
            </div>
        </body>
    </html>
    """
    return send_email(email, subject, html)


def send_password_reset_code(email: str, code: str, username: str):
    """Send password reset code"""
    subject = "Reset Your Ludomania Password"
    html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">Ludomania</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p style="color: #666; font-size: 16px;">
                    Hi {username}, use this code to reset your password:
                </p>
                <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #667eea; font-size: 48px; margin: 0; letter-spacing: 10px;">
                        {code}
                    </h1>
                </div>
                <p style="color: #666; font-size: 14px;">
                    This code will expire in {settings.otp_expiry_minutes} minutes.
                </p>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">
                    If you didn't request this, please ignore this email and secure your account.
                </p>
            </div>
        </body>
    </html>
    """
    return send_email(email, subject, html)


def send_welcome_email(email: str, username: str):
    """Send welcome email after successful registration"""
    subject = "Welcome to Ludomania!"
    html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">Ludomania</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
                <h2 style="color: #333;">Welcome Aboard, {username}!</h2>
                <p style="color: #666; font-size: 16px;">
                    Your account has been successfully verified and activated!
                </p>
                <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3 style="color: #667eea;">What's Next?</h3>
                    <ul style="color: #666; text-align: left;">
                        <li>Deposit funds to your wallet</li>
                        <li>Create or join a game</li>
                        <li>Win real money playing Ludo!</li>
                    </ul>
                </div>
                <a href="{settings.app_url}/dashboard"
                   style="display: inline-block; background: #667eea; color: white; padding: 15px 30px;
                          text-decoration: none; border-radius: 5px; margin: 20px 0;">
                    Go to Dashboard
                </a>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">
                    Need help? Contact us at {settings.admin_email}
                </p>
            </div>
        </body>
    </html>
    """
    return send_email(email, subject, html)


def send_new_device_alert(email: str, username: str, device_info: dict):
    """Send alert when user logs in from new device"""
    subject = "New Device Login - Ludomania Security Alert"
    device_name = device_info.get('device', 'Unknown Device')
    browser = device_info.get('browser', 'Unknown Browser')
    os = device_info.get('os', 'Unknown OS')
    location = device_info.get('location', 'Unknown Location')

    html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">Ludomania</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
                <h2 style="color: #333;">New Device Login Detected</h2>
                <p style="color: #666; font-size: 16px;">
                    Hi {username}, we detected a login from a new device:
                </p>
                <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <table style="width: 100%; color: #666;">
                        <tr>
                            <td style="padding: 10px;"><strong>Device:</strong></td>
                            <td style="padding: 10px;">{device_name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px;"><strong>Browser:</strong></td>
                            <td style="padding: 10px;">{browser}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px;"><strong>OS:</strong></td>
                            <td style="padding: 10px;">{os}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px;"><strong>Location:</strong></td>
                            <td style="padding: 10px;">{location}</td>
                        </tr>
                    </table>
                </div>
                <p style="color: #666; font-size: 14px;">
                    If this was you, no action is needed.
                </p>
                <p style="color: #d9534f; font-size: 14px;">
                    If this wasn't you, please secure your account immediately by changing your password.
                </p>
                <a href="{settings.app_url}/auth/forgot-password"
                   style="display: inline-block; background: #d9534f; color: white; padding: 15px 30px;
                          text-decoration: none; border-radius: 5px; margin: 20px 0;">
                    Change Password
                </a>
            </div>
        </body>
    </html>
    """
    return send_email(email, subject, html)


def send_admin_new_user_notification(username: str, email: str, user_id: str):
    """Send notification to admin when new user registers"""
    subject = "New User Registration - Ludomania"
    html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">Ludomania Admin</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
                <h2 style="color: #333;">New User Registered</h2>
                <p style="color: #666; font-size: 16px;">
                    A new user has successfully registered and verified their email.
                </p>
                <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <table style="width: 100%; color: #666;">
                        <tr>
                            <td style="padding: 10px;"><strong>Username:</strong></td>
                            <td style="padding: 10px;">{username}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px;"><strong>Email:</strong></td>
                            <td style="padding: 10px;">{email}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px;"><strong>User ID:</strong></td>
                            <td style="padding: 10px;">{user_id}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px;"><strong>Status:</strong></td>
                            <td style="padding: 10px;"><span style="color: green;">Email Verified</span></td>
                        </tr>
                    </table>
                </div>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">
                    This is an automated notification from Ludomania platform.
                </p>
            </div>
        </body>
    </html>
    """
    return send_email(settings.admin_email, subject, html)

