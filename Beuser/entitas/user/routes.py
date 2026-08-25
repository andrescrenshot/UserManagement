from .resource import (
    RegisterResource,
    LoginResource,
    ProfileResource,
    ProfilePhotoResource
)


def register_routes(app):

    app.add_route(
        "/api/auth/register",
        RegisterResource()
    )

    app.add_route(
        "/api/auth/login",
        LoginResource()
    )

    app.add_route(
        "/api/user",
        ProfileResource()
    )

    app.add_route(
        "/api/user/profile-photo",
        ProfilePhotoResource()
    )