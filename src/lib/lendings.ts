import { syncService } from './syncService';
import { PaymentMethod } from './transactions';

export type LendingType = 'lent' | 'borrowed';
export type LendingStatus = 'pending' | 'settled';

export interface Lending {
  id: string;
  familyId: string;
  type: LendingType;
  amount: number;
  settledAmount?: number;
  personName: string;
  note?: string;
  status: LendingStatus;
  date: string; // YYYY-MM-DD
  createdAt: number;
  paymentMethod?: PaymentMethod;
}

export const addLending = async (
  familyId: string,
  type: LendingType,
  amount: number,
  personName: string,
  date: Date,
  note?: string,
  paymentMethod?: PaymentMethod
) => {
  const lendingId = `lnd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  
  const year = date.getFullYear();
  const monthStr = String(date.getMonth() + 1).padStart(2, '0');
  const dayStr = String(date.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${monthStr}-${dayStr}`;

  const newLending: Lending = {
    id: lendingId,
    familyId,
    type,
    amount,
    settledAmount: 0,
    personName,
    status: 'pending',
    date: formattedDate,
    createdAt: Date.now(),
  };

  if (note !== undefined) newLending.note = note;
  if (paymentMethod !== undefined) newLending.paymentMethod = paymentMethod;

  // Update local cache
  const cacheKey = `@cache_lendings_${familyId}`;
  const cachedLendings = (await syncService.getCache<Lending[]>(cacheKey)) || [];
  await syncService.setCache(cacheKey, [newLending, ...cachedLendings]);

  // Enqueue offline action
  await syncService.enqueueAction('ADD_LENDING', newLending);

  return lendingId;
};

export const settleLending = async (lending: Lending, amount: number) => {
  const currentSettled = lending.settledAmount || 0;
  const newSettled = currentSettled + amount;
  const newStatus: LendingStatus = newSettled >= lending.amount ? 'settled' : 'pending';

  // Update local cache
  const cacheKey = `@cache_lendings_${lending.familyId}`;
  const cachedLendings = (await syncService.getCache<Lending[]>(cacheKey)) || [];
  const updatedCache = cachedLendings.map(l => {
    if (l.id === lending.id) {
      return { ...l, settledAmount: newSettled, status: newStatus };
    }
    return l;
  });
  await syncService.setCache(cacheKey, updatedCache);

  // Enqueue offline action
  await syncService.enqueueAction('SETTLE_LENDING', {
    lendingId: lending.id,
    settledAmount: newSettled,
    status: newStatus
  });
};

export const deleteLending = async (lendingId: string, familyId?: string) => {
  if (familyId) {
    const cacheKey = `@cache_lendings_${familyId}`;
    const cachedLendings = (await syncService.getCache<Lending[]>(cacheKey)) || [];
    await syncService.setCache(cacheKey, cachedLendings.filter(l => l.id !== lendingId));
  }

  await syncService.enqueueAction('DELETE_LENDING', { lendingId });
};

