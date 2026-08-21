import falcon


class CORSMiddleware:

    ALLOWED_ORIGINS = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://usermanagement-gaharu.vercel.app"
    ]

    def process_request(self, req, resp):

        origin = req.get_header("Origin")

        if origin in self.ALLOWED_ORIGINS:
            resp.set_header(
                "Access-Control-Allow-Origin",
                origin
            )

        resp.set_header(
            "Access-Control-Allow-Credentials",
            "true"
        )

        resp.set_header(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization, Accept"
        )

        resp.set_header(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, DELETE, OPTIONS"
        )

        resp.set_header(
            "Access-Control-Max-Age",
            "86400"
        )

        if req.method == "OPTIONS":
            resp.status = falcon.HTTP_200
            return True

    def process_response(
        self,
        req,
        resp,
        resource,
        req_succeeded
    ):

        origin = req.get_header("Origin")

        if origin in self.ALLOWED_ORIGINS:
            resp.set_header(
                "Access-Control-Allow-Origin",
                origin
            )

        resp.set_header(
            "Access-Control-Allow-Credentials",
            "true"
        )

        resp.set_header(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization, Accept"
        )

        resp.set_header(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, DELETE, OPTIONS"
        )