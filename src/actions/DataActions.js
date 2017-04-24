import {
	UPDATE_BATTERY,
	ADD_STRESS_VALS,
	ADD_STEPS_VALS,
	INIT_PPG_FILE,
} from './types';

export function updateBattery(value) {
	return {
		type: UPDATE_BATTERY,
		value,
	};
}

export function addStress(values) {
	return {
		type: ADD_STRESS_VALS,
		values,
	};
}

export function addSteps(values) {
	return {
		type: ADD_STEPS_VALS,
		values,
	};
}

export function initPpgFile(path, time) {
	return {
		type: INIT_PPG_FILE,
		path,
		time,
	};
}
