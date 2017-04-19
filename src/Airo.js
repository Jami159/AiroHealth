import React, { Component } from 'react';
import { Provider } from 'react-redux';
import {
	createStore,
	applyMiddleware,
} from 'redux';
import ReduxThunk from 'redux-thunk';
import {
	View,
} from 'react-native';
import reducers from './reducers';
import Router from './Router';
import BleComponent from './components/BleComponent';
import ErrorComponent from './components/ErrorComponent';
import MyDrawer from './components/common/MyDrawer';

class Airo extends Component {
	render() {
		const store = createStore(reducers, {}, applyMiddleware(ReduxThunk));

		return (
			<Provider store={store}>
				<View style={{ flex: 1 }}>
					<ErrorComponent />
					<Router key='root' />
					<BleComponent />
				</View>
			</Provider>
		);
	}
}

export default Airo;
