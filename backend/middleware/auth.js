import jwt from 'jsonwebtoken';

const authUser = async(req, res, next) => {
    try {
        const { token } = req.headers;

        if (!token) {
            return res.json({
                success: false,
                message: 'Not Authorized. Please login again'
            });
        }

        // Verify token
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);

        // Add user id to request body for easy access
        req.body.userId = token_decode.id;
        req.user = token_decode;

        next();

    } catch (error) {
        console.log('User auth error:', error);
        res.json({
            success: false,
            message: 'Invalid token. Please login again'
        });
    }
};

export default authUser;