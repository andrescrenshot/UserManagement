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


print("DB_HOST =", config.DB_HOST)
print("DB_PORT =", config.DB_PORT)
print("DB_USER =", config.DB_USER)
print("DB_NAME =", config.DB_NAME)