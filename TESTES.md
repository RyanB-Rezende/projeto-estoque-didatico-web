#!/usr/bin/env markdown

# 🧪 Estratégia de Testes do Projeto

Documento didático para entender COMO e POR QUE testamos aqui. Serve como suporte de aula.

---

## 🎯 Objetivos da Estratégia
1. Garantir que os FLUXOS importantes funcionem (valor para o usuário).
2. Evitar “teste por vaidade” (cobertura alta sem benefício).
3. Manter manutenção simples (poucos testes, mas fortes).
4. Diferenciar claramente testes **unitários** de **integração**.

---

## 🔍 Diferença: Teste Unitário x Teste de Integração

| Tipo | O que cobre | Quando usar | Vantagens | Limitações |
|------|-------------|-------------|-----------|------------|
| Unitário | Uma função/módulo isolado | Lógica pura, transformação de dados, cálculos | Muito rápido, falha localizada | Não detecta problemas de integração/UX |
| Integração (comportamental de componente) | Componente + hooks + interação + boundary do serviço (mockado) | Fluxos de tela (form, lista, ações) | Capta regressões reais, valida acessibilidade básica | Mais lento, depende de estrutura do DOM |

Regra simples: se você precisa do DOM, eventos e simular uso do usuário → provavelmente é integração. Se está apenas passando parâmetros e conferindo retorno → unitário.

---

## 📂 Classificação dos Testes Atuais

| Arquivo | Tipo | Justificativa |
|---------|------|---------------|
| `src/tests/authService.test.js` | Unitário | Testa lógica de login/logout isolada (mock supabase). |
| `src/tests/produtos.service.test.js` | Unitário | Verifica funções de CRUD e cálculo de saldo com mocks. |
| `src/tests/Login.test.js` | Integração (componente) | Interação do usuário: preencher, validar, submeter, toggle senha. |
| `src/tests/CadastroProduto.test.js` | Integração | Form completo: validação, submit, chamada de serviço. |
| `src/tests/ProdutoList.test.js` | Integração | Lista, remoção com confirmação, toast, paginação, refresh. |
| `src/tests/ConfirmDialog.test.js` | Integração pontual | Fluxo confirmar vs cancelar (estado + callback). |

Total atual: 6 suites / 19 testes.

---

## ✅ Critérios de Qualidade por Tipo

### Unitário
- Não renderiza React / DOM.
- Todas dependências externas mockadas ou parametrizadas.
- Foca em regras (ex: cálculo de saldo, sanitização numérica).
- Deve executar em < 10ms por caso (regra empírica). 

### Integração
- Usa `@testing-library/react` para simular o usuário.
- Evita acessar estados internos (usar texto, roles, aria-labels).
- Mocka somente a borda de I/O (ex: supabase / serviço) — NÃO mocka hooks do React.
- Garante caminho feliz + 1 erro/variante importante (não todas as permutações).

---

## 🧱 Padrões Adotados
- Preferir `screen.getByRole` / `findByText` (acessibilidade primeiro).
- Agrupar testes por fluxo, não por método privado inexistente.
- Limpar mocks com `jest.clearAllMocks()` em `beforeEach` quando relevante.
- Evitar snapshot: frágil e com pouco valor pedagógico aqui.
- Reduzir warnings (ex: usar `act` onde necessário ou mock adequado).

---

## 🚫 Anti‑Padrões Evitados
| Anti‑padrão | Por que evitar |
|-------------|---------------|
| Testar implementação (ex: estado interno) | Quebra fácil em refatorações neutras. |
| Cobrir “cada if” mecanicamente | Não mede valor real. |
| Excesso de mocks em cadeia | Deixa teste artificial e frágil. |
| Snapshots gigantes | Dificultam leitura e revisão. |
| Testar bibliotecas de terceiros | Confiamos que já são testadas pelos autores. |

---

## 🧪 Exemplo Comparativo

### Unitário (trecho conceitual)
```js
import { addProduto } from '../services/produtosService';

test('addProduto calcula saldo corretamente', async () => {
  // supabase.from mockado previamente retorna sucesso
  const novo = await addProduto({ nome: 'A', entrada: 10, saida: 3, medida: 1 });
  expect(novo.saldo).toBe(7);
});
```

