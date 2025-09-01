# Documentação Simplificada de Testes

## Objetivo
Registrar de forma curta o que já está coberto pelos testes automatizados e o que ainda falta implementar, facilitando acompanhamento do TDD.

## Escopo Atual Coberto

### 1. Componente `CadastroProduto`
Testes focados em comportamento do formulário e função de domínio:
- Renderização básica: título e todos os campos principais aparecem (nome, medida, local, código, data de entrada, quantidade) e opções de medida carregam de forma assíncrona (mock Supabase).
- Validação obrigatória: submissão vazia exibe mensagens para nome e medida e impede envio.
- Fluxo de sucesso: envia dados válidos, chama service `addProduto` com payload sanitizado (tipos corretos) e dispara `onSubmit`; formulário é limpo após sucesso.
- Fluxo de erro: quando `addProduto` falha, mantém valores do formulário e exibe mensagem de erro; não chama `onSubmit`.
- Função de domínio `cadastrarProduto`: lança erro para nome vazio e normaliza espaços no nome válido.

### 2. Service de Produtos (`produtosService`)
Testes focados em construir queries e lógica de transformação:
- `getProdutos`: seleção geral e ordenação por `id_produtos`.
- `getProdutoById`: filtro por id com `eq` + `single`.
- `addProduto`: cálculo automático de `saldo = entrada - saida` quando não fornecido.
- `updateProduto`: sanitização de dados (trim, conversões numéricas) e retorno do primeiro registro.
- `deleteProduto`: execução de `delete` com filtro por id.
- `getMedidas`: leitura ordenada de medidas auxiliares.
- Propagação de erros: garante que erros do Supabase não são engolidos.

## Abordagem de Teste
- Uso de mocks manuais para Supabase nos testes de service, permitindo inspecionar cadeia de chamadas.
- Uso de jest.mock para isolar dependências externas no componente (carregamento de medidas e `addProduto`).
- Testes do componente priorizam interação do usuário (Testing Library) e efeitos visíveis (mensagens, limpeza de campos), evitando testar detalhes internos de implementação.

## O que Ainda Falta / Próximos Testes Recomendados
1. Validações adicionais:
	- Medida inválida (id não presente nas opções) no componente.
	- Entrada negativa (já validado no componente, mas falta teste dedicado de erro visual se preencher número negativo e tentar enviar).
2. Campos adicionais (futuros): saída e saldo quando forem introduzidos na UI.
3. Testes de acessibilidade básica (ex: verificar ausência de labels órfãos, roles).
4. Teste de loading/erro ao carregar medidas (simular erro do Supabase e verificar mensagem de erro de carregamento).
5. Teste de integração leve (mock parcial) garantindo que, após `addProduto` bem-sucedido, o objeto retornado contém tipos esperados (medida número, entrada número).
6. Cobertura de `sanitizeProduto` isolada (testar diferentes combinações de entrada/saida/saldo informados para confirmar cálculo).
7. Teste de performance simples (ex: não múltiplas chamadas ao carregar medidas – garantir efeito é executado apenas uma vez).
8. Snapshot opcional do layout inicial para detectar mudanças não intencionais no formulário (cautela ao usar; atualizar apenas com propósito claro).

## Estratégia de Evolução (TDD)
1. Criar novo teste (RED) cobrindo um dos itens faltantes (ex: erro ao carregar medidas).
2. Implementar lógica mínima para passar o teste (GREEN).
3. Refatorar caso surjam duplicações (REFACTOR).
4. Repetir até cobrir todos os casos críticos.

## Execução
Comando principal (CRA / Jest):
`npm test -- --watchAll=false`

## Resumo
Cobertura atual garante principais fluxos de cadastro (renderização, validação, sucesso, erro e regras de saldo no service). Próximos passos focam em robustez (erros específicos, estados de carregamento), regras futuras (saída/saldo dinâmico) e qualidade (acessibilidade e sanitização isolada).

