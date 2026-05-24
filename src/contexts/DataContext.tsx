import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AppData } from '../types';
import {
  DATA_CHANGE_EVENT,
  STORAGE_KEY,
  getAppData,
  initStorage,
} from '../lib/storage';

interface DataContextValue {
  /** Bumps when localStorage data changes — use as a dependency for selectors. */
  version: number;
  /** Full snapshot from localStorage. */
  appData: AppData;
  /** Re-read localStorage and re-render subscribers. */
  refreshData: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0);

  const refreshData = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    initStorage();
    const onDataChange = () => refreshData();
    window.addEventListener(DATA_CHANGE_EVENT, onDataChange);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) refreshData();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(DATA_CHANGE_EVENT, onDataChange);
      window.removeEventListener('storage', onStorage);
    };
  }, [refreshData]);

  const appData = useMemo(() => getAppData(), [version]);

  const value = useMemo(
    () => ({ version, appData, refreshData }),
    [version, appData, refreshData]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
