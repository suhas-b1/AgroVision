from backend.database import SessionLocal
from backend.models import User

db = SessionLocal()
user = db.query(User).filter(User.username == "suhas_b1").first()

if user:
    print(f"User found: ID={user.id}, Username={user.username}, Email={user.email}")
else:
    print("User 'suhas_b1' not found in database.")

db.close()
