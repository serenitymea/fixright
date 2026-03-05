import re
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

_US_PHONE_RE = re.compile(
    r"^(\+1[\s\-.]?)?(\(?\d{3}\)?[\s\-.]?)(\d{3}[\s\-.]?\d{4})$"
)


class BookingRequest(BaseModel):
    """request body for POST /api/bookings"""

    name: str = Field(..., min_length=2, max_length=120, examples=["Jane Smith"])
    phone: str = Field(..., examples=["(555) 867-5309"])
    problem_description: str = Field(..., min_length=10, max_length=2000)

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("name cannot be empty")
        return stripped

    @field_validator("phone")
    @classmethod
    def phone_valid_us(cls, v: str) -> str:
        stripped = v.strip()
        if not _US_PHONE_RE.match(stripped):
            raise ValueError("enter a valid US phone number")
        return stripped

    @field_validator("problem_description")
    @classmethod
    def problem_not_blank(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("description cannot be empty")
        return stripped


class BookingResponse(BaseModel):
    """response returned after booking is created"""
    
    id: int
    name: str
    phone: str
    problem_description: str
    created_at: datetime

    class Config:
        from_attributes = True