import { PrismaClient } from '@prisma/client'; // Importando o Prisma Client pra falar com o banco de dados
import express from 'express'; // Importando a tal da bibliotaca principal
import bcrypt from 'bcrypt'; // Dar aquelas hasheada de leve

const router = express.Router(); // Usando só o básico pra criar rota mesmo
const prisma = new PrismaClient(); // Criando uma instância do Prisma Client pra usar depois

router.post('/registrar/Emprestimo', async (req, res) => { // Rota pra registrar empréstimo usando postzão
  const emprestimo = req.body;

  try { // Vai tentar, se der ruim, cai no catch
    const newEmprestimo = await prisma.emprestimo.create({ // Olha que maravilha a API mandando só o basico fi
      data: {
      user_cpf: emprestimo.user_cpf,
      ferramenta_id: emprestimo.ferramenta_id,
      status: 'Emprestado', // Aqui a gente já marca como emprestado, porque é isso que tá acontecendo
      }
    });

    return res.status(201).json({message: 'Empréstimo registrado com sucesso'});
  } catch (error) { // Caiu no catch, deu ruim, se deu ruim vai logar o erro e mandar resposta de erro
    console.error('Erro ao registrar empréstimo:', error);
    res.status(500).json({ message: 'Erro ao registrar empréstimo' });
  }
});

router.post('/registrar/Devolucao', async (req, res) => {
  const devolucao = req.body;

  try { // Vai tentar, se der ruim, cai no catch
    const newDevolucao = await prisma.devolucao.create({
      data: {
      user_cpf: devolucao.user_cpf,
      emprestimo_id: devolucao.emprestimo_id,
      ferramenta_id: devolucao.ferramenta_id,
      status: 'Devolvido', // Aqui a gente já marca como devolvido, porque é isso que tá acontecendo
      }
    });

    return res.status(201).json({message: 'Devolução registrada com sucesso'});
  } catch (error) { // Caiu no catch, deu ruim, se deu ruim vai logar o erro e mandar resposta de erro
    console.error('Erro ao registrar devolução:', error);
    res.status(500).json({ message: 'Erro ao registrar devolução' });
  }
});

router.post('/registrar/Usuario', async (req, res) => { // Rota de registro de usuário porque nós é bom mai num é bombom
  const usuario = req.body;

  try {
    const newUsuario = await prisma.usuario.create({
      data: {
        cpf: usuario.cpf,
        nome: usuario.nome,
        tipo: usuario.tipo,
        setor: usuario.setor,
        senha: await bcrypt.hash(usuario.senha, 10)
      }
    });

    return res.status(201).json({ message: 'Usuário registrado com sucesso' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
});

router.get('/listar/Emprestimos', async (req, res) => { // Rota pra listar os empréstimos, usando getzão
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
            setor: true,
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
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar empréstimos'});
  }
});

router.get('/listar/Devolucoes', async (req,res) => { // Rota pra listar devoluções, topzera
  try {
    const devolucoes = await prisma.devolucao.findMany({ // Inferno de aninhamento 
      select: {
        id: true,
        emprestimo_id: true,
        status: true,
        data_devolucao: true,
        usuario: {
          select: {
          nome: true,
          tipo: true,
          setor: true,
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
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Erro ao listar devoluções'});
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

    return res.status(200).json({ message: 'Login realizado com sucesso'});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao realizar login' });
  }
});

export default router; // Exportando as rotas, porque nós precisa usar depois

// OBS: Mais umas 200 linhas eu não vou mais tar entendendo como essa bomba tá rodando
// OBS2: Não deu nem 200 linhas ainda e já não sei como isso tá rodando tamo juntooooooooooooooooo