import bcrypt
import jwt

from datetime import datetime, timedelta, timezone

from app.core.config import settings


if not settings.jwt_secret:
    raise RuntimeError("JWT_SECRET chưa được cấu hình trong .env")


def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")

    salt = bcrypt.gensalt()

    hashed = bcrypt.hashpw(
        password_bytes,
        salt
    )

    return hashed.decode("utf-8")


def verify_password(
    password: str,
    hashed_password: str
) -> bool:

    return bcrypt.checkpw(
        password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )


def create_access_token(
    user_id: int,
    role_id: int
) -> str:

    expire = datetime.now(timezone.utc) + timedelta(
        hours=settings.jwt_expire_hours
    )

    payload = {
        "user_id": user_id,
        "role_id": role_id,
        "exp": expire
    }

    token = jwt.encode(
        payload,
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm
    )

    return token
def decode_access_token(token: str):

    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm]
        )

        return payload

    except jwt.ExpiredSignatureError:
        return None

    except jwt.InvalidTokenError:
        return None