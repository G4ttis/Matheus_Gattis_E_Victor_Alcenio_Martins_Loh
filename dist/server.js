"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
const layout_1 = require("./layout");
const investidor_1 = require("./routes/investidor");
const corretora_1 = require("./routes/corretora");
const conta_1 = require("./routes/conta");
const ativo_1 = require("./routes/ativo");
const cotacao_1 = require("./routes/cotacao");
const movimento_1 = require("./routes/movimento");
const ordem_1 = require("./routes/ordem");
const provento_1 = require("./routes/provento");
const relatorios_1 = require("./routes/relatorios");
const app = (0, express_1.default)();
const port = 3000;
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static(path_1.default.join(__dirname, "..", "public")));
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
    res.send((0, layout_1.layout)("Menu", html));
});
(0, investidor_1.registerInvestidorRoutes)(app);
(0, corretora_1.registerCorretoraRoutes)(app);
(0, conta_1.registerContaRoutes)(app);
(0, ativo_1.registerAtivoRoutes)(app);
(0, cotacao_1.registerCotacaoRoutes)(app);
(0, movimento_1.registerMovimentoRoutes)(app);
(0, ordem_1.registerOrdemRoutes)(app);
(0, provento_1.registerProventoRoutes)(app);
(0, relatorios_1.registerRelatorioRoutes)(app);
app.listen(port, () => {
    console.log(`Servidor ouvindo em http://localhost:${port}`);
});
