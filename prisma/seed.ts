import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const municipios = [
  { nome: "Aracaju", uf: "SE" },
  { nome: "Belém", uf: "PA" },
  { nome: "Belo Horizonte", uf: "MG" },
  { nome: "Brasília", uf: "DF" },
  { nome: "Campinas", uf: "SP" },
  { nome: "Curitiba", uf: "PR" },
  { nome: "Florianópolis", uf: "SC" },
  { nome: "Fortaleza", uf: "CE" },
  { nome: "Goiânia", uf: "GO" },
  { nome: "João Pessoa", uf: "PB" },
  { nome: "Manaus", uf: "AM" },
  { nome: "Natal", uf: "RN" },
  { nome: "Porto Alegre", uf: "RS" },
  { nome: "Recife", uf: "PE" },
  { nome: "Rio de Janeiro", uf: "RJ" },
  { nome: "Salvador", uf: "BA" },
  { nome: "São Luís", uf: "MA" },
  { nome: "São Paulo", uf: "SP" },
  { nome: "Vitória", uf: "ES" },
];

const especialidades = [
  "Cardiologia",
  "Clínica Geral",
  "Dermatologia",
  "Endocrinologia",
  "Fisioterapia",
  "Ginecologia",
  "Neurologia",
  "Nutrição",
  "Odontologia",
  "Oftalmologia",
  "Ortopedia",
  "Pediatria",
  "Psicologia",
  "Psiquiatria",
];

// Idempotente: pode ser executado várias vezes sem duplicar registros.
async function main() {
  for (const m of municipios) {
    await prisma.municipio.upsert({
      where: { nome_uf: { nome: m.nome, uf: m.uf } },
      update: {},
      create: m,
    });
  }

  for (const nome of especialidades) {
    await prisma.especialidade.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
  }

  console.log(`Seed concluído: ${municipios.length} municípios e ${especialidades.length} especialidades.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
