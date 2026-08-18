from datetime import datetime

from flask_login import UserMixin

from pony.orm import Database, Optional, Required

db = Database()


class User(db.Entity, UserMixin):
    login = Required(str, unique=True)
    password = Required(str)
    last_login = Optional(datetime)
