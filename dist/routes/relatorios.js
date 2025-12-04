"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRelatorioRoutes = registerRelatorioRoutes;
const db_1 = require("../db");
const layout_1 = require("../layout");
function registerRelatorioRoutes(app) {
    app.get("/relatorios", (req, res) => {
        const html = `
      <section>
        <h2>Relatórios</h2>
        <ul class="menu-list">
          <li><a href="/relatorios/ordens">Relatório de ordens por período</a></li>
          <li><a href="/relatorios/proventos">Relatório de proventos por período</a></li>
          <li><a href="/relatorios/posicao">Relatório de posição consolidada</a></li>
        </ul>
      </section>
    `;
        res.send((0, layout_1.layout)("Relatórios", html));
    });
    app.get("/relatorios/ordens", (req, res) => {
        const html = `
      <section>
        <h2>Relatório de ordens por período</h2>
        <form method="post" action="/relatorios/ordens">
          <label>Data inicial</label>
          <input type="date" name="data_inicial" required/>
          <label>Data final</label>
          <input type="date" name="data_final" required/>
          <label>ID do investidor (opcional)</label>
          <input name="id_investidor"/>
          <label>ID do ativo (opcional)</label>
          <input name="id_ativo"/>
          <button type="submit">Gerar</button>
        </form>
      </section>
    `;
        res.send((0, layout_1.layout)("Relatório de ordens", html));
    });
    app.post("/relatorios/ordens", async (req, res) => {
        const db = await (0, db_1.getDb)();
        const dataInicial = new Date(req.body.data_inicial);
        const dataFinal = new Date(req.body.data_final);
        dataFinal.setHours(23, 59, 59, 999);
        const idInvestidor = req.body.id_investidor ? Number(req.body.id_investidor) : null;
        const idAtivo = req.body.id_ativo ? Number(req.body.id_ativo) : null;
        const ordens = await db.collection("ordem").find({
            dt_ordem: { $gte: dataInicial, $lte: dataFinal }
        }).toArray();
        const contas = await db.collection("conta_corretora").find({}).toArray();
        const investidores = await db.collection("investidor").find({}).toArray();
        const ativos = await db.collection("ativo").find({}).toArray();
        const filtradas = ordens.filter(o => {
            if (idAtivo && o.id_ativo !== idAtivo)
                return false;
            if (idInvestidor) {
                const conta = contas.find(c => c.id_conta === o.id_conta);
                if (!conta || conta.id_investidor !== idInvestidor)
                    return false;
            }
            return true;
        });
        const rows = filtradas.map(o => {
            const conta = contas.find(c => c.id_conta === o.id_conta);
            const investidor = conta ? investidores.find(i => i.id_investidor === conta.id_investidor) : null;
            const ativo = ativos.find(a => a.id_ativo === o.id_ativo);
            return `
        <tr>
          <td>${o.id_ordem}</td>
          <td>${new Date(o.dt_ordem).toLocaleString("pt-BR")}</td>
          <td>${investidor ? investidor.nome : ""}</td>
          <td>${ativo ? ativo.codigo : ""}</td>
          <td>${o.lado}</td>
          <td>${o.quantidade}</td>
          <td>${o.preco}</td>
          <td>${o.custos}</td>
        </tr>
      `;
        }).join("");
        const html = `
      <section>
        <h2>Relatório de ordens por período</h2>
        <p>Período: ${req.body.data_inicial} a ${req.body.data_final}</p>
        <table>
          <thead>
            <tr>
              <th>ID Ordem</th><th>Data</th><th>Investidor</th><th>Ativo</th>
              <th>Lado</th><th>Qtd</th><th>Preço</th><th>Custos</th>
            </tr>
          </thead>
          <tbody>
            ${rows || "<tr><td colspan='8'>Nenhuma ordem no período.</td></tr>"}
          </tbody>
        </table>
        <a href="/relatorios/ordens">Novo filtro</a>
      </section>
    `;
        res.send((0, layout_1.layout)("Relatório de ordens", html));
    });

    app.get("/relatorios/proventos", (req, res) => {
        const html = `
      <section>
        <h2>Relatório de proventos por período</h2>
        <form method="post" action="/relatorios/proventos">
          <label>Data inicial</label>
          <input type="date" name="data_inicial" required/>
          <label>Data final</label>
          <input type="date" name="data_final" required/>
          <label>ID do investidor (opcional)</label>
          <input name="id_investidor"/>
          <label>ID do ativo (opcional)</label>
          <input name="id_ativo"/>
          <button type="submit">Gerar</button>
        </form>
      </section>
    `;
        res.send((0, layout_1.layout)("Relatório de proventos", html));
    });
    app.post("/relatorios/proventos", async (req, res) => {
        const db = await (0, db_1.getDb)();
        const dataInicial = new Date(req.body.data_inicial);
        const dataFinal = new Date(req.body.data_final);
        dataFinal.setHours(23, 59, 59, 999);
        const idInvestidor = req.body.id_investidor ? Number(req.body.id_investidor) : null;
        const idAtivo = req.body.id_ativo ? Number(req.body.id_ativo) : null;
        const proventos = await db.collection("provento").find({
            dt_pagamento: { $gte: dataInicial, $lte: dataFinal }
        }).toArray();
        const contas = await db.collection("conta_corretora").find({}).toArray();
        const investidores = await db.collection("investidor").find({}).toArray();
        const ativos = await db.collection("ativo").find({}).toArray();
        const filtrados = proventos.filter(p => {
            if (idAtivo && p.id_ativo !== idAtivo)
                return false;
            if (idInvestidor) {
                const conta = contas.find(c => c.id_conta === p.id_conta);
                if (!conta || conta.id_investidor !== idInvestidor)
                    return false;
            }
            return true;
        });
        const rows = filtrados.map(p => {
            const conta = contas.find(c => c.id_conta === p.id_conta);
            const investidor = conta ? investidores.find(i => i.id_investidor === conta.id_investidor) : null;
            const ativo = ativos.find(a => a.id_ativo === p.id_ativo);
            return `
        <tr>
          <td>${p.id_provento}</td>
          <td>${new Date(p.dt_pagamento).toLocaleDateString("pt-BR")}</td>
          <td>${investidor ? investidor.nome : ""}</td>
          <td>${ativo ? ativo.codigo : ""}</td>
          <td>${p.tipo_provento}</td>
          <td>${p.valor_total}</td>
          <td>${p.imposto_retido}</td>
        </tr>
      `;
        }).join("");
        const html = `
      <section>
        <h2>Relatório de proventos por período</h2>
        <p>Período: ${req.body.data_inicial} a ${req.body.data_final}</p>
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Data</th><th>Investidor</th><th>Ativo</th>
              <th>Tipo</th><th>Valor</th><th>Imposto</th>
            </tr>
          </thead>
          <tbody>
            ${rows || "<tr><td colspan='7'>Nenhum provento no período.</td></tr>"}
          </tbody>
        </table>
        <a href="/relatorios/proventos">Novo filtro</a>
      </section>
    `;
        res.send((0, layout_1.layout)("Relatório de proventos", html));
    });
    app.get("/relatorios/posicao", (req, res) => {
        const html = `
      <section>
        <h2>Relatório de posição consolidada</h2>
        <form method="post" action="/relatorios/posicao">
          <label>ID do investidor (opcional)</label>
          <input name="id_investidor"/>
          <label>ID do ativo (opcional)</label>
          <input name="id_ativo"/>
          <button type="submit">Gerar</button>
        </form>
      </section>
    `;
        res.send((0, layout_1.layout)("Posição consolidada", html));
    });
    app.post("/relatorios/posicao", async (req, res) => {
        const db = await (0, db_1.getDb)();
        const idInvestidor = req.body.id_investidor ? Number(req.body.id_investidor) : null;
        const idAtivo = req.body.id_ativo ? Number(req.body.id_ativo) : null;
        const ordens = await db.collection("ordem").find({}).toArray();
        const contas = await db.collection("conta_corretora").find({}).toArray();
        const investidores = await db.collection("investidor").find({}).toArray();
        const ativos = await db.collection("ativo").find({}).toArray();
        const mapa = new Map();
        for (const o of ordens) {
            const conta = contas.find(c => c.id_conta === o.id_conta);
            if (!conta)
                continue;
            const invId = conta.id_investidor;
            if (idInvestidor && invId !== idInvestidor)
                continue;
            if (idAtivo && o.id_ativo !== idAtivo)
                continue;
            const ativo = ativos.find(a => a.id_ativo === o.id_ativo);
            const investidor = investidores.find(i => i.id_investidor === invId);
            if (!ativo || !investidor)
                continue;
            const key = `${invId}-${o.id_ativo}`;
            if (!mapa.has(key)) {
                mapa.set(key, {
                    investidorId: invId,
                    ativoId: o.id_ativo,
                    comprado: 0,
                    vendido: 0,
                    investidorNome: investidor.nome,
                    codigoAtivo: ativo.codigo
                });
            }
            const pos = mapa.get(key);
            if (o.lado === "COMPRA") {
                pos.comprado += o.quantidade * o.preco;
            }
            else if (o.lado === "VENDA") {
                pos.vendido += o.quantidade * o.preco;
            }
        }
        let totalInvestidoGeral = 0;
        const rows = Array.from(mapa.values()).map(p => {
            const quantidadeLiquidaValor = p.comprado - p.vendido;
            const quantidadeLiquidaQtd = quantidadeLiquidaValor; // simplificação, já que não temos qtde separada aqui
            const investido = p.comprado;
            totalInvestidoGeral += investido;
            const precoMedio = quantidadeLiquidaQtd !== 0 ? investido / quantidadeLiquidaQtd : 0;
            return `
        <tr>
          <td>${p.investidorNome}</td>
          <td>${p.codigoAtivo}</td>
          <td>${p.comprado.toFixed(2)}</td>
          <td>${p.vendido.toFixed(2)}</td>
          <td>${quantidadeLiquidaQtd.toFixed(2)}</td>
          <td>${investido.toFixed(2)}</td>
          <td>${precoMedio.toFixed(2)}</td>
        </tr>
      `;
        }).join("");
        const html = `
      <section>
        <h2>Posição consolidada</h2>
        <table>
          <thead>
            <tr>
              <th>Investidor</th><th>Ativo</th>
              <th>Total comprado (R$)</th><th>Total vendido (R$)</th>
              <th>Quantidade líquida (aprox.)</th><th>Valor investido</th><th>Preço médio (aprox.)</th>
            </tr>
          </thead>
          <tbody>
            ${rows || "<tr><td colspan='7'>Nenhuma posição encontrada.</td></tr>"}
          </tbody>
        </table>
        <p><strong>Valor total investido:</strong> ${totalInvestidoGeral.toFixed(2)}</p>
        <a href="/relatorios/posicao">Novo filtro</a>
      </section>
    `;
        res.send((0, layout_1.layout)("Posição consolidada", html));
    });
}
