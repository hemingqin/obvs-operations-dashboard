"""
Seeds the database with several weeks of realistic, cross-referenced
Oak Bay Volunteer Services activity, replacing the sparse test rows left
over from development.

Relationship model (why the tables are populated in this order):

  donations         -- independent events (a donor gives money)
  service_requests   -- independent events (a client asks for help),
                        assigned to names drawn from VOLUNTEERS below
  notifications      -- DERIVED from the two tables above, plus a
                        handful of narrative-only events (onboarding,
                        reminders, system maintenance) that don't have
                        a dedicated backend trigger yet. Each donation-
                        or request-shaped notification's `created_at`
                        is pinned to the event it describes, so the
                        inbox timeline matches the ledger/queue timelines.

VOLUNTEERS is also the source of truth for `frontend/src/lib/mockData.js`'s
`volunteerDirectory` -- the same names are used on both sides so a name
searched in one module (e.g. Donations, Service Requests) is recognizable
in another (Volunteers, Notifications), per the "one connected system"
requirement. Run with: docker compose exec backend python seed_demo_data.py
"""

import random
from datetime import datetime, timedelta

from db import SessionLocal, init_db
from models import Donation, Notification, ServiceRequest

random.seed(20260716)  # deterministic across re-runs

NOW = datetime.utcnow()


def days_ago(n, hour=9, minute=0):
    return (NOW - timedelta(days=n)).replace(hour=hour, minute=minute, second=0, microsecond=0)


# ---------------------------------------------------------------------------
# Volunteers referenced by service_requests.assignee_name (kept in sync with
# frontend/src/lib/mockData.js -> volunteerDirectory).
# ---------------------------------------------------------------------------
VOLUNTEERS_BY_SKILL = {
    "Pantry delivery": ["Priya Anand", "Sofia Reyes", "Natasha Petrov", "Emily Tran"],
    "Transportation": ["Jordan Chen", "Connor Campbell", "Liam Fischer", "Jasdeep Sidhu"],
    "Wellness check-in": ["Nia Patel", "Grace Okafor", "Fatima Al-Rashid", "Sarah Johnson"],
    "Meal prep support": ["Marcus Lee", "David Cho"],
    "Admin support": ["Elena Volkov", "Hannah Wright", "Aisha Khan"],
    "Event support": ["Owen Brooks", "Ryan MacDonald", "Carlos Mendoza"],
}

# ---------------------------------------------------------------------------
# Donations: (donor_name, amount, days_ago) -- repeats model recurring donors,
# "Anonymous" models anonymous gifts, the $5,000 gift models an unusually
# large one-off donation.
# ---------------------------------------------------------------------------
DONATIONS = [
    ("Mike Chen", 250.00, 55), ("Mike Chen", 250.00, 27), ("Mike Chen", 300.00, 3),
    ("Sarah Mitchell", 100.00, 49), ("Sarah Mitchell", 150.00, 14),
    ("David Nguyen", 75.00, 46),
    ("Priya Sharma", 500.00, 44),
    ("Aiden MacDonald", 50.00, 41),
    ("Fatima Hassan", 200.00, 38), ("Fatima Hassan", 200.00, 10),
    ("Connor Bailey", 40.00, 36),
    ("Grace Kim", 1200.00, 33),
    ("Liam O'Brien", 60.00, 31),
    ("Natasha Ivanova", 85.00, 29),
    ("Carlos Mendoza Sr.", 120.00, 26),
    ("Anonymous", 25.00, 25), ("Anonymous", 500.00, 12), ("Anonymous", 75.00, 4),
    ("Hannah Reyes", 90.00, 23),
    ("Marcus Webb", 150.00, 21), ("Marcus Webb", 175.00, 6),
    ("Choi Wing-Yan", 300.00, 19),
    ("Jaspreet Bhullar", 65.00, 17),
    ("Emily Wong", 110.00, 15),
    ("Noah Campbell", 5000.00, 9),
    ("Olivia Reid", 45.00, 5),
    ("Wei Zhang", 80.00, 20), ("Wei Zhang", 80.00, 2),
]

# ---------------------------------------------------------------------------
# Service requests: client_name, service_type, priority, status, days_ago,
# location (real Greater Victoria / Oak Bay neighbourhoods), assignee.
# "Unassigned" for Open requests; Cancelled requests keep whoever was
# assigned before the cancellation to feel like real history.
# ---------------------------------------------------------------------------
LOCATIONS = ["Oak Bay", "Fairfield", "James Bay", "Esquimalt", "Saanich", "Fernwood", "Rockland", "Gordon Head"]

