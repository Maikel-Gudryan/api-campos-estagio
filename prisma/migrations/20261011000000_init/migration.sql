-- CreateTable
CREATE TABLE "Municipio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "uf" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Especialidade" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Campo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "classificacao" TEXT NOT NULL,
    "municipioId" INTEGER NOT NULL,
    CONSTRAINT "Campo_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Consultorio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" INTEGER NOT NULL,
    "campoId" INTEGER NOT NULL,
    "especialidadeId" INTEGER NOT NULL,
    "capacidadeMin" INTEGER NOT NULL,
    "capacidadeMax" INTEGER NOT NULL,
    CONSTRAINT "Consultorio_campoId_fkey" FOREIGN KEY ("campoId") REFERENCES "Campo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Consultorio_especialidadeId_fkey" FOREIGN KEY ("especialidadeId") REFERENCES "Especialidade" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Municipio_nome_uf_key" ON "Municipio"("nome", "uf");

-- CreateIndex
CREATE UNIQUE INDEX "Especialidade_nome_key" ON "Especialidade"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Consultorio_campoId_numero_key" ON "Consultorio"("campoId", "numero");
