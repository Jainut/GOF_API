import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import publicRouter from "./routes/public.js"; // Importando é tudo fi
import privateRouter from "./routes/private.js"
import iniciarMQTT from "./mqttHandler.js";
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', { withCredentials: true });

import auth from "./middlewares/auth.js"

const app = express(); // Usando o express todinho

app.use(cors({
    origin: true,
    credentials:true
})); // Configurando o CORS de leve pra liberar o acesso tranquilo

const server = http.createServer(app);

const io = new Server(server,{

    cors:{
        origin:"http://localhost:5173",
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

server.listen(PORT, () => {
    console.log(`Ts is running, le'go 🖥️`); // Mostrando que ts (não é this shit eu juro) tá rodando e le'go né
});
