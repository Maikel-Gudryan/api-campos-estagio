import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ValidationError,
  checarCapacidade,
  exigirId,
  validarCampo,
  validarConsultorio,
} from "../src/validation";

const campoOk = { nome: "Campo Centro", endereco: "Rua A, 100", classificacao: "Principal", municipioId: 1 };
const consultorioOk = { numero: 101, campoId: 1, especialidadeId: 2, capacidadeMin: 1, capacidadeMax: 4 };

test("exigirId aceita inteiros positivos em texto e rejeita o resto", () => {
  assert.equal(exigirId("7"), 7);
  for (const ruim of ["0", "-1", "abc", "1.5", "", "01", undefined, ["1"]]) {
    assert.throws(() => exigirId(ruim), ValidationError);
  }
});

test("validarCampo: cadastro completo é aceito e textos são aparados", () => {
  const dados = validarCampo({ ...campoOk, nome: "  Campo Centro  " }, false);
  assert.deepEqual(dados, campoOk);
});

test("validarCampo: campos obrigatórios ausentes ou inválidos geram 400", () => {
  assert.throws(() => validarCampo({}, false), ValidationError);
  assert.throws(() => validarCampo({ ...campoOk, nome: "   " }, false), ValidationError);
  assert.throws(() => validarCampo({ ...campoOk, endereco: 10 }, false), ValidationError);
  assert.throws(() => validarCampo({ ...campoOk, municipioId: "1" }, false), ValidationError);
  assert.throws(() => validarCampo({ ...campoOk, municipioId: 0 }, false), ValidationError);
  assert.throws(() => validarCampo({ ...campoOk, municipioId: 1.5 }, false), ValidationError);
  for (const corpo of [null, "texto", 5, [], undefined]) {
    assert.throws(() => validarCampo(corpo, false), ValidationError);
  }
});

test("validarCampo (parcial): aceita subconjunto, rejeita vazio e valores ruins", () => {
  assert.deepEqual(validarCampo({ nome: "Novo" }, true), { nome: "Novo" });
  assert.throws(() => validarCampo({}, true), ValidationError);
  assert.throws(() => validarCampo({ nome: "" }, true), ValidationError);
});

test("validarConsultorio: cadastro completo é aceito", () => {
  assert.deepEqual(validarConsultorio(consultorioOk, false), consultorioOk);
  assert.deepEqual(validarConsultorio({ ...consultorioOk, capacidadeMin: 3, capacidadeMax: 3 }, false).capacidadeMin, 3);
});

test("validarConsultorio: capacidadeMin maior que capacidadeMax é rejeitada", () => {
  assert.throws(
    () => validarConsultorio({ ...consultorioOk, capacidadeMin: 5, capacidadeMax: 4 }, false),
    (e: unknown) => e instanceof ValidationError && e.detalhes.some((d) => d.includes("capacidadeMin")),
  );
  assert.throws(() => validarConsultorio({ capacidadeMin: 9, capacidadeMax: 2 }, true), ValidationError);
});

test("validarConsultorio: campos obrigatórios e tipos", () => {
  assert.throws(() => validarConsultorio({}, false), ValidationError);
  for (const chave of Object.keys(consultorioOk)) {
    const { [chave as keyof typeof consultorioOk]: _omitido, ...resto } = consultorioOk;
    assert.throws(() => validarConsultorio(resto, false), ValidationError, `sem ${chave}`);
  }
  assert.throws(() => validarConsultorio({ ...consultorioOk, numero: "101" }, false), ValidationError);
  assert.throws(() => validarConsultorio({ ...consultorioOk, campoId: -1 }, false), ValidationError);
  assert.throws(() => validarConsultorio({ ...consultorioOk, capacidadeMin: -1 }, false), ValidationError);
  assert.throws(() => validarConsultorio({ ...consultorioOk, capacidadeMax: 2.5 }, false), ValidationError);
});

test("validarConsultorio (parcial): aceita subconjunto e rejeita vazio", () => {
  assert.deepEqual(validarConsultorio({ capacidadeMax: 10 }, true), { capacidadeMax: 10 });
  assert.throws(() => validarConsultorio({}, true), ValidationError);
});

test("checarCapacidade valida o resultado final de um PATCH", () => {
  assert.doesNotThrow(() => checarCapacidade(2, 2));
  assert.throws(() => checarCapacidade(3, 2), ValidationError);
});
