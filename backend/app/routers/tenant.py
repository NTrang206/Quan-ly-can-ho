from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.models.tenant import Tenant
from app.models.user import User

from app.schemas.tenant import (
    TenantCreate,
    TenantUpdate,
    TenantResponse
)

from app.dependencies.auth import require_roles


router = APIRouter(
    prefix="/tenants",
    tags=["Tenants"]
)
@router.post(
    "",
    response_model=TenantResponse
)
def create_tenant(
    data: TenantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("ADMIN", "STAFF")
    )
):

    existing = db.query(Tenant).filter(
        Tenant.citizen_id == data.citizen_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="CCCD đã tồn tại"
        )

    tenant = Tenant(
        full_name=data.full_name,
        citizen_id=data.citizen_id,
        phone=data.phone,
        email=data.email,
        hometown=data.hometown,
        is_bad_debt=False
    )

    db.add(tenant)
    db.commit()
    db.refresh(tenant)

    return tenant
@router.get(
    "",
    response_model=list[TenantResponse]
)
def get_tenants(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "STAFF",
            "ACCOUNTANT"
        )
    )
):

    tenants = db.query(Tenant).all()

    return tenants
@router.get("/me")
def get_my_tenant_profile(
    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_roles("TENANT")
    )
):

    tenant = db.query(Tenant).filter(
        Tenant.user_id == current_user.id
    ).first()

    if tenant is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy hồ sơ khách thuê"
        )

    return tenant
@router.get(
    "/{tenant_id}",
    response_model=TenantResponse
)
def get_tenant(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "STAFF",
            "ACCOUNTANT"
        )
    )
):

    tenant = db.query(Tenant).filter(
        Tenant.id == tenant_id
    ).first()

    if tenant is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy khách thuê"
        )

    return tenant
@router.put(
    "/{tenant_id}",
    response_model=TenantResponse
)
def update_tenant(
    tenant_id: int,
    data: TenantUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("ADMIN", "STAFF")
    )
):

    tenant = db.query(Tenant).filter(
        Tenant.id == tenant_id
    ).first()

    if tenant is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy khách thuê"
        )

    duplicate = db.query(Tenant).filter(
        Tenant.citizen_id == data.citizen_id,
        Tenant.id != tenant_id
    ).first()

    if duplicate:
        raise HTTPException(
            status_code=400,
            detail="CCCD đã tồn tại"
        )

    tenant.full_name = data.full_name
    tenant.citizen_id = data.citizen_id
    tenant.phone = data.phone
    tenant.email = data.email
    tenant.hometown = data.hometown
    tenant.is_bad_debt = data.is_bad_debt

    db.commit()
    db.refresh(tenant)

    return tenant
@router.delete("/{tenant_id}")
def delete_tenant(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("ADMIN")
    )
):

    tenant = db.query(Tenant).filter(
        Tenant.id == tenant_id
    ).first()

    if tenant is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy khách thuê"
        )

    db.delete(tenant)
    db.commit()

    return {
        "message": "Xóa khách thuê thành công"
    }
