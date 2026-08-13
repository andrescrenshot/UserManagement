import falcon
from falcon_cors import CORS
from waitress import serve

from db import db
from entitas.user.routes import register_routes


cors = CORS(
    allow_all_origins=True,
    allow_all_methods=True,
    allow_all_headers=True
)

app = falcon.App(
    middleware=cors.middleware
)

db.generate_mapping(
    create_tables=True
)

register_routes(app)


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