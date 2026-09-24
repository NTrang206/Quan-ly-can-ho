from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.models.apartment import Apartment
from app.models.building import Building
from app.models.user import User

from app.schemas.apartment import (
    ApartmentCreate,
    ApartmentUpdate,
    ApartmentResponse
)

from app.dependencies.auth import require_roles


router = APIRouter(
    prefix="/apartments",
    tags=["Apartments"]
)
VALID_STATUSES = [
    "AVAILABLE",
    "RESERVED",
    "OCCUPIED",
    "MAINTENANCE"
]
@router.post(
    "",
    response_model=ApartmentResponse
)
def create_apartment(
    data: ApartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("ADMIN", "STAFF")
    )
):

    building = db.query(Building).filter(
        Building.id == data.building_id
    ).first()

    if building is None:
        raise HTTPException(
            status_code=404,
            detail="Tòa nhà không tồn tại"
        )

    if data.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail="Trạng thái căn hộ không hợp lệ"
        )

    existing = db.query(Apartment).filter(
        Apartment.building_id == data.building_id,
        Apartment.room_number == data.room_number
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Số căn hộ đã tồn tại trong tòa nhà"
        )

    apartment = Apartment(
        building_id=data.building_id,
        room_number=data.room_number,
        floor=data.floor,
        area_sqm=data.area_sqm,
        price=data.price,
        max_occupants=data.max_occupants,
        status=data.status
    )

    db.add(apartment)
    db.commit()
    db.refresh(apartment)

    return apartment
@router.get(
    "",
    response_model=list[ApartmentResponse]
)
def get_apartments(
    db: Session = Depends(get_db)
):

    apartments = db.query(Apartment).all()

    return apartments
@router.get(
    "",
    response_model=list[ApartmentResponse]
)
def get_apartments(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "STAFF",
            "ACCOUNTANT"
        )
    )
):
    return db.query(Apartment).all()
@router.get(
    "/{apartment_id}",
    response_model=ApartmentResponse
)
def get_apartment(
    apartment_id: int,
    db: Session = Depends(get_db)
):

    apartment = db.query(Apartment).filter(
        Apartment.id == apartment_id
    ).first()

    if apartment is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy căn hộ"
        )

    return apartment
@router.put(
    "/{apartment_id}",
    response_model=ApartmentResponse
)
def update_apartment(
    apartment_id: int,
    data: ApartmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("ADMIN", "STAFF")
    )
):

    apartment = db.query(Apartment).filter(
        Apartment.id == apartment_id
    ).first()

    if apartment is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy căn hộ"
        )

    building = db.query(Building).filter(
        Building.id == data.building_id
    ).first()

    if building is None:
        raise HTTPException(
            status_code=404,
            detail="Tòa nhà không tồn tại"
        )

    if data.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail="Trạng thái căn hộ không hợp lệ"
        )

    duplicate = db.query(Apartment).filter(
        Apartment.building_id == data.building_id,
        Apartment.room_number == data.room_number,
        Apartment.id != apartment_id
    ).first()

    if duplicate:
        raise HTTPException(
            status_code=400,
            detail="Số căn hộ đã tồn tại trong tòa nhà"
        )

    apartment.building_id = data.building_id
    apartment.room_number = data.room_number
    apartment.floor = data.floor
    apartment.area_sqm = data.area_sqm
    apartment.price = data.price
    apartment.max_occupants = data.max_occupants
    apartment.status = data.status

    db.commit()
    db.refresh(apartment)

    return apartment
@router.delete("/{apartment_id}")
def delete_apartment(
    apartment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("ADMIN")
    )
):

    apartment = db.query(Apartment).filter(
        Apartment.id == apartment_id
    ).first()

    if apartment is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy căn hộ"
        )

    db.delete(apartment)
    db.commit()

    return {
        "message": "Xóa căn hộ thành công"
    }