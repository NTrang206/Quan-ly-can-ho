import sys
import os
from decimal import Decimal
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, r'd:\Detai12_QLCH\backend')

# Import all models
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

# 29 distinct, high-quality, verified interior images
DISTINCT_IMAGES = [
    # Tầng 1: P101 -> P109
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80", # 1: P101
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80", # 2: P102
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80", # 3: P103
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop&q=80", # 4: P104
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80", # 5: P105
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80", # 6: P106
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80", # 7: P107
    "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&auto=format&fit=crop&q=80", # 8: P108
    "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&auto=format&fit=crop&q=80", # 9: P109

    # Tầng 2: P201 -> P209
    "https://images.unsplash.com/photo-1502005229762-ee1b2b8ab98f?w=800&auto=format&fit=crop&q=80", # 10: P201
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&auto=format&fit=crop&q=80", # 11: P202
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80", # 12: P203
    "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&auto=format&fit=crop&q=80", # 13: P204
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&auto=format&fit=crop&q=80", # 14: P205
    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop&q=80", # 15: P206
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop&q=80", # 16: P207
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80", # 17: P208
    "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&auto=format&fit=crop&q=80", # 18: P209

    # Tầng 3: P301 -> P309
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&auto=format&fit=crop&q=80", # 19: P301
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80", # 20: P302
    "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&auto=format&fit=crop&q=80", # 21: P303
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&auto=format&fit=crop&q=80", # 22: P304
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop&q=80", # 23: P305
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop&q=80", # 24: P306
    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&auto=format&fit=crop&q=80", # 25: P307
    "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&auto=format&fit=crop&q=80", # 26: P308
    "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&auto=format&fit=crop&q=80", # 27: P309

    # Tầng 4: P401 -> P402
    "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800&auto=format&fit=crop&q=80", # 28: P401
    "https://images.unsplash.com/photo-1615873968403-89e068629265?w=800&auto=format&fit=crop&q=80", # 29: P402
]

# Specification data for 29 apartments
SPECS = [
    # Tầng 1: P101 -> P109
    {"room": "P101", "floor": 1, "area": 55.0, "price": 11500000, "br": 1, "wc": 1},
    {"room": "P102", "floor": 1, "area": 70.0, "price": 14000000, "br": 2, "wc": 2},
    {"room": "P103", "floor": 1, "area": 58.0, "price": 12000000, "br": 1, "wc": 1},
    {"room": "P104", "floor": 1, "area": 85.0, "price": 17500000, "br": 2, "wc": 2},
    {"room": "P105", "floor": 1, "area": 60.0, "price": 13000000, "br": 1, "wc": 1},
    {"room": "P106", "floor": 1, "area": 95.0, "price": 21000000, "br": 3, "wc": 2},
    {"room": "P107", "floor": 1, "area": 65.0, "price": 13500000, "br": 2, "wc": 1},
    {"room": "P108", "floor": 1, "area": 80.0, "price": 16000000, "br": 2, "wc": 2},
    {"room": "P109", "floor": 1, "area": 110.0, "price": 25000000, "br": 3, "wc": 2},

    # Tầng 2: P201 -> P209
    {"room": "P201", "floor": 2, "area": 50.0, "price": 9500000, "br": 1, "wc": 1},
    {"room": "P202", "floor": 2, "area": 75.0, "price": 14500000, "br": 2, "wc": 2},
    {"room": "P203", "floor": 2, "area": 62.0, "price": 12500000, "br": 1, "wc": 1},
    {"room": "P204", "floor": 2, "area": 78.0, "price": 15500000, "br": 2, "wc": 2},
    {"room": "P205", "floor": 2, "area": 88.0, "price": 18000000, "br": 2, "wc": 2},
    {"room": "P206", "floor": 2, "area": 52.0, "price": 10500000, "br": 1, "wc": 1},
    {"room": "P207", "floor": 2, "area": 92.0, "price": 19500000, "br": 3, "wc": 2},
    {"room": "P208", "floor": 2, "area": 72.0, "price": 14800000, "br": 2, "wc": 1},
    {"room": "P209", "floor": 2, "area": 68.0, "price": 13800000, "br": 2, "wc": 1},

    # Tầng 3: P301 -> P309
    {"room": "P301", "floor": 3, "area": 105.0, "price": 22500000, "br": 3, "wc": 2},
    {"room": "P302", "floor": 3, "area": 56.0, "price": 11000000, "br": 1, "wc": 1},
    {"room": "P303", "floor": 3, "area": 82.0, "price": 16500000, "br": 2, "wc": 2},
    {"room": "P304", "floor": 3, "area": 50.0, "price": 10000000, "br": 1, "wc": 1},
    {"room": "P305", "floor": 3, "area": 65.0, "price": 13000000, "br": 2, "wc": 1},
    {"room": "P306", "floor": 3, "area": 70.0, "price": 14000000, "br": 2, "wc": 2},
    {"room": "P307", "floor": 3, "area": 60.0, "price": 12000000, "br": 1, "wc": 1},
    {"room": "P308", "floor": 3, "area": 85.0, "price": 17000000, "br": 2, "wc": 2},
    {"room": "P309", "floor": 3, "area": 90.0, "price": 19000000, "br": 3, "wc": 2},

    # Tầng 4: P401 -> P402
    {"room": "P401", "floor": 4, "area": 75.0, "price": 15000000, "br": 2, "wc": 2},
    {"room": "P402", "floor": 4, "area": 120.0, "price": 26000000, "br": 3, "wc": 3},
]

db = SessionLocal()

apts = db.query(Apartment).order_by(Apartment.id).all()
print(f"Updating {len(apts)} apartments in database...")

for idx, a in enumerate(apts):
    if idx >= len(SPECS):
        break
    spec = SPECS[idx]
    img = DISTINCT_IMAGES[idx]
    
    old_room = a.room_number
    a.room_number = spec["room"]
    a.floor = spec["floor"]
    a.area_sqm = Decimal(str(spec["area"]))
    a.price = Decimal(str(spec["price"]))
    a.deposit_default = Decimal(str(spec["price"] * 2))
    a.bedrooms = spec["br"]
    a.bathrooms = spec["wc"]
    a.image_url = img
    
    # Ensure description is clean and realistic
    a.description = f"Căn hộ {spec['room']} tại tầng {spec['floor']}, diện tích {spec['area']} m², thiết kế hiện đại gồm {spec['br']} phòng ngủ, {spec['wc']} phòng vệ sinh, ban công thoáng mát và trang bị đầy đủ nội thất cao cấp Dwell Living."
    
    # If room had negative or erroneous status, make it available
    if a.status in ("MAINTENANCE",) and idx >= 21:
        a.status = "AVAILABLE"
        
    print(f"ID {a.id:02d}: {old_room} -> {a.room_number} (Tầng {a.floor}, {a.area_sqm}m², {a.price:,.0f}đ/th) | img={img[:45]}...")

db.commit()
print("\n[SUCCESS] Successfully updated all 29 apartments in database!")
db.close()
