import express from "express";
import { rotaNaoEncontrada, tratarErros } from "./http";
import { camposRouter } from "./routes/campos";
import { consultoriosRouter } from "./routes/consultorios";
import { referenciasRouter } from "./routes/referencias";

export const app = express();

app.use(express.json());

app.use(referenciasRouter); // GET /health, /municipios, /especialidades
app.use("/campos", camposRouter);
app.use("/consultorios", consultoriosRouter);

app.use(rotaNaoEncontrada);
app.use(tratarErros);
