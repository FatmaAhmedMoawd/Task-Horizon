'use client';
import { useEffect } from 'react';
import { useAppDispatch } from '@/lib/store/hooks';
import { fetchAllTasks } from '@/lib/store/kanbanSlice';

export default function DataHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    dispatch(fetchAllTasks());
  }, [dispatch]);
  
  return <>{children}</>;
}
