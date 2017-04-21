import {
	LOGIN_STATUS,
	LOGGED_IN,
	LOGGED_OUT,
	CHANGE_WIFI_STATUS,
} from '../actions/types';

const INITIAL_STATE = {
	facebookToken: '',
	login: false,

	wifiStatus: false,
};

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case LOGIN_STATUS:
			return { ...state, facebookToken: action.token };
		case LOGGED_IN:
			return { ...state, login: true };
		case LOGGED_OUT:
			return { ...state, login: false };
		case CHANGE_WIFI_STATUS:
			return { ...state, wifiStatus: action.status };
		default:
			return state;
	}
};
