import express from "express";
import cors from "cors";
import publicRouter from "./routes/public.js"; // Importando é tudo fi

const app = express(); // Usando o express todinho
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors()); // Liberando geral pra todo mundo acessar, sem frescura de CORS
app.use('/', publicRouter); // Usando a rota pública que a gente criou, tudo que chegar na raiz vai passar por lá

app.get('/', (req, res) => {
    res.json({ message: 'Rodando...' });
});

app.listen(PORT, () => {
    console.log(`Ts is running, le'go 🖥️`); // Mostrando que ts (não é this shit eu juro) tá rodando e le'go né
});