SERVICE_REQUESTS = [
    dict(client="Eleanor Whitfield", type="Wellness check-in", priority="High", status="Completed", days=52, assignee="Nia Patel"),
    dict(client="Robert Sinclair", type="Transportation", priority="Medium", status="Completed", days=50, assignee="Jordan Chen"),
    dict(client="Margaret Fong", type="Pantry delivery", priority="Low", status="Completed", days=47, assignee="Priya Anand"),
    dict(client="Harold Dubois", type="Wellness check-in", priority="Urgent", status="Completed", days=45, assignee="Grace Okafor"),
    dict(client="Linda Prasad", type="Meal prep support", priority="Medium", status="Completed", days=40, assignee="Marcus Lee"),
    dict(client="Walter Bergstrom", type="Transportation", priority="Medium", status="Completed", days=37, assignee="Connor Campbell"),
    dict(client="Doris Yamamoto", type="Pantry delivery", priority="Low", status="Cancelled", days=34, assignee="Sofia Reyes"),
    dict(client="George Okonkwo", type="Admin support", priority="Low", status="Completed", days=30, assignee="Hannah Wright"),
    dict(client="Betty Sinclair", type="Wellness check-in", priority="Medium", status="Completed", days=28, assignee="Fatima Al-Rashid"),
    dict(client="Frank Kowalski", type="Transportation", priority="High", status="In progress", days=24, assignee="Liam Fischer"),
    dict(client="Ruth Abernathy", type="Pantry delivery", priority="Medium", status="In progress", days=20, assignee="Natasha Petrov"),
    dict(client="Vincent Delacroix", type="Event support", priority="Low", status="Completed", days=18, assignee="Owen Brooks"),
    # Sarah Johnson's shift: originally hers, reassigned to Grace Okafor after
    # she marked herself unavailable -- see the matching "volunteer" notifications.
    dict(client="Agnes Littlebear", type="Wellness check-in", priority="Urgent", status="Assigned", days=6, assignee="Grace Okafor"),
    dict(client="Patricia Nakamura", type="Meal prep support", priority="Medium", status="Assigned", days=9, assignee="David Cho"),
    dict(client="Samuel Okafor", type="Transportation", priority="Medium", status="Assigned", days=7, assignee="Jasdeep Sidhu"),
    dict(client="Dorothy Chen", type="Pantry delivery", priority="High", status="Open", days=3, assignee=None),
    dict(client="Clarence Whitehorse", type="Wellness check-in", priority="High", status="Open", days=2, assignee=None),
    dict(client="Irene Kaminski", type="Admin support", priority="Low", status="Open", days=1, assignee=None),
    dict(client="Robert Sinclair", type="Pantry delivery", priority="Low", status="Open", days=0, assignee=None),
]

# Real volunteer login user (username "volunteer") -- gets a couple of
# requests genuinely assigned to their account so the self-service
# "My Requests" view has real data too.
REAL_VOLUNTEER_USER_ID = 3
REAL_VOLUNTEER_ASSIGNED_CLIENTS = {"Frank Kowalski", "Patricia Nakamura"}


