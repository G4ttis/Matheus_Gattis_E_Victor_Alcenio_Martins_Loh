INSTRUÇÕES PARA COMPILAÇÃO E EXECUÇÃO
========================================

REQUISITOS:
-----------
1. Node.js 20+
2. NPM
3. MongoDB instalado e rodando localmente
4. Banco de dados criado com o script: criar_banco_mongodb.js

----------------------------------------
1. INSTALAÇÃO DAS DEPENDÊNCIAS
----------------------------------------

Executar o arquivo criar_banco_mongodb.js para criar a database, instruções estão dentro do arquivo.

No terminal, dentro da pasta do projeto:

    npm install

Isso instalará todas as dependências necessárias:
- express
- mongodb
- body-parser
- typescript
- ts-node
- @types/node
- @types/express

----------------------------------------
2. COMPILAÇÃO DO TYPESCRIPT
----------------------------------------

Para compilar os arquivos TypeScript (.ts) para JavaScript:

    npm run build

Isso criará a pasta:
    dist/

Contendo os arquivos .js prontos para execução.

----------------------------------------
3. EXECUTAR EM MODO PRODUÇÃO
----------------------------------------

Após compilar:

    npm start

O servidor será iniciado em:

    http://localhost:3000


----------------------------------------
4. EXECUTAR EM MODO DESENVOLVIMENTO
----------------------------------------

Para rodar diretamente em TypeScript usando ts-node:

    npm run dev

----------------------------------------
5. ACESSO À APLICAÇÃO
----------------------------------------

Abra no navegador:

    http://localhost:3000

De lá, você pode acessar:
- Investidores
- Corretoras
- Contas
- Ativos
- Ordens
- Movimentos
- Proventos
- Cotações
- Relatórios


----------------------------------------
6. FINALIZAÇÃO
----------------------------------------

Se desejar alterar a conexão com o banco,
abra o arquivo:

    src/db.ts

E modifique:

    const uri = "mongodb://localhost:27017";
    const dbName = "banco";

