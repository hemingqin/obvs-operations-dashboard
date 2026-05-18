from sqlalchemy.orm import Session

from models import Donation
from schemas import DonationCreate


def list_donations(db: Session, limit: int, offset: int) -> list[Donation]:
    return (
        db.query(Donation)
        .order_by(Donation.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def create_donation(db: Session, payload: DonationCreate) -> Donation:
    donation = Donation(
        donor_name=payload.donor_name,
        amount=payload.amount,
    )
    db.add(donation)
    db.commit()
    db.refresh(donation)
    return donation


def get_donation_by_id(db: Session, donation_id: int) -> Donation | None:
    return db.get(Donation, donation_id)


def delete_donation(db: Session, donation: Donation) -> None:
    db.delete(donation)
    db.commit()
