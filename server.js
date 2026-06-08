import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import publicRouter from "./routes/public.js"; // Importando é tudo fi
import privateRouter from "./routes/private.js"
import iniciarMQTT from "./mqtthandler.js";

import auth from "./middlewares/auth.js"

const app = express(); // Usando o express todinho

app.use(cors({
    origin: true,
    credentials:true
})); // Configurando o CORS de leve pra liberar o acesso tranquilo

const server = http.createServer(app);

const io = new Server(server,{

    cors:{
        origin:"https://rastreabilidadegof.vercel.app",
        methods: ["GET", "POST"],
        credentials:true
    }

});

const PORT = process.env.PORT || 3000;
const client = iniciarMQTT(io);

app.use(express.json());
app.use('/', publicRouter); // Usando a rota pública que a gente criou, tudo que chegar na raiz vai passar por lá

app.use('/', auth, privateRouter);

app.get('/', (req, res) => {
    res.json({ message: 'Rodando...' });
});

const SELF_PING_URL = process.env.SELF_PING_URL || `http://localhost:${PORT}/`; // URL para o self-ping, usando a porta do servidor

function selfPing() {
    setInterval(async() => {
        try{
            const res = await fetch(SELF_PING_URL);
            console.log(`Self-ping successful: ${res.status}`);
        }catch(err){
            console.log(`Self-ping failed: ${err.message}`);
        }
    }, 1000 * 60 * 10); // Ping a cada 60 segundos
}

server.listen(PORT, () => {
    console.log(`Ts is running, le'go 🖥️`); // Mostrando que ts (não é this shit eu juro) tá rodando e le'go né
    selfPing(); // Iniciando o self-ping
});