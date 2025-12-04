export interface Ativo {
  id_ativo: number;
  codigo: string;
  nome: string;
  tipo_ativo: string;
  mercado: string;
}

export interface Corretora {
  id_corretora: number;
  nome: string;
  cnpj?: string;
}

export interface Investidor {
  id_investidor: number;
  nome: string;
  email: string;
  cpf: string;
  dt_cadastro: Date;
}

export interface ContaCorretora {
  id_conta: number;
  id_investidor: number;
  id_corretora: number;
  numero_conta: string;
  dt_abertura: Date;
}

export interface CotacaoHistorica {
  id_cotacao: number;
  id_ativo: number;
  dt_ref: Date;
  preco_fech: number;
}

export interface MovimentoCaixa {
  id_movimento: number;
  id_conta: number;
  dt_mov: Date;
  tipo_mov: string;
  valor: number;
  descricao?: string;
}

export interface Ordem {
  id_ordem: number;
  id_conta: number;
  id_ativo: number;
  dt_ordem: Date;
  lado: string;
  quantidade: number;
  preco: number;
  custos: number;
  observacao?: string;
}

export interface Provento {
  id_provento: number;
  id_conta: number;
  id_ativo: number;
  dt_pagamento: Date;
  tipo_provento: string;
  valor_total: number;
  imposto_retido: number;
  descricao?: string;
}
