import type { NextFunction, Request, RequestHandler, Response } from "express";
import { Prisma } from "@prisma/client";
import { ValidationError } from "./validation";

/** Erro com status HTTP definido (ex.: 404, 409). */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

/** Express 4 não captura rejeições de handlers async; este wrapper encaminha para o middleware de erro. */
export const asyncHandler =
  (fn: (req: Request, res: Response) => Promise<void>): RequestHandler =>
  (req, res, next) => {
    fn(req, res).catch(next);
  };

export function rotaNaoEncontrada(_req: Request, res: Response): void {
  res.status(404).json({ erro: "Rota não encontrada" });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function tratarErros(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ValidationError) {
    res.status(400).json({ erro: err.message, detalhes: err.detalhes });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ erro: err.message });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({ erro: "Já existe um registro com esses dados (conflito de unicidade)" });
      return;
    }
    if (err.code === "P2003") {
      res.status(409).json({ erro: "Operação em conflito com registros relacionados" });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({ erro: "Registro não encontrado" });
      return;
    }
  }

  // Erros do body-parser (JSON malformado, corpo grande demais etc.)
  const e = err as { type?: string; status?: number } | null;
  if (e?.type === "entity.parse.failed") {
    res.status(400).json({ erro: "JSON inválido no corpo da requisição" });
    return;
  }
  if (typeof e?.status === "number" && e.status >= 400 && e.status < 500) {
    res.status(e.status).json({ erro: "Requisição inválida" });
    return;
  }

  console.error(err);
  res.status(500).json({ erro: "Erro interno do servidor" });
}
