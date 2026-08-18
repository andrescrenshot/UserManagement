from . import views  # noqa: F401  # Register Flask routes
from .app import app
from .models import db

if __name__ == "__main__":
    db.bind(**app.config["PONY"])
    db.generate_mapping(create_tables=True)
    app.run()
