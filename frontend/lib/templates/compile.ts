export function compileTemplate(html: string, data: Record<string, unknown>): string {
    // 1) section arrays: {{#key}}...{{/key}}
    html = html.replace(/{{#(\w+)}}([\s\S]*?){{\/\1}}/g, (_, key: string, block: string) => {
      const val = data[key];
      if (!Array.isArray(val) || val.length === 0) return '';
      return val
        .map((item) =>
          typeof item === 'object'
            ? compileTemplate(block, { ...data, ...item }) // nested object
            : block.replace(/{{\s*item\s*}}/g, String(item)) // primitive array with {{item}}
        )
        .join('');
    });
  
    // 2) simple variables: {{fullName}}
    html = html.replace(/{{\s*([\w.]+)\s*}}/g, (_, key: string) => {
      const parts = key.split('.');
      let v: unknown = data;
      for (const p of parts) v = (v as Record<string, unknown>)?.[p];
      return (v ?? '') as string;
    });
  
    return html;
  }