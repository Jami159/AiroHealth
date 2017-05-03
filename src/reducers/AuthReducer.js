import {
	LOGIN_STATUS,
	LOGGED_IN,
	LOGGED_OUT,
	CHANGE_WIFI_STATUS,
	INIT_USER_FB,
} from '../actions/types';

const INITIAL_STATE = {
	facebookToken: '',
	login: false,
	user: {
		name: '',
		id: '',
	},

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
		case INIT_USER_FB:
			return {
				...state,
				user: {
					...state.user,
					name: action.name,
					id: action.id,
				}
			};
		default:
			return state;
	}
};
