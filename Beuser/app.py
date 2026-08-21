import os
import falcon
from waitress import serve

from db import db

from entitas.user.routes import register_routes as register_user_routes

from util.cors_middleware import CORSMiddleware


app = falcon.App(
    middleware=[
        CORSMiddleware()
    ]
)


db.generate_mapping(
    create_tables=True
)


os.makedirs("uploads/profile", exist_ok=True)


register_user_routes(app)


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


app.add_static_route(
    "/uploads",
    "uploads"
)


if __name__ == "__main__":

    port = int(
        os.environ.get(
            "PORT",
            9983
        )
    )

    print("======================================")
    print("       USER MANAGEMENT BACKEND")
    print("======================================")
    print(
        f"Server : http://0.0.0.0:{port}"
    )
    print("======================================")

    serve(
        app,
        host="0.0.0.0",
        port=port
    )