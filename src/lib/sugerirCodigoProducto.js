function slugify(text) {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
}

function segmentoIva(impuesto) {
  const n = Number(impuesto);
  if (!Number.isFinite(n)) return 'iva-xx';
  const i = Math.max(0, Math.min(100, Math.round(n)));
  return `iva${String(i).padStart(2, '0')}`;
}

function sufijoUnico() {
  const t = Date.now().toString(36).slice(-6);
  const r = Math.random().toString(36).slice(2, 8);
  return `${t}${r}`.replace(/\./g, '');
}

/**
 * Referencia legible: slug del nombre + tipo IVA + sufijo aleatorio.
 */
export function sugerirCodigoProducto(nombre, impuestoPct = 21) {
  const slug = slugify(nombre);
  const iva = segmentoIva(impuestoPct);
  const u = sufijoUnico();

  if (!slug) {
    return `ref-${iva}-${u}`.slice(0, 50);
  }

  const raw = `${slug}-${iva}-${u}`;
  return raw.slice(0, 50).replace(/-+$/, '');
}
