import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface PendingAction {
  id: string;
  type: 
    | 'ADD_TRANSACTION'
    | 'DELETE_TRANSACTION'
    | 'ADD_LENDING'
    | 'SETTLE_LENDING'
    | 'DELETE_LENDING'
    | 'UPDATE_BALANCES'
    | 'UPDATE_BUDGET';
  payload: any;
  createdAt: number;
}

const QUEUE_KEY = '@pending_sync_queue';

export const syncService = {
  // --- Local Cache Helpers ---
  async getCache<T>(key: string): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error(`[SyncService] Error reading cache for ${key}:`, e);
      return null;
    }
  },

  async setCache<T>(key: string, data: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`[SyncService] Error saving cache for ${key}:`, e);
    }
  },

  // --- Offline Queue Helpers ---
  async getQueue(): Promise<PendingAction[]> {
    try {
      const queue = await AsyncStorage.getItem(QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch (e) {
      console.error('[SyncService] Error getting pending queue:', e);
      return [];
    }
  },

  async saveQueue(queue: PendingAction[]): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.error('[SyncService] Error saving pending queue:', e);
    }
  },

  async enqueueAction(type: PendingAction['type'], payload: any): Promise<void> {
    const queue = await this.getQueue();
    const actionId = `action_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    queue.push({
      id: actionId,
      type,
      payload,
      createdAt: Date.now(),
    });
    await this.saveQueue(queue);
    console.log(`[SyncService] Enqueued offline action: ${type}`, actionId);
    
    // Attempt processing immediately in case network is available
    this.processSyncQueue();
  },

  async executeAction(action: PendingAction): Promise<boolean> {
    const { type, payload } = action;
    try {
      switch (type) {
        case 'ADD_TRANSACTION': {
          await setDoc(doc(db, 'transactions', payload.id), payload);
          break;
        }
        case 'DELETE_TRANSACTION': {
          await deleteDoc(doc(db, 'transactions', payload.transactionId));
          break;
        }
        case 'ADD_LENDING': {
          await setDoc(doc(db, 'lendings', payload.id), payload);
          break;
        }
        case 'SETTLE_LENDING': {
          await updateDoc(doc(db, 'lendings', payload.lendingId), {
            settledAmount: payload.settledAmount,
            status: payload.status,
          });
          break;
        }
        case 'DELETE_LENDING': {
          await deleteDoc(doc(db, 'lendings', payload.lendingId));
          break;
        }
        case 'UPDATE_BALANCES': {
          await updateDoc(doc(db, 'families', payload.familyId), {
            initialCashBalance: payload.initialCashBalance,
            initialOnlineBalance: payload.initialOnlineBalance,
          });
          break;
        }
        case 'UPDATE_BUDGET': {
          await updateDoc(doc(db, 'families', payload.familyId), {
            monthlyBudget: payload.monthlyBudget,
          });
          break;
        }
        default:
          console.warn('[SyncService] Unknown action type:', type);
      }
      return true;
    } catch (error: any) {
      console.warn(`[SyncService] Failed to sync action ${type} (might be offline):`, error.message);
      return false;
    }
  },

  async processSyncQueue(): Promise<void> {
    const queue = await this.getQueue();
    if (queue.length === 0) return;

    console.log(`[SyncService] Processing queue of ${queue.length} pending actions...`);
    const remainingQueue: PendingAction[] = [];

    for (const action of queue) {
      const success = await this.executeAction(action);
      if (!success) {
        // If an action fails due to offline/network error, stop processing remaining actions to maintain order
        remainingQueue.push(action);
        // Copy rest of queue
        const actionIdx = queue.indexOf(action);
        remainingQueue.push(...queue.slice(actionIdx + 1));
        break;
      } else {
        console.log(`[SyncService] Successfully synced action ${action.type}`);
      }
    }

    await this.saveQueue(remainingQueue);
  }
};
