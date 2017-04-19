import React, {Component} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import LoginForm from '../components/LoginForm';
import ToolBar from '../components/common/ToolBar';


export default class Welcome extends Component{
    render(){
        console.log("HELLO WORLD!!!HAHAHAHAH")
        return(
            <View style={{flex:1,}}>
                <View style={styles.container}>
                    <Text style={styles.welcome}>Welcome To</Text>
                    <Text style={styles.airo}>Airo</Text>
                    <LoginForm />
                </View>

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems: 'center',
    },
    welcome: {
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        color: '#000',
        fontSize: 35
    },
    airo: {
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        color: '#000',
        fontSize: 43
    },

})
