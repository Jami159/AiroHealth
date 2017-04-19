import React, { Component } from 'react';
import { View, TouchableHighlight, Text } from 'react-native';
import { Actions } from 'react-native-router-flux';
import {Icon} from 'native-base';

export default class SideDrawerContent extends Component {

	render() {
		const { drawer } = this.context
		return (
			<View>
                <View>
                    <TouchableHighlight onPress={() => { drawer.close(); Actions.Home.call() }}>
						<View style={{flexDirection:'row'}}>
							<Icon name='home' />
							<Text>Home</Text>
						</View>

                    </TouchableHighlight>
                </View>
                <View>
                    <TouchableHighlight onPress={() => { drawer.close(); Actions.Goal.call() }}>
						<View style={{flexDirection:'row'}}>
							<Icon name='star-outlined' />
							<Text>Goals</Text>
						</View>
                    </TouchableHighlight>
                </View>
                <View>
                    <TouchableHighlight onPress={() => { drawer.close(); Actions.Progress.call() }}>
						<View style={{flexDirection:'row'}}>
							<Icon name='line-graph' />
							<Text>Progress</Text>
						</View>
                    </TouchableHighlight>
                </View>
			</View>
		)
	}
}
