import { Express, Request, Response } from "express";
import { getDb, getNextId } from "../db";
import { layout } from "../layout";
import { ContaCorretora, Investidor, Corretora, Ordem, Provento, MovimentoCaixa } from "../models";

export function registerContaRoutes(app: Express) {
  app.get("/contas", async (req: Request, res: Response) => {
    const db = await getDb();
    const contas = await db.collection<ContaCorretora>("conta_corretora").find({}).toArray();
    const investidores = await db.collection<Investidor>("investidor").find({}).toArray();
    const corretoras = await db.collection<Corretora>("corretora").find({}).toArray();

    const rows = contas.map(c => {
      const inv = investidores.find(i => i.id_investidor === c.id_investidor);
      const cor = corretoras.find(co => co.id_corretora === c.id_corretora);
      return `
        <tr>
          <td>${c.id_conta}</td>
          <td>${inv ? inv.nome : c.id_investidor}</td>
          <td>${cor ? cor.nome : c.id_corretora}</td>
          <td>${c.numero_conta}</td>
          <td>${new Date(c.dt_abertura).toLocaleDateString("pt-BR")}</td>
          <td>
            <a href="/contas/edit/${c.id_conta}">Editar</a>
            <form method="post" action="/contas/delete/${c.id_conta}" class="inline">
              <button type="submit">Encerrar conta</button>
            </form>
          </td>
        </tr>
      `;
    }).join("");

    const html = `
      <section>
        <h2>Contas em corretoras</h2>
        <a class="btn" href="/contas/new">Abrir nova conta</a>
        <table>
          <thead>
            <tr><th>ID</th><th>Investidor</th><th>Corretora</th><th>Número</th><th>Abertura</th><th>Ações</th></tr>
          </thead>
          <tbody>
            ${rows || "<tr><td colspan='6'>Nenhuma conta cadastrada.</td></tr>"}
          </tbody>
        </table>
      </section>
    `;
    res.send(layout("Contas", html));
  });

  app.get("/contas/new", async (req: Request, res: Response) => {
    const db = await getDb();
    const investidores = await db.collection<Investidor>("investidor").find({}).toArray();
    const corretoras = await db.collection<Corretora>("corretora").find({}).toArray();

    const invOptions = investidores.map(i => `<option value="${i.id_investidor}">${i.nome}</option>`).join("");
    const corOptions = corretoras.map(c => `<option value="${c.id_corretora}">${c.nome}</option>`).join("");

    const html = `
      <section>
        <h2>Abrir conta</h2>
        <form method="post" action="/contas/new">
          <label>Investidor</label>
          <select name="id_investidor" required>
            <option value="">Selecione</option>
            ${invOptions}
          </select>
          <label>Corretora</label>
          <select name="id_corretora" required>
            <option value="">Selecione</option>
            ${corOptions}
          </select>
          <label>Número da conta</label>
          <input name="numero_conta" required/>
          <button type="submit">Salvar</button>
        </form>
      </section>
    `;
    res.send(layout("Abrir conta", html));
  });

  app.post("/contas/new", async (req: Request, res: Response) => {
    const db = await getDb();
    const id = await getNextId("conta_corretora", "id_conta");
    const conta: ContaCorretora = {
      id_conta: id,
      id_investidor: Number(req.body.id_investidor),
      id_corretora: Number(req.body.id_corretora),
      numero_conta: String(req.body.numero_conta || ""),
      dt_abertura: new Date()
    };
  
    const existing = await db.collection<ContaCorretora>("conta_corretora").findOne({
      id_investidor: conta.id_investidor,
      id_corretora: conta.id_corretora,
      numero_conta: conta.numero_conta
    } as any);
    if (existing) {
      const html = `
        <section>
          <h2>Abrir conta</h2>
          <p class="message">Já existe uma conta com este investidor, corretora e número.</p>
          <a href="/contas">Voltar</a>
        </section>
      `;
      res.send(layout("Erro", html));
      return;
    }

    await db.collection<ContaCorretora>("conta_corretora").insertOne(conta as any);
    res.redirect("/contas");
  });

  app.get("/contas/edit/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const db = await getDb();
    const conta = await db.collection<ContaCorretora>("conta_corretora").findOne({ id_conta: id } as any);
    if (!conta) {
      res.redirect("/contas");
      return;
    }
    const investidores = await db.collection<Investidor>("investidor").find({}).toArray();
    const corretoras = await db.collection<Corretora>("corretora").find({}).toArray();

    const invOptions = investidores.map(i => `
      <option value="${i.id_investidor}" ${i.id_investidor === conta.id_investidor ? "selected" : ""}>${i.nome}</option>
    `).join("");
    const corOptions = corretoras.map(c => `
      <option value="${c.id_corretora}" ${c.id_corretora === conta.id_corretora ? "selected" : ""}>${c.nome}</option>
    `).join("");

    const html = `
      <section>
        <h2>Editar conta</h2>
        <form method="post" action="/contas/edit/${id}">
          <label>Investidor</label>
          <select name="id_investidor" required>
            ${invOptions}
          </select>
          <label>Corretora</label>
          <select name="id_corretora" required>
            ${corOptions}
          </select>
          <label>Número da conta</label>
          <input name="numero_conta" value="${conta.numero_conta}" required/>
          <button type="submit">Salvar</button>
        </form>
      </section>
    `;
    res.send(layout("Editar conta", html));
  });

  app.post("/contas/edit/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const db = await getDb();
    await db.collection<ContaCorretora>("conta_corretora").updateOne(
      { id_conta: id } as any,
      {
        $set: {
          id_investidor: Number(req.body.id_investidor),
          id_corretora: Number(req.body.id_corretora),
          numero_conta: String(req.body.numero_conta || "")
        }
      }
    );
    res.redirect("/contas");
  });

  app.post("/contas/delete/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const db = await getDb();

    const ordem = await db.collection<Ordem>("ordem").findOne({ id_conta: id } as any);
    if (ordem) {
      const html = `
        <section>
          <h2>Encerrar conta</h2>
          <p class="message">Não é possível encerrar: esta conta possui ordens cadastradas.</p>
          <a href="/contas">Voltar</a>
        </section>
      `;
      res.send(layout("Erro", html));
      return;
    }

    const mov = await db.collection<MovimentoCaixa>("movimento_caixa").findOne({ id_conta: id } as any);
    if (mov) {
      const html = `
        <section>
          <h2>Encerrar conta</h2>
          <p class="message">Não é possível encerrar: esta conta possui movimentos de caixa.</p>
          <a href="/contas">Voltar</a>
        </section>
      `;
      res.send(layout("Erro", html));
      return;
    }

    const prov = await db.collection<Provento>("provento").findOne({ id_conta: id } as any);
    if (prov) {
      const html = `
        <section>
          <h2>Encerrar conta</h2>
          <p class="message">Não é possível encerrar: esta conta possui proventos recebidos.</p>
          <a href="/contas">Voltar</a>
        </section>
      `;
      res.send(layout("Erro", html));
      return;
    }

    await db.collection<ContaCorretora>("conta_corretora").deleteOne({ id_conta: id } as any);
    res.redirect("/contas");
  });
}
