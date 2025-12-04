import { Express, Request, Response } from "express";
import { getDb, getNextId } from "../db";
import { layout } from "../layout";
import { Corretora, ContaCorretora } from "../models";

export function registerCorretoraRoutes(app: Express) {
  app.get("/corretoras", async (req: Request, res: Response) => {
    const db = await getDb();
    const corrs = await db.collection<Corretora>("corretora").find({}).toArray();
    const rows = corrs.map(c => `
      <tr>
        <td>${c.id_corretora}</td>
        <td>${c.nome}</td>
        <td>${c.cnpj || ""}</td>
        <td>
          <a href="/corretoras/edit/${c.id_corretora}">Editar</a>
          <form method="post" action="/corretoras/delete/${c.id_corretora}" class="inline">
            <button type="submit">Excluir</button>
          </form>
        </td>
      </tr>
    `).join("");

    const html = `
      <section>
        <h2>Corretoras</h2>
        <a class="btn" href="/corretoras/new">Cadastrar corretora</a>
        <table>
          <thead>
            <tr><th>ID</th><th>Nome</th><th>CNPJ</th><th>Ações</th></tr>
          </thead>
          <tbody>
            ${rows || "<tr><td colspan='4'>Nenhuma corretora cadastrada.</td></tr>"}
          </tbody>
        </table>
      </section>
    `;
    res.send(layout("Corretoras", html));
  });

  app.get("/corretoras/new", (req: Request, res: Response) => {
    const html = `
      <section>
        <h2>Nova corretora</h2>
        <form method="post" action="/corretoras/new">
          <label>Nome</label>
          <input name="nome" required/>
          <label>CNPJ</label>
          <input name="cnpj" required/>
          <button type="submit">Salvar</button>
        </form>
      </section>
    `;
    res.send(layout("Nova corretora", html));
  });

  app.post("/corretoras/new", async (req: Request, res: Response) => {
    const db = await getDb();
    const cnpj = String(req.body.cnpj || "").trim();

    const existing = await db.collection<Corretora>("corretora").findOne({ cnpj } as any);
    if (existing) {
      const html = `
        <section>
          <h2>Nova corretora</h2>
          <p class="message">Já existe uma corretora com este CNPJ.</p>
          <a href="/corretoras">Voltar</a>
        </section>
      `;
      res.send(layout("Erro", html));
      return;
    }

    const id = await getNextId("corretora", "id_corretora");
    const cor: Corretora = {
      id_corretora: id,
      nome: String(req.body.nome || ""),
      cnpj
    };
    await db.collection<Corretora>("corretora").insertOne(cor as any);
    res.redirect("/corretoras");
  });

  app.get("/corretoras/edit/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const db = await getDb();
    const cor = await db.collection<Corretora>("corretora").findOne({ id_corretora: id } as any);
    if (!cor) {
      res.redirect("/corretoras");
      return;
    }
    const html = `
      <section>
        <h2>Editar corretora</h2>
        <form method="post" action="/corretoras/edit/${id}">
          <label>Nome</label>
          <input name="nome" value="${cor.nome}" required/>
          <label>CNPJ</label>
          <input name="cnpj" value="${cor.cnpj || ""}" required/>
          <button type="submit">Salvar</button>
        </form>
      </section>
    `;
    res.send(layout("Editar corretora", html));
  });

  app.post("/corretoras/edit/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const db = await getDb();
    await db.collection<Corretora>("corretora").updateOne(
      { id_corretora: id } as any,
      {
        $set: {
          nome: String(req.body.nome || ""),
          cnpj: String(req.body.cnpj || "")
        }
      }
    );
    res.redirect("/corretoras");
  });

  app.post("/corretoras/delete/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const db = await getDb();

    const conta = await db.collection<ContaCorretora>("conta_corretora")
      .findOne({ id_corretora: id } as any);
    if (conta) {
      const html = `
        <section>
          <h2>Excluir corretora</h2>
          <p class="message">Não é possível excluir: existem contas vinculadas a esta corretora.</p>
          <a href="/corretoras">Voltar</a>
        </section>
      `;
      res.send(layout("Erro", html));
      return;
    }

    await db.collection<Corretora>("corretora").deleteOne({ id_corretora: id } as any);
    res.redirect("/corretoras");
  });
}
