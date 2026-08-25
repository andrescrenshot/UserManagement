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

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(
                __file__
            )
        )
    )
)

UPLOAD_DIR = os.path.join(
    BASE_DIR,
    "uploads",
    "profile"
)

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)

MAX_PROFILE_PHOTO_SIZE = (
    100 * 1024 * 1024
)

ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
}

ALLOWED_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp"
}


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


def detect_image_format(file_obj):

    file_obj.seek(0)

    header = file_obj.read(
        32
    )

    file_obj.seek(0)

    if not header:
        return None

    if header.startswith(
        b"\xFF\xD8\xFF"
    ):
        return "image/jpeg"

    if header.startswith(
        b"\x89PNG\r\n\x1a\n"
    ):
        return "image/png"

    if (
        len(header) >= 12
        and header[0:4] == b"RIFF"
        and header[8:12] == b"WEBP"
    ):
        return "image/webp"

    return None


def extension_from_content_type(
    content_type
):

    return ALLOWED_CONTENT_TYPES.get(
        content_type
    )


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
                data.get(
                    "remember_me",
                    False
                )
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


class ProfilePhotoResource:

    @db_session
    def on_put(
        self,
        req,
        resp
    ):

        file_path = None

        try:
            user_id = get_current_user_id(
                req
            )

            content_type = (
                req.content_type or ""
            ).lower()

            if not content_type.startswith(
                "multipart/form-data"
            ):
                resp.status = falcon.HTTP_400
                resp.media = {
                    "success": False,
                    "message":
                        "Request harus multipart/form-data"
                }
                return

            content_length = (
                req.content_length
            )

            if (
                content_length is not None
                and content_length
                > MAX_PROFILE_PHOTO_SIZE
                + (1024 * 1024)
            ):
                resp.status = falcon.HTTP_413
                resp.media = {
                    "success": False,
                    "message":
                        "Ukuran upload terlalu besar. Maksimal foto 100 MB."
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
                    "message":
                        "File profile_photo wajib diupload"
                }
                return

            if not hasattr(
                file,
                "file"
            ):
                resp.status = falcon.HTTP_400
                resp.media = {
                    "success": False,
                    "message":
                        "Format file tidak valid"
                }
                return

            filename = str(
                getattr(
                    file,
                    "filename",
                    ""
                )
            ).strip()

            if not filename:
                resp.status = falcon.HTTP_400
                resp.media = {
                    "success": False,
                    "message":
                        "Nama file tidak ditemukan"
                }
                return

            extension = (
                os.path.splitext(
                    filename
                )[1]
                .lower()
            )

            if extension not in ALLOWED_EXTENSIONS:
                resp.status = falcon.HTTP_400
                resp.media = {
                    "success": False,
                    "message":
                        "Format foto harus JPG, JPEG, PNG, atau WEBP"
                }
                return

            file.file.seek(
                0,
                os.SEEK_END
            )

            file_size = (
                file.file.tell()
            )

            file.file.seek(0)

            if file_size <= 0:
                resp.status = falcon.HTTP_400
                resp.media = {
                    "success": False,
                    "message":
                        "File foto kosong"
                }
                return

            if file_size > MAX_PROFILE_PHOTO_SIZE:
                resp.status = falcon.HTTP_413
                resp.media = {
                    "success": False,
                    "message":
                        "Ukuran foto maksimal 100 MB"
                }
                return

            detected_type = (
                detect_image_format(
                    file.file
                )
            )

            if not detected_type:
                resp.status = falcon.HTTP_400
                resp.media = {
                    "success": False,
                    "message":
                        "File bukan gambar yang valid"
                }
                return

            expected_extension = (
                extension_from_content_type(
                    detected_type
                )
            )

            if not expected_extension:
                resp.status = falcon.HTTP_400
                resp.media = {
                    "success": False,
                    "message":
                        "Format gambar tidak didukung"
                }
                return

            if (
                extension == ".jpg"
                or extension == ".jpeg"
            ):
                if detected_type != "image/jpeg":
                    resp.status = falcon.HTTP_400
                    resp.media = {
                        "success": False,
                        "message":
                            "Isi file tidak sesuai dengan format JPG/JPEG"
                    }
                    return

            elif extension == ".png":
                if detected_type != "image/png":
                    resp.status = falcon.HTTP_400
                    resp.media = {
                        "success": False,
                        "message":
                            "Isi file tidak sesuai dengan format PNG"
                    }
                    return

            elif extension == ".webp":
                if detected_type != "image/webp":
                    resp.status = falcon.HTTP_400
                    resp.media = {
                        "success": False,
                        "message":
                            "Isi file tidak sesuai dengan format WEBP"
                    }
                    return

            safe_extension = (
                ".jpg"
                if detected_type == "image/jpeg"
                else ".png"
                if detected_type == "image/png"
                else ".webp"
            )

            new_filename = (
                f"user_{user_id}_"
                f"{uuid.uuid4().hex}"
                f"{safe_extension}"
            )

            file_path = os.path.join(
                UPLOAD_DIR,
                new_filename
            )

            file.file.seek(0)

            with open(
                file_path,
                "wb"
            ) as destination:

                while True:
                    chunk = (
                        file.file.read(
                            1024 * 1024
                        )
                    )

                    if not chunk:
                        break

                    destination.write(
                        chunk
                    )

            saved_size = os.path.getsize(
                file_path
            )

            if saved_size <= 0:
                os.remove(
                    file_path
                )
                file_path = None

                resp.status = falcon.HTTP_400
                resp.media = {
                    "success": False,
                    "message":
                        "Foto gagal disimpan"
                }
                return

            if saved_size > MAX_PROFILE_PHOTO_SIZE:
                os.remove(
                    file_path
                )
                file_path = None

                resp.status = falcon.HTTP_413
                resp.media = {
                    "success": False,
                    "message":
                        "Ukuran foto maksimal 100 MB"
                }
                return

            profile_photo = (
                f"/uploads/profile/{new_filename}"
            )

            user = update_profile_photo(
                user_id,
                profile_photo
            )

            if not user:

                if (
                    file_path
                    and os.path.isfile(
                        file_path
                    )
                ):
                    os.remove(
                        file_path
                    )

                file_path = None

                resp.status = falcon.HTTP_404
                resp.media = {
                    "success": False,
                    "message":
                        "User tidak ditemukan"
                }
                return

            file_path = None

            resp.status = falcon.HTTP_200
            resp.media = {
                "success": True,
                "message":
                    "Foto profile berhasil diperbarui",
                "profile_photo":
                    profile_photo,
                "user": user
            }

        except jwt.ExpiredSignatureError:

            if (
                file_path
                and os.path.isfile(
                    file_path
                )
            ):
                try:
                    os.remove(
                        file_path
                    )
                except OSError:
                    pass

            resp.status = falcon.HTTP_401
            resp.media = {
                "success": False,
                "message":
                    "Token sudah expired"
            }

        except jwt.InvalidTokenError:

            if (
                file_path
                and os.path.isfile(
                    file_path
                )
            ):
                try:
                    os.remove(
                        file_path
                    )
                except OSError:
                    pass

            resp.status = falcon.HTTP_401
            resp.media = {
                "success": False,
                "message":
                    "Token tidak valid"
            }

        except ValueError as e:

            if (
                file_path
                and os.path.isfile(
                    file_path
                )
            ):
                try:
                    os.remove(
                        file_path
                    )
                except OSError:
                    pass

            resp.status = falcon.HTTP_401
            resp.media = {
                "success": False,
                "message": str(e)
            }

        except Exception as e:

            if (
                file_path
                and os.path.isfile(
                    file_path
                )
            ):
                try:
                    os.remove(
                        file_path
                    )
                except OSError:
                    pass

            resp.status = falcon.HTTP_500
            resp.media = {
                "success": False,
                "message":
                    "Gagal mengupload foto",
                "error": str(e)
            }