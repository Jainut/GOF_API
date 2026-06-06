import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export default function auth(
    req,
    res,
    next
){

    const authHeader=
    req.headers.authorization;

    if(!authHeader){

        return res.status(401).json({
            message:
            'Token não informado'
        });

    }

    const token=
    authHeader.replace(
        'Bearer ',
        ''
    );

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