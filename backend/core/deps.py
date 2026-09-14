from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import User, UserRole
from core.security import decode_access_token

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    try:
        payload = decode_access_token(credentials.credentials)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists",
        )

    return user


def _normalize_role(role) -> str:
    """
    Returns a bare lowercase role string no matter how `user.role` comes back:
    a UserRole enum member (UserRole.parent), a plain DB string ("parent"),
    or a stringified enum repr ("UserRole.parent") — all normalize to "parent".
    """
    raw = getattr(role, "value", role)
    return str(raw).rsplit(".", 1)[-1].strip().lower()


def require_parent(user: User = Depends(get_current_user)) -> User:
    if _normalize_role(user.role) != UserRole.parent.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Parent access only",
        )
    return user


def require_child(user: User = Depends(get_current_user)) -> User:
    if _normalize_role(user.role) != UserRole.child.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Child access only",
        )
    return user