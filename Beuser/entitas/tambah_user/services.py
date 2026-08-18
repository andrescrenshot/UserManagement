from pony.orm import db_session, select

from .model import TambahUser


VALID_STATUS = {"active", "nonaktif"}


def user_to_dict(user):
    return {
        "id": user.id,
        "title": user.title,
        "nama": user.nama,
        "noHp": user.noHp,
        "email": user.email,
        "tanggalLahir": user.tanggalLahir,
        "roles": user.roles,
        "status": user.status,
    }


@db_session
def create_user(data):
    email = data["email"].strip().lower()
    no_hp = data["noHp"].strip()

    # Cek hanya tabel TambahUser. Tidak pernah menyentuh User/Login.
    if TambahUser.get(email=email):
        raise ValueError("Email sudah terdaftar di Dashboard")

    if TambahUser.get(noHp=no_hp):
        raise ValueError("Nomor HP sudah terdaftar di Dashboard")

    user = TambahUser(
        title=data["title"],
        nama=data["nama"].strip(),
        noHp=no_hp,
        email=email,
        tanggalLahir=data["tanggalLahir"].strip(),
        roles=data["roles"].strip(),
        status="active",
    )

    return user_to_dict(user)


@db_session
def get_users():
    users = select(user for user in TambahUser)[:]
    users.sort(key=lambda user: user.id)
    return [user_to_dict(user) for user in users]


@db_session
def get_user(user_id):
    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        return None

    user = TambahUser.get(id=user_id)
    return user_to_dict(user) if user else None


@db_session
def update_user(user_id, data):
    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        return None

    user = TambahUser.get(id=user_id)
    if not user:
        return None

    email = data["email"].strip().lower()
    no_hp = data["noHp"].strip()

    duplicate_email = TambahUser.get(email=email)
    if duplicate_email and duplicate_email.id != user.id:
        raise ValueError("Email sudah digunakan user Dashboard lain")

    duplicate_hp = TambahUser.get(noHp=no_hp)
    if duplicate_hp and duplicate_hp.id != user.id:
        raise ValueError("Nomor HP sudah digunakan user Dashboard lain")

    status = data.get("status", user.status)
    if status not in VALID_STATUS:
        status = user.status

    user.title = data["title"]
    user.nama = data["nama"].strip()
    user.noHp = no_hp
    user.email = email
    user.tanggalLahir = data["tanggalLahir"].strip()
    user.roles = data["roles"].strip()
    user.status = status

    return user_to_dict(user)


@db_session
def delete_user(user_id):
    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        return False

    user = TambahUser.get(id=user_id)
    if not user:
        return False

    user.delete()
    return True
