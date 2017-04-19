import React, { Component } from 'react';
import { View, TouchableHighlight } from 'react-native';
import { Actions } from 'react-native-router-flux';

export default class SideDrawerContent extends Component {

	render() {
		const { drawer } = this.context
		return (
			<View>
                <View>
                    <TouchableHighlight onPress={() => { drawer.close(); Actions.Home.call() }}>
                        <Text>HOME</Text>
                    </TouchableHighlight>
                </View>
                <View>
                    <TouchableHighlight onPress={() => { drawer.close(); Actions.Goal.call() }}>
                        <Text>GOALS</Text>
                    </TouchableHighlight>
                </View>
                <View>
                    <TouchableHighlight onPress={() => { drawer.close(); Actions.Progress.call() }}>
                        <Text>PROGRESS</Text>
                    </TouchableHighlight>
                </View>
			</View>
		)
	}
}
