
## 🎯 Objetivo Pedagógico
Mostrar como construir uma aplicação CRUD enxuta (login + produtos) priorizando:
1. Código legível antes de “otimizações”.
2. Testes mínimos realmente úteis (evitar over-testing).
3. Responsabilidade clara por camada (componentes, serviços, integração).
4. UX básica: feedback (toast), confirmação, paginação simples.

---

## 🗂 Estrutura de Pastas (simplificada)
```
src/
	components/
		auth/Login.js           -> Tela de autenticação simples
		CadastroProduto.js      -> Formulário de novo produto (modal reutilizável)
		ProdutoList.js          -> Listagem, paginação, remoção, criação
		ConfirmDialog.js        -> Diálogo genérico de confirmação
	services/
		supabase.js             -> Instância/config Supabase
		authService.js          -> Login/logout (mock / supabase adaptável)
		produtosService.js      -> CRUD + utilidades (cálculo saldo, medidas)
	tests/                    -> Testes focados em cenários essenciais
```

---

## 🔐 Fluxo de Autenticação
Componente: `Login`.
Principais pontos:
- Campos controlados (email, senha).
- Botão “mostrar/ocultar senha” (ícone troca: olho-fechado quando oculto).
- Validação só de obrigatoriedade (didático). 
- Em sucesso chama `login(email, senha)` em `authService` e sobe sessão via `onSuccess`.

Por que simples? Para focar em fluxo principal antes de lidar com recuperação de sessão, refresh token etc.

---

## 📄 Produtos – Regras Principais
Componente central: `ProdutoList`.

Inclui:
- Carregamento inicial de produtos (`getProdutos`).
- Paginação client-side com página atual preservada ao adicionar.
- Botão “Adicionar” abre `CadastroProduto` em overlay.
- Remoção protegida por `ConfirmDialog` (prevenção de erro humano).
- Toast verde ao cadastrar, vermelho ao remover.
- Nomes de medidas resolvidos (`getMedidas`) e mapeados (id → texto).

Decisão didática: manter paginação minimal (setas + indicador “página / total”) em vez de componente complexo.

---

## 📝 Cadastro de Produto
Componente: `CadastroProduto`.

Características:
- Todos os campos obrigatórios: nome, medida, local, código, data de entrada, quantidade.
- Validação síncrona simples (objetivo educativo).
- Conversão de quantidade para inteiro; saldo calculado no serviço (entrada - saída).
- Carrega lista de medidas de forma assíncrona (exemplo de efeito + loading).
- Em sucesso: chama `addProduto` → retorna objeto criado → dispara `onSubmit` (pais atualizam lista).

---

## 🧩 Diálogo de Confirmação
Componente: `ConfirmDialog`.
Ensina:
- Reuso de UI (genérico: título, mensagem, labels, callbacks).
- Acessibilidade: `role="dialog"`, `aria-modal`, `aria-labelledby`.
- Overlay centralizado com bloqueio de fundo.

Usado antes de deletar produto evitando remoções acidentais.

---

## 🔔 Feedback ao Usuário (Toast)
Implementado manualmente (sem lib externa) para reforçar:
- Simplicidade: apenas estado local + `setTimeout` para esconder.
- Variantes: success (verde), danger (vermelho).
- Acessibilidade: `role="status"` + `aria-live="polite"`.

---

## 🧪 Estratégia de Testes (Filosofia “Mínimo Útil”)
Evitar testes redundantes que só confirmam detalhes de implementação. Mantemos apenas o que garante fluxo de valor:

| Área | Cenários Testados |
|------|--------------------|
| Login | Render básico, validação obrigatória, sucesso login, toggle senha |
| CadastroProduto | Render campos, submit válido, valida obrigatórios |
| ProdutoList | Lista vazia, listagem, remoção com confirmação + toast, paginação, refresh pós criação |
| ConfirmDialog | Fluxo cancelar vs confirmar (integração) |
| authService | Login sucesso, login falha, logout limpa sessão |
| produtosService | getProdutos, addProduto calcula saldo, propagação de erro |

Princípios aplicados:
- Testar comportamentos observáveis (ex: item aparece / some) e não estados internos.
- Evitar snapshot irrelevante.
- Isolar efeitos externos com mocks (Supabase / serviços).
- Remover warnings de act (wrap + mock). 

Por que não mais testes? A meta aqui é ensinar seleção crítica, não inflar cobertura artificial.

---

## 🔌 Serviços
`authService.js`
- Funções: `login(email, senha)`, `logout()`, estado de sessão simples (mockável / adaptável a Supabase real).

`produtosService.js`
- Funções: `getProdutos`, `getProdutoById`, `addProduto`, `updateProduto`, `deleteProduto`, `getMedidas`.
- Cálculo de `saldo` centralizado (consistência).
- Sanitização de entrada (parse numérico). 

`supabase.js`
- Ponto único de import (facilita trocar backend / mock).

---

## 🔄 Fluxos Principais
Login → Carrega `ProdutoList` → Usuário:
1. Visualiza produtos paginados.
2. Cadastra novo produto → lista faz refresh mantendo página.
3. Remove produto → confirmação → toast de remoção.

---

## ♻️ Decisões de Arquitetura
- Sem Redux / Context ainda: complexidade desnecessária para o escopo atual.
- Estado local suficiente (didático + direto).
- Paginação client-side (dados modestos). Escalável depois para server-side se volume crescer.
- Componentes desacoplados por props (ex: `onSubmit`, `onCancel`).

---

## 🚀 Como Rodar
Pré-requisitos: Node 18+.

Instalar dependências:
```
npm install
```

Rodar em desenvolvimento:
```
npm start
```

Executar testes (uma vez):
```
npm test -- --watchAll=false
```

Build de produção:
```
npm run build
```

---

## 🧭 Próximos Passos (Sugestões Didáticas)
- Adicionar edição de produto.
- Filtro / busca textual.
- Persistir sessão de login (localStorage + restore em `App`).
- Loading skeleton para tabela.
- Teste e2e (ex: Playwright) cobrindo fluxo completo.

---

## ✅ Resumo do que se Aprendeu
- Separar “o que faz” (serviço) de “como mostra” (componente).
- Escolher testes que protegem fluxo, não detalhes triviais.
- Fornecer feedback imediato (toast) aumenta clareza do usuário.
- Confirmar ações destrutivas é UX fundamental.
- Começar simples → evoluir depois (progressive enhancement real, não teórico).

---

## 📄 Licença
Uso educacional. Adapte livremente conforme necessidade institucional.

---

Feito com foco didático. Aprenda, adapte e siga em frente. 💡
