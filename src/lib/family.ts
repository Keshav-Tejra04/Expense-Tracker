import { syncService } from './syncService';
import { Family } from './types';

export const updateFamilyBudget = async (familyId: string, monthlyBudget: number) => {
  const cacheKey = `@cache_family_${familyId}`;
  const cachedFamily = await syncService.getCache<Family>(cacheKey);
  if (cachedFamily) {
    await syncService.setCache(cacheKey, { ...cachedFamily, monthlyBudget });
  }

  await syncService.enqueueAction('UPDATE_BUDGET', { familyId, monthlyBudget });
};

export const updateFamilyBalances = async (familyId: string, initialCashBalance: number, initialOnlineBalance: number) => {
  const cacheKey = `@cache_family_${familyId}`;
  const cachedFamily = await syncService.getCache<Family>(cacheKey);
  if (cachedFamily) {
    await syncService.setCache(cacheKey, { ...cachedFamily, initialCashBalance, initialOnlineBalance });
  }

  await syncService.enqueueAction('UPDATE_BALANCES', { familyId, initialCashBalance, initialOnlineBalance });
};

