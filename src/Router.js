import React from 'react';
import {Navigator, StyleSheet} from 'react-native';
import { Scene, Router, Actions, Schema, Route } from 'react-native-router-flux';
import Home from './pages/Home';
import Goal from './pages/Goal';
import ToolBar from './components/MyGoal/toolBar';
import Progress from './pages/Progress';
import Welcome from './pages/Welcome';
import SideDrawer from './components/common/SideDrawer';

const RouterComponent = () => {
	return (
			<Router hideNavBar={true}>
				<Scene key='welcome' component={Welcome} initial title='Welcome'/>
				<Scene key='goal' component={Goal} title='Goal'/>
				<Scene key='progress' component={Progress} title='Progress' />
				<Scene key='home' component={Home} title='Home'/>
			</Router>
	);
};

export default RouterComponent;
