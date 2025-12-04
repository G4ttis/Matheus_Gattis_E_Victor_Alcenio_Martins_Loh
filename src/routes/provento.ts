import { Express, Request, Response } from "express";
import { getDb, getNextId } from "../db";
import { layout } from "../layout";
import { Provento, ContaCorretora, Ativo } from "../models";

export function registerProventoRoutes(app: Express) {
  app.get("/proventos", async (req: Request, res: Response) => {
    const db = await getDb();
    const proventos = await db.collection<Provento>("provento").find({}).toArray();
    const contas = await db.collection<ContaCorretora>("conta_corretora").find({}).toArray();
    const ativos = await db.collection<Ativo>("ativo").find({}).toArray();

    const rows = proventos.map(p => {
      const conta = contas.find(c => c.id_conta === p.id_conta);
      const ativo = ativos.find(a => a.id_ativo === p.id_ativo);
      const descConta = conta ? `Conta ${conta.numero_conta}` : p.id_conta;
      const descAtivo = ativo ? ativo.codigo : p.id_ativo;
      return `
        <tr>
          <td>${p.id_provento}</td>
          <td>${descConta}</td>
          <td>${descAtivo}</td>
          <td>${new Date(p.dt_pagamento).toLocaleDateString("pt-BR")}</td>
          <td>${p.tipo_provento}</td>
          <td>${p.valor_total}</td>
          <td>${p.imposto_retido}</td>
          <td>${p.descricao || ""}</td>
          <td>
            <a href="/proventos/edit/${p.id_provento}">Editar</a>
            <form method="post" action="/proventos/delete/${p.id_provento}" class="inline">
              <button type="submit">Excluir</button>
            </form>
          </td>
        </tr>
      `;
    }).join("");

    const html = `
      <section>
        <h2>Proventos</h2>
        <a class="btn" href="/proventos/new">Cadastrar provento</a>
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Conta</th><th>Ativo</th><th>Pagamento</th>
              <th>Tipo</th><th>Valor total</th><th>Imposto</th><th>Descrição</th><th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${rows || "<tr><td colspan='9'>Nenhum provento cadastrado.</td></tr>"}
          </tbody>
        </table>
      </section>
    `;
    res.send(layout("Proventos", html));
  });

  app.get("/proventos/new", async (req: Request, res: Response) => {
    const db = await getDb();
    const contas = await db.collection<ContaCorretora>("conta_corretora").find({}).toArray();
    const ativos = await db.collection<Ativo>("ativo").find({}).toArray();

    const contaOptions = contas.map(c => `<option value="${c.id_conta}">Conta ${c.numero_conta}</option>`).join("");
    const ativoOptions = ativos.map(a => `<option value="${a.id_ativo}">${a.codigo} - ${a.nome}</option>`).join("");

    const html = `
      <section>
        <h2>Novo provento</h2>
        <form method="post" action="/proventos/new">
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
          <label>Tipo de provento</label>
          <input name="tipo_provento" required/>
          <label>Valor total</label>
          <input type="number" step="0.01" name="valor_total" required/>
          <label>Imposto retido</label>
          <input type="number" step="0.01" name="imposto_retido" value="0" required/>
          <label>Descrição</label>
          <input name="descricao"/>
          <button type="submit">Salvar</button>
        </form>
      </section>
    `;
    res.send(layout("Novo provento", html));
  });

  app.post("/proventos/new", async (req: Request, res: Response) => {
    const db = await getDb();

    const idConta = Number(req.body.id_conta);
    const idAtivo = Number(req.body.id_ativo);
    const conta = await db.collection<ContaCorretora>("conta_corretora").findOne({ id_conta: idConta } as any);
    if (!conta) {
      const html = `
        <section>
          <h2>Novo provento</h2>
          <p class="message">Conta não encontrada.</p>
          <a href="/proventos">Voltar</a>
        </section>
      `;
      res.send(layout("Erro", html));
      return;
    }
    const ativo = await db.collection<Ativo>("ativo").findOne({ id_ativo: idAtivo } as any);
    if (!ativo) {
      const html = `
        <section>
          <h2>Novo provento</h2>
          <p class="message">Ativo não encontrado.</p>
          <a href="/proventos">Voltar</a>
        </section>
      `;
      res.send(layout("Erro", html));
      return;
    }

    const id = await getNextId("provento", "id_provento");
    const prov: Provento = {
      id_provento: id,
      id_conta: idConta,
      id_ativo: idAtivo,
      dt_pagamento: new Date(),
      tipo_provento: String(req.body.tipo_provento || "").toUpperCase(),
      valor_total: Number(req.body.valor_total),
      imposto_retido: Number(req.body.imposto_retido || 0),
      descricao: req.body.descricao ? String(req.body.descricao) : undefined
    };
    await db.collection<Provento>("provento").insertOne(prov as any);
    res.redirect("/proventos");
  });

  app.get("/proventos/edit/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const db = await getDb();
    const prov = await db.collection<Provento>("provento").findOne({ id_provento: id } as any);
    if (!prov) {
      res.redirect("/proventos");
      return;
    }
    const contas = await db.collection<ContaCorretora>("conta_corretora").find({}).toArray();
    const ativos = await db.collection<Ativo>("ativo").find({}).toArray();

    const contaOptions = contas.map(c => `
      <option value="${c.id_conta}" ${c.id_conta === prov.id_conta ? "selected" : ""}>Conta ${c.numero_conta}</option>
    `).join("");
    const ativoOptions = ativos.map(a => `
      <option value="${a.id_ativo}" ${a.id_ativo === prov.id_ativo ? "selected" : ""}>${a.codigo} - ${a.nome}</option>
    `).join("");

    const html = `
      <section>
        <h2>Editar provento</h2>
        <form method="post" action="/proventos/edit/${id}">
          <label>Conta</label>
          <select name="id_conta" required>${contaOptions}</select>
          <label>Ativo</label>
          <select name="id_ativo" required>${ativoOptions}</select>
          <label>Tipo de provento</label>
          <input name="tipo_provento" value="${prov.tipo_provento}" required/>
          <label>Valor total</label>
          <input type="number" step="0.01" name="valor_total" value="${prov.valor_total}" required/>
          <label>Imposto retido</label>
          <input type="number" step="0.01" name="imposto_retido" value="${prov.imposto_retido}" required/>
          <label>Descrição</label>
          <input name="descricao" value="${prov.descricao || ""}"/>
          <button type="submit">Salvar</button>
        </form>
      </section>
    `;
    res.send(layout("Editar provento", html));
  });

  app.post("/proventos/edit/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const db = await getDb();
    await db.collection<Provento>("provento").updateOne(
      { id_provento: id } as any,
      {
        $set: {
          id_conta: Number(req.body.id_conta),
          id_ativo: Number(req.body.id_ativo),
          tipo_provento: String(req.body.tipo_provento || "").toUpperCase(),
          valor_total: Number(req.body.valor_total),
          imposto_retido: Number(req.body.imposto_retido || 0),
          descricao: req.body.descricao ? String(req.body.descricao) : undefined
        }
      }
    );
    res.redirect("/proventos");
  });

  app.post("/proventos/delete/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const db = await getDb();
    await db.collection<Provento>("provento").deleteOne({ id_provento: id } as any);
    res.redirect("/proventos");
  });
}
