from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from datetime import datetime
from uuid import uuid4

from app.database import get_db

from app.models.booking import Booking
from app.models.apartment import Apartment
from app.models.user import User

from app.schemas.booking import (
    BookingCreate,
    BookingResponse
)

from app.dependencies.auth import require_roles


router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"]
)


VALID_BOOKING_STATUSES = [
    "PENDING",
    "CONFIRMED",
    "CANCELLED",
    "CONVERTED"
]
def generate_booking_code(
    db: Session
):

    while True:

        month = datetime.now().strftime("%Y%m")

        random_code = uuid4().hex[:4].upper()

        booking_code = (
            f"BK-{month}-{random_code}"
        )

        existing = db.query(Booking).filter(
            Booking.booking_code == booking_code
        ).first()

        if existing is None:
            return booking_code
@router.post(
    "",
    response_model=BookingResponse
)
def create_booking(
    data: BookingCreate,
    db: Session = Depends(get_db)
):

    apartment = db.query(Apartment).filter(
        Apartment.id == data.apartment_id
    ).first()

    if apartment is None:
        raise HTTPException(
            status_code=404,
            detail="Căn hộ không tồn tại"
        )

    if apartment.status != "AVAILABLE":
        raise HTTPException(
            status_code=400,
            detail="Căn hộ hiện không còn trống"
        )

    booking_code = generate_booking_code(db)

    booking = Booking(
        booking_code=booking_code,
        customer_name=data.customer_name,
        customer_phone=data.customer_phone,
        customer_email=data.customer_email,
        apartment_id=data.apartment_id,
        check_in_date=data.check_in_date,
        deposit_amount=data.deposit_amount,
        status="PENDING",
        notes=data.notes
    )

    db.add(booking)

    # Căn hộ chuyển sang giữ chỗ
    apartment.status = "RESERVED"

    db.commit()
    db.refresh(booking)

    return booking
@router.get(
    "",
    response_model=list[BookingResponse]
)
def get_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("ADMIN", "STAFF")
    )
):

    bookings = db.query(Booking).all()

    return bookings
@router.get(
    "/{booking_id}",
    response_model=BookingResponse
)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("ADMIN", "STAFF")
    )
):

    booking = db.query(Booking).filter(
        Booking.id == booking_id
    ).first()

    if booking is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy Booking"
        )

    return booking
@router.patch(
    "/{booking_id}/confirm",
    response_model=BookingResponse
)
def confirm_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("ADMIN", "STAFF")
    )
):

    booking = db.query(Booking).filter(
        Booking.id == booking_id
    ).first()

    if booking is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy Booking"
        )

    if booking.status != "PENDING":
        raise HTTPException(
            status_code=400,
            detail="Booking không ở trạng thái chờ xác nhận"
        )

    booking.status = "CONFIRMED"

    db.commit()
    db.refresh(booking)

    return booking
@router.patch(
    "/{booking_id}/cancel",
    response_model=BookingResponse
)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("ADMIN", "STAFF")
    )
):

    booking = db.query(Booking).filter(
        Booking.id == booking_id
    ).first()

    if booking is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy Booking"
        )

    if booking.status == "CONVERTED":
        raise HTTPException(
            status_code=400,
            detail="Booking đã chuyển thành hợp đồng"
        )

    if booking.status == "CANCELLED":
        raise HTTPException(
            status_code=400,
            detail="Booking đã được hủy trước đó"
        )

    apartment = db.query(Apartment).filter(
        Apartment.id == booking.apartment_id
    ).first()

    booking.status = "CANCELLED"

    if apartment:
        apartment.status = "AVAILABLE"

    db.commit()
    db.refresh(booking)

    return booking