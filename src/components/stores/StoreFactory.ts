import type BaseStore from "./BaseStore";

export default class StoreFactory {
  private static storeInstances: any = {};

  public static get<T extends BaseStore>(
    StoreClass: new (...params: any[]) => T
  ): T {
    const storeId = new StoreClass().id;

    let store = this.storeInstances[storeId];

    if (!store) {
      store = new StoreClass();
      this.storeInstances[storeId] = store;
    }

    return store;
  }
}
