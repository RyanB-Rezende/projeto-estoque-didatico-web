<<<<<<< HEAD
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home({ currentUser }) {
  const navigate = useNavigate();
=======
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSession } from '../../services/login/authService';
import { getProdutos } from '../../services/produtos/produtosService';
import SearchBar from '../common/SearchBar';

// Home com atalhos para todas as listas e uma seção de progresso simples.
export default function Home() {
  const session = getSession();
  const role = (session?.user?.status || '').toString().toLowerCase();

  const isInstrutor = role.includes('instrutor');
  const isAdmin = role.includes('admin');
  const navigate = useNavigate();

  // Produtos para "Visão Geral"
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFalta, setShowFalta] = useState(false);
  const [showAcabando, setShowAcabando] = useState(false);
  const [termFalta, setTermFalta] = useState('');
  const [termAcab, setTermAcab] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await getProdutos();
        setProdutos(data || []);
      } catch (e) {
        setError('Não foi possível carregar produtos.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const shortcuts = useMemo(() => {
    const base = [];
    if (isInstrutor && !isAdmin) {
      base.push(
        { to: '/progresso', label: 'Progresso', icon: 'bi-graph-up' },
        { to: '/solicitacoes', label: 'Solicitações', icon: 'bi-inbox' }
      );
    } else {
      base.push(
        // Acesso do admin inclui atalhos de instrutor
        { to: '/progresso', label: 'Progresso', icon: 'bi-graph-up' },
        { to: '/solicitacoes', label: 'Solicitações', icon: 'bi-inbox' },
        { to: '/turmas', label: 'Lista de Turmas', icon: 'bi-collection' },
        { to: '/produtos', label: 'Lista de Produtos', icon: 'bi-box' },
        { to: '/usuarios', label: 'Lista de Usuários', icon: 'bi-people' },
        { to: '/cursos', label: 'Lista de Cursos', icon: 'bi-journal-bookmark' },
      );
    }
    return base;
  }, [isInstrutor, isAdmin]);

  // Derivados
  const totalProdutos = produtos.length;
  const produtosEmFalta = produtos.filter(p => Number(p.saldo ?? 0) === 0);
  const produtosAcabando = produtos.filter(p => {
    const s = Number(p.saldo ?? 0);
    return s > 0 && s < 5;
  });
  const faltaFiltrados = produtosEmFalta.filter(p => (p.nome || '').toLowerCase().includes(termFalta.toLowerCase()));
  const acabandoFiltrados = produtosAcabando.filter(p => (p.nome || '').toLowerCase().includes(termAcab.toLowerCase()));

  const Card = ({ title, value, gradient, onClick, accent }) => (
    <button type="button" onClick={onClick} className="w-100 text-start btn p-0 border-0 bg-transparent" aria-label={title}>
      <div className="rounded-4 shadow-sm p-4" style={{ background: gradient, minHeight: 120 }}>
        <div className="fw-semibold text-body-tertiary">{title}</div>
        <div className="display-6 fw-bold" style={{ color: accent }}>{value}</div>
      </div>
    </button>
  );
