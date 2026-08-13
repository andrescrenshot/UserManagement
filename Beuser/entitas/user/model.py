from pony.orm import PrimaryKey, Required
from db import db


class User(db.Entity):
    id_user = PrimaryKey(int, auto=True)
    title = Required(str, 10)
    nama = Required(str, 100)
    noHp = Required(str, 30)
    email = Required(str, 100, unique=True)
    tanggalLahir = Required(str, 20)
    password = Required(str, 255)
    roles = Required(str, 30, default="Member")
    status = Required(str, 30, default="active")