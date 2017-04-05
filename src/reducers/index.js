import { combineReducers } from 'redux';
import BleReducer from './BleReducer';
import DataReducer from './DataReducer';

export default combineReducers({
	ble: BleReducer,
	algoData: DataReducer,
});