>>>>>>> e691240521bc3ae537d30a9dbb37cb8ae5bac306

  // --------- DASHBOARD STATE
  const [produtos, setProdutos] = useState([]);
  const [filteredProdutos, setFilteredProdutos] = useState([]);

  const [totalProdutos, setTotalProdutos] = useState(0);
  const [produtosEmFalta, setProdutosEmFalta] = useState(0);
  const [produtosAcabando, setProdutosAcabando] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState(""); // '', 'emFalta', 'acabando'
  const [searchQuery, setSearchQuery] = useState("");

  // --------- TOAST + LOGOUT
  const [toast, setToast] = useState({ open: false, message: "", variant: "danger" });
  const [logoutOpen, setLogoutOpen] = useState(false);

  const isAdmin = useMemo(() => currentUser?.status === "admin", [currentUser]);

  // ------------------ INIT DASHBOARD ------------------
  useEffect(() => {
    fetchEstoqueResumo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [produtos, currentFilter, searchQuery]);

  async function fetchEstoqueResumo() {
    try {
      setIsLoading(true);

      // ✅ TROQUE ISSO PELA SUA API/REPOSITÓRIO REAL
      const list = await apiFetchAllProdutos();

      setProdutos(list);
      setTotalProdutos(list.length);
      setProdutosEmFalta(list.filter((p) => Number(p.saldo) <= 0).length);
      setProdutosAcabando(list.filter((p) => Number(p.saldo) > 0 && Number(p.saldo) <= 5).length);

      setIsLoading(false);

      // Snackbar/toast como no Flutter
      setTimeout(() => {
        const emFalta = list.filter((p) => Number(p.saldo) <= 0).length;
        const acabando = list.filter((p) => Number(p.saldo) > 0 && Number(p.saldo) <= 5).length;
        if (emFalta > 0 || acabando > 0) {
          showToast(`Produtos em falta: ${emFalta}\nProdutos acabando: ${acabando}`, "danger");
        }
      }, 800);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      showToast("Erro ao carregar dados do estoque", "danger");
    }
  }

  function applyFilters() {
    let temp = [...produtos];

    if (currentFilter === "acabando") {
      temp = temp.filter((p) => Number(p.saldo) > 0 && Number(p.saldo) <= 5);
    } else if (currentFilter === "emFalta") {
      temp = temp.filter((p) => Number(p.saldo) <= 0);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      temp = temp.filter((p) => String(p.nome || "").toLowerCase().includes(q));
    }

    setFilteredProdutos(temp);
  }

  function filterProducts(filter) {
    setCurrentFilter(filter);
    setSearchQuery("");
  }

  function clearFilter() {
    setCurrentFilter("");
    setSearchQuery("");
  }

  function showToast(message, variant = "danger") {
    setToast({ open: true, message, variant });
    setTimeout(() => setToast((t) => ({ ...t, open: false })), 3500);
  }

  function onRefresh() {
    fetchEstoqueResumo();
  }

  function onLogoutConfirm() {
    // ✅ coloque aqui seu logout real
    window.location.href = "/login";
  }

  // ------------------ NAV / ROUTES ------------------
  function goTo(path) {
    navigate(path);
  }

  function openMovimentacoes(produto) {
    // redireciona para página separada e passa o produto via state
    navigate("/movimentacao", { state: { produto } });
  }

  // ------------------ UI ------------------
  return (
    <div style={styles.root}>
      {/* APP BAR */}
      <header style={styles.appBar}>
        <div style={styles.appBarTitle}>Painel de Controle</div>

        <div style={styles.appBarActions}>
          <button style={styles.iconBtn} onClick={onRefresh} title="Atualizar">
            <RefreshIcon />
          </button>
          <button style={styles.iconBtn} onClick={() => setLogoutOpen(true)} title="Sair">
            <LogoutIcon />
          </button>
        </div>
      </header>

<<<<<<< HEAD
      {/* DASHBOARD */}
      <main style={styles.body}>
        {isLoading ? (
          <div style={styles.centerLoading}>
            <div style={styles.spinner} />
          </div>
        ) : (
          <div style={styles.contentWrap}>
            <h2 style={styles.sectionTitle}>Visão Geral</h2>

            <div style={styles.summaryRow}>
              <SummaryCard
                label="Total de Produtos"
                value={totalProdutos}
                tone="orange"
                onClick={() => filterProducts("")}
              />
              <SummaryCard
                label="Produtos em Falta"
                value={produtosEmFalta}
                tone="red"
                onClick={() => filterProducts("emFalta")}
              />
              <SummaryCard
                label="Produtos Acabando"
                value={produtosAcabando}
                tone="yellow"
                onClick={() => filterProducts("acabando")}
              />
            </div>

            <div style={{ marginTop: 24 }}>
              <h2 style={{ ...styles.sectionTitle, textAlign: "center" }}>Ações Rápidas</h2>
            </div>

            <div style={styles.actionsRow}>
              {isAdmin && (
                <>
                  <ActionCard
                    icon={<InventoryIcon />}
                    label={"Gerenciar\nEstoque"}
                    color="blue"
                    onClick={() => goTo("/produtos")}
                  />
                  <ActionCard
                    icon={<PeopleIcon />}
                    label={"Staff"}
                    color="red"
                    onClick={() => goTo("/usuarios")}
                  />
                </>
              )}

              <ActionCard
                icon={<TargetIcon />}
                label={"Progresso"}
                color="blue"
                onClick={() => goTo("/progresso")}
              />

              <ActionCard
                icon={<CartIcon />}
                label={"Solicitações"}
                color="green"
                onClick={() => goTo("/solicitacao")}
              />
            </div>

            {/* LISTA POR FILTRO (igual Flutter) */}
            {currentFilter !== "" && (
              <div style={{ marginTop: 18 }}>
                <div style={styles.filterHeader}>
                  <h3 style={styles.filterTitle}>
                    Produtos {currentFilter === "acabando" ? "Acabando" : "em Falta"}
                  </h3>
                  <button style={styles.closeBtn} onClick={clearFilter} title="Limpar filtro">
                    ✕
                  </button>
                </div>

                <div style={styles.searchWrap}>
                  <div style={styles.searchIcon}>
                    <SearchIcon />
                  </div>

                  <input
                    style={styles.searchInput}
                    placeholder="Pesquisar produtos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />

                  {searchQuery && (
                    <button style={styles.clearSearchBtn} onClick={() => setSearchQuery("")} title="Limpar">
                      ✕
                    </button>
                  )}
                </div>

                <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                  {filteredProdutos.length === 0 ? (
                    <div style={styles.emptyState}>Nenhum produto encontrado.</div>
                  ) : (
                    filteredProdutos.map((p) => (
                      <div key={p.id_produtos ?? `${p.nome}-${p.saldo}`} style={styles.produtoCard}>
                        <div>
                          <div style={styles.produtoNome}>{p.nome}</div>
                          <div style={styles.produtoSaldo}>Saldo: {p.saldo}</div>
                        </div>

                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <button style={styles.miniBtn} onClick={() => openMovimentacoes(p)} title="Movimentar">
                            Movimentar
                          </button>

                          <div>{Number(p.saldo) <= 0 ? <ErrorIcon /> : <WarningIcon />}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
=======
      <main className="py-4" style={{ minHeight: 'calc(100vh - 40px)' }}>
        {/* Visão Geral */}
        <h2 className="h5 mb-3">Visão Geral</h2>
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-lg-4">
            <Card title="Total de Produtos" value={loading ? '—' : totalProdutos} gradient="linear-gradient(135deg, #fff2d8, #ffffff)" accent="#f6a400" onClick={() => navigate('/produtos')} />
          </div>
          <div className="col-12 col-sm-6 col-lg-4">
            <Card title="Produtos em Falta" value={loading ? '—' : produtosEmFalta.length} gradient="linear-gradient(135deg, #ffe1e1, #ffffff)" accent="#ff4b4b" onClick={() => { setShowFalta(v => !v); setShowAcabando(false); }} />
          </div>
          <div className="col-12 col-sm-6 col-lg-4">
            <Card title="Produtos Acabando" value={loading ? '—' : produtosAcabando.length} gradient="linear-gradient(135deg, #fff8d6, #ffffff)" accent="#c9b400" onClick={() => { setShowAcabando(v => !v); setShowFalta(false); }} />
          </div>
        </div>

        {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}

        {/* Ações Rápidas em grade Bootstrap, 3 por linha */}
        <h2 className="h5 mb-3">Ações Rápidas</h2>
        <div className="row g-3 mb-4">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="col-12 col-sm-6 col-lg-4">
              <Link to={s.to} className="text-decoration-none">
                <button type="button" className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2 py-3">
                  <i className={`bi ${s.icon}`} aria-hidden="true" />
                  <span>{s.label}</span>
                </button>
              </Link>
            </div>
          ))}
        </div>

        {/* Painéis Expansíveis abaixo das ações rápidas */}
        {showFalta && (
          <section className="mb-4 rounded-4 p-3 shadow-sm bg-light" aria-label="Produtos em Falta">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3 className="h6 mb-0">Produtos em Falta</h3>
              <button className="btn btn-sm btn-link" onClick={() => setShowFalta(false)} aria-label="Fechar lista"><i className="bi bi-x-lg"></i></button>
            </div>
            <SearchBar placeholder="Pesquisar produtos..." onSearch={setTermFalta} showAddButton={false} />
            <div className="list-group list-group-flush">
              {faltaFiltrados.map(p => (
                <div key={p.id_produtos} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-semibold">{p.nome}</div>
                    <div className="small text-body-secondary">Saldo: {Number(p.saldo ?? 0)}</div>
                  </div>
                  <span className="text-danger" title="Em falta"><i className="bi bi-exclamation-circle-fill"></i></span>
                </div>
              ))}
              {faltaFiltrados.length === 0 && <div className="text-center text-body-secondary py-3">Nenhum item encontrado.</div>}
            </div>
          </section>
        )}

        {showAcabando && (
          <section className="mb-4 rounded-4 p-3 shadow-sm bg-light" aria-label="Produtos Acabando">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3 className="h6 mb-0">Produtos Acabando</h3>
              <button className="btn btn-sm btn-link" onClick={() => setShowAcabando(false)} aria-label="Fechar lista"><i className="bi bi-x-lg"></i></button>
            </div>
            <SearchBar placeholder="Pesquisar produtos..." onSearch={setTermAcab} showAddButton={false} />
            <div className="list-group list-group-flush">
              {acabandoFiltrados.map(p => (
                <div key={p.id_produtos} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-semibold">{p.nome}</div>
                    <div className="small text-body-secondary">Saldo: {Number(p.saldo ?? 0)}</div>
                  </div>
                  <span className="text-warning" title="Atenção"><i className="bi bi-exclamation-triangle-fill"></i></span>
                </div>
              ))}
              {acabandoFiltrados.length === 0 && <div className="text-center text-body-secondary py-3">Nenhum item encontrado.</div>}
            </div>
          </section>
>>>>>>> e691240521bc3ae537d30a9dbb37cb8ae5bac306
        )}
      </main>

      {/* MODAL LOGOUT */}
      {logoutOpen && (
        <Modal onClose={() => setLogoutOpen(false)}>
          <div style={styles.modalTitle}>Confirmar Logout</div>
          <div style={styles.modalText}>Tem certeza que deseja sair?</div>

          <div style={styles.modalActions}>
            <button style={styles.btnGhost} onClick={() => setLogoutOpen(false)}>
              Cancelar
            </button>
            <button
              style={styles.btnDanger}
              onClick={() => {
                setLogoutOpen(false);
                onLogoutConfirm();
              }}
            >
              Sair
            </button>
          </div>
        </Modal>
      )}

      {/* TOAST */}
      {toast.open && (
        <div style={styles.toast(toast.variant)}>
          <pre style={styles.toastText}>{toast.message}</pre>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ---------------- COMPONENTES ---------------- */

function SummaryCard({ label, value, tone = "orange", onClick }) {
  const bg =
    tone === "orange"
      ? "linear-gradient(180deg, #ffe7cc, #fff2e6)"
      : tone === "red"
      ? "linear-gradient(180deg, #ffd0d0, #ffe9e9)"
      : "linear-gradient(180deg, #fff6c7, #fffbe8)";

  const valueColor = tone === "orange" ? "#f39c12" : tone === "red" ? "#e74c3c" : "#f1c40f";

  return (
    <button style={{ ...styles.summaryCard, background: bg }} onClick={onClick}>
      <div style={{ ...styles.summaryValue, color: valueColor }}>{value}</div>
      <div style={styles.summaryLabel}>{label}</div>
    </button>
  );
}

function ActionCard({ icon, label, color = "blue", onClick }) {
  const outline =
    color === "blue"
      ? "rgba(63,138,224,.18)"
      : color === "red"
      ? "rgba(231,76,60,.18)"
      : "rgba(46,204,113,.18)";

  const iconColor = color === "blue" ? "#2d7bd8" : color === "red" ? "#e74c3c" : "#2ecc71";

  return (
    <button style={styles.actionCard} onClick={onClick}>
      <div style={{ ...styles.actionCircle, outline: `3px solid ${outline}`, color: iconColor }}>
        {icon}
      </div>
      <div style={{ ...styles.actionLabel, color: iconColor }}>{label}</div>
    </button>
  );
}

function Modal({ children, onClose }) {
  return (
    <div style={styles.modalBackdrop} onMouseDown={onClose}>
      <div style={styles.modalBox} onMouseDown={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

/* ---------------- API MOCK (TROQUE PELO SEU BACKEND) ---------------- */

async function apiFetchAllProdutos() {
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

/* ---------------- STYLES ---------------- */

const styles = {
  root: {
    minHeight: "100vh",
    background: "#f7eef6",
    color: "#202124",
    fontFamily: "Inter, system-ui, Arial, sans-serif",
  },

  // appbar
  appBar: {
    height: 66,
    background: "#3f8ae0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  appBarTitle: {
    fontWeight: 500,
    letterSpacing: 0.2,
    fontSize: 20,
    color: "#0e223a",
  },
  appBarActions: {
    position: "absolute",
    right: 14,
    display: "flex",
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    border: "none",
    background: "transparent",
    color: "#0e223a",
    borderRadius: 10,
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
  },

  body: { padding: "22px 20px 30px" },
  centerLoading: { minHeight: "calc(100vh - 66px)", display: "grid", placeItems: "center" },
  spinner: {
    width: 44,
    height: 44,
    border: "4px solid rgba(0,0,0,.12)",
    borderTopColor: "rgba(0,0,0,.45)",
    borderRadius: "50%",
    animation: "spin 0.9s linear infinite",
  },

  contentWrap: { maxWidth: 1150, margin: "0 auto" },
  sectionTitle: { fontSize: 22, fontWeight: 800, margin: "6px 0 14px" },

  summaryRow: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 },
  summaryCard: {
    border: "none",
    borderRadius: 14,
    boxShadow: "0 8px 18px rgba(0,0,0,.12)",
    padding: "22px 10px",
    cursor: "pointer",
    transition: "transform .15s ease, box-shadow .15s ease",
    background: "#fff",
  },
  summaryValue: { fontSize: 42, fontWeight: 900, textAlign: "center", marginBottom: 6 },
  summaryLabel: { textAlign: "center", fontSize: 16, opacity: 0.9 },

  actionsRow: {
    height: 200,
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
    gap: 18,
    flexWrap: "wrap",
  },
  actionCard: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    alignItems: "center",
    minWidth: 160,
  },
  actionCircle: {
    width: 88,
    height: 88,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    boxShadow: "0 10px 20px rgba(0,0,0,.12)",
    background: "rgba(255,255,255,.45)",
    border: "2px solid rgba(0,0,0,.06)",
  },
  actionLabel: {
    fontSize: 18,
    fontWeight: 800,
    whiteSpace: "pre-line",
    textAlign: "center",
  },

  filterHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  filterTitle: { margin: 0, fontSize: 20, fontWeight: 900 },
  closeBtn: {
    border: "none",
    background: "rgba(0,0,0,.06)",
    width: 38,
    height: 38,
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 18,
  },

  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fff",
    border: "1px solid rgba(0,0,0,.15)",
    borderRadius: 12,
    padding: "10px 12px",
    maxWidth: 520,
  },
  searchIcon: { color: "rgba(0,0,0,.55)", display: "grid", placeItems: "center" },
  searchInput: { flex: 1, border: "none", outline: "none", fontSize: 15, background: "transparent" },
  clearSearchBtn: {
    border: "none",
    background: "rgba(0,0,0,.06)",
    width: 28,
    height: 28,
    borderRadius: 8,
    cursor: "pointer",
  },

  produtoCard: {
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 6px 14px rgba(0,0,0,.10)",
    padding: "12px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  produtoNome: { fontSize: 16, fontWeight: 800 },
  produtoSaldo: { marginTop: 2, fontSize: 14, opacity: 0.8 },
  emptyState: { opacity: 0.75, padding: "14px 2px" },

  miniBtn: {
    border: "none",
    background: "#e3f2fd",
    color: "#1976d2",
    borderRadius: 10,
    padding: "8px 10px",
    fontWeight: 800,
    cursor: "pointer",
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
    width: "min(520px, 96vw)",
    background: "#fff",
    borderRadius: 16,
    padding: "18px 18px 14px",
    boxShadow: "0 16px 40px rgba(0,0,0,.28)",
  },
  modalTitle: { fontSize: 18, fontWeight: 900, marginBottom: 8 },
  modalText: { opacity: 0.85, marginBottom: 16, lineHeight: 1.35 },
  modalActions: { display: "flex", gap: 10, justifyContent: "flex-end" },
  btnGhost: {
    border: "none",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 900,
    background: "rgba(0,0,0,.06)",
  },
  btnDanger: {
    border: "none",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 900,
    background: "#e53935",
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

/* ---------------- ÍCONES ---------------- */

function RefreshIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.65 6.35A7.95 7.95 0 0 0 12 4a8 8 0 1 0 7.75 10h-2.1A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L14 10h6V4z"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M10 17v-2h4v-6h-4V7l-5 5zm9-14H12v2h7v14h-7v2h7a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2"
      />
    </svg>
  );
}

function InventoryIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M20 7h-3V4H7v3H4v13h16zM9 6h6v1H9zm9 14H6V9h12z" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3M8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3m0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13m8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5"
      />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2m0 18a8 8 0 1 1 8-8a8 8 0 0 1-8 8m0-14a6 6 0 1 0 6 6a6 6 0 0 0-6-6m0 10a4 4 0 1 1 4-4a4 4 0 0 1-4 4"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 18a2 2 0 1 0 2 2a2 2 0 0 0-2-2m10 0a2 2 0 1 0 2 2a2 2 0 0 0-2-2M7.2 14h9.9a2 2 0 0 0 1.9-1.4L21 6H7.1L6.7 4H3v2h2l2.2 10.2A2 2 0 0 0 9.2 18H19v-2H9.4z"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 1 0 14 15.5l.27.28v.79L20 21.5L21.5 20zM10 15a5 5 0 1 1 5-5a5 5 0 0 1-5 5"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#e53935" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2m1 15h-2v-2h2zm0-4h-2V7h2z" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#fb8c00" d="M1 21h22L12 2zm12-3h-2v-2h2zm0-4h-2v-4h2z" />
    </svg>
  );
}
