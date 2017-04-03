import * as ble from '../actions/types';

const INITIAL_STATE = {
	bleDevice: null,
	selectedDeviceId: null,
	scanning: false,
	bleState: ble.DEVICE_STATE_DISCONNECTED,
	errors: [],
};

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case ble.START_SCAN:
			return { ...state, scanning: true };
		case ble.STOP_SCAN:
			return { ...state, scanning: false };
		case ble.DEVICE_FOUND:
			return { ...state, bleDevice: action.device };
		case ble.CHANGE_DEVICE_STATE:
			return { ...state, scanning: false, bleState: action.bleState, selectedDeviceId: action.deviceIdentifier };
		case ble.PUSH_ERROR:
			return { ...state, errors: [...state.errors, action.errorMessage] };
		case ble.POP_ERROR:
			return { ...state, errors: [...state.errors.slice(0, errors.length - 1), ...state.errors.slice(errors.length)] };
		default:
			return state;
	}
};