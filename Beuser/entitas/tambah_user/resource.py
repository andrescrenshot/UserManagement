import json
import falcon

from .services import create_user, get_users, get_user, update_user, delete_user


class TambahUserResource:

    def on_get(self, req, resp):
        try:
            resp.media = {
                "success": True,
                "data": get_users()
            }
        except Exception as e:
            resp.status = falcon.HTTP_500
            resp.media = {
                "success": False,
                "message": str(e)
            }

    def on_post(self, req, resp):

        try:
            data = json.load(req.bounded_stream)
        except (json.JSONDecodeError, TypeError):
            resp.status = falcon.HTTP_400
            resp.media = {
                "success": False,
                "message": "Format JSON tidak valid"
            }
            return

        required = [
            "title",
            "nama",
            "noHp",
            "email",
            "tanggalLahir",
            "roles",
            "password"
        ]

        missing = next(
            (
                field
                for field in required
                if not str(data.get(field, "")).strip()
            ),
            None
        )

        if missing:
            resp.status = falcon.HTTP_400
            resp.media = {
                "success": False,
                "message": f"{missing} wajib diisi"
            }
            return

        if data["title"] not in ["Tn", "Ny", "Nn"]:
            resp.status = falcon.HTTP_400
            resp.media = {
                "success": False,
                "message": "Title harus Tn, Ny, atau Nn"
            }
            return

        try:
            user = create_user(data)

            resp.status = falcon.HTTP_201
            resp.media = {
                "success": True,
                "message": "User Dashboard berhasil ditambahkan",
                "data": user
            }

        except ValueError as e:
            resp.status = falcon.HTTP_409
            resp.media = {
                "success": False,
                "message": str(e)
            }

        except Exception as e:
            resp.status = falcon.HTTP_500
            resp.media = {
                "success": False,
                "message": str(e)
            }


class TambahUserDetailResource:

    def on_get(self, req, resp, user_id):

        try:
            user = get_user(user_id)

            if not user:
                resp.status = falcon.HTTP_404
                resp.media = {
                    "success": False,
                    "message": "User Dashboard tidak ditemukan"
                }
                return

            resp.media = {
                "success": True,
                "data": user
            }

        except Exception as e:
            resp.status = falcon.HTTP_500
            resp.media = {
                "success": False,
                "message": str(e)
            }

    def on_put(self, req, resp, user_id):

        try:
            data = json.load(req.bounded_stream)

        except (json.JSONDecodeError, TypeError):
            resp.status = falcon.HTTP_400
            resp.media = {
                "success": False,
                "message": "Format JSON tidak valid"
            }
            return

        required = [
            "title",
            "nama",
            "noHp",
            "email",
            "tanggalLahir",
            "roles"
        ]

        missing = next(
            (
                field
                for field in required
                if not str(data.get(field, "")).strip()
            ),
            None
        )

        if missing:
            resp.status = falcon.HTTP_400
            resp.media = {
                "success": False,
                "message": f"{missing} wajib diisi"
            }
            return

        if data["title"] not in ["Tn", "Ny", "Nn"]:
            resp.status = falcon.HTTP_400
            resp.media = {
                "success": False,
                "message": "Title harus Tn, Ny, atau Nn"
            }
            return

        try:
            user = update_user(user_id, data)

            if not user:
                resp.status = falcon.HTTP_404
                resp.media = {
                    "success": False,
                    "message": "User Dashboard tidak ditemukan"
                }
                return

            resp.media = {
                "success": True,
                "message": "Data Dashboard berhasil diperbarui",
                "data": user
            }

        except ValueError as e:
            resp.status = falcon.HTTP_409
            resp.media = {
                "success": False,
                "message": str(e)
            }

        except Exception as e:
            resp.status = falcon.HTTP_500
            resp.media = {
                "success": False,
                "message": str(e)
            }

    def on_delete(self, req, resp, user_id):

        try:
            if not delete_user(user_id):
                resp.status = falcon.HTTP_404
                resp.media = {
                    "success": False,
                    "message": "User Dashboard tidak ditemukan"
                }
                return

            resp.media = {
                "success": True,
                "message": "User Dashboard berhasil dihapus"
            }

        except Exception as e:
            resp.status = falcon.HTTP_500
            resp.media = {
                "success": False,
                "message": str(e)
            }