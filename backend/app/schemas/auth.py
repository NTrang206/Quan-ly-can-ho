from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=6, max_length=128)


class ChangePasswordRequest(BaseModel):
    old_password: str = Field(min_length=6, max_length=128)
    new_password: str = Field(min_length=6, max_length=128)


class TenantRegisterRequest(BaseModel):
    citizen_id: str
    phone: str

    username: str
    password: str = Field(min_length=6, max_length=128)

    email: str | None = None