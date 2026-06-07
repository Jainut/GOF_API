import express from 'express'; // Importando a tal da bibliotaca principal
import { PrismaClient } from '@prisma/client'; // Importando o Prisma Client pra usar o banco de dados, porque a gente é moderno e usa ORM

import auth from '../middlewares/auth.js';

const router = express.Router(); 
const prisma = new PrismaClient(); 

router.post('/registrar/Emprestimo', auth, async (req, res) => {
  const {user_cpf, ferramentas} = req.body;

  try {
    const emprestimo = await prisma.emprestimo.create({
      data: {
        user_cpf: user_cpf,
        status: 'Emprestado'
      }
    });

    await prisma.item_emprestimo.createMany({
      data: ferramentas.map(item => ({
        emprestimo_id: emprestimo.id,
        ferramenta_id: item.ferramenta_id,
        quantidade: item.quantidade
      }))
    });

    return res.status(201).json({
      message: 'Empréstimo registrado com sucesso',
      emprestimo_id: emprestimo.id
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Erro ao registrar empréstimo'
    });
  }
});

router.post('/registrar/Devolucao', auth, async (req, res) => {
  const {emprestimo_id, user_cpf} = req.body;

  try {
    await prisma.devolucao.create({
      data: {
        user_cpf: user_cpf,
        emprestimo_id: emprestimo_id,
        status: 'Devolvido'
      }
    });

    await prisma.emprestimo.update({
      where: { id: emprestimo_id },
      data: { status: 'Devolvido' }
    });

    return res.status(201).json({
      message: 'Devolução registrada com sucesso'
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Erro ao registrar devolução'
    });
  }
});

router.get('/listar/Emprestimos', auth, async (req, res) => {
  try {
    const emprestimos = await prisma.emprestimo.findMany({
      include: {
        usuario: {
          select: {
            nome: true,
            tipo: true,
            setor: true
          }
        },
        item_emprestimo: {
          include: {
            ferramenta: {
              select: {
                tipo: true
              }
            }
          }
        }
      }
    });

    const empMapeado = emprestimos.map(emp => ({
      emprestimo_id: emp.id,
      data_retirada: emp.data_retirada,
      ferramenta_status: emp.status,

      usuario: {
      nome_usuario: emp.usuario.nome,
      setor_usuario: emp.usuario.setor,
      tipo_usuario: emp.usuario.tipo
      },

      ferramentas: emp.item_emprestimo.map(item => ({
        ferramenta_id: item.ferramenta.id,
        tipo_ferramenta: item.ferramenta.tipo,
        quantidade: item.quantidade
      }))
    }));

    res.json(empMapeado);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Erro ao listar empréstimos'
    });
  }
});

router.get('/listar/Devolucoes', auth, async (req, res) => {
  try {
const devolucoes = await prisma.devolucao.findMany({
  select: {
    id: true,
    emprestimo_id: true,
    status: true,
    data_devolucao: true,
    usuario: {
      select: {
        nome: true,
        tipo: true,
        setor: true
      }
    },
    emprestimo: {
      select: {
        // CORREÇÃO: Passando pelos itens do empréstimo primeiro
        item_emprestimo: {
          select: {
            ferramenta: {
              select: {
                tipo: true
              }
            }
          }
        }
      }
    }
  }
});

const resultado = devolucoes.map(dev => {
  const tiposArray = dev.emprestimo?.item_emprestimo?.map(item => item.ferramenta?.tipo) || [];
  const tiposUnicos = [...new Set(tiposArray)].filter(Boolean).join(', ');

  return {
    devolucao_id: dev.id,
    emprestimo_id: dev.emprestimo_id,
    status: dev.status,
    data_devolucao: dev.data_devolucao,
    // Se vier vazio, coloca 'Desconhecido'
    tipo_ferramenta: tiposUnicos || 'Desconhecido',
    setor_usuario: dev.usuario?.setor || 'N/A',
    nome_usuario: dev.usuario?.nome || 'N/A',
    tipo_usuario: dev.usuario?.tipo || 'N/A'
  };
});

    res.json(resultado);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Erro ao listar devoluções',
    });
  }
});

router.get('/listar/Ferramentas', auth, async (req, res) => {
  try {
    const ferramentas = await prisma.ferramenta.findMany({
      include: {
        ferramenta_estoque: {
          select: {
            quantidade: true
          }
        }
      }
    });

    res.json(ferramentas);

  } catch (error) {
    res.status(500).json({
      message: 'Erro ao listar ferramentas'
    });
  }
});

router.get('/listar/Ativos', auth, async (req, res) => {
  try {
  const emprestimosAbertos = await prisma.emprestimo.findMany({

  where: {
    devolucao: null
  },

  include: {

    usuario: true,

    item_emprestimo: {

      include: {
        ferramenta: true
      }

    }

  }

})
  res.json(emprestimosAbertos);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Erro ao listar ativos'
    });
  }
});

const normalizarUid = (valor) =>
  String(valor ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

router.get('/buscar/Usuario/:uid', auth, async (req, res) => {
  const { uid } = req.params;
  const uidNormalizado = normalizarUid(uid);

  try {
    if (!uidNormalizado) {
      return res.status(400).json({ message: 'UID do cartão não informado' });
    }

    const cartoes = await prisma.cartao_operador.findMany({
      where: { ativo: true },
      include: {
        usuario: {
          select: { cpf: true, nome: true, setor: true, tipo: true }
        }
      }
    });

    const cartao = cartoes.find(c => normalizarUid(c.codigo_uid) === uidNormalizado);

    if (!cartao) {
      return res.status(404).json({
        message: 'Cartão não reconhecido ou inativo',
        uid_recebido: uid,
        uid_normalizado: uidNormalizado
      });
    }

    return res.json(cartao.usuario);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao buscar usuário pelo cartão' });
  }
});


import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: 'Token não informado'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.usuario = decoded;

    next();

  } catch (error) {
    return res.status(401).json({
      message: 'Token inválido'
    });
  }
}

export default router;