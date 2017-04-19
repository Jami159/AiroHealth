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
		<Router key='root' hideNavBar={true}>
		{/*
			<Scene key='Welcome' component={Home} schema='home' title='Welcome' />
			<Scene key='Goal' component={Goal} schema='interior' title='Goal' />
			<Scene key='Progress' component={Progress} schema='interior' title='Progress' />
		*/}
            <Schema
                name='boot'
                sceneConfig={Navigator.SceneConfigs.FlotFromRight}
                hideNavBar={true}
                type='replace' />
            <Route name='welcome' component={Welcome} schema='boot' initial={true} title='Welcome' />

            <Route name='drawer' hideNavBar type='reset'>
                <SideDrawer /*ref={c => { c? this.drawer = c.drawer : this.drawer}}*/>
                    <Router name='drawerRoot'
                        sceneStyle={styles.routerScene}
                        navigationBarStyle={styles.navBar}
                        titleStyle={styles.navTitle}>
                        <Schema
                            name='home'
                            sceneConfig={Navigator.SceneConfigs.FlotFromRight}
                            hideNavBar={false}
                            renderLeftButton={this.renderMenuButton} />
                        <Schema
							name='interior'
							sceneConfig={Navigator.SceneConfigs.FloatFromRight}
							hideNavBar={false}
							renderLeftButton={this.renderBackButton} />
                        <Route name='home' schema='home' component={Home} title='Home' />
                        <Route name='goal' schema='interior' component={Goal} title='Goal' header={ToolBar}/>
                        <Route name='progress' schema='interior' component={Progress} title='Progress' />
                    </Router>
                </SideDrawer>
            </Route>
		</Router>
	);
};

const styles = StyleSheet.create({
	navBar: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'green',
	},
	navTitle: {
		color: 'white',
	},
	routerScene: {
		paddingTop: Navigator.NavigationBar.Styles.General.NavBarHeight, // some navbar padding to avoid content overlap
	},
	leftButtonContainer: {
		paddingLeft: 15,
		paddingRight: 20,
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
	},
})

export default RouterComponent;
