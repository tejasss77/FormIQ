import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Optional, Any
from jose import jwt, JWTError
from app.core.config import settings

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    # bcrypt max length 72 bytes
    pwd_bytes = password.encode('utf-8')[:72]
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pwd_bytes = plain_password.encode('utf-8')[:72]
        return bcrypt.checkpw(pwd_bytes, hashed_password.encode('utf-8'))
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": now})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

# --- RFC 6238 TOTP (Time-based One-Time Password) Support ---
import base64
import hashlib
import hmac
import secrets
import struct
import time
import urllib.parse

def generate_totp_secret() -> str:
    """Generate a 160-bit random Base32 secret key compatible with Google Authenticator."""
    # 20 bytes = 160 bits, standard for SHA-1 TOTP
    raw = secrets.token_bytes(20)
    return base64.b32encode(raw).decode('utf-8').replace('=', '')

def get_totp_uri(secret: str, email: str, issuer: str = "FORMIQ") -> str:
    """Generate the standard otpauth URI used for QR code scanning."""
    label = urllib.parse.quote(f"{issuer}:{email}")
    issuer_param = urllib.parse.quote(issuer)
    return f"otpauth://totp/{label}?secret={secret}&issuer={issuer_param}&algorithm=SHA1&digits=6&period=30"

def verify_totp_code(secret: str, code: str, window: int = 1) -> bool:
    """Verify a 6-digit TOTP code against the secret key with +/- window allowance for clock drift."""
    clean_code = code.strip().replace(' ', '').replace('-', '')
    if len(clean_code) != 6 or not clean_code.isdigit():
        return False

    try:
        # Standardize secret padding
        padded_secret = secret.upper() + '=' * ((8 - len(secret) % 8) % 8)
        key = base64.b32decode(padded_secret, casefold=True)
    except Exception:
        return False

    current_interval = int(time.time()) // 30
    for offset in range(-window, window + 1):
        interval = current_interval + offset
        msg = struct.pack(">Q", interval)
        digest = hmac.new(key, msg, hashlib.sha1).digest()
        idx = digest[-1] & 0x0F
        expected_code = (struct.unpack(">I", digest[idx:idx+4])[0] & 0x7FFFFFFF) % 1000000
        if f"{expected_code:06d}" == clean_code:
            return True

    return False

