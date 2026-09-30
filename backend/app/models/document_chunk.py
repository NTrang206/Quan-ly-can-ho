from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime
)

from pgvector.sqlalchemy import Vector

from datetime import datetime

from app.database import Base


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    document_name = Column(
        String(100),
        nullable=False
    )

    chunk_index = Column(
        Integer,
        nullable=False
    )

    content = Column(
        Text,
        nullable=False
    )

    embedding_vector = Column(
        Vector(768),
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.now
    )