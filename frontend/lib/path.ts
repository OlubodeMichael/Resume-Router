export function setAtPath<T extends object>(obj: T, path: string, value: unknown): T {
  const parts = path.split('.');
  const root: Record<string, unknown> | unknown[] = Array.isArray(obj) 
    ? [...(obj as unknown[])] 
    : { ...(obj as Record<string, unknown>) };
  let cur: Record<string, unknown> | unknown[] = root;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    const next = Array.isArray(cur) ? (cur as unknown[])[Number(k)] : (cur as Record<string, unknown>)[k];
    
    // Determine if next key should be array or object
    const nextKey = parts[i + 1];
    const isNextArrayIndex = Number.isFinite(+nextKey);
    
    if (Array.isArray(next)) {
      if (Array.isArray(cur)) {
        (cur as unknown[])[Number(k)] = [...next];
        cur = (cur as unknown[])[Number(k)] as unknown[];
      } else {
        (cur as Record<string, unknown>)[k] = [...next];
        cur = (cur as Record<string, unknown>)[k] as unknown[];
      }
    } else if (next && typeof next === 'object' && next !== null) {
      if (Array.isArray(cur)) {
        (cur as unknown[])[Number(k)] = { ...(next as Record<string, unknown>) };
        cur = (cur as unknown[])[Number(k)] as Record<string, unknown>;
      } else {
        (cur as Record<string, unknown>)[k] = { ...(next as Record<string, unknown>) };
        cur = (cur as Record<string, unknown>)[k] as Record<string, unknown>;
      }
    } else {
      const newValue = isNextArrayIndex ? [] : {};
      if (Array.isArray(cur)) {
        (cur as unknown[])[Number(k)] = newValue;
        cur = (cur as unknown[])[Number(k)] as Record<string, unknown> | unknown[];
      } else {
        (cur as Record<string, unknown>)[k] = newValue;
        cur = (cur as Record<string, unknown>)[k] as Record<string, unknown> | unknown[];
      }
    }
  }
  
  const lastKey = parts[parts.length - 1];
  if (Array.isArray(cur)) {
    (cur as unknown[])[Number(lastKey)] = value;
  } else {
    (cur as Record<string, unknown>)[lastKey] = value;
  }
  return root as T;
}

