import express from 'express'; // Importando a tal da bibliotaca principal
import { PrismaClient } from '@prisma/client'; // Importando o Prisma Client pra usar o banco de dados, porque a gente é moderno e usa ORM

import auth from '../middlewares/auth.js';

const router = express.Router(); 
const prisma = new PrismaClient(); 

router.post('/registrar/Emprestimo', auth, async (req, res) => {
  const {user_cpf, ferramentas} = req.body;

  try {
    const emprestimo =await prisma.emprestimo.create({
      data: {
        user_cpf: emprestimo.user_cpf,
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
  const devolucao = req.body;

  try {
    await prisma.devolucao.create({
      data: {
        user_cpf: devolucao.user_cpf,
        emprestimo_id: devolucao.emprestimo_id,
        ferramenta_id: devolucao.ferramenta_id,
        status: 'Devolvido'
      }
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
      select: {
        id: true,
        data_retirada: true,
        status: true,
        usuario: {
          select: {
            nome: true,
            tipo: true,
            setor: true
          }
        },
        ferramenta: {
          select: {
            id: true,
            tipo: true
          }
        }
      }
    });

    const empMapeado = emprestimos.map(emp => ({
      emprestimo_id: emp.id,
      data_retirada: emp.data_retirada,
      ferramenta_status: emp.status,
      setor_usuario: emp.usuario.setor,
      nome_usuario: emp.usuario.nome,
      tipo_usuario: emp.usuario.tipo,
      tipo_ferramenta: emp.ferramenta.tipo,
      ferramenta_id: emp.ferramenta.id
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
        ferramenta: {
          select: {
            tipo: true
          }
        }
      }
    });

    const devMapeado = devolucoes.map(dev => ({
      devolucao_id: dev.id,
      emprestimo_id: dev.emprestimo_id,
      status: dev.status,
      data_devolucao: dev.data_devolucao,
      tipo_ferramenta: dev.ferramenta.tipo,
      setor_usuario: dev.usuario.setor,
      nome_usuario: dev.usuario.nome,
      tipo_usuario: dev.usuario.tipo
    }));

    res.json(devMapeado);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Erro ao listar devoluções'
    });
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