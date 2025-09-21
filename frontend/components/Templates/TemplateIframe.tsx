// components/TemplateIframe.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

export function TemplateIframe({ html }: { html: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [h, setH] = useState(1200);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.srcdoc = html;
    const onLoad = () => setH(Math.max(1000, el.contentDocument?.body?.scrollHeight || 1000));
    el.addEventListener('load', onLoad);
    const t = setTimeout(onLoad, 100);
    return () => { el.removeEventListener('load', onLoad); clearTimeout(t); };
  }, [html]);

  return (
    <iframe
      ref={ref}
      title="Resume"
      sandbox="allow-same-origin"
      style={{ width: '100%', height: h, border: '1px solid #e5e5e5', borderRadius: 12 }}
    />
  );
}
