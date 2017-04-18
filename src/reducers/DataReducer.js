import * as data from '../actions/types';

const INITIAL_STATE = {
	battery: 0,
	stressData: [],
	stepsData: [],
};

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case data.UPDATE_BATTERY:
			return { ...state, battery: action.value };
		case data.ADD_STRESS_VALS:
			return { ...state, stressData: [...state.stressData.concat(action.values)] };
		case data.ADD_STEPS_VALS:
			return { ...state, stepsData: [...state.stepsData.concat(action.values)] };
		default:
			return state;
	}
};
