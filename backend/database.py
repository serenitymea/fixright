import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from orm_models import Booking
from base import Base

# build DB URL
def _build_url() -> str:
    host     = os.environ.get("DB_HOST", "localhost")
    port     = os.environ.get("DB_PORT", "5432")
    name     = os.environ.get("DB_NAME")
    user     = os.environ.get("DB_USER")
    password = os.environ.get("DB_PASSWORD")

    missing = [k for k, v in {"DB_NAME": name, "DB_USER": user, "DB_PASSWORD": password}.items() if not v]
    if missing:
        raise RuntimeError(f"Missing env vars: {', '.join(missing)}")

    return f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{name}"

#Engine
engine = create_engine(
    _build_url(),
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    echo=False,
)

#session factory
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


# create tables on startup
def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    print("[DB] Schema initialized")

def get_db():
    """
    Opens a DB session per request,
    closes it automatically
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()