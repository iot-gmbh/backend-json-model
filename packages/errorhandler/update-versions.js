#!/usr/bin/env node

const { writeFileSync } = require("fs");
const { version } = require("./package.json");
const manifestPath = "./src/errorhandler/manifest.json";
const manifest = require(manifestPath);

manifest["sap.app"].applicationVersion.version = version;

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
