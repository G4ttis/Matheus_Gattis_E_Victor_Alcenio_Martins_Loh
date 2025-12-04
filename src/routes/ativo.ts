import { Express, Request, Response } from "express";
import { getDb, getNextId } from "../db";
import { layout } from "../layout";
import { Ativo, Ordem, Provento, CotacaoHistorica } from "../models";

export function registerAtivoRoutes(app: Express) {
  app.get("/ativos", async (req: Request, res: Response) => {
    const db = await getDb();
    const ativos = await db.collection<Ativo>("ativo").find({}).toArray();
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
    res.send(layout("Ativos", html));
  });

  app.get("/ativos/new", (req: Request, res: Response) => {
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
    res.send(layout("Novo ativo", html));
  });

  app.post("/ativos/new", async (req: Request, res: Response) => {
    const db = await getDb();
    const codigo = String(req.body.codigo || "").toUpperCase();

    const existing = await db.collection<Ativo>("ativo").findOne({ codigo } as any);
    if (existing) {
      const html = `
        <section>
          <h2>Novo ativo</h2>
          <p class="message">Já existe um ativo cadastrado com este código.</p>
          <a href="/ativos">Voltar</a>
        </section>
      `;
      res.send(layout("Erro", html));
      return;
    }

    const id = await getNextId("ativo", "id_ativo");
    const ativo: Ativo = {
      id_ativo: id,
      codigo,
      nome: String(req.body.nome || ""),
      tipo_ativo: String(req.body.tipo_ativo || "").toUpperCase(),
      mercado: String(req.body.mercado || "B3").toUpperCase()
    };
    await db.collection<Ativo>("ativo").insertOne(ativo as any);
    res.redirect("/ativos");
  });

  app.get("/ativos/edit/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const db = await getDb();
    const ativo = await db.collection<Ativo>("ativo").findOne({ id_ativo: id } as any);
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
    res.send(layout("Editar ativo", html));
  });

  app.post("/ativos/edit/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const db = await getDb();
    await db.collection<Ativo>("ativo").updateOne(
      { id_ativo: id } as any,
      {
        $set: {
          codigo: String(req.body.codigo || "").toUpperCase(),
          nome: String(req.body.nome || ""),
          tipo_ativo: String(req.body.tipo_ativo || "").toUpperCase(),
          mercado: String(req.body.mercado || "B3").toUpperCase()
        }
      }
    );
    res.redirect("/ativos");
  });

  app.post("/ativos/delete/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const db = await getDb();

    const ord = await db.collection<Ordem>("ordem").findOne({ id_ativo: id } as any);
    if (ord) {
      const html = `
        <section>
          <h2>Excluir ativo</h2>
          <p class="message">Não é possível excluir: ativo vinculado a ordens.</p>
          <a href="/ativos">Voltar</a>
        </section>
      `;
      res.send(layout("Erro", html));
      return;
    }

    const prov = await db.collection<Provento>("provento").findOne({ id_ativo: id } as any);
    if (prov) {
      const html = `
        <section>
          <h2>Excluir ativo</h2>
          <p class="message">Não é possível excluir: ativo vinculado a proventos.</p>
          <a href="/ativos">Voltar</a>
        </section>
      `;
      res.send(layout("Erro", html));
      return;
    }

    const cot = await db.collection<CotacaoHistorica>("cotacao_historica").findOne({ id_ativo: id } as any);
    if (cot) {
      const html = `
        <section>
          <h2>Excluir ativo</h2>
          <p class="message">Não é possível excluir: ativo vinculado a cotações históricas.</p>
          <a href="/ativos">Voltar</a>
        </section>
      `;
      res.send(layout("Erro", html));
      return;
    }

    await db.collection<Ativo>("ativo").deleteOne({ id_ativo: id } as any);
    res.redirect("/ativos");
  });
}
