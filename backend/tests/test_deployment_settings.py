"""Settings used when the backend runs on Railway: database URL, upload folder, proxy address, first admin."""
from pathlib import Path
from types import SimpleNamespace

import pytest
from starlette.requests import Request

import routes.auth as auth_routes
from auth import hash_password, verify_password
from bootstrap import ensure_bootstrap_admin
from config import Settings
from database import normalize_database_url
from models import User
from test_learning_workflow import api  # noqa: F401  (pytest fixture)


@pytest.mark.parametrize("url,expected", [
    ("postgres://u:p@host:5432/db", "postgresql+psycopg://u:p@host:5432/db"),
    ("postgresql://u:p@host/db", "postgresql+psycopg://u:p@host/db"),
    ("postgresql+psycopg://u:p@host/db", "postgresql+psycopg://u:p@host/db"),
    ("sqlite:////data/enginelab.db", "sqlite:////data/enginelab.db"),
])
def test_database_urls_from_hosts_use_the_installed_driver(url, expected):
    assert normalize_database_url(url) == expected


def test_upload_folder_can_live_on_a_volume(tmp_path):
    assert Settings(upload_dir=str(tmp_path)).uploads_root == tmp_path
    assert Settings(upload_dir=None).uploads_root == Path(__file__).resolve().parents[1] / "uploads"


def request_with(forwarded, peer="10.0.0.1"):
    headers = [(b"x-forwarded-for", forwarded.encode())] if forwarded is not None else []
    return Request({"type": "http", "headers": headers, "client": (peer, 1234)})


@pytest.mark.parametrize("hops,forwarded,expected", [
    (0, "1.2.3.4", "10.0.0.1"),                 # no proxy configured: the socket address
    (1, "203.0.113.9", "203.0.113.9"),          # Railway appended the client address
    (1, "6.6.6.6, 203.0.113.9", "203.0.113.9"),  # a forged first entry is ignored
    (1, None, "10.0.0.1"),                      # header missing: fall back to the socket
    (2, "198.51.100.7, 203.0.113.9", "198.51.100.7"),
])
def test_class_code_rate_limit_uses_the_address_the_proxy_saw(monkeypatch, hops, forwarded, expected):
    monkeypatch.setattr(auth_routes.settings, "trusted_proxy_hops", hops)
    assert auth_routes.client_address(request_with(forwarded)) == expected


def config(**values):
    base = dict(bootstrap_admin_username="admin_truong", bootstrap_admin_email="admin@truong.edu.vn",
                bootstrap_admin_password="MatKhau#2026")
    base.update(values)
    return SimpleNamespace(**base)


def test_first_admin_is_created_once_and_only_while_none_exists(api):
    _, Session, _, _ = api
    assert ensure_bootstrap_admin(Session, config(bootstrap_admin_password=None)) == "skipped"
    assert ensure_bootstrap_admin(Session, config(bootstrap_admin_password="short")) == "refused"
    assert ensure_bootstrap_admin(Session, config()) == "created"
    with Session() as db:
        admin = db.query(User).filter_by(username="admin_truong").one()
        assert admin.role == "admin" and admin.account_status == "verified"
        assert verify_password("MatKhau#2026", admin.password_hash)
    assert ensure_bootstrap_admin(Session, config(bootstrap_admin_username="admin_khac")) == "exists"


def test_an_existing_account_is_promoted_only_with_its_own_password(api):
    _, Session, _, _ = api
    with Session() as db:
        db.add(User(username="admin_truong", email="x@truong.edu.vn", password_hash=hash_password("matkhau-cua-nguoi-khac"), role="student"))
        db.commit()
    assert ensure_bootstrap_admin(Session, config()) == "refused"
    with Session() as db:
        assert db.query(User).filter_by(username="admin_truong").one().role == "student"
    with Session() as db:
        db.query(User).filter_by(username="admin_truong").one().password_hash = hash_password("MatKhau#2026")
        db.commit()
    assert ensure_bootstrap_admin(Session, config()) == "promoted"
