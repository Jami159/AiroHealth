import React from 'react';
import {
	Scene,
	Router,
	Actions,
} from 'react-native-router-flux';
import GoalApp from './goalApp';
import Home from './components/Home';

const RouterComponent = () => {
	return (
		<Router hideNavBar={true}>
			<Scene key='home' componenet={Home} title='Home' initial />
			<Scene key='goal' component={GoalApp} title='Goal' />
		</Router>
	);
};

export default RouterComponent;
