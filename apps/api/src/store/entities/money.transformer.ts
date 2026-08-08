export const moneyTransformer = {
  to(value: number | null): number | null {
    return value;
  },
  from(value: string | null): number | null {
    return value == null ? null : Number(value);
  },
};
