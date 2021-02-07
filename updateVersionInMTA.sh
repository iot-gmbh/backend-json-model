# Get the version from package.json
PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')
echo "Extracted version: ${PACKAGE_VERSION}"

# Find the MTA file
MTA_FILE=$(find ./ -iname mta.yaml -type f)
echo "MTA file found: ${MTA_FILE}"

# Now do the replacement in-place (MacOS/Unix compatible)
REPLACE='^  version: .*$'
WITH="  version: '${PACKAGE_VERSION}'"
sed -i.bak "s#${REPLACE}#${WITH}#g" ${MTA_FILE}