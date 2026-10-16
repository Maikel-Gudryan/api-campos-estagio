import "dotenv/config";
import { app } from "./app";

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`; // testa conexão com o banco
    res.json({ status: "ok", db: "connected" });
  } catch (error) {
    res.status(500).json({ status: "error", db: "not connected" });
  }
});

