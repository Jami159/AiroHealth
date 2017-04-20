import { combineReducers } from 'redux';
import BleReducer from './BleReducer';
import DataReducer from './DataReducer';
import AuthReducer from './AuthReducer';

export default combineReducers({
	ble: BleReducer,
	algoData: DataReducer,
	auth: AuthReducer,
});
