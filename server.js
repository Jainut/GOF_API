import express from "express";
import cors from "cors"; 
import publicRouter from "./routes/public.js";

const app = express(); // Usando o express todinho
const PORT = process.env.PORT || 3000;

app.use(cors()); 
app.use(express.json());

app.use('/', publicRouter); 

app.get('/', (req, res) => {
    res.json({ message: 'Rodando...' });
});

app.listen(PORT, () => {
    console.log(`Ta rodando risos kkkk ne`); // Mostrando que ts (não é this shit eu juro) tá rodando e le'go né
});