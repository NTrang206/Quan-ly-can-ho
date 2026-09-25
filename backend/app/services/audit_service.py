import json

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def record_audit(
    db: Session,
    action: str,
    entity_type: str,
    user_id: int | None = None,
    entity_id: int | None = None,
    details: dict | None = None
):
    db.add(
        AuditLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            details=json.dumps(
                details or {},
                ensure_ascii=False
            )
        )
    )
