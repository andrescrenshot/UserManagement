import bcrypt
import jwt
import os

from pony.orm import db_session

from .model import User


JWT_SECRET = os.environ.get(
    "JWT_SECRET",
    "user-management-secret-2026"
)

JWT_ALGORITHM = "HS256"


def user_to_dict(user):
    return {
        "id": user.id_user,
        "title": user.title,
        "nama": user.nama,
        "noHp": user.noHp,
        "email": user.email,
        "tanggalLahir": user.tanggalLahir,
        "roles": user.roles,
        "status": user.status
    }


def generate_token(user):
    payload = {
        "id": user.id_user,
        "email": user.email,
        "roles": user.roles
    }

    token = jwt.encode(
        payload,
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )

    return token


@db_session
def register_user(
    title,
    nama,
    noHp,
    email,
    tanggalLahir,
    password,
    roles="Member"
):
    email = email.strip().lower()

    existing_user = User.get(email=email)

    if existing_user:
        return None

    if title not in ["Tn", "Ny", "Nn"]:
        return None

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    user = User(
        title=title,
        nama=nama,
        noHp=noHp,
        email=email,
        tanggalLahir=tanggalLahir,
        password=hashed_password,
        roles=roles,
        status="active"
    )

    return user_to_dict(user)


@db_session
def login_user(email, password):
    email = email.strip().lower()

    user = User.get(email=email)

    if not user:
        return None

    if user.status != "active":
        return None

    password_valid = bcrypt.checkpw(
        password.encode("utf-8"),
        user.password.encode("utf-8")
    )

    if not password_valid:
        return None

    user_data = user_to_dict(user)

    token = generate_token(user)

    return {
        "token": token,
        "user": user_data
    }