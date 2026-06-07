function managerOnly(req, res, next) {
  if (!req.user || req.user.role !== "manager") {
    return res.status(403).json({ error: "Manager access only" });
  }

  next();
}

module.exports = managerOnly;