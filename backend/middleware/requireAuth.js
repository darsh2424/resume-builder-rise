import admin from "../firebase.js";

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = {
      id: decoded.uid,
      email: decoded.email,
      name: decoded.name || "",
      picture: decoded.picture || "",
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token verification failed" });
  }
}
