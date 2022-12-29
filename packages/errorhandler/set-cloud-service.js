#!/usr/bin/env node

const { writeFileSync } = require("fs");
const manifestPath = "./src/errorhandler/manifest.json";
const argv = require("minimist")(process.argv?.slice(2));
const manifest = require(manifestPath);

if (argv.to) {
  manifest["sap.cloud"].service = argv.to?.toString();
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
