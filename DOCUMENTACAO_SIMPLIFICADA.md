# Documentação Simplificada do Projeto

Linguagem direta para entender rapidamente o que já foi feito.

## Visão Geral
Aplicação web para controle de estoque didático. Tem tela de login simples, cadastro de produtos e integra com Supabase (banco na nuvem) para salvar dados.

## Principais Funcionalidades
- Login com email e senha (sem recuperação automática ao atualizar a página – precisa logar de novo).
- Botão para mostrar/ocultar a senha digitada.
- Cadastro de produtos com campos: nome, medida, local, código, data de entrada, quantidade.
- Lista e manipulação de medidas (via service) usada no formulário de produto.
- Sanitização e cálculo automático de saldo (entrada - saída) no service (caso futuro).

## Tecnologias
- React (Create React App).
- Supabase (como backend de dados) – tabela `usuarios` para login e tabelas de produtos/medidas.
- Bootstrap 5 + Bootstrap Icons para layout e ícones.
- Jest + Testing Library para testes.

## Autenticação
- Service `authService`: faz consulta direta na tabela `usuarios` por email.
- Sem verificação de status (simplificado) — se existe e senha combina, loga.
- Sessão guardada em `localStorage`, mas não é restaurada automaticamente.
- Token é só um identificador aleatório (placeholder até implementar algo mais forte).

## Tela de Login
- Focada em acessibilidade: heading escondido, mensagens de erro com `role="alert"`.
- Enter no campo senha envia o formulário.
- Bloqueia cliques repetidos enquanto está autenticando.
- Botão de alternar visibilidade (Mostrar/Ocultar senha) com ícone olho.

## Cadastro de Produto
- Validação de obrigatórios (nome e medida) antes de enviar.
- Após sucesso limpa o formulário.
- Em caso de erro mantém valores para o usuário corrigir.
- Service faz trim e conversão de tipos.

## Testes Automatizados (Resumo)
- Produtos: criação, validação, update, delete, busca e medidas.
- Auth: login sucesso, senha errada, usuário não existe, logout, normalização de email/senha, tokens diferentes, logout idempotente, erro de rede.
- Login UI: renderização, validação, sucesso, erro credenciais, loading, trim, duplo clique, Enter, toggle de senha.

## Decisões Importantes
- Sem restauração automática de sessão: força disciplina nos testes e clareza de fluxo inicial.
- Sem hashing de senha ainda: ficará para etapa de segurança futura.
- Ignoramos status de usuário para simplificar uso inicial.
- Uso de Bootstrap para evitar manter CSS custom extenso.

## Próximos Passos Sugeridos
1. Proteger rotas (mostrar cadastro só se logado).
2. Implementar hashing de senha no backend e comparação segura.
3. Restaurar sessão ao abrir a página (opcional configurável).
4. Mensagens de acessibilidade mais ricas (aria-live e foco automático).
5. Testes de erro ao carregar medidas.
6. Rate limiting (bloquear várias tentativas erradas seguidas).
7. Tela de listagem/edição de produtos.

## Como Rodar
Instalar dependências e iniciar:
```
npm install
npm start
```
Rodar testes uma vez:
```
npm test -- --watchAll=false
```

## Estrutura Principal
- `src/services/` – lógica de acesso a dados (Supabase) e autenticação.
- `src/components/` – componentes React (Login, CadastroProduto, etc.).
- `src/tests/` – testes unitários/componentes.
- `TESTES.md` – documentação detalhada de testes.
- `DOCUMENTACAO_SIMPLIFICADA.md` – este arquivo (resumo rápido).

## Glossário Rápido
- Sessão: objeto guardando usuário + token fictício.
- Sanitização: limpeza e padronização de dados antes de salvar.
- TDD: criar teste que falha (RED), implementar para passar (GREEN), melhorar código (REFACTOR).

## Contato / Manutenção
- Para adicionar nova funcionalidade: crie teste primeiro no diretório `src/tests/` seguindo padrão existente.
- Evite estilizar fora das classes utilitárias do Bootstrap sem necessidade.

Fim.
