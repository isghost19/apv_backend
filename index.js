import express from "express";
import conectarDB from "./config/db.js";
import cors from "cors";
import dotenv from "dotenv/config.js";
import veterinarioRoutes from "./routes/veterinarioRoutes.js";
import pacienteRoutes from "./routes/pacineteRoutes.js";

const app = express();
app.use(express.json());

conectarDB();

const dominiosPermitidos = [process.env.FRONTEND_URL, process.env.BACKEND_URL];

const corsOptions = {
    origin: function(origin, callback) {
        if(dominiosPermitidos.indexOf(origin) !== -1) {
            // El origen del request esta permitido
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'))
        }
    }
}

app.use(cors(corsOptions));

app.use('/api/veterinarios', veterinarioRoutes);
app.use('/api/pacientes', pacienteRoutes);

const PORT = process.env.PORT || 4000;

app.listen(4000, () => {
    console.log(`Servidor funcionando en el puerto: ${PORT}`);
})