### Integração (trecho conceitual)
```js
import { render, screen, fireEvent } from '@testing-library/react';
import ProdutoList from '../components/ProdutoList';
// getProdutos / deleteProduto mockados

test('remove item após confirmação', async () => {
  render(<ProdutoList />);
  await screen.findByText(/lista de produtos/i);
  fireEvent.click(screen.getAllByTitle(/remover/i)[0]);
  fireEvent.click(screen.getByRole('button', { name: /confirmar remoção/i }));
  await screen.findByTestId('toast');
  expect(screen.queryByText('Caneta')).toBeNull();
});
```

---

## 🧩 Decisão: “Menos, porém Melhor”
Focamos em proteger:
1. Usuário consegue logar.
2. Usuário vê a lista de produtos.
3. Consegue cadastrar → aparece na lista.
4. Consegue remover com segurança.
5. Regras de serviço (saldo) não quebram em refactors.

Se isso quebra, o projeto perde valor. O resto é detalhe de implementação.

---

## 🛠 Checklist ao Criar um Novo Teste
1. Vou cobrir fluxo ou só repetir algo óbvio? (Se for óbvio, não teste.)
2. O nome do teste descreve o comportamento? (ex: “mostra toast após remover”).
3. Uso seletores acessíveis (role/text/label) em vez de `.class`?
4. Tenho apenas o mínimo de mocks?
5. Falha do teste apontaria causa clara? (Se não, repensar.)

Se responder NÃO a ≥ 2 itens → provavelmente o teste não entra.

---

## ▶ Como Rodar
Executar todos:
```
npm test -- --watchAll=false
```
Rodar só uma suite:
```
npm test -- --watchAll=false --testPathPattern=ProdutoList.test.js
```

---

## 🚀 Próximos Passos (Opcional / Aula Avançada)
- Introduzir testes E2E (Playwright) cobrindo login + CRUD completo.
- Cobertura condicional só para serviços críticos.
- Testes de acessibilidade automatizados (axe-core) em builds.
- Mock Service Worker (MSW) para simular API real sem acoplamento.

---

## 💡 Resumo Didático
Testar é escolher. Aqui escolhemos proteger o que gera valor direto para o usuário final (fluxos centrais) e a lógica que pode quebrar silenciosamente (serviços). Menos barulho = mais confiança.

---

## 📌 Teste Mais Complexo: `ProdutoList`
O arquivo `ProdutoList.test.js` é o mais complexo da suíte atual. Ele cobre vários comportamentos encadeados do componente que concentram múltiplos estados e efeitos:

### Por que é o mais difícil
1. Múltiplos fluxos assíncronos
  - Carregamento inicial (`getProdutos`).
  - Refresh após remoção (delete → novo `getProdutos`).
  - Refresh após criação (cadastro → manter página → atualizar lista).
  - Aparição e desaparecimento de toasts (timeout controlado).
2. Estados concorrentes
  - Lista de produtos, página atual, toast, modal de cadastro, diálogo de confirmação, mapeamento de medidas.
3. Elementos efêmeros no DOM
  - Dialog de confirmação (entra e sai).
  - Toast (existe por poucos segundos).
4. Sequenciamento de mocks
  - Ordem das respostas de `getProdutos` precisa refletir as transições (antes/depois de adicionar/remover).
5. Risco de flakiness
  - Necessidade de `findBy*` / `waitFor` corretos para evitar falhas intermitentes.
6. Abrange múltiplas “categorias” de comportamento
  - CRUD parcial (listar / adicionar / remover), UX (feedback + segurança), paginação e consistência de dados.

### Comparação com outros
| Teste | Motivo de ser mais simples |
|-------|----------------------------|
| Login | Apenas formulário + fluxo linear de submit. |
| CadastroProduto | Form + validação, sem paginação/toast/diálogo. |
| ConfirmDialog | Estado binário (aberto/fechado) + dois caminhos. |
| Serviços (auth/produtos) | Lógica pura/isolada (unitários). |

### Possível evolução ainda mais complexa
Futuros testes E2E (ex: Playwright) cobrindo login → adicionar → paginar → remover → persistência real seriam mais complexos, pois adicionam rede real, timing e múltiplas páginas.

Resumo: `ProdutoList.test.js` é um bom exemplo de teste de integração rico — valida não só a renderização, mas a orquestração de estados e efeitos que compõem a experiência completa do usuário.

---

Qualquer dúvida ou sugestão de novo cenário → abrir PR/discussão antes de adicionar testes.
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

