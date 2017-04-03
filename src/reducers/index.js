import { combineReducers } from 'redux';
import BleReducer from './BleReducer';

export default combineReducers({
	ble: BleReducer,
});