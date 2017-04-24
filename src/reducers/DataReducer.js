import * as data from '../actions/types';

const INITIAL_STATE = {
	battery: 0,
	stressData: [],
	stepsData: [],
	ppgFilePath: '',
	ppgFileTime: 0,
};

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case data.UPDATE_BATTERY:
			return { ...state, battery: action.value };
		case data.ADD_STRESS_VALS:
			return { ...state, stressData: [...state.stressData.concat(action.values)] };
		case data.ADD_STEPS_VALS:
			return { ...state, stepsData: [...state.stepsData.concat(action.values)] };
		case data.INIT_PPG_FILE:
			return { ...state, ppgFilePath: action.path, ppgFileTime: action.time };
		default:
			return state;
	}
};
