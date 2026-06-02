import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export async function autenticarNFC(uid) {
    const cartao = await prisma.cartao_operador.findFirst({
        where:{codigo_uid: uid},
    })

    if (!cartao) {
        throw new Error('Cartão NFC não encontrado');
    }

    const token = jwt.sign(

        {
            codigo_uid:cartao.codigo_uid,
            operador:cartao.user_cpf
        },

        JWT_SECRET,

        {
            expiresIn:"10m"
        }

    );

    return {
        token,
        operador: cartao.user_cpf,
        uid: cartao.codigo_uid
    };
}
