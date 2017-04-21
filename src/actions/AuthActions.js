import { Actions } from 'react-native-router-flux';
import {
	LOGIN_STATUS,
	LOGGED_IN,
	LOGGED_OUT,
	CHANGE_WIFI_STATUS,
} from './types';

export function loginStatus(token) {
	return (dispatch) => {
		dispatch({
			type: LOGIN_STATUS,
			token,
		});

		if (token === '') {
			console.log('LOGGED OUT');
			loggedOut(dispatch);
		} else {
			console.log('LOGGED IN');
			loggedIn(dispatch);
		}
	};
}

const loggedIn = (dispatch) => {
	dispatch({
		type: LOGGED_IN
	});
	Actions.main();
};

const loggedOut = (dispatch) => {
	dispatch({
		type: LOGGED_OUT,
	});
	Actions.auth({ type: 'reset' });
};

export function checkWifi(stat) {
	return {
		type: CHANGE_WIFI_STATUS,
		status: stat === 'wifi' || stat === 'WIFI',
	};
}
