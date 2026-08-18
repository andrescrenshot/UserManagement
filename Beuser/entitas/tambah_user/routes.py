from .resource import (
    TambahUserResource,
    TambahUserDetailResource
)


def register_routes(app):

    app.add_route(
        "/api/tambah-user",
        TambahUserResource()
    )

    app.add_route(
        "/api/tambah-user/{user_id:int}",
        TambahUserDetailResource()
    )