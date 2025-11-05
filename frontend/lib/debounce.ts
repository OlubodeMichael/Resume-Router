export const debounce = <T extends (...args: never[]) => void | Promise<void>>(
  fn: T,
  ms: number
): ((...args: Parameters<T>) => void) => {
  let t: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => {
      const result = fn(...args);
      // If it's a promise, catch any errors
      if (result instanceof Promise) {
        result.catch(console.error);
      }
    }, ms);
  };
};

