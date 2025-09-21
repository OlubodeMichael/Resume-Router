export function smartTrimResume(text: string, max = 35000) {
    if (text.length <= max) return text;
    // Keep header + last part (often contains recent experience)
    const head = text.slice(0, Math.floor(max * 0.6));
    const tail = text.slice(-Math.floor(max * 0.4));
    return head + "\n...\n" + tail;
  }