/**
 * Validações puras (sem acesso ao banco). Qualquer falha lança ValidationError,
 * que o middleware de erros converte em HTTP 400.
 */

export class ValidationError extends Error {
  constructor(public readonly detalhes: string[]) {
    super("Dados inválidos");
    this.name = "ValidationError";
  }
}

type Objeto = Record<string, unknown>;

const ehInteiroPositivo = (v: unknown): v is number =>
  typeof v === "number" && Number.isSafeInteger(v) && v > 0;

const ehInteiroNaoNegativo = (v: unknown): v is number =>
  typeof v === "number" && Number.isSafeInteger(v) && v >= 0;

function exigirObjeto(body: unknown): Objeto {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new ValidationError(["o corpo da requisição deve ser um objeto JSON"]);
  }
  return body as Objeto;
}

/** Converte o parâmetro de rota/query (string) em id inteiro positivo. */
export function exigirId(valor: unknown, nome = "id"): number {
  if (typeof valor !== "string" || !/^[1-9]\d*$/.test(valor)) {
    throw new ValidationError([`${nome} deve ser um inteiro positivo`]);
  }
  const n = Number(valor);
  if (!Number.isSafeInteger(n)) {
    throw new ValidationError([`${nome} deve ser um inteiro positivo`]);
  }
  return n;
}

export function checarCapacidade(min: number, max: number): void {
  if (min > max) {
    throw new ValidationError(["capacidadeMin não pode ser maior que capacidadeMax"]);
  }
}

// ---------------------------------------------------------------- Campo

export interface CampoInput {
  nome: string;
  endereco: string;
  classificacao: string;
  municipioId: number;
}

export function validarCampo(body: unknown, parcial: false): CampoInput;
export function validarCampo(body: unknown, parcial: true): Partial<CampoInput>;
export function validarCampo(body: unknown, parcial: boolean): Partial<CampoInput> {
  const obj = exigirObjeto(body);
  const erros: string[] = [];
  const dados: Partial<CampoInput> = {};

  for (const chave of ["nome", "endereco", "classificacao"] as const) {
    const v = obj[chave];
    if (v === undefined) {
      if (!parcial) erros.push(`${chave} é obrigatório`);
    } else if (typeof v !== "string" || v.trim() === "") {
      erros.push(`${chave} deve ser um texto não vazio`);
    } else {
      dados[chave] = v.trim();
    }
  }

  const municipioId = obj.municipioId;
  if (municipioId === undefined) {
    if (!parcial) erros.push("municipioId é obrigatório");
  } else if (!ehInteiroPositivo(municipioId)) {
    erros.push("municipioId deve ser um inteiro positivo");
  } else {
    dados.municipioId = municipioId;
  }

  if (parcial && erros.length === 0 && Object.keys(dados).length === 0) {
    erros.push("informe ao menos um campo para alterar (nome, endereco, classificacao, municipioId)");
  }

  if (erros.length > 0) throw new ValidationError(erros);
  return dados;
}

// ---------------------------------------------------------- Consultório

export interface ConsultorioInput {
  numero: number;
  campoId: number;
  especialidadeId: number;
  capacidadeMin: number;
  capacidadeMax: number;
}

export function validarConsultorio(body: unknown, parcial: false): ConsultorioInput;
export function validarConsultorio(body: unknown, parcial: true): Partial<ConsultorioInput>;
export function validarConsultorio(body: unknown, parcial: boolean): Partial<ConsultorioInput> {
  const obj = exigirObjeto(body);
  const erros: string[] = [];
  const dados: Partial<ConsultorioInput> = {};

  for (const chave of ["numero", "campoId", "especialidadeId"] as const) {
    const v = obj[chave];
    if (v === undefined) {
      if (!parcial) erros.push(`${chave} é obrigatório`);
    } else if (!ehInteiroPositivo(v)) {
      erros.push(`${chave} deve ser um inteiro positivo`);
    } else {
      dados[chave] = v;
    }
  }

  for (const chave of ["capacidadeMin", "capacidadeMax"] as const) {
    const v = obj[chave];
    if (v === undefined) {
      if (!parcial) erros.push(`${chave} é obrigatório`);
    } else if (!ehInteiroNaoNegativo(v)) {
      erros.push(`${chave} deve ser um inteiro maior ou igual a zero`);
    } else {
      dados[chave] = v;
    }
  }

  if (
    dados.capacidadeMin !== undefined &&
    dados.capacidadeMax !== undefined &&
    dados.capacidadeMin > dados.capacidadeMax
  ) {
    erros.push("capacidadeMin não pode ser maior que capacidadeMax");
  }

  if (parcial && erros.length === 0 && Object.keys(dados).length === 0) {
    erros.push(
      "informe ao menos um campo para alterar (numero, campoId, especialidadeId, capacidadeMin, capacidadeMax)",
    );
  }

  if (erros.length > 0) throw new ValidationError(erros);
  return dados;
}
