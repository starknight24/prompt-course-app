/**
 * Generic body validation middleware factory.
 *
 * Usage:
 *   router.post("/foo", validate(["title", "content"]), handler);
 *
 * Returns 400 if any listed field is missing or empty.
 *
 * @param {string[]} requiredFields - List of required body field names.
 * @return {Function} Express middleware function.
 */
function validate(requiredFields = []) {
  return (req, res, next) => {
    const missing = requiredFields.filter((f) => {
      const val = req.body[f];
      return val === undefined || val === null || val === "";
    });

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required field(s): ${missing.join(", ")}`,
      });
    }
    return next();
  };
}

module.exports = validate;
