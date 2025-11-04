// Generic sort utilities with stable sorting
export function sortItems(items, comparator) {
  if (!Array.isArray(items) || typeof comparator !== 'function') return items;
  // decorate-sort-undecorate to keep stability
  return items
    .map((v, i) => ({ v, i }))
    .sort((a, b) => {
      const res = comparator(a.v, b.v);
      return res !== 0 ? res : a.i - b.i;
    })
    .map(({ v }) => v);
}

export const direction = {
  asc: 1,
  desc: -1,
};

export function cmpString(getter, dir = direction.asc) {
  return (a, b) => {
    const va = (getter(a) ?? '').toString().toLowerCase();
    const vb = (getter(b) ?? '').toString().toLowerCase();
    if (va < vb) return -1 * dir;
    if (va > vb) return 1 * dir;
    return 0;
  };
}

export function cmpNumber(getter, dir = direction.asc) {
  return (a, b) => {
    const va = Number(getter(a) ?? 0);
    const vb = Number(getter(b) ?? 0);
    if (va < vb) return -1 * dir;
    if (va > vb) return 1 * dir;
    return 0;
  };
}

export function cmpDateOrId(getter, dir = direction.desc) {
  // try date first; fallback to numeric id or 0
  return (a, b) => {
    const ra = getter(a);
    const rb = getter(b);
    const da = ra ? new Date(ra).getTime() : NaN;
    const db = rb ? new Date(rb).getTime() : NaN;
    let va = isNaN(da) ? Number(ra ?? 0) : da;
    let vb = isNaN(db) ? Number(rb ?? 0) : db;
    if (va < vb) return -1 * dir;
    if (va > vb) return 1 * dir;
    return 0;
  };
}

// Prebuilt factories for pages
export const productComparators = {
  'recent-desc': cmpDateOrId(p => p.data_entrada ?? p.id_produtos, direction.desc),
  'recent-asc': cmpDateOrId(p => p.data_entrada ?? p.id_produtos, direction.asc),
  'alpha-asc': cmpString(p => p.nome, direction.asc),
  'alpha-desc': cmpString(p => p.nome, direction.desc),
  'saldo-asc': cmpNumber(p => p.saldo, direction.asc),
  'saldo-desc': cmpNumber(p => p.saldo, direction.desc),
};

export const userComparators = {
  'recent-desc': cmpDateOrId(u => u.data_criacao ?? u.id_usuarios, direction.desc),
  'recent-asc': cmpDateOrId(u => u.data_criacao ?? u.id_usuarios, direction.asc),
  'alpha-asc': cmpString(u => u.nome, direction.asc),
  'alpha-desc': cmpString(u => u.nome, direction.desc),
};

export const courseComparators = {
  'recent-desc': cmpDateOrId(c => c.data_criacao ?? c.id_curso ?? c.id, direction.desc),
  'recent-asc': cmpDateOrId(c => c.data_criacao ?? c.id_curso ?? c.id, direction.asc),
  'alpha-asc': cmpString(c => c.nome, direction.asc),
  'alpha-desc': cmpString(c => c.nome, direction.desc),
};
