import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
    const { token } = req.headers;
    if (!token) {
        return res.json({ success: false, message: 'Not Authorized Login Again' });
    }
    try {
        const secret = process.env.JWT_SECRET || 'zafran_jwt_secret_key';
        const token_decoded = jwt.verify(token, secret);
        req.body.userId = token_decoded.id;
        next();
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export default authUser;