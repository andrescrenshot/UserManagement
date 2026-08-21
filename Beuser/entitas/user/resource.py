import os
import uuid
import jwt
import falcon

from pony.orm import db_session

from .services import (
    register_user,
    login_user,
    get_user_by_id,
    update_profile_photo
)


JWT_SECRET = os.environ.get(
    "JWT_SECRET",
    "user-management-secret-key"
)

JWT_ALGORITHM = "HS256"


def get_token_from_request(req):

    auth_header = req.get_header(
        "Authorization"
    )

    if not auth_header:
        return None

    if auth_header.startswith(
        "Bearer "
    ):
        return auth_header[7:].strip()

    if auth_header.startswith(
        "jwt "
    ):
        return auth_header[4:].strip()

    return None


def get_current_user_id(req):

    token = get_token_from_request(
        req
    )

    if not token:
        raise ValueError(
            "Token tidak ditemukan"
        )

    payload = jwt.decode(
        token,
        JWT_SECRET,
        algorithms=[
            JWT_ALGORITHM
        ]
    )

    user_id = payload.get(
        "id"
    )

    if not user_id:
        raise ValueError(
            "ID user tidak ditemukan"
        )

    return user_id


class RegisterResource:

    def on_post(
        self,
        req,
        resp
    ):

        try:

            data = req.get_media()

            title = str(
                data.get(
                    "title",
                    ""
                )
            ).strip()

            nama = str(
                data.get(
                    "nama",
                    ""
                )
            ).strip()

            noHp = str(
                data.get(
                    "noHp",
                    ""
                )
            ).strip()

            email = str(
                data.get(
                    "email",
                    ""
                )
            ).strip()

            tanggalLahir = str(
                data.get(
                    "tanggalLahir",
                    ""
                )
            ).strip()

            password = str(
                data.get(
                    "password",
                    ""
                )
            )

            roles = str(
                data.get(
                    "roles",
                    "Member"
                )
            ).strip()

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

            if title not in [
                "Tn",
                "Ny",
                "Nn"
            ]:

                resp.status = falcon.HTTP_400

                resp.media = {
                    "success": False,
                    "message": "Title tidak valid"
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

    def on_post(
        self,
        req,
        resp
    ):

        try:

            data = req.get_media()

            email = str(
                data.get(
                    "email",
                    ""
                )
            ).strip()

            password = str(
                data.get(
                    "password",
                    ""
                )
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
    def on_get(
        self,
        req,
        resp
    ):

        try:

            user_id = get_current_user_id(
                req
            )

            user = get_user_by_id(
                user_id
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
                "user": user
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

        except ValueError as e:

            resp.status = falcon.HTTP_401

            resp.media = {
                "success": False,
                "message": str(e)
            }

        except Exception as e:

            resp.status = falcon.HTTP_500

            resp.media = {
                "success": False,
                "message": "Terjadi kesalahan pada server",
                "error": str(e)
            }

    @db_session
    def on_put(
        self,
        req,
        resp
    ):

        try:

            user_id = get_current_user_id(
                req
            )

            content_type = req.content_type or ""

            if not content_type.startswith(
                "multipart/form-data"
            ):

                resp.status = falcon.HTTP_400

                resp.media = {
                    "success": False,
                    "message": "Request harus multipart/form-data"
                }

                return

            form = req.get_media()

            file = form.get(
                "profile_photo"
            )

            if not file:

                resp.status = falcon.HTTP_400

                resp.media = {
                    "success": False,
                    "message": "File profile_photo wajib diupload"
                }

                return

            if not hasattr(
                file,
                "file"
            ):

                resp.status = falcon.HTTP_400

                resp.media = {
                    "success": False,
                    "message": "Format file tidak valid"
                }

                return

            filename = getattr(
                file,
                "filename",
                ""
            )

            if not filename:

                resp.status = falcon.HTTP_400

                resp.media = {
                    "success": False,
                    "message": "Nama file tidak ditemukan"
                }

                return

            extension = os.path.splitext(
                filename
            )[1].lower()

            allowed_extensions = [
                ".jpg",
                ".jpeg",
                ".png",
                ".webp"
            ]

            if extension not in allowed_extensions:

                resp.status = falcon.HTTP_400

                resp.media = {
                    "success": False,
                    "message": "Format foto harus JPG, JPEG, PNG, atau WEBP"
                }

                return

            max_size = 5 * 1024 * 1024

            file.file.seek(
                0,
                os.SEEK_END
            )

            file_size = file.file.tell()

            file.file.seek(
                0
            )

            if file_size > max_size:

                resp.status = falcon.HTTP_400

                resp.media = {
                    "success": False,
                    "message": "Ukuran foto maksimal 5 MB"
                }

                return

            upload_dir = os.path.join(
                "uploads",
                "profile"
            )

            os.makedirs(
                upload_dir,
                exist_ok=True
            )

            new_filename = (
                f"user_{user_id}_"
                f"{uuid.uuid4().hex}"
                f"{extension}"
            )

            file_path = os.path.join(
                upload_dir,
                new_filename
            )

            with open(
                file_path,
                "wb"
            ) as destination:

                destination.write(
                    file.file.read()
                )

            profile_photo = (
                f"/uploads/profile/"
                f"{new_filename}"
            )

            user = update_profile_photo(
                user_id,
                profile_photo
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
                "message": "Foto profile berhasil diperbarui",
                "profile_photo": profile_photo,
                "user": user
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

        except ValueError as e:

            resp.status = falcon.HTTP_401

            resp.media = {
                "success": False,
                "message": str(e)
            }

        except Exception as e:

            resp.status = falcon.HTTP_500

            resp.media = {
                "success": False,
                "message": "Gagal mengupload foto",
                "error": str(e)
            }