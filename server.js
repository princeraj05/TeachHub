const path = require("path");

// Change working directory to backend so process.cwd() and relative file lookups (.env, routes, config, etc.) resolve correctly
process.chdir(path.join(__dirname, "backend"));

// Require and run backend/server.js
require(path.join(__dirname, "backend", "server.js"));
