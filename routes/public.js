import { PrismaClient } from '@prisma/client'; // Importando o Prisma Client pra falar com o banco de dados
import express from 'express'; // Importando a tal da bibliotaca principal

const router = express.Router(); // Usando só o básico pra criar rota mesmo
const prisma = new PrismaClient(); // Criando uma instância do Prisma Client pra usar depois

router.post('/registrar/Emprestimo', async (req, res) => { // Rota pra registrar empréstimo usando postzão
  const emprestimo = req.body;

  try { // Vai tentar, se der ruim, cai no catch
    const newEmprestimo = await prisma.emprestimo.create({ // Olha que maravilha a API mandando só o basico fi
      data: {
      operador_cpf: emprestimo.operador_cpf,
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
      operador_cpf: devolucao.operador_cpf,
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

router.post('/registrar/Operador', async (req, res) => { // Rota de registro de operador, sem muita ideinha
  const operador = req.body;

  try {
    const newoperador = await prisma.operador.create({
      data: {
        cpf: operador.cpf,
        setor: operador.setor,
        }
    });

    return res.status(201).json({ message: 'Operador registrado com sucesso' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao registrar operador' });
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
        operador: {
          select: {
            setor: true,
            usuario: {
              select: {
                nome: true
              }
            }
          }
        },
        ferramenta: {
          select: {
            tipo: true
        }
      }
    }
  });

  const empMapeado = emprestimos.map(emp => ({
      emprestimo_id: emp.id,
      data_retirada: emp.data_retirada,
      ferramenta_status: emp.status,
      setor_operador: emp.operador.setor,
      nome_operador: emp.operador.usuario.nome,
      tipo_ferramenta: emp.ferramenta.tipo,
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
        operador: {
          select: {
          setor: true,
            usuario: {
              select: {
                nome: true
              }
            }
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
      setor_operador: dev.operador.setor,
      nome_operador: dev.operador.usuario.nome,
    }));

    res.json(devMapeado);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Erro ao listar devoluções'});
  }
});

export default router; // Exportando as rotas, porque nós precisa usar depois

// OBS: Mais umas 200 linhas eu não vou mais tar entendendo como essa bomba tá rodando