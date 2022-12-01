import { useEffect, useMemo, useReducer, useState } from "react";

type DateLike = Date | string | number | undefined | null;

export function compareDateStrings(...values: [DateLike, DateLike]): number {
  const [a, b] = values.map((v) => new Date(v).valueOf());
  return a - b;
}

export function isDateInRange(
  date: DateLike,
  [rangeStart, rangeEnd]: [DateLike, DateLike]
): boolean {
  return (
    compareDateStrings(date, rangeStart) > 0 &&
    compareDateStrings(date, rangeEnd) < 0
  );
}

export function useNow(interval: number): Date {
  const [now, updateNow] = useReducer(() => new Date(), new Date());
  useEffect(() => {
    const id = setInterval(() => updateNow(), interval);
    return () => clearInterval(id);
  });
  return now;
}

export function useDynamicValue<T>(dynamicValue: T): undefined | T {
  const memoedValue = useMemo(() => dynamicValue, [dynamicValue]);
  const [value, setValue] = useState<T | undefined>(undefined);
  useEffect(() => setValue(memoedValue), [memoedValue]);
  return value;
}
