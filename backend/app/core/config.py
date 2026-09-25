import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    database_url: str | None = os.getenv("DATABASE_URL")
    jwt_secret: str | None = os.getenv("JWT_SECRET")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    jwt_expire_hours: int = int(
        os.getenv("JWT_EXPIRE_HOURS", "8")
    )
    vietqr_bank_id: str | None = os.getenv("VIETQR_BANK_ID")
    vietqr_account_no: str | None = os.getenv("VIETQR_ACCOUNT_NO")
    vietqr_account_name: str | None = os.getenv("VIETQR_ACCOUNT_NAME")
    gemini_api_key: str | None = os.getenv("GEMINI_API_KEY")
    gemini_model: str = os.getenv(
        "GEMINI_MODEL",
        "gemini-3.8-flash"
    )
    gemini_embed_model: str = os.getenv(
        "GEMINI_EMBED_MODEL",
        "gemini-embedding-2"
    )


settings = Settings()
