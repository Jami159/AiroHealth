import React, { Component } from 'react';
import {StyleSheet} from 'react-native';
import Drawer from 'react-native-drawer';
import SideDrawerContent from './SideDrawerContent';

export default class SideDrawer extends Component {
    render(){
        return(
            <Drawer
                ref={c=>this.drawer = c} /**assigning a drawer object into the class**/
                type='overlay'
                content={<SideDrawerContent />}
                tapToClose
                openDrawerOffset={0.2}
                panCloseMask={0.2}
                closeDrawerOffset={0.2}
                styles={styles.drawer}
                tweenHandler={(ratio) => ({ main: { opacity: (2-ratio) / 2}})} >
                {
                    React.Children.map(
                        this.props.children, c => React.cloneElement(c, {route: this.props.route})
                    )
                }
            </Drawer>
        );
    }
}

const styles = StyleSheet.create({
    drawer: {
        backgroundColor:'#fff',
    }
})
