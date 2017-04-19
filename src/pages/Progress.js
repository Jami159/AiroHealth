import React, {Component} from 'react';
import {View, Text} from 'react-native';
import ToolBar from '../components/common/ToolBar'

export default class Progress extends Component {
    render(){
        return(
            <View>
                <ToolBar leftIcon='arrow-back' title='Progress' />
                <Text>This will be progress page.</Text>
            </View>
        )
    }
}
