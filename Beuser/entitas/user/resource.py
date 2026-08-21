import os
import jwt
import falcon

from pony.orm import db_session

from .services import register_user, login_user
from .model import User


class RegisterResource:

    def on_post(self, req, resp):
        try:
            data = req.get_media()

            title = data.get("title", "").strip()
            nama = data.get("nama", "").strip()
            noHp = data.get("noHp", "").strip()
            email = data.get("email", "").strip()
            tanggalLahir = data.get("tanggalLahir", "").strip()
            password = data.get("password", "").strip()
            roles = data.get("roles", "Member").strip()

            if not title:
                resp.status = falcon.HTTP_400
                resp.media = {
                    "success": False,
                    "message": "Title wajib diisi"
                }
                return

            if not nama:
                resp.status = falcon.HTTP_400
                resp.media = {
                    "success": False,
                    "message": "Nama wajib diisi"
                }
                return

            if not noHp:
                resp.status = falcon.HTTP_400
                resp.media = {
                    "success": False,
                    "message": "Nomor HP wajib diisi"
                }
                return

            if not email:
                resp.status = falcon.HTTP_400
                resp.media = {
                    "success": False,
                    "message": "Email wajib diisi"
                }
                return

            if not tanggalLahir:
                resp.status = falcon.HTTP_400
                resp.media = {
                    "success": False,
                    "message": "Tanggal lahir wajib diisi"
                }
                return

            if not password:
                resp.status = falcon.HTTP_400
                resp.media = {
                    "success": False,
                    "message": "Password wajib diisi"
                }
                return

            if len(password) < 6:
                resp.status = falcon.HTTP_400
                resp.media = {
                    "success": False,
                    "message": "Password minimal 6 karakter"
                }
                return

            result = register_user(
                title=title,
                nama=nama,
                noHp=noHp,
                email=email,
                tanggalLahir=tanggalLahir,
                password=password,
                roles=roles
            )

            if result is None:
                resp.status = falcon.HTTP_409
                resp.media = {
                    "success": False,
                    "message": "Email sudah terdaftar"
                }
                return

            resp.status = falcon.HTTP_201
            resp.media = {
                "success": True,
                "message": "Registrasi berhasil",
                "user": result
            }

        except Exception as e:
            resp.status = falcon.HTTP_500
            resp.media = {
                "success": False,
                "message": "Terjadi kesalahan pada server",
                "error": str(e)
            }


class LoginResource:

    def on_post(self, req, resp):

        try:

            data = req.get_media()

            email = data.get(
                "email",
                ""
            ).strip()

            password = data.get(
                "password",
                ""
            )

            remember_me = data.get(
                "rememberMe",
                False
            )

            if isinstance(
                remember_me,
                str
            ):
                remember_me = (
                    remember_me.lower()
                    == "true"
                )

            if not email:

                resp.status = falcon.HTTP_400

                resp.media = {
                    "success": False,
                    "message": "Email wajib diisi"
                }

                return

            if not password:

                resp.status = falcon.HTTP_400

                resp.media = {
                    "success": False,
                    "message": "Password wajib diisi"
                }

                return

            result = login_user(
                email=email,
                password=password,
                remember_me=remember_me
            )

            if result is None:

                resp.status = falcon.HTTP_401

                resp.media = {
                    "success": False,
                    "message": "Email atau password salah"
                }

                return

            resp.status = falcon.HTTP_200

            resp.media = {
                "success": True,
                "message": "Login berhasil",
                "token": result["token"],
                "user": result["user"]
            }

        except Exception as e:

            resp.status = falcon.HTTP_500

            resp.media = {
                "success": False,
                "message": "Terjadi kesalahan pada server",
                "error": str(e)
            }


class ProfileResource:

    @db_session
    def on_get(self, req, resp):

        try:

            auth_header = req.get_header(
                "Authorization"
            )

            if not auth_header:
                resp.status = falcon.HTTP_401
                resp.media = {
                    "success": False,
                    "message": "Token tidak ditemukan"
                }
                return

            if auth_header.startswith("Bearer "):
                token = auth_header[7:]

            elif auth_header.startswith("jwt "):
                token = auth_header[4:]

            else:
                resp.status = falcon.HTTP_401
                resp.media = {
                    "success": False,
                    "message": "Format token tidak valid"
                }
                return

            secret_key = os.getenv(
                "JWT_SECRET",
                "secret"
            )

            payload = jwt.decode(
                token,
                secret_key,
                algorithms=["HS256"]
            )

            user_id = payload.get("id")

            if not user_id:
                resp.status = falcon.HTTP_401
                resp.media = {
                    "success": False,
                    "message": "ID user tidak ditemukan"
                }
                return

            user = User.get(
                id_user=user_id
            )

            if not user:
                resp.status = falcon.HTTP_404
                resp.media = {
                    "success": False,
                    "message": "User tidak ditemukan"
                }
                return

            resp.status = falcon.HTTP_200

            resp.media = {
                "success": True,
                "user": {
                    "id_user": user.id_user,
                    "title": user.title,
                    "nama": user.nama,
                    "noHp": user.noHp,
                    "email": user.email,
                    "tanggalLahir": user.tanggalLahir,
                    "roles": user.roles,
                    "status": user.status,
                    "profile_photo": user.profile_photo
                }
            }

        except jwt.ExpiredSignatureError:

            resp.status = falcon.HTTP_401

            resp.media = {
                "success": False,
                "message": "Token sudah expired"
            }

        except jwt.InvalidTokenError:

            resp.status = falcon.HTTP_401

            resp.media = {
                "success": False,
                "message": "Token tidak valid"
            }

        except Exception as e:

            resp.status = falcon.HTTP_500

            resp.media = {
                "success": False,
                "message": "Terjadi kesalahan pada server",
                "error": str(e)
            }