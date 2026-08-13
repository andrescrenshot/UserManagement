import falcon
import jwt
from datetime import datetime, timedelta, timezone

import config

from .services import register_user, login_user


class RegisterResource:

    def on_post(self, req, resp):
        data = req.media

        title = data.get("title")
        nama = data.get("nama")
        noHp = data.get("noHp")
        email = data.get("email")
        tanggalLahir = data.get("tanggalLahir")
        password = data.get("password")
        roles = data.get("roles", "Member")

        if not title:
            raise falcon.HTTPBadRequest(
                title="Register gagal",
                description="Title wajib diisi"
            )

        if not nama:
            raise falcon.HTTPBadRequest(
                title="Register gagal",
                description="Nama wajib diisi"
            )

        if not noHp:
            raise falcon.HTTPBadRequest(
                title="Register gagal",
                description="Nomor HP wajib diisi"
            )

        if not email:
            raise falcon.HTTPBadRequest(
                title="Register gagal",
                description="Email wajib diisi"
            )

        if not tanggalLahir:
            raise falcon.HTTPBadRequest(
                title="Register gagal",
                description="Tanggal lahir wajib diisi"
            )

        if not password:
            raise falcon.HTTPBadRequest(
                title="Register gagal",
                description="Password wajib diisi"
            )

        if len(password) < 6:
            raise falcon.HTTPBadRequest(
                title="Register gagal",
                description="Password minimal 6 karakter"
            )

        user = register_user(
            title=title,
            nama=nama,
            noHp=noHp,
            email=email,
            tanggalLahir=tanggalLahir,
            password=password,
            roles=roles
        )

        if not user:
            raise falcon.HTTPConflict(
                title="Register gagal",
                description="Email sudah terdaftar"
            )

        resp.status = falcon.HTTP_201

        resp.media = {
            "success": True,
            "message": "Registrasi berhasil",
            "data": user
        }


class LoginResource:

    def on_post(self, req, resp):
        data = req.media

        email = data.get("email")
        password = data.get("password")

        if not email:
            raise falcon.HTTPBadRequest(
                title="Login gagal",
                description="Email wajib diisi"
            )

        if not password:
            raise falcon.HTTPBadRequest(
                title="Login gagal",
                description="Password wajib diisi"
            )

        user = login_user(
            email=email,
            password=password
        )

        if not user:
            raise falcon.HTTPUnauthorized(
                title="Login gagal",
                description="Email atau password salah"
            )

        payload = {
            "id": user["id"],
            "email": user["email"],
            "roles": user["roles"],
            "exp": datetime.now(timezone.utc) + timedelta(hours=8)
        }

        token = jwt.encode(
            payload,
            config.JWT_SECRET,
            algorithm="HS256"
        )

        resp.status = falcon.HTTP_200

        resp.media = {
            "success": True,
            "message": "Login berhasil",
            "token": token,
            "data": user
        }