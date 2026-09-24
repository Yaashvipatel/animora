// Strips Mongo operator keys ($gt, $where, etc.) and dotted keys from user input
// to prevent NoSQL injection. Written by hand because express-mongo-sanitize
// reassigns req.query wholesale, which breaks on Express 5 (req.query is
// getter-only there) — this version mutates objects in place instead.
function stripDangerousKeys(obj) {
  if (!obj || typeof obj !== "object") return;

  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
      continue;
    }
    if (obj[key] && typeof obj[key] === "object") {
      stripDangerousKeys(obj[key]);
    }
  }
}

function sanitizeRequest(req, res, next) {
  stripDangerousKeys(req.body);
  stripDangerousKeys(req.query);
  stripDangerousKeys(req.params);
  next();
}

module.exports = sanitizeRequest;
