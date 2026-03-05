from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from orm_models import Booking
from models import BookingRequest, BookingResponse

router = APIRouter(prefix="/bookings", tags=["Bookings"])


# POST /api/bookings — create a booking
@router.post(
    "",
    response_model=BookingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a repair booking",
)
def create_booking(
    payload: BookingRequest,
    db: Session = Depends(get_db),
):
    record = Booking(
        name=payload.name,
        phone=payload.phone,
        problem_description=payload.problem_description,
    )
    try:
        db.add(record)
        db.commit()
        db.refresh(record)
        return record
    except Exception as exc:
        db.rollback()
        print(f"[ERROR] create_booking: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save booking. Try again",
        )


# GET /api/bookings — list all bookings
@router.get(
    "",
    response_model=List[BookingResponse],
    summary="Get all bookings (admin view)",
)
def list_bookings(
    limit:  int = Query(default=100, ge=1, le=500, description="Сколько вернуть"),
    offset: int = Query(default=0,   ge=0,          description="Сколько пропустить"),
    search: str = Query(default="",                  description="Поиск по имени / телефону"),
    db: Session = Depends(get_db),
):
    query = db.query(Booking)

    if search.strip():
        pattern = f"%{search.strip()}%"
        query = query.filter(
            Booking.name.ilike(pattern) | Booking.phone.ilike(pattern)
        )

    return (
        query
        .order_by(Booking.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


# GET /api/bookings/{id} — single booking
@router.get(
    "/{booking_id}",
    response_model=BookingResponse,
    summary="Get a booking by ID",
)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
):
    record = db.query(Booking).filter(Booking.id == booking_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Booking #{booking_id} not found",
        )
    return record