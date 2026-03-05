import os
import secrets
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials

security = HTTPBasic()


def _get_admin_credentials() -> tuple[str, str]:
    username = os.environ.get("ADMIN_USERNAME")
    password = os.environ.get("ADMIN_PASSWORD")
    missing = [k for k, v in {"ADMIN_USERNAME": username, "ADMIN_PASSWORD": password}.items() if not v]
    if missing:
        raise RuntimeError(f"Missing data for admin auth: {', '.join(missing)}")
    return username, password


def require_admin(credentials: HTTPBasicCredentials = Depends(security)) -> str:

    admin_user, admin_pass = _get_admin_credentials()

    user_ok = secrets.compare_digest(
        credentials.username.encode("utf-8"),
        admin_user.encode("utf-8"),
    )
    pass_ok = secrets.compare_digest(
        credentials.password.encode("utf-8"),
        admin_pass.encode("utf-8"),
    )

    if not (user_ok and pass_ok):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )

    return credentials.username