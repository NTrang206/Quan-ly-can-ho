import sys
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, r'd:\Detai12_QLCH\backend')

# Import all models as in main.py
import app.models.role
import app.models.user
import app.models.building
import app.models.apartment
import app.models.amenity
import app.models.tenant
import app.models.roommate
import app.models.emergency_contact
import app.models.booking
import app.models.contract
import app.models.deposit
import app.models.receivable
import app.models.payment
import app.models.debt_ledger
import app.models.system_alert
import app.models.maintenance_request
import app.models.document_chunk
import app.models.audit_log

from app.database import SessionLocal
from app.models.apartment import Apartment
from app.models.building import Building

db = SessionLocal()
buildings = db.query(Building).order_by(Building.id).all()
print(f"Buildings count: {len(buildings)}")
for b in buildings:
    print(f"  Building {b.id}: {b.name}, {b.address}")

apts = db.query(Apartment).order_by(Apartment.id).all()
print(f"\nTotal Apartments in DB: {len(apts)}")
for a in apts:
    print(f"  ID {a.id:02d}: Room={a.room_number:<12} Floor={a.floor} Area={a.area_sqm} Price={a.price} Status={a.status} BuildingID={a.building_id}")
    print(f"      Image: {a.image_url}")
