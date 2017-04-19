import React, {Component} from 'react';
import {Navigator, StyleSheet, TouchableOpacity} from 'react-native';

import {Icon, Button} from 'native-base';
import { Router, Scene, Schema, Actions, } from 'react-native-router-flux';

import Home from '../../pages/Home';
import Goal from '../../pages/Goal';
import Progress from '../../pages/Progress';
import SideDrawer from './SideDrawer';

export default class MyDrawer extends Component{
    renderMenuButton = () => {
        return (
            <Button transparent onPress={()=>this.drawer.open()}>
                <Icon name='menu' style={{height:24, width:24}} />
            </Button>
        );
    }

    renderBackButton = ()=>{
        return (
            <Button transparent onPress = {Actions.pop}>
                <Icon name='arrow-back' style={{height:24, width:24}} />
            </Button>
        );
    }

    render(){
        return(
            <Router name='root'>
                <Schema
                    name='boot'
                    sceneConfig={Navigator.SceneConfigs.FlotFromRight}
                    hideNavBar
                    type='replace' />
                <Scene key='Welcome' component={Home} schema='boot' initial title='Welcome' />

                <Route name='Drawer' hideNavBar type='reset'>
                    <SideDrawer ref={c => { c? this.drawer = c.drawer : this.drawer}}>
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
                            <Route name='Home' component={Home} schema='home' title='Home' />
                            <Route name='Goal' component={Goal} schema='interior' title='Goal' />
                            <Route name='Progress' component={Progress} schema='interior' title='Progress' />
                        </Router>
                    </SideDrawer>
                </Route>
            </Router>
        );
    }
}

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
