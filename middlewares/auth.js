import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: 'Acesso negado. Token não informado.'
        });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        req.usuario = decoded;

        next();
    } catch (err) {
        return res.status(401).json({
            message: 'Token inválido'
        });
    }
};

export default auth;