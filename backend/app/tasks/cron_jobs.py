import asyncio
from datetime import date
from decimal import Decimal

from app.database import SessionLocal
from app.services.billing_service import generate_monthly_receivables
from app.services.alert_service import scan_alerts


async def billing_scheduler_loop():
    last_billing_month = None

    while True:
        today = date.today()
        billing_key = (today.year, today.month)

        if today.day == 1 and billing_key != last_billing_month:
            db = SessionLocal()
            try:
                generate_monthly_receivables(
                    today.month,
                    today.year,
                    Decimal("0"),
                    db
                )
                db.commit()
                last_billing_month = billing_key
            except Exception:
                db.rollback()
            finally:
                db.close()

        db = SessionLocal()
        try:
            scan_alerts(30, db)
            db.commit()
        except Exception:
            db.rollback()
        finally:
            db.close()

        await asyncio.sleep(3600)
