"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAtivoRoutes = registerAtivoRoutes;
const db_1 = require("../db");
const layout_1 = require("../layout");
function registerAtivoRoutes(app) {
    app.get("/ativos", async (req, res) => {
        const db = await (0, db_1.getDb)();
        const ativos = await db.collection("ativo").find({}).toArray();
        const rows = ativos.map(a => `
      <tr>
        <td>${a.id_ativo}</td>
        <td>${a.codigo}</td>
        <td>${a.nome}</td>
        <td>${a.tipo_ativo}</td>
        <td>${a.mercado}</td>
        <td>
          <a href="/ativos/edit/${a.id_ativo}">Editar</a>
          <form method="post" action="/ativos/delete/${a.id_ativo}" class="inline">
            <button type="submit">Excluir</button>
          </form>
        </td>
      </tr>
    `).join("");
        const html = `
      <section>
        <h2>Ativos</h2>
        <a class="btn" href="/ativos/new">Cadastrar ativo</a>
        <table>
          <thead>
            <tr><th>ID</th><th>Código</th><th>Nome</th><th>Tipo</th><th>Mercado</th><th>Ações</th></tr>
          </thead>
          <tbody>
            ${rows || "<tr><td colspan='6'>Nenhum ativo cadastrado.</td></tr>"}
          </tbody>
        </table>
      </section>
    `;
        res.send((0, layout_1.layout)("Ativos", html));
    });
    app.get("/ativos/new", (req, res) => {
        const html = `
      <section>
        <h2>Novo ativo</h2>
        <form method="post" action="/ativos/new">
          <label>Código</label>
          <input name="codigo" required/>
          <label>Nome</label>
          <input name="nome" required/>
          <label>Tipo de ativo</label>
          <input name="tipo_ativo" required/>
          <label>Mercado</label>
          <input name="mercado" value="B3" required/>
          <button type="submit">Salvar</button>
        </form>
      </section>
    `;
        res.send((0, layout_1.layout)("Novo ativo", html));
    });
    app.post("/ativos/new", async (req, res) => {
        const db = await (0, db_1.getDb)();
        const codigo = String(req.body.codigo || "").toUpperCase();
        const existing = await db.collection("ativo").findOne({ codigo });
        if (existing) {
            const html = `
        <section>
          <h2>Novo ativo</h2>
          <p class="message">Já existe um ativo cadastrado com este código.</p>
          <a href="/ativos">Voltar</a>
        </section>
      `;
            res.send((0, layout_1.layout)("Erro", html));
            return;
        }
        const id = await (0, db_1.getNextId)("ativo", "id_ativo");
        const ativo = {
            id_ativo: id,
            codigo,
            nome: String(req.body.nome || ""),
            tipo_ativo: String(req.body.tipo_ativo || "").toUpperCase(),
            mercado: String(req.body.mercado || "B3").toUpperCase()
        };
        await db.collection("ativo").insertOne(ativo);
        res.redirect("/ativos");
    });
    app.get("/ativos/edit/:id", async (req, res) => {
        const id = Number(req.params.id);
        const db = await (0, db_1.getDb)();
        const ativo = await db.collection("ativo").findOne({ id_ativo: id });
        if (!ativo) {
            res.redirect("/ativos");
            return;
        }
        const html = `
      <section>
        <h2>Editar ativo</h2>
        <form method="post" action="/ativos/edit/${id}">
          <label>Código</label>
          <input name="codigo" value="${ativo.codigo}" required/>
          <label>Nome</label>
          <input name="nome" value="${ativo.nome}" required/>
          <label>Tipo de ativo</label>
          <input name="tipo_ativo" value="${ativo.tipo_ativo}" required/>
          <label>Mercado</label>
          <input name="mercado" value="${ativo.mercado}" required/>
          <button type="submit">Salvar</button>
        </form>
      </section>
    `;
        res.send((0, layout_1.layout)("Editar ativo", html));
    });
    app.post("/ativos/edit/:id", async (req, res) => {
        const id = Number(req.params.id);
        const db = await (0, db_1.getDb)();
        await db.collection("ativo").updateOne({ id_ativo: id }, {
            $set: {
                codigo: String(req.body.codigo || "").toUpperCase(),
                nome: String(req.body.nome || ""),
                tipo_ativo: String(req.body.tipo_ativo || "").toUpperCase(),
                mercado: String(req.body.mercado || "B3").toUpperCase()
            }
        });
        res.redirect("/ativos");
    });
    app.post("/ativos/delete/:id", async (req, res) => {
        const id = Number(req.params.id);
        const db = await (0, db_1.getDb)();
        const ord = await db.collection("ordem").findOne({ id_ativo: id });
        if (ord) {
            const html = `
        <section>
          <h2>Excluir ativo</h2>
          <p class="message">Não é possível excluir: ativo vinculado a ordens.</p>
          <a href="/ativos">Voltar</a>
        </section>
      `;
            res.send((0, layout_1.layout)("Erro", html));
            return;
        }
        const prov = await db.collection("provento").findOne({ id_ativo: id });
        if (prov) {
            const html = `
        <section>
          <h2>Excluir ativo</h2>
          <p class="message">Não é possível excluir: ativo vinculado a proventos.</p>
          <a href="/ativos">Voltar</a>
        </section>
      `;
            res.send((0, layout_1.layout)("Erro", html));
            return;
        }
        const cot = await db.collection("cotacao_historica").findOne({ id_ativo: id });
        if (cot) {
            const html = `
        <section>
          <h2>Excluir ativo</h2>
          <p class="message">Não é possível excluir: ativo vinculado a cotações históricas.</p>
          <a href="/ativos">Voltar</a>
        </section>
      `;
            res.send((0, layout_1.layout)("Erro", html));
            return;
        }
        await db.collection("ativo").deleteOne({ id_ativo: id });
        res.redirect("/ativos");
    });
}
