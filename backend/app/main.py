import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import inspect, text
from app.models.apartment import Apartment
from app.database import engine, Base
from app.routers.admin import router as admin_router
from app.models.role import Role
from app.models.user import User
from app.models.building import Building
from app.routers.auth import router as auth_router
from app.routers.building import router as building_router
from app.routers.apartment import router as apartment_router
from app.models.amenity import Amenity
from app.routers.amenity import router as amenity_router
from app.models.tenant import Tenant
from app.routers.tenant import router as tenant_router
from app.models.roommate import Roommate
from app.models.emergency_contact import EmergencyContact
from app.routers.roommate import router as roommate_router
from app.models.booking import Booking
from app.routers.booking import router as booking_router
from app.models.contract import Contract
from app.routers.contract import router as contract_router
from app.models.deposit import Deposit
from app.routers.deposit import router as deposit_router
from app.models.receivable import Receivable
from app.routers.receivable import router as receivable_router
from app.models.payment import Payment
from app.routers.payment import router as payment_router
from app.models.debt_ledger import DebtLedger
from app.routers.debt_ledger import router as debt_ledger_router
from app.routers.user import router as user_router
from app.models.system_alert import SystemAlert
from app.models.maintenance_request import MaintenanceRequest
from app.models.document_chunk import DocumentChunk
from app.models.audit_log import AuditLog
from app.routers.ai import router as ai_router
from app.routers.emergency_contact import (
    router as emergency_contact_router
)
from app.routers.system_alert import (
    router as system_alert_router
)
from app.routers.dashboard import (
    router as dashboard_router
)
from app.routers.maintenance_request import (
    router as maintenance_request_router
)
from app.tasks.cron_jobs import billing_scheduler_loop


@asynccontextmanager
async def lifespan(_app: FastAPI):
    scheduler_task = asyncio.create_task(
        billing_scheduler_loop()
    )
    try:
        yield
    finally:
        scheduler_task.cancel()
        try:
            await scheduler_task
        except asyncio.CancelledError:
            pass
Base.metadata.create_all(bind=engine)

contract_columns = {
    column["name"]
    for column in inspect(engine).get_columns("contracts")
}

if "rejection_reason" not in contract_columns:
    with engine.begin() as connection:
        connection.execute(
            text(
                "ALTER TABLE contracts "
                "ADD COLUMN rejection_reason VARCHAR(500)"
            )
        )


app = FastAPI(
    title="Hệ thống quản lý thuê căn hộ",
    version="1.0",
    lifespan=lifespan
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(
    _request: Request,
    _exc: Exception
):
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "Đã xảy ra lỗi hệ thống"
            }
        }
    )


API_PREFIX = "/api/v1"

app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(admin_router, prefix=API_PREFIX)
app.include_router(building_router, prefix=API_PREFIX)
app.include_router(apartment_router, prefix=API_PREFIX)
app.include_router(amenity_router, prefix=API_PREFIX)
app.include_router(tenant_router, prefix=API_PREFIX)
app.include_router(roommate_router, prefix=API_PREFIX)
app.include_router(emergency_contact_router, prefix=API_PREFIX)
app.include_router(booking_router, prefix=API_PREFIX)
app.include_router(contract_router, prefix=API_PREFIX)
app.include_router(deposit_router, prefix=API_PREFIX)
app.include_router(receivable_router, prefix=API_PREFIX)
app.include_router(payment_router, prefix=API_PREFIX)
app.include_router(debt_ledger_router, prefix=API_PREFIX)
app.include_router(user_router, prefix=API_PREFIX)
app.include_router(system_alert_router, prefix=API_PREFIX)
app.include_router(dashboard_router, prefix=API_PREFIX)
app.include_router(ai_router, prefix=API_PREFIX)
app.include_router(
    maintenance_request_router,
    prefix=API_PREFIX
)
@app.get("/")
def home():
    return {
        "message": "Backend đang hoạt động"
    }


@app.get("/test-db")
def test_database():

    with engine.connect() as connection:

        result = connection.execute(
            text("SELECT 'Kết nối PostgreSQL thành công'")
        )

        return {
            "message": result.scalar()
        }