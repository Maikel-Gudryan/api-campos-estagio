import { Router } from "express";
import { prisma } from "../db";
import { asyncHandler } from "../http";

export const referenciasRouter = Router();

referenciasRouter.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

referenciasRouter.get(
  "/municipios",
  asyncHandler(async (_req, res) => {
    const municipios = await prisma.municipio.findMany({ orderBy: [{ nome: "asc" }, { uf: "asc" }] });
    res.status(200).json(municipios);
  }),
);

referenciasRouter.get(
  "/especialidades",
  asyncHandler(async (_req, res) => {
    const especialidades = await prisma.especialidade.findMany({ orderBy: { nome: "asc" } });
    res.status(200).json(especialidades);
  }),
);
