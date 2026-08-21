import falcon


class CORSMiddleware:

    def process_request(self, req, resp):

        origin = req.get_header("Origin")

        allowed_origins = [
            "http://localhost:5173",
            "https://usermanagement-gaharu.vercel.app",
        ]

        if origin in allowed_origins:
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
            "Content-Type, Authorization"
        )

        resp.set_header(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, DELETE, OPTIONS"
        )

        if req.method == "OPTIONS":
            resp.status = falcon.HTTP_200
            return


    def process_response(
        self,
        req,
        resp,
        resource,
        req_succeeded
    ):

        origin = req.get_header("Origin")

        allowed_origins = [
            "http://localhost:5173",
            "https://usermanagement-gaharu.vercel.app",
        ]

        if origin in allowed_origins:
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
            "Content-Type, Authorization"
        )

        resp.set_header(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, DELETE, OPTIONS"
        )