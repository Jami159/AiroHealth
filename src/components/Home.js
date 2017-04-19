import React, {Component} from 'react';
import {View, StyleSheet} from 'react-native';
import LoginForm from './LoginForm';


class Home {
    render(){
        <View style={styles.container}>
            <Text style={styles.welcome}>Welcome To</Text>
            <Text style={styles.airo}>Airo</Text>
            <LoginForm />
        </View>
    }
}

const styles = StyleSheet.create({
    container:{
        backgroundColor: 'rgba(125,37,44,0.8)',
    },
    welcome: {
        alignText: 'center',
        justifyContent: 'center',
        alignItem: 'center',
        color: '#fff',
        fontSize: 18
    }
    airo: {
        alignText: 'center',
        justifyContent: 'center',
        alignItem: 'center',
        color: '#fff',
        fontSize: 24
    },

})
