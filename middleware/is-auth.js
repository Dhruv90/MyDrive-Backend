const jwt = require("jsonwebtoken");
const User = require("../models/user");

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client('284746306985-8j7llu7inlpc42ev7l878buln8n86pht.apps.googleusercontent.com')

const validateGoogle = async(token) => {
    try{
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: '284746306985-8j7llu7inlpc42ev7l878buln8n86pht.apps.googleusercontent.com'
        });
        const payload = ticket.getPayload();
        if(payload){
            return {email: payload.email, status:true}
        } else return {email:null, status:false}
    } catch(err) {
        console.log(err);
        return {email:null, status:false}
    }
}

const isAuth =  async (req, res, next) => {
    const authHeader = req.get('Authorization');
    if(!authHeader){
        const error = new Error('Not authenticated');
        error.statusCode = 401;
        throw error;
    }
    const mode = authHeader.split(' ')[1]
    const token = authHeader.split(' ')[2];

    if(mode === 'Native'){
        jwt.verify(token, 'secret', (err, decodedToken) => {
            if(err){
                console.log(err);
                res.status(401).json({message: 'Invalid Token'})
            } else {
                req.userId = decodedToken.userId;
                req.email = decodedToken.email;
                next();
            }
        });
        
    } else if (mode === 'Google') {
        const googleResponse = await validateGoogle(token);
        if(googleResponse.status === true){
            req.email = googleResponse.email;
            const user = await User.findOne({email: googleResponse.email});
            req.userId = user._id;
            next();
        } else {
            console.log(googleResponse);
            res.status(401).json({message: 'Invalid Token'})
        }
    }    
}

exports.isAuth = isAuth;
exports.validateGoogle = validateGoogle;



