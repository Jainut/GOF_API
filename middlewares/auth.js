import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export default function auth(
    req,
    res,
    next
){

    const token=req.cookies.token;

    if(!token){

        return res.status(401).json({
            message:
            'Token não informado'
        });

    }

    try{

        const decoded=
        jwt.verify(
            token,
            JWT_SECRET
        );

        req.usuario=
        decoded;

        next();

    }
    catch(error){

        return res.status(401)
        .json({

            message:
            'Token inválido'

        });

    }

}