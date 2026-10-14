import sys
from datetime import datetime
from decimal import Decimal

sys.stdout.reconfigure(encoding='utf-8')

from app.database import SessionLocal
from app.models.apartment import Apartment
from app.models.maintenance_request import MaintenanceRequest
from app.models.contract import Contract
from app.models.booking import Booking

def sync_complete_and_exit_maintenance():
    db = SessionLocal()
    try:
        print("=== 1. MARK ALL MAINTENANCE REQUESTS AS COMPLETED ===")
        all_reqs = db.query(MaintenanceRequest).all()
        now = datetime.now()
        for r in all_reqs:
            r.status = "COMPLETED"
            if not r.resolved_at:
                r.resolved_at = now
            if not r.repair_cost or r.repair_cost == 0:
                # Assign a standard completed maintenance cost (e.g. 120,000đ - 180,000đ)
                costs = [120000, 150000, 180000, 200000, 80000]
                r.repair_cost = Decimal(str(costs[r.id % len(costs)]))
            if not r.assigned_staff_id:
                r.assigned_staff_id = 2  # Giao kỹ thuật viên tòa nhà

        db.commit()
        print(f"Updated {len(all_reqs)} maintenance requests to COMPLETED.")

        print("\n=== 2. EXIT MAINTENANCE FOR ALL ROOMS & SYNCHRONIZE REAL STATUS ===")
        # Get active contracts
        active_contracts = db.query(Contract).filter(Contract.status == "ACTIVE").all()
        active_apt_ids = {c.apartment_id for c in active_contracts}

        # Get confirmed bookings
        confirmed_bookings = db.query(Booking).filter(Booking.status == "CONFIRMED").all()
        confirmed_apt_ids = {b.apartment_id for b in confirmed_bookings}

        all_apartments = db.query(Apartment).order_by(Apartment.floor, Apartment.room_number).all()

        occupied_count = 0
        reserved_count = 0
        available_count = 0
        maintenance_count = 0

        for apt in all_apartments:
            old_status = apt.status

            if apt.id in active_apt_ids:
                apt.status = "OCCUPIED"
                occupied_count += 1
            elif apt.id in confirmed_apt_ids:
                apt.status = "RESERVED"
                reserved_count += 1
            else:
                apt.status = "AVAILABLE"
                available_count += 1

            if apt.status == "MAINTENANCE":
                maintenance_count += 1

            if old_status != apt.status:
                print(f"Căn {apt.room_number} (Tầng {apt.floor}): {old_status} -> {apt.status}")

        db.commit()

        print("\n=== 3. SYNCHRONIZATION SUMMARY ===")
        print(f"Tổng số căn hộ: {len(all_apartments)}")
        print(f"- Đang thuê (OCCUPIED): {occupied_count} căn")
        print(f"- Đã giữ chỗ (RESERVED): {reserved_count} căn")
        print(f"- Còn trống (AVAILABLE): {available_count} căn")
        print(f"- Đang bảo trì (MAINTENANCE): {maintenance_count} căn (ĐÃ THOÁT HOÀN TOÀN)")

        print("\n=== 4. VERIFY MAINTENANCE TICKETS ===")
        for r in db.query(MaintenanceRequest).order_by(MaintenanceRequest.id).all():
            print(f"Phiếu #{r.id} - Căn {r.room_number}: {r.status} - Chi phí: {r.repair_cost:,.0f} đ - {r.issue_description[:35]}...")

    except Exception as e:
        db.rollback()
        print(f"Error during execution: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    sync_complete_and_exit_maintenance()
