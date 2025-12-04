//----------------------------------------------------------------------------
// Script completo de criação do banco MongoDB
// PARA EXECUTAR:
//   mongosh < criar_banco_mongodb.js
//-----------------------------------------------------------------------------

// Seleciona o banco
use("banco");

//
// COLEÇÃO: investidor
//
db.createCollection("investidor", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id_investidor", "nome", "email", "cpf", "dt_cadastro"],
      properties: {
        id_investidor: { bsonType: "int" },
        nome: { bsonType: "string" },
        email: { bsonType: "string" },
        cpf: { bsonType: "string" },
        dt_cadastro: { bsonType: "date" }
      }
    }
  }
});
db.investidor.createIndex({ id_investidor: 1 }, { unique: true });
db.investidor.createIndex({ email: 1 }, { unique: true });
db.investidor.createIndex({ cpf: 1 }, { unique: true });


//
// COLEÇÃO: corretora
//
db.createCollection("corretora", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id_corretora", "nome", "cnpj"],
      properties: {
        id_corretora: { bsonType: "int" },
        nome: { bsonType: "string" },
        cnpj: { bsonType: "string" }
      }
    }
  }
});
db.corretora.createIndex({ id_corretora: 1 }, { unique: true });
db.corretora.createIndex({ cnpj: 1 }, { unique: true });


//
// COLEÇÃO: conta_corretora
//
db.createCollection("conta_corretora", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id_conta", "id_investidor", "id_corretora", "numero_conta", "dt_abertura"],
      properties: {
        id_conta: { bsonType: "int" },
        id_investidor: { bsonType: "int" },
        id_corretora: { bsonType: "int" },
        numero_conta: { bsonType: "string" },
        dt_abertura: { bsonType: "date" }
      }
    }
  }
});
db.conta_corretora.createIndex({ id_conta: 1 }, { unique: true });
db.conta_corretora.createIndex(
  { id_investidor: 1, id_corretora: 1, numero_conta: 1 },
  { unique: true }
);


//
// COLEÇÃO: ativo
//
db.createCollection("ativo", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id_ativo", "codigo", "nome", "tipo_ativo", "mercado"],
      properties: {
        id_ativo: { bsonType: "int" },
        codigo: { bsonType: "string" },
        nome: { bsonType: "string" },
        tipo_ativo: { bsonType: "string" },
        mercado: { bsonType: "string" }
      }
    }
  }
});
db.ativo.createIndex({ id_ativo: 1 }, { unique: true });
db.ativo.createIndex({ codigo: 1 }, { unique: true });


//
// COLEÇÃO: cotacao_historica
//
db.createCollection("cotacao_historica", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id_cotacao", "id_ativo", "dt_ref", "preco_fech"],
      properties: {
        id_cotacao: { bsonType: "int" },
        id_ativo: { bsonType: "int" },
        dt_ref: { bsonType: "date" },
        preco_fech: { bsonType: "double" }
      }
    }
  }
});
db.cotacao_historica.createIndex({ id_cotacao: 1 }, { unique: true });
db.cotacao_historica.createIndex({ id_ativo: 1 });


//
// COLEÇÃO: movimento_caixa
//
db.createCollection("movimento_caixa", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id_movimento", "id_conta", "dt_mov", "tipo_mov", "valor"],
      properties: {
        id_movimento: { bsonType: "int" },
        id_conta: { bsonType: "int" },
        dt_mov: { bsonType: "date" },
        tipo_mov: { bsonType: "string" },
        valor: { bsonType: "double" },
        descricao: { bsonType: "string" }
      }
    }
  }
});
db.movimento_caixa.createIndex({ id_movimento: 1 }, { unique: true });


//
// COLEÇÃO: ordem
//
db.createCollection("ordem", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id_ordem", "id_conta", "id_ativo", "dt_ordem", "lado", "quantidade", "preco", "custos"],
      properties: {
        id_ordem: { bsonType: "int" },
        id_conta: { bsonType: "int" },
        id_ativo: { bsonType: "int" },
        dt_ordem: { bsonType: "date" },
        lado: { bsonType: "string" },
        quantidade: { bsonType: "double" },
        preco: { bsonType: "double" },
        custos: { bsonType: "double" },
        observacao: { bsonType: "string" }
      }
    }
  }
});
db.ordem.createIndex({ id_ordem: 1 }, { unique: true });


//
// COLEÇÃO: provento
//
db.createCollection("provento", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id_provento", "id_conta", "id_ativo", "dt_pagamento", "tipo_provento", "valor_total", "imposto_retido"],
      properties: {
        id_provento: { bsonType: "int" },
        id_conta: { bsonType: "int" },
        id_ativo: { bsonType: "int" },
        dt_pagamento: { bsonType: "date" },
        tipo_provento: { bsonType: "string" },
        valor_total: { bsonType: "double" },
        imposto_retido: { bsonType: "double" },
        descricao: { bsonType: "string" }
      }
    }
  }
});
db.provento.createIndex({ id_provento: 1 }, { unique: true });

print("Estrutura do banco criada com sucesso!");
