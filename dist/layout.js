"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.layout = layout;
function layout(title, content) {
    return `
  <!doctype html>
  <html lang="pt-BR">
    <head>
      <meta charset="utf-8"/>
      <title>${title}</title>
      <link rel="stylesheet" href="/style.css"/>
    </head>
    <body>
      <header>
        <h1>Carteira de investimentos</h1>
        <nav>
          <a href="/">Menu</a>
          <a href="/investidores">Investidores</a>
          <a href="/corretoras">Corretoras</a>
          <a href="/contas">Contas</a>
          <a href="/ativos">Ativos</a>
          <a href="/cotacoes">Cotações</a>
          <a href="/ordens">Ordens</a>
          <a href="/proventos">Proventos</a>
          <a href="/movimentos">Movimentos</a>
          <a href="/relatorios">Relatórios</a>
        </nav>
      </header>
      <main>
        ${content}
      </main>
    </body>
  </html>
  `;
}
