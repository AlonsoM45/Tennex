
import { DbBridge, DbBridgeName } from '@common/DbBridge';

const dbContextApi: DbBridge = (window as any).electron_window[DbBridgeName];

export default dbContextApi;
