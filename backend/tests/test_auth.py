import time

import pytest
from fastapi.testclient import TestClient
from jose import jwt
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from config import settings
from database import Base, get_db
from main import app

STUDENT = {
    "username": "minhan.11a1",
    "email": "An@Truong.edu.vn",
    "password": "matkhau123",
    "full_name": "Nguyễn Minh An",
    "role": "student",
    "student_class": "11A1",
}


@pytest.fixture()
def client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


def test_register_normalizes_email_and_rejects_case_insensitive_duplicates(client):
    response = client.post("/api/auth/register", json=STUDENT)
    assert response.status_code == 201
    assert response.json()["email"] == "an@truong.edu.vn"

    duplicate_username = client.post(
        "/api/auth/register", json={**STUDENT, "username": "MINHAN.11A1", "email": "x@example.com"}
    )
    assert duplicate_username.status_code == 409
    assert "Tên đăng nhập" in duplicate_username.json()["detail"]

    duplicate_email = client.post(
        "/api/auth/register", json={**STUDENT, "username": "other", "email": "AN@truong.edu.vn"}
    )
    assert duplicate_email.status_code == 409
    assert "Email" in duplicate_email.json()["detail"]


@pytest.mark.parametrize(
    "overrides",
    [
        {"username": "bad name!"},
        {"password": "abcdefgh"},
        {"password": "12345678"},
        {"student_class": "  "},
        {"full_name": ""},
    ],
)
def test_register_rejects_invalid_student_data(client, overrides):
    response = client.post("/api/auth/register", json={**STUDENT, **overrides})
    assert response.status_code == 422
    assert response.json()["errors"][0]["msg"]


def test_register_blocks_privileged_roles(client):
    response = client.post("/api/auth/register", json={**STUDENT, "role": "admin"})
    assert response.status_code == 403


def test_login_accepts_username_or_email_in_any_case(client):
    client.post("/api/auth/register", json=STUDENT)

    for identifier in ("minhan.11a1", " AN@TRUONG.edu.vn "):
        response = client.post("/api/auth/login", json={"username": identifier, "password": "matkhau123"})
        assert response.status_code == 200
        token = response.json()["access_token"]

    expires_in = jwt.get_unverified_claims(token)["exp"] - time.time()
    assert abs(expires_in / 60 - settings.access_token_expire_minutes) < 2

    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["username"] == "minhan.11a1"


def test_login_failures_share_one_message(client):
    client.post("/api/auth/register", json=STUDENT)

    wrong_password = client.post("/api/auth/login", json={"username": "minhan.11a1", "password": "sai-mat-khau"})
    unknown_user = client.post("/api/auth/login", json={"username": "nobody", "password": "sai-mat-khau"})
    assert wrong_password.status_code == unknown_user.status_code == 401
    assert wrong_password.json()["detail"] == unknown_user.json()["detail"]
