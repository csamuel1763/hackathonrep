from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.auth.jwt import (
    create_access_token,
    create_refresh_token,
    decode_access_token,
    get_password_hash,
    verify_password,
    verify_google_token,
    Token,
    RefreshRequest,
    GoogleAuthRequest
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory user database (seeded with demo candidate)
USERS_DB: dict[str, dict] = {
    "samuel@example.com": {
        "id": "usr_demo_01",
        "name": "Samuel Godson",
        "email": "samuel@example.com",
        "password_hash": get_password_hash("Password123!"),
        "role": "Security Specialist",
        "provider": "email",
        "picture": "",
        "created_at": "2026-07-22T00:00:00Z"
    }
}

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserProfileResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    provider: Optional[str] = "email"
    picture: Optional[str] = ""
    created_at: str

@router.post("/register", response_model=Token)
async def register(req: RegisterRequest):
    """Register a new candidate user with email & password."""
    email_lower = req.email.lower()
    if email_lower in USERS_DB:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    user_data = {
        "id": f"usr_{len(USERS_DB) + 1:02d}",
        "name": req.name.strip(),
        "email": email_lower,
        "password_hash": get_password_hash(req.password),
        "role": "SOC Analyst candidate",
        "provider": "email",
        "picture": "",
        "created_at": "2026-07-22T12:00:00Z"
    }
    USERS_DB[email_lower] = user_data

    user_info = {
        "id": user_data["id"],
        "name": user_data["name"],
        "email": user_data["email"],
        "role": user_data["role"],
        "provider": "email",
        "picture": ""
    }
    access_token = create_access_token({"sub": email_lower, "id": user_data["id"]})
    refresh_token = create_refresh_token({"sub": email_lower, "id": user_data["id"]})
    return Token(access_token=access_token, refresh_token=refresh_token, token_type="bearer", user=user_info)

@router.post("/login", response_model=Token)
async def login(req: LoginRequest):
    """Authenticate existing candidate user."""
    email_lower = req.email.lower()
    user = USERS_DB.get(email_lower)
    if not user:
        raise HTTPException(status_code=404, detail="Account not found. Please check your email or register.")

    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    user_info = {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "provider": user.get("provider", "email"),
        "picture": user.get("picture", "")
    }
    access_token = create_access_token({"sub": email_lower, "id": user["id"]})
    refresh_token = create_refresh_token({"sub": email_lower, "id": user["id"]})
    return Token(access_token=access_token, refresh_token=refresh_token, token_type="bearer", user=user_info)

@router.post("/logout")
async def logout():
    """Logout endpoint to invalidate session."""
    return {"message": "Logged out successfully."}

@router.post("/refresh", response_model=Token)
async def refresh_session(req: RefreshRequest):
    """Issue new access_token using a valid refresh_token."""
    payload = decode_access_token(req.refresh_token)
    if not payload or payload.get("type") != "refresh" or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token.")

    email = payload["sub"]
    user = USERS_DB.get(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user_info = {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "provider": user.get("provider", "email"),
        "picture": user.get("picture", "")
    }
    new_access_token = create_access_token({"sub": email, "id": user["id"]})
    new_refresh_token = create_refresh_token({"sub": email, "id": user["id"]})
    return Token(access_token=new_access_token, refresh_token=new_refresh_token, token_type="bearer", user=user_info)

@router.post("/google", response_model=Token)
async def google_auth(req: GoogleAuthRequest):
    """Authenticate or register user via Google OAuth 2.0."""
    google_user = verify_google_token(req.credential)
    if not google_user or not google_user.get("email"):
        raise HTTPException(status_code=400, detail="Invalid Google OAuth credential.")

    email_lower = google_user["email"].lower()
    
    # Auto-register if user doesn't exist
    if email_lower not in USERS_DB:
        user_data = {
            "id": f"usr_g_{len(USERS_DB) + 1:02d}",
            "name": google_user["name"],
            "email": email_lower,
            "password_hash": get_password_hash("GoogleAuthNoPassword!"),
            "role": "Cybersecurity Candidate (Google Auth)",
            "provider": "google",
            "picture": google_user.get("picture", ""),
            "created_at": "2026-07-22T12:00:00Z"
        }
        USERS_DB[email_lower] = user_data

    user = USERS_DB[email_lower]
    user_info = {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "provider": "google",
        "picture": user.get("picture", "")
    }

    access_token = create_access_token({"sub": email_lower, "id": user["id"]})
    refresh_token = create_refresh_token({"sub": email_lower, "id": user["id"]})
    return Token(access_token=access_token, refresh_token=refresh_token, token_type="bearer", user=user_info)

@router.get("/me", response_model=UserProfileResponse)
async def get_current_user(authorization: Optional[str] = Header(None)):
    """Fetch profile of currently authenticated user session."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header.")

    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Session expired or invalid token.")

    email = payload["sub"]
    user = USERS_DB.get(email)
    if not user:
        raise HTTPException(status_code=404, detail="User profile not found.")

    return UserProfileResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        role=user["role"],
        provider=user.get("provider", "email"),
        picture=user.get("picture", ""),
        created_at=user["created_at"]
    )
