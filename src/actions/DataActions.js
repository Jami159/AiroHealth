import {
	UPDATE_BATTERY,
	ADD_STRESS_VALS,
	ADD_STEPS_VALS,
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
