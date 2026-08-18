import bcrypt
from pony.orm import db_session

from .model import User


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

    return user_to_dict(user)