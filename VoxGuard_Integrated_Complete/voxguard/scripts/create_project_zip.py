import os
import zipfile
import sys
from pathlib import Path

def create_voxguard_zip():
    root_dir = Path(r"c:\Users\Other User\Downloads\voxguard-ai").resolve()
    output_zip_path = Path(r"c:\Users\Other User\Downloads\VoxGuard_Integrated_Complete.zip")
    output_zip_in_dir = root_dir / "VoxGuard_Integrated_Complete.zip"

    # Directories and files to exclude
    EXCLUDE_DIRS = {
        "node_modules",
        "voxguard-ai",       # Nested duplicate folder
        "__pycache__",
        ".pytest_cache",
        ".git",
        "venv",
        ".venv",
        "dist",
        ".turbo",
        ".next"
    }

    EXCLUDE_EXTENSIONS = {
        ".pyc",
        ".pyo",
        ".pyd"
    }

    EXCLUDE_FILES = {
        "voxguard-ai.zip",
        "VoxGuard_Integrated_Complete.zip"
    }

    print(f"Starting packaging of: {root_dir}")
    print(f"Output ZIP target: {output_zip_path}")

    file_count = 0
    total_uncompressed_bytes = 0

    with zipfile.ZipFile(output_zip_path, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as zipf:
        for current_dir, dirs, files in os.walk(root_dir):
            # Prune directories in-place
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.startswith(".git")]

            rel_dir = os.path.relpath(current_dir, root_dir)
            if rel_dir == ".":
                rel_dir = ""

            for file in files:
                if file in EXCLUDE_FILES or file.endswith(".zip"):
                    continue
                _, ext = os.path.splitext(file)
                if ext.lower() in EXCLUDE_EXTENSIONS:
                    continue

                abs_file_path = os.path.join(current_dir, file)
                
                # Check file size
                try:
                    size = os.path.getsize(abs_file_path)
                    total_uncompressed_bytes += size
                except OSError:
                    pass

                # Store inside a clean top-level folder 'voxguard' in the zip
                archive_name = os.path.join("voxguard", rel_dir, file) if rel_dir else os.path.join("voxguard", file)
                # Normalize slashes for zip standard
                archive_name = archive_name.replace("\\", "/")

                zipf.write(abs_file_path, archive_name)
                file_count += 1

    zip_size_mb = os.path.getsize(output_zip_path) / (1024 * 1024)
    orig_size_mb = total_uncompressed_bytes / (1024 * 1024)

    # Also copy / write to project root for convenience
    try:
        import shutil
        shutil.copy2(output_zip_path, output_zip_in_dir)
        print(f"Also created copy inside project directory: {output_zip_in_dir}")
    except Exception as e:
        print(f"Notice on local copy: {e}")

    print("==================================================")
    print("PACKAGE CREATION SUCCESSFUL!")
    print(f"Total files packaged: {file_count}")
    print(f"Uncompressed size:    {orig_size_mb:.2f} MB")
    print(f"Compressed ZIP size:  {zip_size_mb:.2f} MB")
    print(f"Location 1:           {output_zip_path}")
    print(f"Location 2:           {output_zip_in_dir}")
    print("==================================================")

if __name__ == "__main__":
    create_voxguard_zip()
