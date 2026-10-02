from app.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()
tables = [
    'deposits',
    'contracts',
    'receivables',
    'payments',
    'maintenance_requests',
    'bookings',
    'tenants',
    'apartments',
    'users',
    'roommates',
    'emergency_contacts',
    'audit_logs',
    'system_alerts',
    'debt_ledger',
    'amenities'
]

print("=== CHECKING AND SYNCHRONIZING SEQUENCES ===")
for table in tables:
    try:
        max_id = db.execute(text(f"SELECT COALESCE(MAX(id), 0) FROM {table}")).scalar()
        seq = db.execute(text(f"SELECT pg_get_serial_sequence('{table}', 'id')")).scalar()
        if seq:
            last_val_info = db.execute(text(f"SELECT last_value, is_called FROM {seq}")).fetchone()
            print(f"Table '{table}': max_id={max_id}, sequence={seq}, current_val={last_val_info}")
            if max_id > 0:
                res = db.execute(text(f"SELECT setval('{seq}', {max_id}, true)")).scalar()
                print(f"  -> Reset {seq} to {res}")
            else:
                res = db.execute(text(f"SELECT setval('{seq}', 1, false)")).scalar()
                print(f"  -> Reset {seq} to 1 (not called)")
        else:
            print(f"Table '{table}': no sequence found")
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Table '{table}' error: {e}")

db.commit()
print("=== DONE ===")
