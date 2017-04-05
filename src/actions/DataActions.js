import {
	ADD_STRESS_VALS,
	ADD_STEPS_VALS,
} from './types';

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
