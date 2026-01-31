import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Movimentacao({ currentUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  // produto vem da Home via navigate("/movimentacao", { state: { produto } })
  const selectedProduto = location.state?.produto ?? null;

  const isAdmin = useMemo(() => currentUser?.status === "admin", [currentUser]);

  const [movIsLoading, setMovIsLoading] = useState(true);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [tipoMovimentacao, setTipoMovimentacao] = useState("saida");
  const [quantidade, setQuantidade] = useState("");

  const [toast, setToast] = useState({ open: false, message: "", variant: "danger" });

  useEffect(() => {
    loadMovimentacoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduto?.id_produtos, isAdmin, currentUser?.id_usuarios]);

  function showToast(message, variant = "danger") {
    setToast({ open: true, message, variant });
    setTimeout(() => setToast((t) => ({ ...t, open: false })), 3500);
  }

  async function loadMovimentacoes() {
    try {
      setMovIsLoading(true);

      let list;
      if (isAdmin) {
        list = await apiFetchAllMovimentacoes();
      } else {
        list = await apiFetchMovimentacoesByUsuario(currentUser?.id_usuarios);
      }

      // filtra pelo produto selecionado (igual você fazia na Home)
      if (selectedProduto?.id_produtos != null) {
        list = list.filter(
          (m) => Number(m.id_produtos) === Number(selectedProduto.id_produtos)
        );
      }

      setMovimentacoes(list);
      setMovIsLoading(false);
    } catch (e) {
      console.error(e);
      setMovIsLoading(false);
      showToast("Erro ao carregar movimentações", "danger");
    }
  }

  async function registrarMovimentacao() {
    if (!quantidade || String(quantidade).trim() === "") {
      showToast("Por favor, insira uma quantidade", "danger");
      return;
    }

    const qnt = parseInt(quantidade, 10);
    if (Number.isNaN(qnt) || qnt <= 0) {
      showToast("Por favor, insira uma quantidade válida", "danger");
      return;
    }

    if (!selectedProduto?.id_produtos) {
      showToast("Selecione um produto para registrar movimentação", "danger");
      return;
    }

    try {
      const mov = {
        id_produtos: selectedProduto.id_produtos,
        id_turma: currentUser?.turma ?? null,
        id_usuarios: currentUser?.id_usuarios ?? null,
        data_saida: new Date().toISOString(),
        quantidade: qnt,
        tipo: tipoMovimentacao,
        observacao: "Registrado manualmente",
      };

      await apiInsertMovimentacao(mov);

      await apiUpdateSaldoProduto({
        id_produtos: selectedProduto.id_produtos,
        quantidade: qnt,
        tipo: tipoMovimentacao,
        userId: currentUser?.id_usuarios,
        skipMovementRecord: true,
      });

      setQuantidade("");
      await loadMovimentacoes();

      showToast("Movimentação registrada e saldo atualizado!", "success");
    } catch (e) {
      console.error(e);
      showToast(`Erro ao registrar movimentação: ${String(e)}`, "danger");
    }
  }

  async function clearAllMovimentacoes() {
    if (!isAdmin) return;

    const ok = window.confirm("Tem certeza que deseja limpar todas as movimentações?");
    if (!ok) return;

    try {
      await apiClearAllMovimentacoes();
      await loadMovimentacoes();
      showToast("Todas as movimentações foram limpas", "success");
    } catch (e) {
      console.error(e);
      showToast(`Erro ao limpar movimentações: ${String(e)}`, "danger");
    }
  }

  function backToDashboard() {
    navigate("/home");
  }

  return (
    <div style={styles.root}>
      <div style={styles.gradient}>
        {/* TOP BAR */}
        <div style={styles.topBar}>
          <button style={styles.iconBtn} onClick={backToDashboard} title="Voltar">
            <BackIcon />
          </button>

          <div style={styles.title}>Movimentações</div>

          {isAdmin ? (
            <button style={styles.iconBtn} onClick={clearAllMovimentacoes} title="Limpar todas">
              <DeleteSweepIcon />
            </button>
          ) : (
            <div style={{ width: 44 }} />
          )}
        </div>

        {/* CARD NOVA MOVIMENTAÇÃO */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Nova Movimentação</div>

          <div style={{ marginTop: 14, display: "flex", gap: 18, flexWrap: "wrap" }}>
            <RadioOption
              label="Entrada"
              value="entrada"
              groupValue={tipoMovimentacao}
              onChange={setTipoMovimentacao}
            />
            <RadioOption
              label="Saída"
              value="saida"
              groupValue={tipoMovimentacao}
              onChange={setTipoMovimentacao}
            />
          </div>

          <div style={{ marginTop: 10 }}>
            <label style={styles.inputLabel}>Quantidade</label>
            <input
              style={styles.input}
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              placeholder="Digite a quantidade"
            />
          </div>

          <button style={styles.primaryBtn} onClick={registrarMovimentacao}>
            Registrar Movimentação
          </button>

          <div style={{ marginTop: 10, fontSize: 13, opacity: 0.75 }}>
            {selectedProduto ? (
              <span>
                Produto selecionado: <b>{selectedProduto.nome}</b> (ID:{" "}
                {selectedProduto.id_produtos})
              </span>
            ) : (
              <span>Volte e selecione um produto para movimentar.</span>
            )}
          </div>
        </div>

        {/* LISTA BRANCA */}
        <div style={styles.whiteArea}>
          {movIsLoading ? (
            <div style={styles.centerLoading}>
              <div style={styles.spinner} />
            </div>
          ) : movimentacoes.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyIconWrap}>
                <InboxIcon />
              </div>
              <div style={styles.emptyText}>Nenhuma movimentação encontrada</div>
            </div>
          ) : (
            <div style={{ padding: 16 }}>
              {movimentacoes.map((m) => (
                <div
                  key={m.id_movimentacao ?? `${m.id_produtos}-${m.data_saida}-${m.quantidade}`}
                  style={styles.itemCard}
                >
                  <div style={styles.avatar(m.tipo)}>
                    {m.tipo === "entrada" ? <PlusIcon /> : <MinusIcon />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={styles.itemTitle}>
                      Movimentação #{m.id_movimentacao ?? "—"}
                    </div>

                    <div style={styles.sub}>
                      <div>Data: {formatDateBR(m.data_saida)}</div>
                      <div>Quantidade: {m.quantidade}</div>
                      <div>Tipo: {m.tipo}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TOAST */}
      {toast.open && (
        <div style={styles.toast(toast.variant)}>
          <pre style={styles.toastText}>{toast.message}</pre>
        </div>
      )}

      {/* KEYFRAMES */}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ---------------- COMPONENTES ---------------- */

function RadioOption({ label, value, groupValue, onChange }) {
  const checked = groupValue === value;
  return (
    <label style={styles.radioWrap}>
      <input
        type="radio"
        name="tipoMovimentacao"
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        style={{ accentColor: "#1976d2" }}
      />
      <span style={{ fontWeight: 600 }}>{label}</span>
    </label>
  );
}

/* ---------------- HELPERS ---------------- */

function formatDateBR(dateStr) {
  try {
    const d = dateStr ? new Date(dateStr) : new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  } catch {
    return "—";
  }
}

/* ---------------- API (TROQUE PELO SEU BACKEND) ---------------- */

async function apiFetchAllMovimentacoes() {
  try {
    const res = await fetch("/api/movimentacoes");
    if (res.ok) return await res.json();
  } catch (_) {}
  const raw = localStorage.getItem("movimentacoes");
  return raw ? JSON.parse(raw) : [];
}

async function apiFetchMovimentacoesByUsuario(userId) {
  try {
    const res = await fetch(`/api/movimentacoes?userId=${userId}`);
    if (res.ok) return await res.json();
  } catch (_) {}
  const raw = localStorage.getItem("movimentacoes");
  const list = raw ? JSON.parse(raw) : [];
  return list.filter((m) => Number(m.id_usuarios) === Number(userId));
}

async function apiInsertMovimentacao(mov) {
  try {
    const res = await fetch("/api/movimentacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mov),
    });
    if (res.ok) return await res.json();
  } catch (_) {}

  const raw = localStorage.getItem("movimentacoes");
  const list = raw ? JSON.parse(raw) : [];
  const newMov = { ...mov, id_movimentacao: Date.now() };
  list.unshift(newMov);
  localStorage.setItem("movimentacoes", JSON.stringify(list));
  return newMov;
}

async function apiUpdateSaldoProduto({ id_produtos, quantidade, tipo }) {
  try {
    const res = await fetch(`/api/produtos/${id_produtos}/saldo`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantidade, tipo }),
    });
    if (res.ok) return await res.json();
  } catch (_) {}

  const raw = localStorage.getItem("produtos");
  const list = raw ? JSON.parse(raw) : [];
  const idx = list.findIndex((p) => Number(p.id_produtos) === Number(id_produtos));
  if (idx >= 0) {
    const saldoAtual = Number(list[idx].saldo);
    const novoSaldo = tipo === "entrada" ? saldoAtual + Number(quantidade) : saldoAtual - Number(quantidade);
    list[idx].saldo = novoSaldo;
    localStorage.setItem("produtos", JSON.stringify(list));
  }
}

async function apiClearAllMovimentacoes() {
  try {
    const res = await fetch("/api/movimentacoes/clear", { method: "POST" });
    if (res.ok) return true;
  } catch (_) {}
  localStorage.removeItem("movimentacoes");
  return true;
}

/* ---------------- STYLES ---------------- */

const styles = {
  root: { minHeight: "100vh", fontFamily: "Inter, system-ui, Arial, sans-serif" },
  gradient: {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#1565c0,#1e88e5)",
    paddingTop: 10,
  },
  topBar: { padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 },
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
  title: { flex: 1, textAlign: "center", color: "#fff", fontSize: 24, fontWeight: 900, marginRight: 44 },

  card: { background: "#fff", borderRadius: 15, margin: "10px 16px 16px", padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: 900 },
  radioWrap: { display: "flex", alignItems: "center", gap: 10, padding: "6px 8px" },

  inputLabel: { display: "block", fontSize: 13, fontWeight: 800, marginBottom: 6, opacity: 0.8 },
  input: { width: "100%", padding: "12px 12px", borderRadius: 10, border: "1px solid rgba(0,0,0,.18)", outline: "none", fontSize: 15 },

  primaryBtn: { width: "100%", marginTop: 16, border: "none", background: "#1976d2", color: "#fff", borderRadius: 10, padding: "14px 14px", fontWeight: 900, cursor: "pointer" },

  whiteArea: { background: "#fff", borderTopLeftRadius: 30, borderTopRightRadius: 30, minHeight: "calc(100vh - 320px)", paddingTop: 4 },

  centerLoading: { minHeight: 280, display: "grid", placeItems: "center" },
  spinner: { width: 44, height: 44, border: "4px solid rgba(0,0,0,.12)", borderTopColor: "rgba(0,0,0,.45)", borderRadius: "50%", animation: "spin .9s linear infinite" },

  empty: { minHeight: 320, display: "grid", placeItems: "center", padding: 26, textAlign: "center" },
  emptyIconWrap: { width: 88, height: 88, borderRadius: 22, background: "rgba(0,0,0,.05)", display: "grid", placeItems: "center", margin: "0 auto 14px" },
  emptyText: { fontSize: 18, fontWeight: 700, opacity: 0.65 },

  itemCard: { display: "flex", gap: 14, alignItems: "flex-start", background: "#fff", borderRadius: 15, boxShadow: "0 2px 10px rgba(0,0,0,.10)", padding: 16, marginBottom: 12 },
  avatar: (tipo) => ({
    width: 44,
    height: 44,
    borderRadius: 999,
    background: tipo === "entrada" ? "rgba(46,125,50,.10)" : "rgba(229,57,53,.10)",
    display: "grid",
    placeItems: "center",
    color: tipo === "entrada" ? "#2e7d32" : "#e53935",
    flex: "0 0 auto",
  }),
  itemTitle: { fontWeight: 900, marginBottom: 8 },
  sub: { display: "grid", gap: 4, color: "rgba(0,0,0,.6)", fontSize: 14 },

  toast: (variant) => ({
    position: "fixed",
    left: "50%",
    bottom: 24,
    transform: "translateX(-50%)",
    width: "min(520px,92vw)",
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

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8l8 8l1.41-1.41L7.83 13H20z" />
    </svg>
  );
}
function DeleteSweepIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M16 16h6v2h-6zm0-8h6v2h-6zM16 12h6v2h-6zM6 19c-1.1 0-2-.9-2-2V7h14v2H6v8h8v2zM9 4h6l1 1h5v2H3V5h5z" />
    </svg>
  );
}
function InboxIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M19 3H4.99C3.89 3 3 3.9 3 5v14c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m0 14h-3l-2 2H10l-2-2H5V5h14z" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6z" />
    </svg>
  );
}
function MinusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M19 13H5v-2h14z" />
    </svg>
  );
}
