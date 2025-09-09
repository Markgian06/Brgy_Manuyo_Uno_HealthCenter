import jwt from "jsonwebtoken";

const userToken = async (req, res, next) =>{
    const {token} = req.cookies;

    if(!token){
        return res.redirect("/frontend/patient/html/login.html?error=notAuthorized");
    }

    try{
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        if(!req.body){
            req.body = {};
        }

        if(tokenDecode.id){
            req.body.userId = tokenDecode.id
        }
        else{
            return res.redirect("/frontend/patient/html/login.html?error=notAuthorized");
        }

        next();

    }
    catch(error){
        return res.redirect("/frontend/patient/html/login.html?error=notAuthorized");
    }
}

export default userToken;