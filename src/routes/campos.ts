import { Router } from "express";
import { prisma } from "../db";
import { asyncHandler, HttpError } from "../http";
import { exigirId, validarCampo } from "../validation";

export const camposRouter = Router();

async function buscarCampoOu404(id: number) {
  const campo = await prisma.campo.findUnique({ where: { id } });
  if (!campo) throw new HttpError(404, "Campo não encontrado");
  return campo;
}

async function exigirMunicipio(id: number): Promise<void> {
  const municipio = await prisma.municipio.findUnique({ where: { id } });
  if (!municipio) throw new HttpError(404, "Município não encontrado");
}

camposRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const dados = validarCampo(req.body, false);
    await exigirMunicipio(dados.municipioId);
    const campo = await prisma.campo.create({ data: dados });
    res.status(201).json(campo);
  }),
);

camposRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const campos = await prisma.campo.findMany({ orderBy: { id: "asc" } });
    res.status(200).json(campos);
  }),
);

camposRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = exigirId(req.params.id);
    res.status(200).json(await buscarCampoOu404(id));
  }),
);

// Consultórios vinculados a um campo (atalho para GET /consultorios?campoId=:id)
camposRouter.get(
  "/:id/consultorios",
  asyncHandler(async (req, res) => {
    const id = exigirId(req.params.id);
    await buscarCampoOu404(id);
    const consultorios = await prisma.consultorio.findMany({
      where: { campoId: id },
      orderBy: { numero: "asc" },
    });
    res.status(200).json(consultorios);
  }),
);

camposRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = exigirId(req.params.id);
    const dados = validarCampo(req.body, true);
    await buscarCampoOu404(id);
    if (dados.municipioId !== undefined) await exigirMunicipio(dados.municipioId);
    const campo = await prisma.campo.update({ where: { id }, data: dados });
    res.status(200).json(campo);
  }),
);

camposRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = exigirId(req.params.id);
    await buscarCampoOu404(id);

    const vinculados = await prisma.consultorio.count({ where: { campoId: id } });
    if (vinculados > 0) {
      throw new HttpError(
        409,
        `Não é possível excluir o campo: existem ${vinculados} consultório(s) vinculado(s) a ele`,
      );
    }

    await prisma.campo.delete({ where: { id } });
    res.status(204).send();
  }),
);
