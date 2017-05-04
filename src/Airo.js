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
import { AWSCognitoCredentials } from 'aws-sdk-react-native-core';
import reducers from './reducers';
import Router from './Router';
import BleComponent from './components/BleComponent';
import ErrorComponent from './components/ErrorComponent';
import S3DataUpload from './components/S3DataUpload';

class Airo extends Component {
	componentWillMount() {
		const config = {
			region: 'us-east-1',
			identity_pool_id: 'us-east-1:7cd56497-cf3c-43b7-81ad-a31b5b60a4c3'
		};

		AWSCognitoCredentials.initWithOptions(config);
	}

	render() {
		const store = createStore(reducers, {}, applyMiddleware(ReduxThunk));

		return (
			<Provider store={store}>
				<View style={{ flex: 1 }}>
					<ErrorComponent />
					<S3DataUpload />
					<Router />
					<BleComponent />
				</View>
			</Provider>
		);
	}
}

export default Airo;