### 3. Service de Autenticação (`authService`)
Cobertura das regras simplificadas de login via Supabase (`usuarios`) — 9 testes:
1. Sucesso: usuário existente + senha correta retorna sessão `{ user:{id,email,nome}, token }` e persiste no `localStorage`.
2. Senha incorreta: erro `Credenciais inválidas` e sessão permanece `null`.
3. Usuário não encontrado: mesmo erro genérico (não revela existência).
4. Logout limpa sessão e storage.
5. Normalização de email: trim + lowercase antes de consultar.
6. Trim de senha: espaços nas extremidades ignorados.
7. Renovação de token: logins consecutivos geram tokens diferentes.
8. Logout idempotente: múltiplas chamadas mantêm estado limpo.
9. Erro de rede tratado como credenciais inválidas (não vaza detalhe).

Aspectos ainda NÃO cobertos e intencionais:
- Não há hashing de senha (comparação plaintext temporária).
- Não testamos race conditions reais (concorrência simultânea de chamadas login).
- Não há restore automático de sessão (futuro `restoreSession`).
- Campo `status` ignorado nesta versão simplificada (pode voltar futuramente se houver regra de bloqueio).

### 4. Componente `Login`
Testes de comportamento da UI (com jest.mock do service) — total 9:
1. Renderização: heading acessível "Login" (visualmente escondido), logo, título "Controle de Estoque", campos email/senha e botão.
2. Validação: submissão vazia exibe mensagens para email e senha e não chama `login`.
3. Fluxo de sucesso: credenciais válidas chama `login(email, senha)` e executa `onSuccess(session)`.
4. Erro de credenciais: quando `login` rejeita mostra alerta de erro e não chama `onSuccess`.
5. Estado de carregamento: botão desabilitado durante requisição e reabilitado ao terminar.
6. Sanitização de input: faz `trim` de email e senha antes de chamar `login`.
7. Prevenção de duplicidade: ignora segundo clique rápido (não duplica chamadas simultâneas ao service).
8. Acessibilidade de fluxo: permite submissão pelo Enter no campo senha disparando o mesmo fluxo de sucesso.
9. Toggle de visibilidade da senha: botão acessível alterna type password/text e atualiza label (Mostrar/Ocultar senha).

Evoluções estruturais (suportadas pelos testes ou neutras):
- Refatoração para uso de Bootstrap + Bootstrap Icons (remoção de objeto de estilos custom) mantendo estabilidade.
- Layout responsivo: card central com `clamp()` e fullscreen gradient.
- Remoção de restauração automática de sessão (requisito do cliente: relogar após refresh).
- Guard contra múltiplas submissões simultâneas (estado de `loading`).

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
 9. `authService`: testes de múltiplos logins seguidos, logout idempotente, tentativa concorrente, latência simulada e tratamento diferenciado de erro de rede.
10. `authService`: futura função `restoreSession()` (quando decidirmos permitir persistência após refresh) + teste garantindo não restaura quando sessão expirada.
11. Hash de senha: ao implementar, validar comparação usando mock de função de hashing e garantir que senha em claro não é retornada em nenhum objeto.
12. `Login`: (pendentes) teste de foco inicial automático no campo email; acessibilidade adicional (aria-live para mensagem de erro) e teste de tab order.
13. Proteção de rotas: teste de componente _ProtectedRoute_ redirecionando visitantes não autenticados para login.
14. Acessibilidade adicional: verificar navegação por tab, `aria-live` para mensagens de erro e contraste mínimo de cores.
15. Teste de responsividade visual (ex: width do card muda em breakpoints simulando diferentes larguras com `window.innerWidth`).
16. Rate limiting / bloqueio após X falhas consecutivas (futuro) + teste garantindo reset em sucesso.

## Estratégia de Evolução (TDD)
1. Criar novo teste (RED) cobrindo um dos itens faltantes (ex: erro ao carregar medidas).
2. Implementar lógica mínima para passar o teste (GREEN).
3. Refatorar caso surjam duplicações (REFACTOR).
4. Repetir até cobrir todos os casos críticos.

## Execução
Comando principal (CRA / Jest):
`npm test -- --watchAll=false`

## Resumo
Cobertura atual:
- Cadastro de Produto: fluxos essenciais + regras de sanitização via service.
- Autenticação: regras centrais de login/logout, status de usuário e cenários de erro genérico vs. inativo.
- Login UI: renderização e fluxos básicos de formulário.

Foco futuro: robustez (erros de carregamento, hashing), UX (mensagens de credenciais, toggle senha, acessibilidade), segurança (rate limit, restore controlada) e integração de rotas protegidas.

