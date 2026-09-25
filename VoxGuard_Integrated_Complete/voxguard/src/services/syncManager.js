import { offlineStorage } from "./offlineStorage";
import { networkStatusService } from "./networkStatus";

export const syncManager = {
  syncState: "idle", // idle, pending_sync, syncing, sync_complete

  async checkAndSync(addToast) {
    if (!networkStatusService.isOnline()) {
      return;
    }

    const pending = await offlineStorage.getPendingSyncRecords();
    if (pending.length === 0) {
      this.syncState = "idle";
      return;
    }

    this.syncState = "syncing";
    if (addToast) addToast(`Syncing ${pending.length} offline analysis records with VoxGuard Vault...`, "info");

    // Simulate batch sync process
    for (const record of pending) {
      await offlineStorage.updateSyncStatus(record.id, "local_only");
    }

    this.syncState = "sync_complete";
    if (addToast) addToast("Offline records saved locally. (Local record — not synchronized)", "success");
  }
};
