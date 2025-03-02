#!/bin/sh

# Script to delete all __pycache__ directories in specific folders

# Define the pattern and target directories
PATTERN="__pycache__"
DIRECTORIES=("./api/common" "./api/schoolmarksapi")

echo "This script will delete all '$PATTERN' directories in:"
for dir in "${DIRECTORIES[@]}"; do
    echo "- $dir"
done

# Check if directories exist
MISSING_DIR=0
for dir in "${DIRECTORIES[@]}"; do
    if [ ! -d "$dir" ]; then
        echo "Warning: Directory '$dir' does not exist."
        MISSING_DIR=1
    fi
done

if [ $MISSING_DIR -eq 1 ]; then
    read -p "Some directories don't exist. Continue anyway? (y/n): " CONFIRM
    if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
        echo "Operation canceled."
        exit 1
    fi
fi

# Find all __pycache__ directories in the specified paths
FOUND_DIRS=()
for dir in "${DIRECTORIES[@]}"; do
    if [ -d "$dir" ]; then
        while IFS= read -r found_dir; do
            FOUND_DIRS+=("$found_dir")
        done < <(find "$dir" -type d -name "$PATTERN" | sort)
    fi
done

# Check if any matching directories were found
if [ ${#FOUND_DIRS[@]} -eq 0 ]; then
    echo "No '$PATTERN' directories found. Nothing to delete."
    exit 0
fi

# Show what will be deleted
echo "Found ${#FOUND_DIRS[@]} '$PATTERN' directories to delete:"
for dir in "${FOUND_DIRS[@]}"; do
    echo "- $dir"
done

# Ask for confirmation
read -p "Delete these directories? (y/n): " CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo "Operation canceled."
    exit 1
fi

# Delete the directories
echo "Deleting directories..."
for dir in "${FOUND_DIRS[@]}"; do
    echo "Removing: $dir"
    rm -rf "$dir"
done

echo "Done! Deleted ${#FOUND_DIRS[@]} '$PATTERN' directories."
exit 0