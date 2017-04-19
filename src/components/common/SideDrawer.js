import React, { Component } from 'react';
import {StyleSheet} from 'react-native';
import Drawer from 'react-native-drawer';
import {Actions, DefaultRenderer} from 'react-native-router-flux';
import SideDrawerContent from './SideDrawerContent';

export default class SideDrawer extends Component {

    componentDidMount() {
        //Actions.refresh({key: 'drawer', ref: this.refs.navigation});
        console.log(Actions);
        //console.log(Actions.refresh({key:'drawer'}));
        //console.log(Actions.refresh({key:'drawer', ref: this.refs.navigation}));
    }

    render(){
        console.log(this.props.navigationState);
        return(
            <Drawer
                ref='navigation'
                type='overlay'
                content={<SideDrawerContent />}
                tapToClose
                openDrawerOffset={0.2}
                panCloseMask={0.2}
                tweenHandler={(ratio) => ({
                    main: { opacity: Math.max(0.54, 1-ratio) },
                })} >
            </Drawer>
        );
    }
}

const styles = StyleSheet.create({
    drawer: {
        backgroundColor:'#fff',
    }
})
