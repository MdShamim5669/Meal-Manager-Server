export function pick<T extends Record<string, any>, k extends keyof T>(
  obj: T,
  keys: k[]
): Partial<Pick<T, k>> {
  const finalObj: Partial<Pick<T, k>> = {};

  for (const key of keys) {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
      finalObj[key] = obj[key];
    }
  }

  return finalObj;
}
