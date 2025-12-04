import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { layout } from "./layout";
import { registerInvestidorRoutes } from "./routes/investidor";
import { registerCorretoraRoutes } from "./routes/corretora";
import { registerContaRoutes } from "./routes/conta";
import { registerAtivoRoutes } from "./routes/ativo";
import { registerCotacaoRoutes } from "./routes/cotacao";
import { registerMovimentoRoutes } from "./routes/movimento";
import { registerOrdemRoutes } from "./routes/ordem";
import { registerProventoRoutes } from "./routes/provento";
import { registerRelatorioRoutes } from "./routes/relatorios";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", (req, res) => {
  const html = `
    <section>
      <h2>Menu principal</h2>
      <ul class="menu-list">
        <li><a href="/investidores">Investidores</a></li>
        <li><a href="/corretoras">Corretoras</a></li>
        <li><a href="/contas">Contas em corretoras</a></li>
        <li><a href="/ativos">Ativos</a></li>
        <li><a href="/cotacoes">Cotações históricas</a></li>
        <li><a href="/movimentos">Movimentos de caixa</a></li>
        <li><a href="/ordens">Ordens</a></li>
        <li><a href="/proventos">Proventos</a></li>
        <li><a href="/relatorios">Relatórios</a></li>
      </ul>
    </section>
  `;
  res.send(layout("Menu", html));
});

registerInvestidorRoutes(app);
registerCorretoraRoutes(app);
registerContaRoutes(app);
registerAtivoRoutes(app);
registerCotacaoRoutes(app);
registerMovimentoRoutes(app);
registerOrdemRoutes(app);
registerProventoRoutes(app);
registerRelatorioRoutes(app);

app.listen(port, () => {
  console.log(`Servidor ouvindo em http://localhost:${port}`);
});
