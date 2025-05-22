import jwt from 'jsonwebtoken';

export const authorizeRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      req.user = decoded;

      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Access denied: Insufficient role' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token verification failed', error: error.message });
    }
  };
};
