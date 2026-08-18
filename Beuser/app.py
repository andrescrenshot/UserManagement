import falcon
from waitress import serve

from db import db

from entitas.user.routes import (
    register_routes as register_user_routes
)

from entitas.tambah_user.model import TambahUser

from entitas.tambah_user.routes import (
    register_routes as register_tambah_user_routes
)

from entitas.edit_user.routes import (
    register_routes as register_edit_user_routes
)

from util.cors_middleware import CORSMiddleware

app = falcon.App(
    middleware=[
        CORSMiddleware()
    ]
)


db.generate_mapping(
    create_tables=True
)


register_user_routes(app)

register_tambah_user_routes(app)

register_edit_user_routes(app)

class StatusResource:

    def on_get(self, req, resp):

        resp.media = {
            "success": True,
            "message": "User Management API aktif"
        }


app.add_route(
    "/api",
    StatusResource()
)

if __name__ == "__main__":

    print("======================================")
    print("       USER MANAGEMENT BACKEND")
    print("======================================")
    print("Server : http://127.0.0.1:9983")
    print("======================================")

    serve(
        app,
        host="127.0.0.1",
        port=9983
    )