import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

const normalizarUid = (valor) =>
  String(valor ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

export async function autenticarNFC(uid) {
  const uidNormalizado = normalizarUid(uid);

  if (!uidNormalizado) {
    throw new Error('UID NFC não informado');
  }

  const cartoes = await prisma.cartao_operador.findMany({
    where: { ativo: true },
    include: {
      usuario: {
        select: {
          cpf: true,
          nome: true,
          setor: true,
          tipo: true
        }
      }
    }
  });

  const cartao = cartoes.find(
    item => normalizarUid(item.codigo_uid) === uidNormalizado
  );

  if (!cartao) {
    console.warn('Cartão NFC não encontrado', {
      uid_recebido: uid,
      uid_normalizado: uidNormalizado,
      cartoes_ativos: cartoes.map(item => ({
        id: item.id,
        codigo_uid: item.codigo_uid,
        codigo_uid_normalizado: normalizarUid(item.codigo_uid),
        user_cpf: item.user_cpf
      }))
    });

    throw new Error('Cartão NFC não encontrado');
  }

  const token = jwt.sign(
    {
      codigo_uid: cartao.codigo_uid,
      operador: cartao.user_cpf
    },
    JWT_SECRET,
    { expiresIn: '10m' }
  );

  return {
    token,
    uid: cartao.codigo_uid,
    operador: cartao.usuario
  };
}