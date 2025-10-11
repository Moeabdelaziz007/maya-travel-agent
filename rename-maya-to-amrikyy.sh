#!/bin/bash
# Script to rename all "maya" references to "amrikyy"

set -e

echo "🔄 Renaming Maya to Amrikyy across the codebase..."
echo ""

# Navigate to project root
cd "$(dirname "$0")"

# Files to process (excluding node_modules, .git, dist, build)
FILES=$(find . -type f \( \
    -name "*.md" -o \
    -name "*.js" -o \
    -name "*.ts" -o \
    -name "*.tsx" -o \
    -name "*.json" -o \
    -name "*.yml" -o \
    -name "*.yaml" -o \
    -name "*.toml" -o \
    -name "*.sh" -o \
    -name "*.example" -o \
    -name "*.css" -o \
    -name "*.sql" \
    \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/dist/*" \
    -not -path "*/build/*" \
    -not -path "*/package-lock.json" \
    -not -path "*/rename-maya-to-amrikyy.sh" \
)

COUNT=0

echo "Processing files..."
for file in $FILES; do
    # Check if file contains "maya" (case-insensitive)
    if grep -qi "maya" "$file" 2>/dev/null; then
        # Perform replacements (case-sensitive to maintain proper casing)
        # Use sed -i '' for macOS, -i for Linux
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' \
                -e 's/Maya/Amrikyy/g' \
                -e 's/maya/amrikyy/g' \
                -e 's/MAYA/AMRIKYY/g' \
                -e 's/maya-travel-agent/amrikyy-travel-agent/g' \
                -e 's/maya_travel/amrikyy_travel/g' \
                -e 's/MayaPersona/AmrikyyPersona/g' \
                -e 's/mayaPersona/amrikyyPersona/g' \
                "$file"
        else
            # Linux
            sed -i \
                -e 's/Maya/Amrikyy/g' \
                -e 's/maya/amrikyy/g' \
                -e 's/MAYA/AMRIKYY/g' \
                -e 's/maya-travel-agent/amrikyy-travel-agent/g' \
                -e 's/maya_travel/amrikyy_travel/g' \
                -e 's/MayaPersona/AmrikyyPersona/g' \
                -e 's/mayaPersona/amrikyyPersona/g' \
                "$file"
        fi
        
        COUNT=$((COUNT + 1))
        echo "  ✓ Updated: $file"
    fi
done

echo ""
echo "✅ Replacement complete!"
echo "   Updated $COUNT files"
echo ""
echo "🔍 Files that still contain 'maya' (if any):"
grep -ril "maya" . \
    --exclude-dir=node_modules \
    --exclude-dir=.git \
    --exclude-dir=dist \
    --exclude-dir=build \
    --exclude=package-lock.json \
    --exclude=rename-maya-to-amrikyy.sh \
    2>/dev/null | head -20 || echo "   None found!"

echo ""
echo "📝 Note: File and directory names were not changed"
echo "   The workspace directory is still: /Users/Shared/maya-travel-agent"
echo "   This is intentional to avoid breaking absolute paths"

