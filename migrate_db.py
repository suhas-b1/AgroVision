import sqlite3

def migrate():
    try:
        conn = sqlite3.connect('agrovision.db')
        cursor = conn.cursor()
        
        # Add profile_image
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN profile_image VARCHAR(255);")
            print("Added profile_image column.")
        except sqlite3.OperationalError:
            print("profile_image column already exists.")

        # Add settings_json
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN settings_json TEXT;")
            print("Added settings_json column.")
        except sqlite3.OperationalError:
            print("settings_json column already exists.")
            
        conn.commit()
        conn.close()
        print("Migration complete.")
    except Exception as e:
        print(f"Error during migration: {e}")

if __name__ == "__main__":
    migrate()
