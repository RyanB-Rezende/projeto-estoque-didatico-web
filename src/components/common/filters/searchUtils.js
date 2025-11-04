// Utilidade reutilizável para filtrar listas por um termo em múltiplos campos
// selectors: array de funções (item) => string | number | undefined
// Retorna a lista original quando term for falsy
export function filterByTerm(items, term, selectors) {
  if (!term) return items;
  const t = String(term).toLowerCase();
  if (!Array.isArray(items) || !Array.isArray(selectors) || selectors.length === 0) return items;
  return items.filter((it) => {
    for (const sel of selectors) {
      try {
        const v = sel?.(it);
        if (v === null || v === undefined) continue;
        const s = String(v).toLowerCase();
        if (s.includes(t)) return true;
      } catch (_) {
        // ignora seletores com erro para não quebrar a UX
      }
    }
    return false;
  });
}
