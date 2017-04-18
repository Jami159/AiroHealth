import React from 'react';
import {
	Scene,
	Router,
	Actions,
} from 'react-native-router-flux';
import GoalApp from './goalApp';
import LoginForm from './components/LoginForm'

const RouterComponent = () => {
	return (
		<Router hideNavBar={true}>
			<Scene key='home' componenet={} title='Home' />
			<Scene key='goal' component={GoalApp} title='Goal' />
			<Scene key='login' component = {LoginForm} title='Login'/>
		</Router>
	);
};

export default RouterComponent;
