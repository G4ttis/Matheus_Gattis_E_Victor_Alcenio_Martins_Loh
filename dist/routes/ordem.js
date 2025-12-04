"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOrdemRoutes = registerOrdemRoutes;
const db_1 = require("../db");
const layout_1 = require("../layout");
function registerOrdemRoutes(app) {
    app.get("/ordens", async (req, res) => {
        const db = await (0, db_1.getDb)();
        const ordens = await db.collection("ordem").find({}).toArray();
        const contas = await db.collection("conta_corretora").find({}).toArray();
        const ativos = await db.collection("ativo").find({}).toArray();
        const rows = ordens.map(o => {
            const conta = contas.find(c => c.id_conta === o.id_conta);
            const ativo = ativos.find(a => a.id_ativo === o.id_ativo);
            const descConta = conta ? `Conta ${conta.numero_conta}` : o.id_conta;
            const descAtivo = ativo ? ativo.codigo : o.id_ativo;
            return `
        <tr>
          <td>${o.id_ordem}</td>
          <td>${descConta}</td>
          <td>${descAtivo}</td>
          <td>${new Date(o.dt_ordem).toLocaleString("pt-BR")}</td>
          <td>${o.lado}</td>
          <td>${o.quantidade}</td>
          <td>${o.preco}</td>
          <td>${o.custos}</td>
          <td>${o.observacao || ""}</td>
          <td>
            <a href="/ordens/edit/${o.id_ordem}">Editar</a>
            <form method="post" action="/ordens/delete/${o.id_ordem}" class="inline">
              <button type="submit">Excluir</button>
            </form>
          </td>
        </tr>
      `;
        }).join("");
        const html = `
      <section>
        <h2>Ordens</h2>
        <a class="btn" href="/ordens/new">Cadastrar ordem</a>
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Conta</th><th>Ativo</th><th>Data</th><th>Lado</th>
              <th>Quantidade</th><th>Preço</th><th>Custos</th><th>Obs</th><th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${rows || "<tr><td colspan='10'>Nenhuma ordem cadastrada.</td></tr>"}
          </tbody>
        </table>
      </section>
    `;
        res.send((0, layout_1.layout)("Ordens", html));
    });
    app.get("/ordens/new", async (req, res) => {
        const db = await (0, db_1.getDb)();
        const contas = await db.collection("conta_corretora").find({}).toArray();
        const ativos = await db.collection("ativo").find({}).toArray();
        const contaOptions = contas.map(c => `<option value="${c.id_conta}">Conta ${c.numero_conta}</option>`).join("");
        const ativoOptions = ativos.map(a => `<option value="${a.id_ativo}">${a.codigo} - ${a.nome}</option>`).join("");
        const html = `
      <section>
        <h2>Nova ordem</h2>
        <form method="post" action="/ordens/new">
          <label>Conta</label>
          <select name="id_conta" required>
            <option value="">Selecione</option>
            ${contaOptions}
          </select>
          <label>Ativo</label>
          <select name="id_ativo" required>
            <option value="">Selecione</option>
            ${ativoOptions}
          </select>
          <label>Lado</label>
          <input name="lado" placeholder="COMPRA ou VENDA" required/>
          <label>Quantidade</label>
          <input type="number" step="0.000001" name="quantidade" required/>
          <label>Preço</label>
          <input type="number" step="0.000001" name="preco" required/>
          <label>Custos</label>
          <input type="number" step="0.000001" name="custos" value="0"/>
          <label>Observação</label>
          <input name="observacao"/>
          <button type="submit">Salvar</button>
        </form>
      </section>
    `;
        res.send((0, layout_1.layout)("Nova ordem", html));
    });
    app.post("/ordens/new", async (req, res) => {
        const db = await (0, db_1.getDb)();
        const idConta = Number(req.body.id_conta);
        const idAtivo = Number(req.body.id_ativo);
        const conta = await db.collection("conta_corretora").findOne({ id_conta: idConta });
        if (!conta) {
            const html = `
        <section>
          <h2>Nova ordem</h2>
          <p class="message">Conta não encontrada.</p>
          <a href="/ordens">Voltar</a>
        </section>
      `;
            res.send((0, layout_1.layout)("Erro", html));
            return;
        }
        const ativo = await db.collection("ativo").findOne({ id_ativo: idAtivo });
        if (!ativo) {
            const html = `
        <section>
          <h2>Nova ordem</h2>
          <p class="message">Ativo não encontrado.</p>
          <a href="/ordens">Voltar</a>
        </section>
      `;
            res.send((0, layout_1.layout)("Erro", html));
            return;
        }
        const id = await (0, db_1.getNextId)("ordem", "id_ordem");
        const ordem = {
            id_ordem: id,
            id_conta: idConta,
            id_ativo: idAtivo,
            dt_ordem: new Date(),
            lado: String(req.body.lado || "").toUpperCase(),
            quantidade: Number(req.body.quantidade),
            preco: Number(req.body.preco),
            custos: req.body.custos ? Number(req.body.custos) : 0,
            observacao: req.body.observacao ? String(req.body.observacao) : undefined
        };
        await db.collection("ordem").insertOne(ordem);
        res.redirect("/ordens");
    });
    app.get("/ordens/edit/:id", async (req, res) => {
        const id = Number(req.params.id);
        const db = await (0, db_1.getDb)();
        const ordem = await db.collection("ordem").findOne({ id_ordem: id });
        if (!ordem) {
            res.redirect("/ordens");
            return;
        }
        const contas = await db.collection("conta_corretora").find({}).toArray();
        const ativos = await db.collection("ativo").find({}).toArray();
        const contaOptions = contas.map(c => `
      <option value="${c.id_conta}" ${c.id_conta === ordem.id_conta ? "selected" : ""}>Conta ${c.numero_conta}</option>
    `).join("");
        const ativoOptions = ativos.map(a => `
      <option value="${a.id_ativo}" ${a.id_ativo === ordem.id_ativo ? "selected" : ""}>${a.codigo} - ${a.nome}</option>
    `).join("");
        const html = `
      <section>
        <h2>Editar ordem</h2>
        <form method="post" action="/ordens/edit/${id}">
          <label>Conta</label>
          <select name="id_conta" required>${contaOptions}</select>
          <label>Ativo</label>
          <select name="id_ativo" required>${ativoOptions}</select>
          <label>Lado</label>
          <input name="lado" value="${ordem.lado}" required/>
          <label>Quantidade</label>
          <input type="number" step="0.000001" name="quantidade" value="${ordem.quantidade}" required/>
          <label>Preço</label>
          <input type="number" step="0.000001" name="preco" value="${ordem.preco}" required/>
          <label>Custos</label>
          <input type="number" step="0.000001" name="custos" value="${ordem.custos}"/>
          <label>Observação</label>
          <input name="observacao" value="${ordem.observacao || ""}"/>
          <button type="submit">Salvar</button>
        </form>
      </section>
    `;
        res.send((0, layout_1.layout)("Editar ordem", html));
    });
    app.post("/ordens/edit/:id", async (req, res) => {
        const id = Number(req.params.id);
        const db = await (0, db_1.getDb)();
        await db.collection("ordem").updateOne({ id_ordem: id }, {
            $set: {
                id_conta: Number(req.body.id_conta),
                id_ativo: Number(req.body.id_ativo),
                lado: String(req.body.lado || "").toUpperCase(),
                quantidade: Number(req.body.quantidade),
                preco: Number(req.body.preco),
                custos: req.body.custos ? Number(req.body.custos) : 0,
                observacao: req.body.observacao ? String(req.body.observacao) : undefined
            }
        });
        res.redirect("/ordens");
    });
    app.post("/ordens/delete/:id", async (req, res) => {
        const id = Number(req.params.id);
        const db = await (0, db_1.getDb)();
        await db.collection("ordem").deleteOne({ id_ordem: id });
        res.redirect("/ordens");
    });
}
