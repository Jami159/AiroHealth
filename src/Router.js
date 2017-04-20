import React from 'react';
import {
	Scene,
	Router,
	Actions,
} from 'react-native-router-flux';
import LoginForm from './components/LoginForm';
import S3DataUpload from './components/S3DataUpload';

const RouterComponent = () => {
	return (
		<Router sceneStyle={{ paddingTop: 65 }}>
			<Scene key="auth">
				<Scene
					key="login"
					component={LoginForm}
					title="Please Login"
				/>
			</Scene>
			<Scene key="main">
				<Scene
					key="S3"
					component={S3DataUpload}
					title="Upload Data"
				/>
			</Scene>
		</Router>
	);
};

export default RouterComponent;
