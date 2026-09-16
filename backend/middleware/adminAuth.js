import jwt from 'jsonwebtoken'

const adminAuth = async (req, res, next) => {
    try {
        const { token } = req.headers
        if (!token){
            return res.json({success : false, message: "Not Authorized Login Again"})
        }
        const secret = process.env.JWT_SECRET || 'zafran_jwt_secret_key';
        const token_decode = jwt.verify(token, secret);
        const expected = (process.env.ADMIN_EMAIL || 'admin@zafran.com') + (process.env.ADMIN_PASSWORD || 'admin1234');
        if(token_decode !== expected) {
            return res.json({success : false, message: "Not Authorized Login Again"})
        }
        next()
    }
    catch (error){
        console.log(error)
        res.json({ success: false, message: error.message})
    }
}

export default adminAuth