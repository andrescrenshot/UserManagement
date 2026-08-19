from pony.orm import Database
import config


db = Database()

db.bind(
    provider="mysql",
    host=config.DB_HOST,
    port=config.DB_PORT,
    user=config.DB_USER,
    passwd=config.DB_PASSWORD,
    db=config.DB_NAME
    
    
)


