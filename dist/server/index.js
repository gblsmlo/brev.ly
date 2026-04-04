"use strict";

// src/http/app.ts
var import_fastify = require("fastify");
var app = (0, import_fastify.fastify)();

// src/http/server/index.ts
app.listen({
  host: "0.0.0.0",
  port: 3333
}).then(() => {
  console.log("\u{1F680} HTTP server running on http://localhost:3333");
}).catch((error) => {
  console.log(error);
});
