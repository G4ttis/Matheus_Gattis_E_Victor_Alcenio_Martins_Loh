import { Express, Request, Response } from "express";
import { getDb, getNextId } from "../db";
import { layout } from "../layout";
import { MovimentoCaixa, ContaCorretora } from "../models";

export function registerMovimentoRoutes(app: Express) {
  app.get("/movimentos", async (req: Request, res: Response) => {
    const db = await getDb();
    const movimentos = await db.collection<MovimentoCaixa>("movimento_caixa").find({}).toArray();
    const contas = await db.collection<ContaCorretora>("conta_corretora").find({}).toArray();

    const rows = movimentos.map(m => {
      const conta = contas.find(c => c.id_conta === m.id_conta);
      const descConta = conta ? `Conta ${conta.numero_conta}` : m.id_conta;
      return `
        <tr>
          <td>${m.id_movimento}</td>
          <td>${descConta}</td>
          <td>${new Date(m.dt_mov).toLocaleDateString("pt-BR")}</td>
          <td>${m.tipo_mov}</td>
          <td>${m.valor}</td>
          <td>${m.descricao || ""}</td>
          <td>
            <a href="/movimentos/edit/${m.id_movimento}">Editar</a>
            <form method="post" action="/movimentos/delete/${m.id_movimento}" class="inline">
              <button type="submit">Excluir</button>
            </form>
          </td>
        </tr>
      `;
    }).join("");

    const html = `
      <section>
        <h2>Movimentos de caixa</h2>
        <a class="btn" href="/movimentos/new">Novo movimento</a>
        <table>
          <thead>
            <tr><th>ID</th><th>Conta</th><th>Data</th><th>Tipo</th><th>Valor</th><th>Descrição</th><th>Ações</th></tr>
          </thead>
          <tbody>
            ${rows || "<tr><td colspan='7'>Nenhum movimento cadastrado.</td></tr>"}
          </tbody>
        </table>
      </section>
    `;
    res.send(layout("Movimentos", html));
  });

  app.get("/movimentos/new", async (req: Request, res: Response) => {
    const db = await getDb();
    const contas = await db.collection<ContaCorretora>("conta_corretora").find({}).toArray();
    const options = contas.map(c => `<option value="${c.id_conta}">Conta ${c.numero_conta}</option>`).join("");

    const html = `
      <section>
        <h2>Novo movimento</h2>
        <form method="post" action="/movimentos/new">
          <label>Conta</label>
          <select name="id_conta" required>
            <option value="">Selecione</option>
            ${options}
          </select>
          <label>Tipo de movimento</label>
          <input name="tipo_mov" required/>
          <label>Valor</label>
          <input type="number" step="0.01" name="valor" required/>
          <label>Descrição</label>
          <input name="descricao"/>
          <button type="submit">Salvar</button>
        </form>
      </section>
    `;
    res.send(layout("Novo movimento", html));
  });

  app.post("/movimentos/new", async (req: Request, res: Response) => {
    const db = await getDb();
    const id = await getNextId("movimento_caixa", "id_movimento");
    const mov: MovimentoCaixa = {
      id_movimento: id,
      id_conta: Number(req.body.id_conta),
      dt_mov: new Date(),
      tipo_mov: String(req.body.tipo_mov || "").toUpperCase(),
      valor: Number(req.body.valor),
      descricao: req.body.descricao ? String(req.body.descricao) : undefined
    };
    await db.collection<MovimentoCaixa>("movimento_caixa").insertOne(mov as any);
    res.redirect("/movimentos");
  });

  app.get("/movimentos/edit/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const db = await getDb();
    const mov = await db.collection<MovimentoCaixa>("movimento_caixa").findOne({ id_movimento: id } as any);
    if (!mov) {
      res.redirect("/movimentos");
      return;
    }
    const contas = await db.collection<ContaCorretora>("conta_corretora").find({}).toArray();
    const options = contas.map(c => `
      <option value="${c.id_conta}" ${c.id_conta === mov.id_conta ? "selected" : ""}>Conta ${c.numero_conta}</option>
    `).join("");

    const html = `
      <section>
        <h2>Editar movimento</h2>
        <form method="post" action="/movimentos/edit/${id}">
          <label>Conta</label>
          <select name="id_conta" required>${options}</select>
          <label>Tipo de movimento</label>
          <input name="tipo_mov" value="${mov.tipo_mov}" required/>
          <label>Valor</label>
          <input type="number" step="0.01" name="valor" value="${mov.valor}" required/>
          <label>Descrição</label>
          <input name="descricao" value="${mov.descricao || ""}"/>
          <button type="submit">Salvar</button>
        </form>
      </section>
    `;
    res.send(layout("Editar movimento", html));
  });

  app.post("/movimentos/edit/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const db = await getDb();
    await db.collection<MovimentoCaixa>("movimento_caixa").updateOne(
      { id_movimento: id } as any,
      {
        $set: {
          id_conta: Number(req.body.id_conta),
          tipo_mov: String(req.body.tipo_mov || "").toUpperCase(),
          valor: Number(req.body.valor),
          descricao: req.body.descricao ? String(req.body.descricao) : undefined
        }
      }
    );
    res.redirect("/movimentos");
  });

  app.post("/movimentos/delete/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const db = await getDb();
    await db.collection<MovimentoCaixa>("movimento_caixa").deleteOne({ id_movimento: id } as any);
    res.redirect("/movimentos");
  });
}
