import React, { useEffect, useMemo, useState } from "react";

export default function Solicitacao({ currentUser }) {
  const [produtos, setProdutos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [toast, setToast] = useState({ open: false, message: "", variant: "danger" });

  const [modalOpen, setModalOpen] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState("");

  useEffect(() => {
    fetchProdutos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchProdutos() {
    setIsLoading(true);
    try {
      // ✅ TROQUE PELA SUA API/REPOSITÓRIO REAL
      const list = await apiFetchAllProdutos();

      // ordena por nome (igual no Dart)
      list.sort((a, b) => String(a.nome).localeCompare(String(b.nome)));

      setProdutos(list);
      setIsLoading(false);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      showToast(`Erro ao carregar produtos: ${String(e)}`, "danger");
    }
  }

  const produtosFiltrados = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return produtos;
    return produtos.filter((p) => String(p.nome || "").toLowerCase().includes(q));
  }, [produtos, searchQuery]);

  function showToast(message, variant = "danger") {
    setToast({ open: true, message, variant });
    setTimeout(() => setToast((t) => ({ ...t, open: false })), 3500);
  }

  function abrirModalSolicitar(produto) {
    setProdutoSelecionado(produto);
    setQuantidade("");
    setModalOpen(true);
  }

  async function confirmarSolicitacao() {
    if (!produtoSelecionado) return;

    const qnt = parseInt(quantidade, 10);
    if (!quantidade || Number.isNaN(qnt) || qnt <= 0) {
      showToast("Por favor, insira uma quantidade válida", "danger");
      return;
    }

    // Monta a notificação igual seu Dart
    const notificacao = {
      id_notificacao: null,
      solicitante_nome: currentUser?.nome ?? "Usuário",
      solicitante_cargo: String(currentUser?.cargo ?? ""),
      produto_nome: produtoSelecionado.nome,
      quantidade: qnt,
      data_solicitacao: new Date().toISOString(),
    };

    try {
      // ✅ TROQUE PELA SUA API/REPOSITÓRIO REAL (NotificacoesRepository.insert)
      await apiInsertNotificacao(notificacao);

      setModalOpen(false);

      showToast(
        `Solicitação de ${qnt} unidades de ${produtoSelecionado.nome} enviada.`,
        "success"
      );
    } catch (e) {
      console.error(e);
      showToast(`Erro ao enviar solicitação: ${String(e)}`, "danger");
    }
  }

  function voltarDashboard() {
    // ✅ se você usa react-router, troque por navigate("/home") ou -1
    window.location.href = "/home";
  }

  return (
    <div style={styles.root}>
      {/* Fundo gradiente */}
      <div style={styles.gradient}>
        {/* TopBar */}
        <div style={styles.topBar}>
          <button style={styles.iconBtn} onClick={voltarDashboard} title="Voltar">
            <BackIcon />
          </button>

          <div style={styles.title}>Solicitações</div>

          {/* placeholder pra centralizar */}
          <div style={{ width: 44 }} />
        </div>

        {/* Área branca */}
        <div style={styles.whiteArea}>
          {/* Search */}
          <div style={styles.searchWrap}>
            <div style={styles.searchIcon}>
              <SearchIcon />
            </div>
            <input
              style={styles.searchInput}
              placeholder="Procurar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Lista */}
          <div style={styles.listWrap}>
            {isLoading ? (
              <div style={styles.centerLoading}>
                <div style={styles.spinner} />
              </div>
            ) : (
              <div style={{ padding: 16 }}>
                {produtosFiltrados.length === 0 ? (
                  <div style={styles.emptyState}>Nenhum produto encontrado.</div>
                ) : (
                  produtosFiltrados.map((p) => (
                    <div key={p.id_produtos ?? p.nome} style={styles.itemCard}>
                      <div style={styles.leadingIconBox}>
                        <InventoryIcon />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={styles.prodTitle}>{p.nome}</div>
                        <div style={styles.prodSub}>Saldo: {p.saldo}</div>
                      </div>

                      <button style={styles.solicitarBtn} onClick={() => abrirModalSolicitar(p)}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <AddCartIcon />
                          <span>Solicitar</span>
                        </div>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal solicitar (igual AlertDialog do Dart) */}
      {modalOpen && produtoSelecionado && (
        <Modal onClose={() => setModalOpen(false)}>
          <div style={styles.modalTitle}>
            Solicitar <span style={{ color: "#1976d2" }}>{produtoSelecionado.nome}</span>
          </div>

          <div style={styles.modalBoxInfo}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <InventoryIconSmall />
              <span style={{ fontWeight: 700 }}>Saldo atual: {produtoSelecionado.saldo}</span>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={styles.inputLabel}>Quantidade a solicitar</label>
            <div style={styles.inputWrap}>
              <div style={styles.inputIcon}>
                <CartSmallIcon />
              </div>
              <input
                style={styles.input}
                type="number"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="Digite a quantidade"
              />
            </div>
          </div>

          <div style={styles.modalActions}>
            <button style={styles.btnGhost} onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button style={styles.btnOrange} onClick={confirmarSolicitacao}>
              Solicitar
            </button>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast.open && (
        <div style={styles.toast(toast.variant)}>
          <pre style={styles.toastText}>{toast.message}</pre>
        </div>
      )}

      {/* keyframes spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ---------------- Modal ---------------- */
function Modal({ children, onClose }) {
  return (
    <div style={styles.modalBackdrop} onMouseDown={onClose}>
      <div style={styles.modalBox} onMouseDown={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

/* ---------------- API MOCKS (TROQUE PELO SEU BACKEND) ---------------- */
async function apiFetchAllProdutos() {
  // tenta /api/produtos
  try {
    const res = await fetch("/api/produtos");
    if (res.ok) return await res.json();
  } catch (_) {}

  const raw = localStorage.getItem("produtos");
  if (raw) return JSON.parse(raw);

  return [
    { id_produtos: 1, nome: "Produto A", saldo: 10 },
    { id_produtos: 2, nome: "Produto B", saldo: 0 },
    { id_produtos: 3, nome: "Produto C", saldo: 3 },
  ];
}

async function apiInsertNotificacao(notificacao) {
  // tenta /api/notificacoes
  try {
    const res = await fetch("/api/notificacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notificacao),
    });
    if (res.ok) return await res.json();
  } catch (_) {}

  // fallback localStorage
  const raw = localStorage.getItem("notificacoes");
  const list = raw ? JSON.parse(raw) : [];
  list.unshift({ ...notificacao, id_notificacao: Date.now() });
  localStorage.setItem("notificacoes", JSON.stringify(list));
  return true;
}

/* ---------------- Styles (inline) ---------------- */
const styles = {
  root: {
    minHeight: "100vh",
    fontFamily: "Inter, system-ui, Arial, sans-serif",
    background: "#f7eef6",
  },
  gradient: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #1565c0, #1e88e5)",
    paddingTop: 10,
  },
  topBar: {
    padding: "10px 16px",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    border: "none",
    background: "rgba(255,255,255,.12)",
    color: "#fff",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    color: "#fff",
    fontSize: 24,
    fontWeight: 900,
    marginRight: 44,
  },

  whiteArea: {
    marginTop: 8,
    background: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: "calc(100vh - 90px)",
    display: "flex",
    flexDirection: "column",
  },

  searchWrap: {
    margin: 16,
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(25,118,210,.10)",
    borderRadius: 15,
    padding: "14px 14px",
  },
  searchIcon: {
    color: "#1976d2",
    display: "grid",
    placeItems: "center",
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 15,
  },

  listWrap: {
    flex: 1,
  },
  centerLoading: {
    minHeight: 260,
    display: "grid",
    placeItems: "center",
  },
  spinner: {
    width: 44,
    height: 44,
    border: "4px solid rgba(0,0,0,.12)",
    borderTopColor: "rgba(0,0,0,.45)",
    borderRadius: "50%",
    animation: "spin 0.9s linear infinite",
  },

  itemCard: {
    marginBottom: 12,
    background: "#fff",
    borderRadius: 15,
    boxShadow: "0 10px 18px rgba(0,0,0,.05)",
    padding: 16,
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  leadingIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "rgba(25,118,210,.10)",
    display: "grid",
    placeItems: "center",
    color: "#1976d2",
  },
  prodTitle: {
    fontWeight: 900,
    fontSize: 16,
  },
  prodSub: {
    marginTop: 8,
    color: "rgba(0,0,0,.60)",
    fontSize: 14,
  },

  solicitarBtn: {
    border: "none",
    cursor: "pointer",
    background: "#fb8c00",
    color: "#fff",
    borderRadius: 10,
    padding: "12px 16px",
    fontWeight: 900,
  },

  emptyState: {
    opacity: 0.7,
    padding: "18px 6px",
  },

  // modal
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.35)",
    display: "grid",
    placeItems: "center",
    zIndex: 50,
    padding: 20,
  },
  modalBox: {
    width: "min(540px, 96vw)",
    background: "#fff",
    borderRadius: 16,
    padding: 18,
    boxShadow: "0 16px 40px rgba(0,0,0,.28)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 900,
    marginBottom: 12,
  },
  modalBoxInfo: {
    padding: 16,
    borderRadius: 12,
    background: "rgba(25,118,210,.10)",
  },
  inputLabel: {
    display: "block",
    fontSize: 13,
    fontWeight: 900,
    marginBottom: 8,
    opacity: 0.85,
  },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    border: "1px solid rgba(0,0,0,.18)",
    borderRadius: 12,
    padding: "12px 12px",
  },
  inputIcon: { color: "rgba(0,0,0,.55)", display: "grid", placeItems: "center" },
  input: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: 15,
    background: "transparent",
  },
  modalActions: {
    marginTop: 16,
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },
  btnGhost: {
    border: "none",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 900,
    background: "rgba(0,0,0,.06)",
  },
  btnOrange: {
    border: "none",
    borderRadius: 12,
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: 900,
    background: "#fb8c00",
    color: "#fff",
  },

  // toast
  toast: (variant) => ({
    position: "fixed",
    left: "50%",
    bottom: 24,
    transform: "translateX(-50%)",
    width: "min(520px, 92vw)",
    borderRadius: 14,
    padding: "12px 14px",
    boxShadow: "0 14px 30px rgba(0,0,0,.25)",
    zIndex: 60,
    background: variant === "success" ? "#2e7d32" : "#e53935",
    color: "#fff",
  }),
  toastText: { margin: 0, fontFamily: "inherit", whiteSpace: "pre-line" },
};

/* ---------------- Ícones ---------------- */
function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8l8 8l1.41-1.41L7.83 13H20z" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 1 0 14 15.5l.27.28v.79L20 21.5L21.5 20zM10 15a5 5 0 1 1 5-5a5 5 0 0 1-5 5" />
    </svg>
  );
}
function InventoryIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M20 7h-3V4H7v3H4v13h16zM9 6h6v1H9zm9 14H6V9h12z" />
    </svg>
  );
}
function InventoryIconSmall() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M20 7h-3V4H7v3H4v13h16zM9 6h6v1H9zm9 14H6V9h12z" />
    </svg>
  );
}
function AddCartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M11 9h2v2h2v2h-2v2h-2v-2H9v-2h2zm-2 11a2 2 0 1 0 2 2a2 2 0 0 0-2-2m10 0a2 2 0 1 0 2 2a2 2 0 0 0-2-2M7.2 14h9.9a2 2 0 0 0 1.9-1.4L21 6H7.1L6.7 4H3v2h2l2.2 10.2A2 2 0 0 0 9.2 18H19v-2H9.4z" />
    </svg>
  );
}
function CartSmallIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M7.2 14h9.9a2 2 0 0 0 1.9-1.4L21 6H7.1L6.7 4H3v2h2l2.2 10.2A2 2 0 0 0 9.2 18H19v-2H9.4z" />
    </svg>
  );
}
