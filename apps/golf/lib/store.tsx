import { createContext, useContext, useMemo, useReducer, type PropsWithChildren } from 'react';
import type { AppState } from './domain';
import { reduce, type Action } from './reducer';
import { seedState } from './mock';
import { me as meOf } from './selectors';

const Ctx = createContext<{ state: AppState; dispatch: (a: Action) => void } | null>(null);
export function StoreProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reduce, undefined, seedState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore: bọc app trong <StoreProvider>');
  return { ...v, me: meOf(v.state) };
}
