import React, {Component} from 'react';
import {View, Text} from 'react-native';
import ToolBar from '../components/common/ToolBar';
import {Actions} from 'react-native-router-flux';
import {CardSection, Button} from '../components/common'

export default class Progress extends Component {
    render(){
        console.log(Actions);
        return(
            <View>
                <ToolBar title='Home' leftIcon='menu'/>
                <Text>This will be Home page.</Text>
                <Text>Coming Soon.....</Text>
                <CardSection>
                    <Button onPress={()=>{Actions.progress()}}>
                        Checkout Progress
                    </Button>
                </CardSection>
                <CardSection>
                    <Button onPress={()=>{Actions.goal()}}>
                        Checkout Goals
                    </Button>
                </CardSection>
            </View>
        )
    }
}
