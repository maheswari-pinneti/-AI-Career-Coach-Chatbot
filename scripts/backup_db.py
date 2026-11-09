"""Database Backup Utility for AI Career Coach SaaS.

Exports atomic snapshot of SQLite persistent database with checksums.
"""

import os
import shutil
import hashlib
from datetime import datetime

INSTANCE_DIR = os.path.join(os.path.dirname(__file__), '..', 'backend', 'instance')
DB_FILE = os.path.join(INSTANCE_DIR, 'ai_career_coach.db')
BACKUP_DIR = os.path.join(os.path.dirname(__file__), '..', 'backups')


def backup_database():
    if not os.path.exists(DB_FILE):
        print(f"Database file not found at {DB_FILE}. Skipping.")
        return False

    os.makedirs(BACKUP_DIR, exist_ok=True)
    timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
    backup_filename = f"ai_career_coach_{timestamp}.db"
    backup_path = os.path.join(BACKUP_DIR, backup_filename)

    shutil.copy2(DB_FILE, backup_path)

    # Compute SHA-256 Checksum
    hasher = hashlib.sha256()
    with open(backup_path, 'rb') as f:
        while chunk := f.read(8192):
            hasher.update(chunk)
    checksum = hasher.hexdigest()

    checksum_path = f"{backup_path}.sha256"
    with open(checksum_path, 'w') as f:
        f.write(checksum)

    print(f"[SUCCESS] Database backed up to: {backup_path}")
    print(f"[CHECKSUM] SHA-256: {checksum}")
    return True


if __name__ == '__main__':
    backup_database()
