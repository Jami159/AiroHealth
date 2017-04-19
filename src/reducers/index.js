import { combineReducers } from 'redux';
import BleReducer from './BleReducer';
import DataReducer from './DataReducer';
import FilterReducer from './MyGoal/FilterReducer';
import GoalReducer from './MyGoal/GoalReducer';
import ModalReducer from './MyGoal/ModalReducer';

export default combineReducers({
	ble: BleReducer,
	algoData: DataReducer,
	goalFilter: FilterReducer,
	goal: GoalReducer,
	modal: ModalReducer,
});