def seed():
    init_db()
    db = SessionLocal()
    try:
        db.query(Notification).delete()
        db.query(ServiceRequest).delete()
        db.query(Donation).delete()
        db.commit()

        # --- Donations -----------------------------------------------------
        donation_rows = []
        for donor_name, amount, age in DONATIONS:
            donation = Donation(donor_name=donor_name, amount=amount, created_at=days_ago(age, 10, 15))
            db.add(donation)
            donation_rows.append(donation)
        db.commit()
        for donation in donation_rows:
            db.refresh(donation)

        # --- Service requests ------------------------------------------------
        request_rows = []
        for item in SERVICE_REQUESTS:
            assignee_name = item["assignee"] or "Unassigned"
            assignee_user_id = (
                REAL_VOLUNTEER_USER_ID if item["client"] in REAL_VOLUNTEER_ASSIGNED_CLIENTS else None
            )
            request = ServiceRequest(
                client_name=item["client"],
                service_type=item["type"],
                priority=item["priority"],
                status=item["status"],
                location=random.choice(LOCATIONS),
                assignee_user_id=assignee_user_id,
                assignee_name=assignee_name,
                preferred_date=days_ago(item["days"] - 1).strftime("%Y-%m-%d"),
                notes=f"{item['type']} requested for {item['client']}.",
                created_at=days_ago(item["days"], 11, 30),
            )
            db.add(request)
            request_rows.append((request, item))
        db.commit()
        for request, _ in request_rows:
            db.refresh(request)

        # --- Notifications: derived from donations --------------------------
        notifications = []

        # Only the most recent ~14 donations get a "created" notification --
        # older ones are treated as already-acknowledged history.
        for donation in sorted(donation_rows, key=lambda d: d.created_at)[-14:]:
            age_days = (NOW - donation.created_at).days
            notifications.append(
                Notification(
                    message=f"Donation {donation.id} created for {donation.donor_name}",
                    status="sent",
                    type="donation",
                    audience_role="operations",
                    is_read=age_days > 5,
                    created_at=donation.created_at + timedelta(minutes=2),
                )
            )

        # A refunded donation -- narrative event, not backed by a real refund
        # flow, referencing an actual seeded donation for continuity.
        refunded_donor, refunded_amount, refunded_age = DONATIONS[14]  # Carlos Mendoza Sr.
        notifications.append(
            Notification(
                message=f"Donation from {refunded_donor} for ${refunded_amount:.2f} was refunded at donor's request",
                status="sent",
                type="donation",
                audience_role="operations",
                is_read=True,
                created_at=days_ago(refunded_age - 2, 15, 0),
            )
        )

        # --- Notifications: derived from service requests --------------------
        for request, item in request_rows:
            created_notification = Notification(
                message=f"Service request {request.id} created for {request.client_name}",
                status="sent",
                type="request",
                audience_role="operations",
                is_read=item["days"] > 5,
                created_at=request.created_at + timedelta(minutes=5),
            )
            notifications.append(created_notification)

            if item["priority"] == "Urgent":
                notifications.append(
                    Notification(
                        message=f"Urgent: {item['type']} request created for {request.client_name}",
                        status="sent",
                        type="warning",
                        audience_role="operations",
                        is_read=item["days"] > 3,
                        created_at=request.created_at + timedelta(minutes=6),
                    )
                )

            if item["assignee"] and item["status"] in {"Assigned", "In progress", "Completed"}:
                assigned_to_real_user = request.assignee_user_id == REAL_VOLUNTEER_USER_ID
                # Matches the exact phrasing services/service_request_service.py uses
                # for a real assignee ("assigned to you"); named assignees are cosmetic
                # directory entries, so operations-facing notifications name them.
                assignment_message = (
                    f"Service request {request.id} assigned to you"
                    if assigned_to_real_user
                    else f"Service request {request.id} assigned to {item['assignee']}"
                )
                notifications.append(
                    Notification(
                        message=assignment_message,
                        status="sent",
                        type="request",
                        audience_role="volunteer" if assigned_to_real_user else "operations",
                        recipient_user_id=REAL_VOLUNTEER_USER_ID if assigned_to_real_user else None,
                        is_read=item["days"] > 4,
                        created_at=request.created_at + timedelta(hours=1),
                    )
                )

            if item["status"] == "Completed":
                notifications.append(
                    Notification(
                        message=f"Service request {request.id} for {request.client_name} marked complete",
                        status="sent",
                        type="request",
                        audience_role="operations",
                        is_read=True,
                        created_at=days_ago(item["days"] - 1, 16, 0),
                    )
                )

        # --- Sarah Johnson storyline: availability change -> reassignment ---
        sarah_shift = next(r for r, i in request_rows if i["client"] == "Agnes Littlebear")
        notifications.append(
            Notification(
                message="Sarah Johnson updated her availability to Unavailable this week",
                status="sent",
                type="volunteer",
                audience_role="operations",
                is_read=False,
                created_at=days_ago(6, 8, 45),
            )
        )
        notifications.append(
            Notification(
                message=(
                    f"Wellness check-in shift for {sarah_shift.client_name} reassigned "
                    "from Sarah Johnson to Grace Okafor"
                ),
                status="sent",
                type="volunteer",
                audience_role="operations",
                is_read=False,
                created_at=days_ago(6, 9, 5),
            )
        )

        # --- Remaining narrative-only notifications --------------------------
        notifications.extend(
            [
                Notification(
                    message="David Cho completed volunteer onboarding and background check",
                    status="sent",
                    type="volunteer",
                    audience_role="operations",
                    is_read=True,
                    created_at=days_ago(19, 14, 0),
                ),
                Notification(
                    message="Reminder: quarterly volunteer background checks are due this week",
                    status="sent",
                    type="system",
                    audience_role="operations",
                    is_read=True,
                    created_at=days_ago(13, 9, 0),
                ),
                Notification(
                    message="System maintenance notice: platform will be briefly unavailable Sunday 2-3am",
                    status="sent",
                    type="system",
                    audience_role="operations",
                    is_read=False,
                    created_at=days_ago(1, 17, 30),
                ),
            ]
        )

        for notification in notifications:
            db.add(notification)
        db.commit()

        print(
            f"Seeded {len(donation_rows)} donations, {len(request_rows)} service requests, "
            f"{len(notifications)} notifications."
        )
    finally:
        db.close()


if __name__ == "__main__":
    seed()
