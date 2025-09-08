import jwt from 'jsonwebtoken';

const adminAuth = async(req, res, next) => {
    try {
        const { token } = req.headers;

        if (!token) {
            return res.json({ success: false, message: 'Not Authorized. Please login again' });
        }

        // Verify token
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);

        // For now, we'll allow any valid token. You can add admin role checking here
        // Example: if (token_decode.role !== 'admin') { return res.json(...) }

        req.user = token_decode;
        next();

    } catch (error) {
        console.log('Admin auth error:', error);
        res.json({ success: false, message: 'Invalid token' });
    }
};

export default adminAuth;