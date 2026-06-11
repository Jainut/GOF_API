import { PrismaClient } from '@prisma/client'; // Importando o Prisma Client pra falar com o banco de dados
import express from 'express'; // Importando a tal da bibliotaca principal
import bcrypt from 'bcrypt'; // Dar aquelas hasheada de leve
import {autenticarNFC} from "../services/nfcAuth.js"; // Importando a funlção pra autenticar NFC

import jwt from 'jsonwebtoken'; // Pra criar token de login, porque segurança é importante mesmo que seja só um projeto do senai né lobato

const JWT_SECRET = process.env.JWT_SECRET ; // Pegando a chave secreta do ambiente, ou usando uma padrão se não tiver, porque segurança é importante mesmo que seja só um projeto do senai né lobato

const router = express.Router(); // Usando só o básico pra criar rota mesmo
const prisma = new PrismaClient(); // Criando uma instância do Prisma Client pra usar depois

router.post('/login/almoxarife', async (req, res) => {
  const userInfo = req.body;
  try {
    const user = await prisma.usuario.findUnique({
      where: { cpf: userInfo.cpf },
    });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    if (user.tipo !== 'ALMOXARIFE') {
      return res.status(403).json({ message: 'Acesso negado: usuário não é almoxarife' });
    }
    const isMatch = await bcrypt.compare(userInfo.senha, user.senha);
    if (!isMatch) {
      return res.status(401).json({ message: 'Senha incorreta' });
    }
    const token = jwt.sign({ cpf: user.cpf, nome: user.nome, tipo: user.tipo }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 24*60*60*1000 });
    return res.status(200).json({ message: 'Login realizado com sucesso'});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao realizar login' });
  }
});

router.post('/login/admin', async (req, res) => {
  const userInfo = req.body;
  try {
    const user = await prisma.usuario.findUnique({
      where: { cpf: userInfo.cpf },
    });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    if (user.tipo !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado: usuário não é administrador' });
    }
    const isMatch = await bcrypt.compare(userInfo.senha, user.senha);
    if (!isMatch) {
      return res.status(401).json({ message: 'Senha incorreta' });
    }
    const token = jwt.sign({ cpf: user.cpf, nome: user.nome, tipo: user.tipo }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 24*60*60*1000 });
    return res.status(200).json({ message: 'Login realizado com sucesso'});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao realizar login' });
  }
});

router.post('/login/NFC', async (req, res) => {
  const nfcInfo = req.body;

  try {
    const resultado = await autenticarNFC(nfcInfo.uid); // Chamando a função de autenticação NFC, que vai verificar o cartão e gerar um token se for válido

    if (!resultado) {
      return res.status(401).json({ message: 'Cartão NFC inválido'});
    }

    res.cookie('token', resultado.token, { httpOnly: true, sameSite: 'lax', maxAge: 5*60*1000 }); // Guardando o token nos cookies ao invés de local storage

    return res.status(200).json({ message: 'Usuário autenticado com sucesso' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router; // Exportando as rotas, porque nós precisa usar depois

// OBS: Mais umas 200 linhas eu não vou mais tar entendendo como essa bomba tá rodando
// OBS2: Não deu nem 200 linhas ainda e já não sei como isso tá rodando tamo juntooooooooooooooooo
