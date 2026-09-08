/**
 * Representa um veículo vindo da tabela FIPE (via BrasilAPI) — marca/modelo
 * reais e ao vivo. Não existe mais ficha técnica mockada (motor, off-road,
 * segurança): a FIPE não fornece esse nível de detalhe, então até integrarmos
 * uma segunda API para isso, o app trabalha só com identificação + preço.
 */
export interface Vehicle {
  id: string;
  marca: string;
  marcaCodigo: string;
  /** Nome completo do modelo/versão como vem da FIPE (já inclui motor, cabine, tração etc). */
  modelo: string;
  modeloCodigo: string;
  /** Alias de `modelo`, mantido pra compatibilidade com telas que exibem "versão". */
  versao: string;
  /** Preço oficial da FIPE, quando a fonte está disponível e o código foi resolvido. */
  preco?: string;
  fipeCode?: string;
}
