import jwt from "jsonwebtoken";

// Like isAuth, but never blocks the request - used on public endpoints that
// need to know "who's asking" (to decide what to reveal) without requiring
// a logged-in visitor to be turned away.
const optionalAuth = (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (token) {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      if (verified) {
        req.userId = verified.userId;
      }
    }
  } catch (error) {
    // invalid/expired token - proceed unauthenticated rather than blocking
  }
  next();
};

export default optionalAuth;
