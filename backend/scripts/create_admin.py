"""Create the first administrator, or promote an existing account.

    python scripts/create_admin.py --username admin --email admin@truong.edu.vn

The password is asked for interactively so that it never reaches the shell history.
"""
import argparse
import getpass
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from auth import ACCOUNT_VERIFIED, hash_password  # noqa: E402
from database import Base, SessionLocal, engine  # noqa: E402
from migrations import run_startup_migrations  # noqa: E402
from models import User  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--username", required=True)
    parser.add_argument("--email", help="required when the account does not exist yet")
    args = parser.parse_args()

    Base.metadata.create_all(bind=engine)
    run_startup_migrations(engine)
    with SessionLocal() as db:
        user = db.query(User).filter(User.username == args.username).first()
        if user is None:
            if not args.email:
                sys.exit("Tài khoản chưa tồn tại: cần thêm --email.")
            password = getpass.getpass("Mật khẩu (ít nhất 8 kí tự): ")
            if len(password) < 8:
                sys.exit("Mật khẩu quá ngắn.")
            user = User(username=args.username, email=args.email, password_hash=hash_password(password))
            db.add(user)
        user.role = "admin"
        user.account_status = ACCOUNT_VERIFIED
        db.commit()
    print(f"{args.username} đã là quản trị viên.")


if __name__ == "__main__":
    main()
