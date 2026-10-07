let n = 0;
// ponytail: id cục bộ theo bộ đếm — đủ cho mock trong bộ nhớ; backend thật dùng UUID.
export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(n++).toString(36)}`;
