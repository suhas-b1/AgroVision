import sqlite3

try:
    conn = sqlite3.connect('agrovision.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, email FROM users WHERE username = 'suhas_b1'")
    row = cursor.fetchone()
    if row:
        print(f"User found: ID={row[0]}, Username={row[1]}, Email={row[2]}")
    else:
        print("User 'suhas_b1' not found in database.")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
