'use strict';

import React, {Component} from 'react';
import {TouchableOpacity, StyleSheet, View, Text} from 'react-native';

class CompleteToggle extends Component{
    toggle= () => {
        if(this.props.checked) {
            this.props.onUnchecked(this.props.index);
        } else {
            this.props.onChecked(this.props.index);
        }
    }
    getStyle(){
        if(this.props.checked) {
            return styles.active;
        } else {
            return styles.complete;
        }
    }
    render(){
        var goal = this.props.goal;
        return (
            <TouchableOpacity
                style={[styles.button, this.getStyle()]}
                onPress={this.toggle} />
        );
    }
}

const styles = StyleSheet.create({
    
    active: {
        backgroundColor: '#81c04d'
    },
    complete: {
        backgroundColor:'grey'
    }
});

export default CompleteToggle;
