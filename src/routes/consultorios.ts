import { Router } from "express";
import { prisma } from "../db";
import { asyncHandler, HttpError } from "../http";
import { checarCapacidade, exigirId, validarConsultorio } from "../validation";

export const consultoriosRouter = Router();

async function buscarConsultorioOu404(id: number) {
  const consultorio = await prisma.consultorio.findUnique({ where: { id } });
  if (!consultorio) throw new HttpError(404, "Consultório não encontrado");
  return consultorio;
}

async function exigirCampo(id: number): Promise<void> {
  const campo = await prisma.campo.findUnique({ where: { id } });
  if (!campo) throw new HttpError(404, "Campo não encontrado");
}

async function exigirEspecialidade(id: number): Promise<void> {
  const especialidade = await prisma.especialidade.findUnique({ where: { id } });
  if (!especialidade) throw new HttpError(404, "Especialidade não encontrada");
}

consultoriosRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const dados = validarConsultorio(req.body, false);
    await exigirCampo(dados.campoId);
    await exigirEspecialidade(dados.especialidadeId);
    const consultorio = await prisma.consultorio.create({ data: dados });
    res.status(201).json(consultorio);
  }),
);

// Aceita o filtro opcional ?campoId=...
consultoriosRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    let where = {};
    if (req.query.campoId !== undefined) {
      const campoId = exigirId(req.query.campoId, "campoId");
      await exigirCampo(campoId);
      where = { campoId };
    }
    const consultorios = await prisma.consultorio.findMany({ where, orderBy: { id: "asc" } });
    res.status(200).json(consultorios);
  }),
);

consultoriosRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = exigirId(req.params.id);
    res.status(200).json(await buscarConsultorioOu404(id));
  }),
);

consultoriosRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = exigirId(req.params.id);
    const dados = validarConsultorio(req.body, true);
    const atual = await buscarConsultorioOu404(id);

    // A regra min <= max vale para o resultado final (valores novos + os que já existiam).
    checarCapacidade(
      dados.capacidadeMin ?? atual.capacidadeMin,
      dados.capacidadeMax ?? atual.capacidadeMax,
    );

    if (dados.campoId !== undefined) await exigirCampo(dados.campoId);
    if (dados.especialidadeId !== undefined) await exigirEspecialidade(dados.especialidadeId);

    const consultorio = await prisma.consultorio.update({ where: { id }, data: dados });
    res.status(200).json(consultorio);
  }),
);

consultoriosRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = exigirId(req.params.id);
    await buscarConsultorioOu404(id);
    await prisma.consultorio.delete({ where: { id } });
    res.status(204).send();
  }),
);
