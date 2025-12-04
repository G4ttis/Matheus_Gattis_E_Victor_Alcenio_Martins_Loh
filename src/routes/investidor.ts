import { Express, Request, Response } from "express";
import { getDb, getNextId } from "../db";
import { layout } from "../layout";
import { Investidor, ContaCorretora } from "../models";

export function registerInvestidorRoutes(app: Express) {
  app.get("/investidores", async (req: Request, res: Response) => {
    const db = await getDb();
    const investidores = await db.collection<Investidor>("investidor").find({}).toArray();
    const rows = investidores.map(i => `
      <tr>
        <td>${i.id_investidor}</td>
        <td>${i.nome}</td>
        <td>${i.email}</td>
        <td>${i.cpf}</td>
        <td>
          <a href="/investidores/edit/${i.id_investidor}">Editar</a>
          <form method="post" action="/investidores/delete/${i.id_investidor}" class="inline">
            <button type="submit">Excluir</button>
          </form>
        </td>
      </tr>
    `).join("");

    const html = `
      <section>
        <h2>Investidores</h2>
        <a class="btn" href="/investidores/new">Cadastrar investidor</a>
        <table>
          <thead>
            <tr><th>ID</th><th>Nome</th><th>Email</th><th>CPF</th><th>Ações</th></tr>
          </thead>
          <tbody>
            ${rows || "<tr><td colspan='5'>Nenhum investidor cadastrado.</td></tr>"}
          </tbody>
        </table>
      </section>
    `;
    res.send(layout("Investidores", html));
  });

  app.get("/investidores/new", (req: Request, res: Response) => {
    const html = `
      <section>
        <h2>Novo investidor</h2>
        <form method="post" action="/investidores/new">
          <label>Nome</label>
          <input name="nome" required/>
          <label>Email</label>
          <input type="email" name="email" required/>
          <label>CPF</label>
          <input name="cpf" required/>
          <button type="submit">Salvar</button>
        </form>
      </section>
    `;
    res.send(layout("Novo investidor", html));
  });

  app.post("/investidores/new", async (req: Request, res: Response) => {
    const db = await getDb();
    const email = String(req.body.email || "").trim();
    const cpf = String(req.body.cpf || "").trim();

    const existing = await db.collection<Investidor>("investidor").findOne({
      $or: [{ email }, { cpf }]
    } as any);
    if (existing) {
      const html = `
        <section>
          <h2>Novo investidor</h2>
          <p class="message">Já existe um investidor com este email ou CPF.</p>
          <a href="/investidores">Voltar</a>
        </section>
      `;
      res.send(layout("Erro", html));
      return;
    }

    const id = await getNextId("investidor", "id_investidor");
    const now = new Date();
    const inv: Investidor = {
      id_investidor: id,
      nome: String(req.body.nome || ""),
      email,
      cpf,
      dt_cadastro: now
    };
    await db.collection<Investidor>("investidor").insertOne(inv as any);
    res.redirect("/investidores");
  });

  app.get("/investidores/edit/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const db = await getDb();
    const inv = await db.collection<Investidor>("investidor").findOne({ id_investidor: id } as any);
    if (!inv) {
      res.redirect("/investidores");
      return;
    }
    const html = `
      <section>
        <h2>Editar investidor</h2>
        <form method="post" action="/investidores/edit/${id}">
          <label>Nome</label>
          <input name="nome" value="${inv.nome}" required/>
          <label>Email</label>
          <input type="email" name="email" value="${inv.email}" required/>
          <label>CPF</label>
          <input name="cpf" value="${inv.cpf}" required/>
          <button type="submit">Salvar</button>
        </form>
      </section>
    `;
    res.send(layout("Editar investidor", html));
  });

  app.post("/investidores/edit/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const db = await getDb();
    await db.collection<Investidor>("investidor").updateOne(
      { id_investidor: id } as any,
      {
        $set: {
          nome: String(req.body.nome || ""),
          email: String(req.body.email || ""),
          cpf: String(req.body.cpf || "")
        }
      }
    );
    res.redirect("/investidores");
  });

  app.post("/investidores/delete/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const db = await getDb();

    const conta = await db.collection<ContaCorretora>("conta_corretora")
      .findOne({ id_investidor: id } as any);
    if (conta) {
      const html = `
        <section>
          <h2>Excluir investidor</h2>
          <p class="message">Não é possível excluir: o investidor possui contas vinculadas.</p>
          <a href="/investidores">Voltar</a>
        </section>
      `;
      res.send(layout("Erro", html));
      return;
    }

    await db.collection<Investidor>("investidor").deleteOne({ id_investidor: id } as any);
    res.redirect("/investidores");
  });
}
