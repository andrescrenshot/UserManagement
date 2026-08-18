import falcon


class CORSMiddleware:
    def process_request(self, req, resp):
        origin = req.get_header("Origin")

        if origin == "http://localhost:5173":
            resp.set_header("Access-Control-Allow-Origin", origin)

        resp.set_header("Access-Control-Allow-Credentials", "true")
        resp.set_header(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization"
        )
        resp.set_header(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, DELETE, OPTIONS"
        )

        # WAJIB: tangani preflight request
        if req.method == "OPTIONS":
            raise falcon.HTTPStatus(falcon.HTTP_204)

    def process_response(self, req, resp, resource, req_succeeded):
        origin = req.get_header("Origin")

        if origin == "http://localhost:5173":
            resp.set_header("Access-Control-Allow-Origin", origin)

        resp.set_header("Access-Control-Allow-Credentials", "true")
        resp.set_header(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization"
        )
        resp.set_header(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, DELETE, OPTIONS"
        )