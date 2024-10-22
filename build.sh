# inspired by
# https://github.com/MagicJinn/Youtube- DougDougify/raw/4e500fa7a9b8516e87d008cd210c84d6d3b782e6/build.bat

ZIP_NAME_FIREFOX="Firefox.zip"
ZIP_NAME_CHROMIUM="Chromium.zip"
SOURCE_FOLDER=$(pwd)
TEMP_FOLDER="temp"

# Ensure the temp folder is clean
if [ -d "${TEMP_FOLDER}" ]; then
	rm -rf "${TEMP_FOLDER}"
fi

mkdir "${TEMP_FOLDER}"

# Copy all files and folders from the source folder to the temp folder
echo "Copying all files to the temp directory..."
cp -r "${SOURCE_FOLDER}/." "${TEMP_FOLDER}/"

# Create Firefox zip folder using zip
echo "Creating Firefox zip folder..."
cd $TEMP_FOLDER || exit
zip -r "${SOURCE_FOLDER}/${ZIP_NAME_FIREFOX}" "./"
cd ..
echo "Firefox zip folder created successfully."

# Ensure the temp folder is clean
if [ -d "${TEMP_FOLDER}" ]; then
	rm -rf "${TEMP_FOLDER}"
fi
mkdir "${TEMP_FOLDER}"

# Copy all files and folders for Chromium
cp -r "${SOURCE_FOLDER}/." "${TEMP_FOLDER}/"

# Rename manifest for Chromium
echo "Preparing files for Chromium zip..."
mv "${TEMP_FOLDER}/manifestV3.json" "${TEMP_FOLDER}/manifest.json"

# Create Chromium zip folder using zip
echo "Creating Chromium zip folder..."
cd $TEMP_FOLDER || exit
zip -r "${SOURCE_FOLDER}/${ZIP_NAME_CHROMIUM}" "./"
cd ..
echo "Chromium zip folder created successfully."

# Cleanup
if [ -d "${TEMP_FOLDER}" ]; then
	rm -rf "${TEMP_FOLDER}"
fi

echo "All operations completed successfully."
