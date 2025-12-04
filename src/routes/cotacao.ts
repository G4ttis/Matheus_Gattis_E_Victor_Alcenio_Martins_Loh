import { Express, Request, Response } from "express";
import { getDb, getNextId } from "../db";
import { layout } from "../layout";
import { CotacaoHistorica, Ativo } from "../models";

export function registerCotacaoRoutes(app: Express) {
  app.get("/cotacoes", async (req: Request, res: Response) => {
    const db = await getDb();
    const cotacoes = await db.collection<CotacaoHistorica>("cotacao_historica").find({}).toArray();
    const ativos = await db.collection<Ativo>("ativo").find({}).toArray();

    const rows = cotacoes.map(c => {
      const at = ativos.find(a => a.id_ativo === c.id_ativo);
      const nomeAtivo = at ? `${at.codigo} - ${at.nome}` : c.id_ativo;
      return `
        <tr>
          <td>${c.id_cotacao}</td>
          <td>${nomeAtivo}</td>
          <td>${new Date(c.dt_ref).toLocaleDateString("pt-BR")}</td>
          <td>${c.preco_fech}</td>
          <td>
            <a href="/cotacoes/edit/${c.id_cotacao}">Editar</a>
            <form method="post" action="/cotacoes/delete/${c.id_cotacao}" class="inline">
              <button type="submit">Excluir</button>
            </form>
          </td>
        </tr>
      `;
    }).join("");

    const html = `
      <section>
        <h2>Cotações históricas</h2>
        <a class="btn" href="/cotacoes/new">Cadastrar cotação</a>
        <table>
          <thead>
            <tr><th>ID</th><th>Ativo</th><th>Data</th><th>Preço</th><th>Ações</th></tr>
          </thead>
          <tbody>
            ${rows || "<tr><td colspan='5'>Nenhuma cotação cadastrada.</td></tr>"}
          </tbody>
        </table>
      </section>
    `;
    res.send(layout("Cotações", html));
  });

  app.get("/cotacoes/new", async (req: Request, res: Response) => {
    const db = await getDb();
    const ativos = await db.collection<Ativo>("ativo").find({}).toArray();
    const atOptions = ativos.map(a => `<option value="${a.id_ativo}">${a.codigo} - ${a.nome}</option>`).join("");

    const html = `
      <section>
        <h2>Nova cotação</h2>
        <form method="post" action="/cotacoes/new">
          <label>Ativo</label>
          <select name="id_ativo" required>
            <option value="">Selecione</option>
            ${atOptions}
          </select>
          <label>Data</label>
          <input type="date" name="dt_ref" required/>
          <label>Preço de fechamento</label>
          <input type="number" step="0.000001" name="preco_fech" required/>
          <button type="submit">Salvar</button>
        </form>
      </section>
    `;
    res.send(layout("Nova cotação", html));
  });

  app.post("/cotacoes/new", async (req: Request, res: Response) => {
    const db = await getDb();
    const id = await getNextId("cotacao_historica", "id_cotacao");
    const cot: CotacaoHistorica = {
      id_cotacao: id,
      id_ativo: Number(req.body.id_ativo),
      dt_ref: new Date(req.body.dt_ref),
      preco_fech: Number(req.body.preco_fech)
    };
    await db.collection<CotacaoHistorica>("cotacao_historica").insertOne(cot as any);
    res.redirect("/cotacoes");
  });

  app.get("/cotacoes/edit/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const db = await getDb();
    const cot = await db.collection<CotacaoHistorica>("cotacao_historica").findOne({ id_cotacao: id } as any);
    if (!cot) {
      res.redirect("/cotacoes");
      return;
    }
    const ativos = await db.collection<Ativo>("ativo").find({}).toArray();
    const atOptions = ativos.map(a => `
      <option value="${a.id_ativo}" ${a.id_ativo === cot.id_ativo ? "selected" : ""}>${a.codigo} - ${a.nome}</option>
    `).join("");

    const html = `
      <section>
        <h2>Editar cotação</h2>
        <form method="post" action="/cotacoes/edit/${id}">
          <label>Ativo</label>
          <select name="id_ativo" required>
            ${atOptions}
          </select>
          <label>Data</label>
          <input type="date" name="dt_ref" value="${new Date(cot.dt_ref).toISOString().substring(0,10)}" required/>
          <label>Preço de fechamento</label>
          <input type="number" step="0.000001" name="preco_fech" value="${cot.preco_fech}" required/>
          <button type="submit">Salvar</button>
        </form>
      </section>
    `;
    res.send(layout("Editar cotação", html));
  });

  app.post("/cotacoes/edit/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const db = await getDb();
    await db.collection<CotacaoHistorica>("cotacao_historica").updateOne(
      { id_cotacao: id } as any,
      {
        $set: {
          id_ativo: Number(req.body.id_ativo),
          dt_ref: new Date(req.body.dt_ref),
          preco_fech: Number(req.body.preco_fech)
        }
      }
    );
    res.redirect("/cotacoes");
  });

  app.post("/cotacoes/delete/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const db = await getDb();
    await db.collection<CotacaoHistorica>("cotacao_historica").deleteOne({ id_cotacao: id } as any);
    res.redirect("/cotacoes");
  });
}
