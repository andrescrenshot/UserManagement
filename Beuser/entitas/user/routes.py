from .resource import RegisterResource, LoginResource


def register_routes(app):

    app.add_route(
        "/api/auth/register",
        RegisterResource()
    )

    app.add_route(
        "/api/auth/login",
        LoginResource()
    )