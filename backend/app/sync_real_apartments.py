import sys
import os
from datetime import datetime, timedelta
from decimal import Decimal

sys.stdout.reconfigure(encoding='utf-8')

from app.database import SessionLocal
from app.models.apartment import Apartment
from app.models.maintenance_request import MaintenanceRequest
from app.models.contract import Contract
from app.models.booking import Booking
from app.models.user import User

def sync_data():
    db = SessionLocal()
    try:
        print("=== 1. SYNC REAL APARTMENT NUMBERS & METADATA ===")
        # Rename random hex apartments on floor 5
        floor5_data = [
            (30, "P501", 5, Decimal("45.0"), Decimal("13500000"), 1, 1, "AVAILABLE", "Đông Nam", 
             "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80",
             "Căn hộ Studio cao cấp tầng 5, đón trọn ánh sáng tự nhiên, nội thất phong cách tối giản Bắc Âu sang trọng."),
            (31, "P502", 5, Decimal("68.0"), Decimal("16500000"), 2, 2, "OCCUPIED", "Nam",
             "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80",
             "Căn hộ 2 phòng ngủ hiện đại tầng 5, phòng khách rộng rãi, trang bị đầy đủ bếp từ âm và sofa da cao cấp."),
            (32, "P503", 5, Decimal("60.0"), Decimal("14000000"), 1, 1, "MAINTENANCE", "Đông",
             "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80",
             "Căn hộ 1 phòng ngủ tầng 5, đang trong kế hoạch kiểm tra bảo dưỡng định kỳ hệ thống điều hòa và thiết bị."),
            (33, "P504", 5, Decimal("85.0"), Decimal("19000000"), 2, 2, "AVAILABLE", "Đông Nam",
             "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop&q=80",
             "Căn hộ 2 phòng ngủ Master tầng 5, ban công kính tràn viền nhìn ra công viên trung tâm thoáng đãng."),
            (34, "P505", 5, Decimal("55.0"), Decimal("13000000"), 1, 1, "AVAILABLE", "Bắc",
             "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&auto=format&fit=crop&q=80",
             "Căn hộ 1 phòng ngủ thông minh tầng 5, bố trí nội thất âm tường hiện đại, máy giặt sấy riêng."),
            (35, "P506", 5, Decimal("75.0"), Decimal("17500000"), 2, 2, "AVAILABLE", "Tây Nam",
             "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80",
             "Căn hộ gia đình 2 phòng ngủ tầng 5, không gian ấm cúng, khóa cửa vân tay điện tử kết hợp FaceID."),
            (36, "P507", 5, Decimal("50.0"), Decimal("12500000"), 1, 1, "AVAILABLE", "Đông",
             "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop&q=80",
             "Căn hộ Studio thoáng đãng tầng 5, view nhìn ra phố đi bộ nội khu, ánh sáng ngập tràn."),
            (37, "P508", 5, Decimal("95.0"), Decimal("23500000"), 3, 2, "OCCUPIED", "Đông Nam",
             "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80",
             "Căn hộ góc 3 phòng ngủ Penthouse tầng 5, tầm nhìn Panorama 2 mặt thoáng, nội thất chuẩn khách sạn 5 sao."),
        ]

        for apt_id, room_no, floor, area, price, bed, bath, status_val, direction, img, desc in floor5_data:
            apt = db.query(Apartment).filter(Apartment.id == apt_id).first()
            if apt:
                apt.room_number = room_no
                apt.floor = floor
                apt.area_sqm = area
                apt.price = price
                apt.bedrooms = bed
                apt.bathrooms = bath
                apt.status = status_val
                apt.view_direction = direction
                apt.image_url = img
                apt.description = desc
                print(f"Updated Apartment ID {apt_id} -> Room {room_no} ({status_val})")

        # Update P106
        apt_p106 = db.query(Apartment).filter(Apartment.room_number == "P106").first()
        if apt_p106:
            apt_p106.status = "MAINTENANCE"
            apt_p106.description = "Căn hộ P106 tại tầng 1, diện tích 95m², đang tiến hành bảo dưỡng máy lạnh trước khi đón khách."

        # Update P503
        apt_p503 = db.query(Apartment).filter(Apartment.room_number == "P503").first()
        if apt_p503:
            apt_p503.status = "MAINTENANCE"

        # Update other floor 5 apartments
        for r_no in ["P501", "P504", "P505", "P506", "P507"]:
            a = db.query(Apartment).filter(Apartment.room_number == r_no).first()
            if a:
                a.status = "AVAILABLE"

        a_p502 = db.query(Apartment).filter(Apartment.room_number == "P502").first()
        if a_p502:
            a_p502.status = "OCCUPIED"

        a_p508 = db.query(Apartment).filter(Apartment.room_number == "P508").first()
        if a_p508:
            a_p508.status = "OCCUPIED"

        db.commit()

        print("\n=== 2. CLEAN UP & SYNC REALISTIC MAINTENANCE TICKETS ===")
        # Delete duplicate spam test tickets (ID >= 6)
        db.query(MaintenanceRequest).filter(MaintenanceRequest.id >= 6).delete(synchronize_session=False)
        db.commit()

        # Get staff user for assignment
        staff_user = db.query(User).filter(User.phone == "0912234567").first()
        staff_id = staff_user.id if staff_user else None

        # Build realistic maintenance tickets across different real rooms
        real_tickets = [
            {
                "apartment_room": "P101",
                "reporter_name": "Nguyễn Văn An",
                "phone": "0912888999",
                "issue_description": "Rò rỉ nước tại van khóa bồn rửa chén nhà bếp, cần thay gioăng cao su chịu nhiệt.",
                "priority": "HIGH",
                "status": "COMPLETED",
                "repair_cost": Decimal("150000"),
                "assigned_staff_id": staff_id,
                "days_ago": 3,
                "resolved_days_ago": 2,
                "image_url": "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&auto=format&fit=crop&q=80",
            },
            {
                "apartment_room": "P106",
                "reporter_name": "Lê Quang Khánh (BQL Tòa Nhà)",
                "phone": "0912234567",
                "issue_description": "Điều hòa phòng khách kêu to và bám bụi dày, cần vệ sinh lưới lọc và nạp gas bổ sung trước khi đón khách.",
                "priority": "HIGH",
                "status": "IN_PROGRESS",
                "repair_cost": Decimal("250000"),
                "assigned_staff_id": staff_id,
                "days_ago": 1,
                "resolved_days_ago": None,
                "image_url": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80",
            },
            {
                "apartment_room": "P104",
                "reporter_name": "Trần Thị Bích",
                "phone": "0933111222",
                "issue_description": "Khóa cửa điện tử vân tay chập chờn báo pin yếu, đã thay 4 viên pin kiềm chính hãng và kiểm tra đóng mở trơn tru.",
                "priority": "URGENT",
                "status": "COMPLETED",
                "repair_cost": Decimal("180000"),
                "assigned_staff_id": staff_id,
                "days_ago": 5,
                "resolved_days_ago": 4,
                "image_url": None,
            },
            {
                "apartment_room": "P503",
                "reporter_name": "Hoàng Khánh Ly (Giám sát BQL)",
                "phone": "0904123456",
                "issue_description": "Bảo dưỡng định kỳ hệ thống điều hòa Multi và thông tắc đường thoát nước ngưng ban công.",
                "priority": "MEDIUM",
                "status": "IN_PROGRESS",
                "repair_cost": Decimal("200000"),
                "assigned_staff_id": staff_id,
                "days_ago": 1,
                "resolved_days_ago": None,
                "image_url": None,
            },
            {
                "apartment_room": "P201",
                "reporter_name": "Nguyễn Hải Đăng",
                "phone": "0918234567",
                "issue_description": "Át-tô-mát bình nóng lạnh nhà tắm bị nhảy khi bật cùng lúc máy sưởi, cần thợ kiểm tra đường dây và tải điện.",
                "priority": "HIGH",
                "status": "PENDING",
                "repair_cost": Decimal("0"),
                "assigned_staff_id": None,
                "days_ago": 0,
                "resolved_days_ago": None,
                "image_url": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80",
            },
            {
                "apartment_room": "P204",
                "reporter_name": "Lê Hoàng Nam",
                "phone": "0977456789",
                "issue_description": "Bản lề cánh cửa tủ bếp trên bị lỏng ốc, phát ra tiếng kêu cọt kẹt khi mở đóng, đã căn chỉnh và siết chặt.",
                "priority": "LOW",
                "status": "COMPLETED",
                "repair_cost": Decimal("80000"),
                "assigned_staff_id": staff_id,
                "days_ago": 8,
                "resolved_days_ago": 7,
                "image_url": None,
            },
            {
                "apartment_room": "P302",
                "reporter_name": "Đỗ Phương Thảo",
                "phone": "0915667788",
                "issue_description": "Kiểm tra định kỳ đầu phun PCCC Sprinkler và thiết bị báo khói cảm biến nhiệt tự động trong phòng khách.",
                "priority": "MEDIUM",
                "status": "COMPLETED",
                "repair_cost": Decimal("0"),
                "assigned_staff_id": staff_id,
                "days_ago": 10,
                "resolved_days_ago": 9,
                "image_url": None,
            },
            {
                "apartment_room": "P307",
                "reporter_name": "Vũ Minh Trang",
                "phone": "0966789012",
                "issue_description": "Vòi sen tắm đứng tăng áp bị tắc nghẽn tia nước do cặn vôi, đã tháo vệ sinh lõi lọc áp lực nước phun mạnh đều.",
                "priority": "LOW",
                "status": "COMPLETED",
                "repair_cost": Decimal("60000"),
                "assigned_staff_id": staff_id,
                "days_ago": 6,
                "resolved_days_ago": 5,
                "image_url": None,
            },
            {
                "apartment_room": "P508",
                "reporter_name": "Trần Thảo Linh",
                "phone": "0945678901",
                "issue_description": "Đèn LED hắt trần thạch cao phòng khách không sáng, nghi ngờ hỏng nguồn Driver 12V cần thay thế linh kiện.",
                "priority": "MEDIUM",
                "status": "PENDING",
                "repair_cost": Decimal("0"),
                "assigned_staff_id": None,
                "days_ago": 0,
                "resolved_days_ago": None,
                "image_url": None,
            },
            {
                "apartment_room": "P102",
                "reporter_name": "Phạm Đức Duy",
                "phone": "0909112233",
                "issue_description": "Cửa nhôm kính Xingfa trượt ban công bị kẹt bánh xe ray trượt, đã xịt mỡ bôi trơn và chỉnh độ khít kín gió.",
                "priority": "MEDIUM",
                "status": "COMPLETED",
                "repair_cost": Decimal("120000"),
                "assigned_staff_id": staff_id,
                "days_ago": 12,
                "resolved_days_ago": 11,
                "image_url": None,
            },
        ]

        # Reset existing remaining tickets (IDs 1, 2, 3) or delete all and recreate cleanly
        db.query(MaintenanceRequest).delete(synchronize_session=False)
        db.commit()

        now = datetime.now()
        for idx, t_info in enumerate(real_tickets, start=1):
            apt = db.query(Apartment).filter(Apartment.room_number == t_info["apartment_room"]).first()
            if not apt:
                continue

            created = now - timedelta(days=t_info["days_ago"], hours=idx * 2)
            resolved = None
            if t_info["resolved_days_ago"] is not None:
                resolved = now - timedelta(days=t_info["resolved_days_ago"], hours=idx)

            req = MaintenanceRequest(
                id=idx,
                apartment_id=apt.id,
                reporter_name=t_info["reporter_name"],
                phone=t_info["phone"],
                issue_description=t_info["issue_description"],
                priority=t_info["priority"],
                status=t_info["status"],
                repair_cost=t_info["repair_cost"],
                assigned_staff_id=t_info["assigned_staff_id"],
                created_at=created,
                resolved_at=resolved,
                image_url=t_info["image_url"],
            )
            db.add(req)

        db.commit()
        print("Successfully synchronized all realistic maintenance requests!")

        print("\n=== 3. VERIFY APARTMENT STATUSES ===")
        all_apts = db.query(Apartment).order_by(Apartment.room_number).all()
        for a in all_apts:
            print(f"{a.room_number} (Tầng {a.floor}): {a.status} - {a.price:,.0f} đ")

    except Exception as e:
        db.rollback()
        print(f"Error during synchronization: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    sync_data()
