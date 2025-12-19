import jwt from "jsonwebtoken";

export default function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token =
    authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : req.cookies?.adminToken;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (!decoded?.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    console.error("Admin auth error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
