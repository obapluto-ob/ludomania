import hashlib
from datetime import datetime
from typing import Optional
from user_agents import parse
from supabase import create_client
from config import get_settings

settings = get_settings()
supabase = create_client(settings.supabase_url, settings.supabase_service_key)


def get_device_fingerprint(user_agent: str, ip_address: str) -> str:
    """Generate unique device fingerprint"""
    fingerprint_string = f"{user_agent}:{ip_address}"
    return hashlib.sha256(fingerprint_string.encode()).hexdigest()


def parse_device_info(user_agent: str) -> dict:
    """Parse user agent to extract device information"""
    ua = parse(user_agent)
    
    return {
        'browser': f"{ua.browser.family} {ua.browser.version_string}",
        'os': f"{ua.os.family} {ua.os.version_string}",
        'device': ua.device.family if ua.device.family != 'Other' else 'Desktop',
        'is_mobile': ua.is_mobile,
        'is_tablet': ua.is_tablet,
        'is_pc': ua.is_pc,
    }


async def check_device(user_id: str, user_agent: str, ip_address: str) -> tuple[bool, dict]:
    """
    Check if device is known for this user
    Returns: (is_new_device, device_info)
    """
    fingerprint = get_device_fingerprint(user_agent, ip_address)
    device_info = parse_device_info(user_agent)
    
    # Check if device exists in database
    result = supabase.table('user_devices').select('*').eq('user_id', user_id).eq('device_fingerprint', fingerprint).execute()
    
    if result.data and len(result.data) > 0:
        # Known device - update last seen
        supabase.table('user_devices').update({
            'last_seen': datetime.now().isoformat(),
            'login_count': result.data[0]['login_count'] + 1
        }).eq('id', result.data[0]['id']).execute()
        
        return False, device_info
    else:
        # New device - add to database
        supabase.table('user_devices').insert({
            'user_id': user_id,
            'device_fingerprint': fingerprint,
            'browser': device_info['browser'],
            'os': device_info['os'],
            'device_type': device_info['device'],
            'ip_address': ip_address,
            'first_seen': datetime.now().isoformat(),
            'last_seen': datetime.now().isoformat(),
            'login_count': 1
        }).execute()
        
        return True, device_info


def get_user_devices(user_id: str) -> list:
    """Get all devices for a user"""
    result = supabase.table('user_devices').select('*').eq('user_id', user_id).order('last_seen', desc=True).execute()
    return result.data if result.data else []

