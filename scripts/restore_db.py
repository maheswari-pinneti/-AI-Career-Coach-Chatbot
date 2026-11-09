"""Database Restore Utility for AI Career Coach SaaS.

Restores SQLite persistent database from verified backup with checksum check.
"""

import os
import sys
import shutil
import hashlib

INSTANCE_DIR = os.path.join(os.path.dirname(__file__), '..', 'backend', 'instance')
TARGET_DB = os.path.join(INSTANCE_DIR, 'ai_career_coach.db')


def restore_database(backup_path: str):
    if not os.path.exists(backup_path):
        print(f"[ERROR] Backup file not found at: {backup_path}")
        return False

    checksum_path = f"{backup_path}.sha256"
    if os.path.exists(checksum_path):
        with open(checksum_path, 'r') as f:
            expected_checksum = f.read().strip()

        hasher = hashlib.sha256()
        with open(backup_path, 'rb') as f:
            while chunk := f.read(8192):
                hasher.update(chunk)
        actual_checksum = hasher.hexdigest()

        if actual_checksum != expected_checksum:
            print("[FATAL] Checksum mismatch! Corrupted backup file.")
            return False
        print("[VERIFIED] Checksum matched.")

    os.makedirs(INSTANCE_DIR, exist_ok=True)
    shutil.copy2(backup_path, TARGET_DB)
    print(f"[SUCCESS] Restored database to: {TARGET_DB}")
    return True


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python restore_db.py <path_to_backup.db>")
        sys.exit(1)
    restore_database(sys.argv[1])
