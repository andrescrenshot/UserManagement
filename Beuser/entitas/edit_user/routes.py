from .resource import EditUserResource


def register_routes(app):

    app.add_route(
        "/api/edit-user/{user_id}",
        EditUserResource()
    )