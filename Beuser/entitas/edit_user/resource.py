import json
import falcon

from .services import (
    get_user,
    update_user
)


class EditUserResource:

    def on_get(self, req, resp, user_id):

        try:
            user = get_user(user_id)

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

        required_fields = [
            "title",
            "nama",
            "noHp",
            "email",
            "tanggalLahir",
            "roles"
        ]

        for field in required_fields:

            if not str(data.get(field, "")).strip():

                resp.status = falcon.HTTP_400
                resp.media = {
                    "success": False,
                    "message": f"{field} wajib diisi"
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

            user = update_user(
                user_id,
                data
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
                "message": "Perubahan data user berhasil disimpan",
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