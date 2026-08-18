import json
import falcon

from .services import (
    get_user,
    update_user
)


class EditUserResource:

    # GET /api/edit-user/{user_id}
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


    # PUT /api/edit-user/{user_id}
    def on_put(self, req, resp, user_id):

        try:

            data = json.load(req.bounded_stream)

            required_fields = [
                "title",
                "nama",
                "noHp",
                "email",
                "tanggalLahir",
                "roles"
            ]

            # Validasi field
            for field in required_fields:

                if not data.get(field):

                    resp.status = falcon.HTTP_400

                    resp.media = {
                        "success": False,
                        "message": f"{field} wajib diisi"
                    }

                    return

            # Validasi title
            if data["title"] not in ["Tn", "Ny", "Nn"]:

                resp.status = falcon.HTTP_400

                resp.media = {
                    "success": False,
                    "message": "Title harus Tn, Ny, atau Nn"
                }

                return

            # Update user
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

        except json.JSONDecodeError:

            resp.status = falcon.HTTP_400

            resp.media = {
                "success": False,
                "message": "Format JSON tidak valid"
            }

        except Exception as e:

            resp.status = falcon.HTTP_500

            resp.media = {
                "success": False,
                "message": str(e)
            }