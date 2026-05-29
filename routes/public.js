import { PrismaClient } from '@prisma/client'; // Importando o Prisma Client pra falar com o banco de dados
import express from 'express'; // Importando a tal da bibliotaca principal
import bcrypt from 'bcrypt'; // Dar aquelas hasheada de leve

import jwt from 'jsonwebtoken'; // Pra criar token de login, porque segurança é importante mesmo que seja só um projeto do senai né lobato

const JWT_SECRET = process.env.JWT_SECRET ; // Pegando a chave secreta do ambiente, ou usando uma padrão se não tiver, porque segurança é importante mesmo que seja só um projeto do senai né lobato

const router = express.Router(); // Usando só o básico pra criar rota mesmo
const prisma = new PrismaClient(); // Criando uma instância do Prisma Client pra usar depois

router.post('/registrar/Usuario', async (req, res) => { // Rota de registro de usuário porque nós é bom mai num é bombom
  const usuario = req.body;

  const salt = await bcrypt.genSalt(10); // Gerando um salt pra hashear a senha, porque segurança é importante mesmo que seja só um projeto do senai né lobato

  const hashedPassword = await bcrypt.hash(usuario.senha, salt); // Hasheando a senha do usuário com o salt gerado, porque a gente não quer senha em texto puro no banco de dados né lobato

  try {
    const newUsuario = await prisma.usuario.create({
      data: {
        cpf: usuario.cpf,
        nome: usuario.nome,
        tipo: usuario.tipo,
        setor: usuario.setor,
        senha: hashedPassword, // Guardando a senha hasheada no banco de dados, porque a gente é responsável e não quer deixar senha em texto puro por aí né lobato
      }
    });

    return res.status(201).json({ message: 'Usuário registrado com sucesso' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
});

router.post('/login', async (req, res) => { // Rota de login, porque a gente precisa de segurança né
  const userInfo = req.body;

  try {
    const user = await prisma.usuario.findUnique({
      where: { cpf: userInfo.cpf },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const isMatch = await bcrypt.compare(userInfo.senha, user.senha); // Comparando a senha fornecida com a senha hasheada no banco

    if (!isMatch) {
      return res.status(401).json({ message: 'Senha incorreta' });
    }

    // Gerar o token JWT
    const token = jwt.sign({ cpf: user.cpf, nome: user.nome, tipo: user.tipo }, JWT_SECRET, { expiresIn: '1d' }); // Criando um token com as informações do usuário e a chave secreta, expira em 1 hora

    return res.status(200).json({ message: 'Login realizado com sucesso', token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao realizar login' });
  }
});

router.post('/login/NFC', async (req, res) => {
  const nfcInfo = req.body;

  try {
    const cartao_operador = await prisma.cartao_operador.findFirst({
      where: { codigo_uid: nfcInfo.uid },
    });

    if (!cartao_operador) {
      return res.status(404).json({ message: 'Cartão NFC não encontrado' });
    }

    // Gerar o token JWT
    const token = jwt.sign({ codigo_id: cartao_operador.codigo_uid}, JWT_SECRET, { expiresIn: '600s' });

    return res.status(200).json({ message: 'Usuário autenticado com sucesso', token, operador: cartao_operador.user_cpf, codigo_uid: cartao_operador.codigo_uid });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
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

export default router; // Exportando as rotas, porque nós precisa usar depois

// OBS: Mais umas 200 linhas eu não vou mais tar entendendo como essa bomba tá rodando
// OBS2: Não deu nem 200 linhas ainda e já não sei como isso tá rodando tamo juntooooooooooooooooo
