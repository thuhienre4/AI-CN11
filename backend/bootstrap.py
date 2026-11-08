"""First administrator for hosts where running scripts/create_admin.py is awkward (Railway).

Set ENGINE_LAB_BOOTSTRAP_ADMIN_USERNAME, _EMAIL and _PASSWORD. At startup, and only while no administrator
exists, the account is created, or an existing account with that username is promoted if the password matches
(so someone who registered that name first cannot gain the role). Remove the password variable afterwards.
"""
import logging

from auth import ACCOUNT_VERIFIED, hash_password, verify_password
from config import settings
from database import SessionLocal
from models import User

logger = logging.getLogger("enginelab")


def ensure_bootstrap_admin(session_factory=SessionLocal, config=settings) -> str:
    """Returns what happened: 'skipped', 'exists', 'created', 'promoted' or 'refused'."""
    username = (config.bootstrap_admin_username or "").strip()
    email = (config.bootstrap_admin_email or "").strip()
    password = config.bootstrap_admin_password or ""
    if not (username and email and password):
        return "skipped"
    if len(password) < 8:
        logger.warning("Bootstrap admin not created: the password must have at least 8 characters.")
        return "refused"

    with session_factory() as db:
        if db.query(User).filter(User.role == "admin").first():
            return "exists"
        user = db.query(User).filter(User.username == username).first()
        if user is None:
            db.add(User(username=username, email=email, password_hash=hash_password(password),
                        role="admin", account_status=ACCOUNT_VERIFIED, full_name="Quản trị viên"))
            outcome = "created"
        elif verify_password(password, user.password_hash):
            user.role = "admin"
            user.account_status = ACCOUNT_VERIFIED
            outcome = "promoted"
        else:
            logger.warning("Bootstrap admin refused: %s exists and the password does not match.", username)
            return "refused"
        db.commit()
    logger.warning("Bootstrap admin %s: %s. Remove ENGINE_LAB_BOOTSTRAP_ADMIN_PASSWORD now.", outcome, username)
    return outcome
