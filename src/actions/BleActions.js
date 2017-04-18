import {
	START_SCAN,
	STOP_SCAN,
	DEVICE_FOUND,
	CHANGE_DEVICE_STATE,
	PUSH_ERROR,
	POP_ERROR,
} from './types';

export function startScan() {
	return {
		type: START_SCAN,
	};
}

export function stopScan() {
	return {
		type: STOP_SCAN,
	};
}

export function deviceFound(device) {
	return {
		type: DEVICE_FOUND,
		device,
	};
}

export function changeDeviceState(deviceIdentifier, bleState) {
	return {
		type: CHANGE_DEVICE_STATE,
		deviceIdentifier,
		bleState,
	};
}

export function pushError(errorMessage) {
	return {
		type: PUSH_ERROR,
		errorMessage,
	};
}

export function popError() {
	return {
		type: POP_ERROR,
	};
}
