import json
from datetime import date, datetime, timedelta
from decimal import Decimal

from app.database import SessionLocal, Base, engine
from app.models.role import Role
from app.models.user import User
from app.models.building import Building
from app.models.apartment import Apartment
from app.models.amenity import Amenity
from app.models.tenant import Tenant
from app.models.roommate import Roommate
from app.models.emergency_contact import EmergencyContact
from app.models.booking import Booking
from app.models.contract import Contract
from app.models.deposit import Deposit
from app.models.receivable import Receivable
from app.models.payment import Payment
from app.models.debt_ledger import DebtLedger
from app.models.system_alert import SystemAlert
from app.models.maintenance_request import MaintenanceRequest
from app.models.document_chunk import DocumentChunk
from app.utils.security import hash_password
from app.services.debt_service import recalculate_debt


def seed_all():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # =========================================================
        # 1. ROLES
        # =========================================================
        roles_data = [
            {"role_code": "ADMIN", "role_name": "Quản trị viên", "description": "Quản lý toàn bộ hệ thống"},
            {"role_code": "STAFF", "role_name": "Nhân viên vận hành", "description": "Nhân viên vận hành tòa nhà"},
            {"role_code": "ACCOUNTANT", "role_name": "Kế toán", "description": "Quản lý tài chính và công nợ"},
            {"role_code": "TENANT", "role_name": "Cư dân", "description": "Cư dân đang thuê căn hộ"},
        ]
        role_map = {}
        for r in roles_data:
            existing = db.query(Role).filter(Role.role_code == r["role_code"]).first()
            if not existing:
                existing = Role(**r)
                db.add(existing)
                db.flush()
            role_map[r["role_code"]] = existing

        # =========================================================
        # 2. USERS
        # =========================================================
        users_data = [
            {
                "id": 1,
                "role_id": role_map["ADMIN"].id,
                "username": "admin",
                "email": "admin@dwell.vn",
                "full_name": "Hoàng Khánh Ly",
                "phone": "0904123456",
                "password": "admin123",
            },
            {
                "id": 2,
                "role_id": role_map["STAFF"].id,
                "username": "staff",
                "email": "staff@dwell.vn",
                "full_name": "Lê Quang Khánh",
                "phone": "0912234567",
                "password": "staff123",
            },
            {
                "id": 3,
                "role_id": role_map["ACCOUNTANT"].id,
                "username": "accountant",
                "email": "accountant@dwell.vn",
                "full_name": "Lê Thu Trang",
                "phone": "0934567890",
                "password": "acc123",
            },
            {
                "id": 4,
                "role_id": role_map["TENANT"].id,
                "username": "tenant",
                "email": "tenant@dwell.vn",
                "full_name": "Nguyễn Văn An",
                "phone": "0912888999",
                "password": "tenant123",
            },
        ]
        user_map = {}
        for u in users_data:
            existing = db.query(User).filter((User.username == u["username"]) | (User.email == u["email"])).first()
            if not existing:
                existing = User(
                    id=u["id"],
                    role_id=u["role_id"],
                    username=u["username"],
                    email=u["email"],
                    full_name=u["full_name"],
                    phone=u["phone"],
                    password_hash=hash_password(u["password"]),
                    is_active=True,
                )
                db.add(existing)
                db.flush()
            else:
                existing.email = u["email"]
                existing.password_hash = hash_password(u["password"])
                db.flush()
            user_map[u["username"]] = existing

        # =========================================================
        # 3. BUILDINGS
        # =========================================================
        buildings_data = [
            {
                "id": 1,
                "building_code": "BLD-01",
                "name": "Sunshine Diamond Tower",
                "address": "128 Nguyễn Thị Thập, P. Tân Hưng, Quận 7, TP.HCM",
                "total_floors": 12,
                "total_apartments": 48,
                "status": "ACTIVE",
            },
            {
                "id": 2,
                "building_code": "BLD-02",
                "name": "Sunshine Riverside Residence",
                "address": "25 Mai Chí Thọ, P. An Phú, Quận 2, TP.HCM",
                "total_floors": 18,
                "total_apartments": 72,
                "status": "ACTIVE",
            },
            {
                "id": 3,
                "building_code": "BLD-03",
                "name": "Sunshine Sky Park",
                "address": "88 Cầu Giấy, P. Dịch Vọng Hậu, Cầu Giấy, Hà Nội",
                "total_floors": 15,
                "total_apartments": 60,
                "status": "ACTIVE",
            },
        ]
        for b in buildings_data:
            if not db.query(Building).filter(Building.building_code == b["building_code"]).first():
                db.add(Building(**b))
        db.flush()

        # =========================================================
        # 4. APARTMENTS
        # =========================================================
        apartments_data = [
            {"id": 1, "building_id": 1, "room_number": "P101", "floor": 1, "area_sqm": Decimal("55.0"), "price": Decimal("11500000"), "max_occupants": 2, "status": "OCCUPIED"},
            {"id": 2, "building_id": 1, "room_number": "P102", "floor": 1, "area_sqm": Decimal("70.0"), "price": Decimal("14000000"), "max_occupants": 3, "status": "AVAILABLE"},
            {"id": 3, "building_id": 1, "room_number": "P201", "floor": 2, "area_sqm": Decimal("58.0"), "price": Decimal("12000000"), "max_occupants": 2, "status": "AVAILABLE"},
            {"id": 4, "building_id": 1, "room_number": "P202", "floor": 2, "area_sqm": Decimal("85.0"), "price": Decimal("17500000"), "max_occupants": 4, "status": "OCCUPIED"},
            {"id": 5, "building_id": 1, "room_number": "P301", "floor": 3, "area_sqm": Decimal("60.0"), "price": Decimal("13000000"), "max_occupants": 2, "status": "RESERVED"},
            {"id": 6, "building_id": 1, "room_number": "P302", "floor": 3, "area_sqm": Decimal("95.0"), "price": Decimal("21000000"), "max_occupants": 4, "status": "MAINTENANCE"},
            {"id": 7, "building_id": 2, "room_number": "A401", "floor": 4, "area_sqm": Decimal("65.0"), "price": Decimal("13500000"), "max_occupants": 3, "status": "AVAILABLE"},
            {"id": 8, "building_id": 2, "room_number": "A402", "floor": 4, "area_sqm": Decimal("80.0"), "price": Decimal("16000000"), "max_occupants": 3, "status": "AVAILABLE"},
            {"id": 9, "building_id": 2, "room_number": "A501", "floor": 5, "area_sqm": Decimal("110.0"), "price": Decimal("25000000"), "max_occupants": 5, "status": "OCCUPIED"},
            {"id": 10, "building_id": 3, "room_number": "B601", "floor": 6, "area_sqm": Decimal("50.0"), "price": Decimal("9500000"), "max_occupants": 2, "status": "AVAILABLE"},
            {"id": 11, "building_id": 3, "room_number": "B602", "floor": 6, "area_sqm": Decimal("75.0"), "price": Decimal("14500000"), "max_occupants": 3, "status": "AVAILABLE"},
        ]
        for a in apartments_data:
            existing = db.query(Apartment).filter(Apartment.building_id == a["building_id"], Apartment.room_number == a["room_number"]).first()
            if not existing:
                db.add(Apartment(**a))
        db.flush()

        # =========================================================
        # 5. AMENITIES
        # =========================================================
        standard_amenities = [
            ("Điều hòa Daikin Inverter", "Daikin", "GOOD"),
            ("Tủ lạnh Panasonic 2 cánh", "Panasonic", "GOOD"),
            ("Khóa cửa thông minh vân tay", "Yale", "GOOD"),
            ("Máy giặt sấy lồng ngang", "LG", "GOOD"),
            ("Bếp từ đôi cao cấp", "Hafele", "GOOD"),
        ]
        if db.query(Amenity).count() == 0:
            for apt_id in range(1, 12):
                for name, brand, condition in standard_amenities:
                    db.add(Amenity(apartment_id=apt_id, name=name, brand=brand, condition_status=condition))
            db.flush()

        # =========================================================
        # 6. TENANTS
        # =========================================================
        tenants_data = [
            {
                "id": 1,
                "user_id": 4,
                "full_name": "Nguyễn Văn An",
                "citizen_id": "079201008899",
                "phone": "0912888999",
                "email": "tenant@dwell.vn",
                "hometown": "Hà Nội",
                "is_bad_debt": False,
            },
            {
                "id": 2,
                "user_id": None,
                "full_name": "Trần Thị Bích",
                "citizen_id": "079202007788",
                "phone": "0933111222",
                "email": "bich.tran@gmail.com",
                "hometown": "Đà Nẵng",
                "is_bad_debt": False,
            },
            {
                "id": 3,
                "user_id": None,
                "full_name": "Lê Hoàng Nam",
                "citizen_id": "079203006677",
                "phone": "0944555666",
                "email": "nam.le@gmail.com",
                "hometown": "Hải Phòng",
                "is_bad_debt": False,
            },
            {
                "id": 4,
                "user_id": None,
                "full_name": "Phạm Quốc Huy",
                "citizen_id": "079204005544",
                "phone": "0977888999",
                "email": "huy.pq@gmail.com",
                "hometown": "TP. Hồ Chí Minh",
                "is_bad_debt": True,
            },
        ]
        for t in tenants_data:
            existing = db.query(Tenant).filter(Tenant.citizen_id == t["citizen_id"]).first()
            if not existing:
                db.add(Tenant(**t))
        db.flush()

        # Emergency contacts & Roommates for Tenant 1
        if db.query(EmergencyContact).count() == 0:
            db.add(EmergencyContact(tenant_id=1, full_name="Nguyễn Văn Bình", phone="0903111222", relationship="Cha ruột"))
            db.add(EmergencyContact(tenant_id=2, full_name="Trần Văn Hùng", phone="0913999888", relationship="Anh trai"))
        if db.query(Roommate).count() == 0:
            db.add(Roommate(tenant_id=1, apartment_id=1, full_name="Nguyễn Mai Anh", citizen_id="079205001122", phone="0988776655", relationship="Em gái"))
        db.flush()

        # =========================================================
        # 7. CONTRACTS
        # =========================================================
        today = date.today()
        contracts_data = [
            {
                "id": 1,
                "contract_code": "HD-2025-P101",
                "apartment_id": 1,
                "tenant_id": 1,
                "start_date": today - timedelta(days=120),
                "end_date": today + timedelta(days=245),
                "rental_price": Decimal("11500000"),
                "deposit_amount": Decimal("23000000"),
                "status": "ACTIVE",
                "created_by": 1,
                "approved_by": 1,
            },
            {
                "id": 2,
                "contract_code": "HD-2025-P202",
                "apartment_id": 4,
                "tenant_id": 2,
                "start_date": today - timedelta(days=350),
                "end_date": today + timedelta(days=15),  # Sắp hết hạn trong 15 ngày
                "rental_price": Decimal("17500000"),
                "deposit_amount": Decimal("35000000"),
                "status": "ACTIVE",
                "created_by": 1,
                "approved_by": 1,
            },
            {
                "id": 3,
                "contract_code": "HD-2026-P301",
                "apartment_id": 5,
                "tenant_id": 3,
                "start_date": today + timedelta(days=5),
                "end_date": today + timedelta(days=370),
                "rental_price": Decimal("13000000"),
                "deposit_amount": Decimal("26000000"),
                "status": "DRAFT",
                "created_by": 2,
                "approved_by": None,
            },
        ]
        for c in contracts_data:
            existing = db.query(Contract).filter(Contract.contract_code == c["contract_code"]).first()
            if not existing:
                db.add(Contract(**c))
        db.flush()

        # =========================================================
        # 8. DEPOSITS
        # =========================================================
        deposits_data = [
            {
                "id": 1,
                "contract_id": 1,
                "amount": Decimal("23000000"),
                "status": "HELD",
                "paid_date": today - timedelta(days=120),
                "handled_by": 3,
            },
            {
                "id": 2,
                "contract_id": 2,
                "amount": Decimal("35000000"),
                "status": "HELD",
                "paid_date": today - timedelta(days=350),
                "handled_by": 3,
            },
            {
                "id": 3,
                "contract_id": 3,
                "amount": Decimal("26000000"),
                "status": "PENDING",
                "paid_date": None,
                "handled_by": None,
            },
        ]
        for d in deposits_data:
            existing = db.query(Deposit).filter(Deposit.contract_id == d["contract_id"]).first()
            if not existing:
                db.add(Deposit(**d))
        db.flush()

        # =========================================================
        # 9. RECEIVABLES & PAYMENTS
        # =========================================================
        cur_m = today.month
        cur_y = today.year
        prev_m = cur_m - 1 if cur_m > 1 else 12
        prev_y = cur_y if cur_m > 1 else cur_y - 1

        # Hóa đơn tháng trước của P101: Đã thanh toán xong
        r_prev = db.query(Receivable).filter(Receivable.contract_id == 1, Receivable.billing_month == prev_m, Receivable.billing_year == prev_y).first()
        if not r_prev:
            r_prev = Receivable(
                contract_id=1,
                apartment_id=1,
                billing_month=prev_m,
                billing_year=prev_y,
                room_amount=Decimal("11500000"),
                service_amount=Decimal("1250000"),
                total_amount=Decimal("12750000"),
                paid_amount=Decimal("12750000"),
                status="PAID",
                due_date=date(prev_y, prev_m, 10),
            )
            db.add(r_prev)
            db.flush()

            # Phiếu thu tương ứng
            db.add(Payment(
                receivable_id=r_prev.id,
                amount=Decimal("12750000"),
                payment_date=date(prev_y, prev_m, 8),
                payment_method="BANK_TRANSFER",
                transaction_code=f"TX-{prev_y}{prev_m}0801",
                note="Thanh toán cước tiền phòng & dịch vụ qua VietQR",
                handled_by=3,
            ))

        # Hóa đơn tháng này của P101: Chưa thanh toán (UNPAID)
        r_cur = db.query(Receivable).filter(Receivable.contract_id == 1, Receivable.billing_month == cur_m, Receivable.billing_year == cur_y).first()
        if not r_cur:
            r_cur = Receivable(
                contract_id=1,
                apartment_id=1,
                billing_month=cur_m,
                billing_year=cur_y,
                room_amount=Decimal("11500000"),
                service_amount=Decimal("1420000"),
                total_amount=Decimal("12920000"),
                paid_amount=Decimal("0"),
                status="UNPAID",
                due_date=date(cur_y, cur_m, 10) if today.day <= 10 else today + timedelta(days=5),
            )
            db.add(r_cur)

        # Hóa đơn của P202: Quá hạn (OVERDUE)
        r_overdue = db.query(Receivable).filter(Receivable.contract_id == 2, Receivable.billing_month == prev_m, Receivable.billing_year == prev_y).first()
        if not r_overdue:
            r_overdue = Receivable(
                contract_id=2,
                apartment_id=4,
                billing_month=prev_m,
                billing_year=prev_y,
                room_amount=Decimal("17500000"),
                service_amount=Decimal("3600000"),
                total_amount=Decimal("21100000"),
                paid_amount=Decimal("0"),
                status="OVERDUE",
                due_date=today - timedelta(days=12),
            )
            db.add(r_overdue)
        db.flush()

        # =========================================================
        # 10. RECALCULATE DEBT LEDGERS
        # =========================================================
        for t_id in [1, 2, 3]:
            try:
                recalculate_debt(t_id, db, commit=False)
            except Exception:
                pass
        db.flush()

        # =========================================================
        # 11. MAINTENANCE REQUESTS
        # =========================================================
        if db.query(MaintenanceRequest).count() == 0:
            db.add(MaintenanceRequest(
                apartment_id=1,
                tenant_id=1,
                reporter_name="Nguyễn Văn An",
                phone="0912888999",
                issue_description="Rò rỉ nước tại van khóa bồn rửa chén nhà bếp, cần thay gioăng cao su.",
                priority="HIGH",
                status="IN_PROGRESS",
                repair_cost=Decimal("350000"),
                assigned_staff_id=2,
                created_at=datetime.now() - timedelta(hours=6),
            ))
            db.add(MaintenanceRequest(
                apartment_id=6,
                tenant_id=None,
                reporter_name="Nhân viên kiểm tra phòng",
                phone="0912234567",
                issue_description="Điều hòa phòng khách kêu to và bám bụi dày, cần vệ sinh nạp gas trước khi đón khách.",
                priority="MEDIUM",
                status="PENDING",
                repair_cost=Decimal("0"),
                assigned_staff_id=None,
                created_at=datetime.now() - timedelta(days=1),
            ))
            db.add(MaintenanceRequest(
                apartment_id=4,
                tenant_id=2,
                reporter_name="Trần Thị Bích",
                phone="0933111222",
                issue_description="Khóa cửa điện tử vân tay chập chờn báo pin yếu, đã thay pin mới hoàn tất.",
                priority="URGENT",
                status="RESOLVED",
                repair_cost=Decimal("150000"),
                assigned_staff_id=2,
                created_at=datetime.now() - timedelta(days=3),
                resolved_at=datetime.now() - timedelta(days=2),
            ))
        db.flush()

        # =========================================================
        # 12. SYSTEM ALERTS
        # =========================================================
        if db.query(SystemAlert).count() == 0:
            db.add(SystemAlert(
                alert_type="OVERDUE_RECEIVABLE",
                reference_id=2,
                message="Hóa đơn tiền phòng và dịch vụ căn P202 quá hạn 12 ngày. Số nợ cần thu: 21,100,000 VNĐ. Khách thuê: Trần Thị Bích (0933.111.222).",
                is_sent=False,
                created_at=datetime.now() - timedelta(days=2),
            ))
            db.add(SystemAlert(
                alert_type="EXPIRING_CONTRACT",
                reference_id=2,
                message="Hợp đồng HD-2025-P202 của cư dân Trần Thị Bích tại căn P202 sẽ hết hạn sau 15 ngày. Cần liên hệ gia hạn hoặc chuẩn bị bàn giao.",
                is_sent=False,
                created_at=datetime.now() - timedelta(hours=12),
            ))
        db.flush()

        # =========================================================
        # 13. BOOKINGS
        # =========================================================
        if db.query(Booking).count() == 0:
            db.add(Booking(
                booking_code="BK-2026-001",
                apartment_id=2,
                customer_name="Võ Minh Trí",
                customer_phone="0918776655",
                customer_email="tri.vo@gmail.com",
                check_in_date=today + timedelta(days=7),
                deposit_amount=Decimal("2000000"),
                status="CONFIRMED",
                notes="Khách xem phòng ưng ý, đã giữ chỗ cọc 2 triệu VNĐ.",
            ))
            db.add(Booking(
                booking_code="BK-2026-002",
                apartment_id=7,
                customer_name="Đặng Thị Thu",
                customer_phone="0909334455",
                customer_email="thu.dang@gmail.com",
                check_in_date=today + timedelta(days=10),
                deposit_amount=Decimal("2000000"),
                status="PENDING",
                notes="Đăng ký lịch xem phòng trực tiếp vào 10:00 sáng Thứ 7 tuần này.",
            ))
        db.flush()

        # =========================================================
        # 14. DOCUMENT CHUNKS (RAG KNOWLEDGE BASE)
        # =========================================================
        if db.query(DocumentChunk).count() == 0:
            dummy_vec = [0.01] * 768
            rules_chunks = [
                ("Sổ tay Nội quy Tòa nhà Dwell", 1, "Quy định về thời gian sinh hoạt và an ninh trật tự: Cư dân và khách thuê vui lòng giữ trật tự chung sau 22:00 đêm đến 06:00 sáng hôm sau. Không bật nhạc công suất lớn, không tụ tập gây ồn ào ảnh hưởng đến các căn hộ lân cận."),
                ("Sổ tay Nội quy Tòa nhà Dwell", 2, "Quy định về việc nuôi thú cưng (Chó, Mèo): Tòa nhà cho phép nuôi thú cưng nhỏ dưới 10kg, phải tiêm phòng dại đầy đủ và có giấy chứng nhận. Khi ra khỏi căn hộ đến khu vực sảnh hoặc thang máy bắt buộc phải có dây xích, rọ mõm hoặc để trong túi chuyên dụng."),
                ("Sổ tay Nội quy Tòa nhà Dwell", 3, "Quy định an toàn phòng cháy chữa cháy (PCCC) và ban công: Nghiêm cấm đốt vàng mã, than củi hoặc hút thuốc tại hành lang và ban công. Ban công phải giữ thông thoáng, không cơi nới chuồng cọp bít kín lối thoát hiểm khẩn cấp."),
                ("Sổ tay Nội quy Tòa nhà Dwell", 4, "Quy định thanh toán tiền phòng và dịch vụ: Cước phí tiền phòng và dịch vụ điện nước được chốt số vào ngày cuối tháng và phát hành thông báo hóa đơn vào ngày 01 hàng tháng. Cư dân có trách nhiệm hoàn tất thanh toán trước ngày 10 hàng tháng qua quét mã VietQR Napas247 hoặc chuyển khoản."),
                ("Sổ tay Nội quy Tòa nhà Dwell", 5, "Quy định đăng ký tạm trú và người ở cùng: Mọi trường hợp thêm người ở cùng (Roommate) hoặc khách lưu trú qua đêm quá 03 ngày liên tục phải đăng ký khai báo với Ban Quản Lý và nộp bản chụp CCCD để thực hiện thủ tục đăng ký tạm trú theo quy định pháp luật."),
            ]
            for doc_name, idx, content in rules_chunks:
                db.add(DocumentChunk(
                    document_name=doc_name,
                    chunk_index=idx,
                    content=content,
                    embedding_vector=dummy_vec,
                ))
            db.flush()

        db.commit()
        print("=" * 60)
        print(" [OK] KHOI TAO DU LIEU MAU THANH CONG!")
        print(" - 4 Roles & 4 Tai khoan demo (admin, staff, accountant, tenant)")
        print(" - 3 Toa nha (Sunshine Diamond, Riverside, Sky Park)")
        print(" - 11 Can ho voi day du tien nghi, trang thai khac nhau")
        print(" - 4 Khach thue, nguoi o cung, lien he khan cap")
        print(" - Hop dong, tien coc, hoa don, phieu thu, cong no")
        print(" - Su co ky thuat, canh bao he thong, yeu cau dat lich")
        print(" - 5 Phan doan tri thuc RAG ve noi quy toa nha")
        print("=" * 60)

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Loi seed data: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_all()