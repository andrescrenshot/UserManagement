from pony.orm import PrimaryKey, Required
from db import db


class TambahUser(db.Entity):
    """Model khusus data user Dashboard.

    TIDAK berhubungan dengan entitas User yang dipakai untuk Login.
    """
    id = PrimaryKey(int, auto=True)
    title = Required(str, 2)
    nama = Required(str, 100)
    noHp = Required(str, 30, unique=True)
    email = Required(str, 100, unique=True)
    tanggalLahir = Required(str, 20)
    roles = Required(str, 30)
    status = Required(str, 20, default="active")
