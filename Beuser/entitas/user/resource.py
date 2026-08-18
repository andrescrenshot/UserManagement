import json
import falcon

from .services import register_user, login_user


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

            email = data.get("email", "").strip()
            password = data.get("password", "")

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

            user = login_user(
                email=email,
                password=password
            )

            if user is None:
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
                "user": user
            }

        except Exception as e:
            resp.status = falcon.HTTP_500
            resp.media = {
                "success": False,
                "message": "Terjadi kesalahan pada server",
                "error": str(e)
            }