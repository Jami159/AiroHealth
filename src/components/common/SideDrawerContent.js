import React, { Component } from 'react';
import { View, TouchableHighlight, Text } from 'react-native';
import { Actions } from 'react-native-router-flux';
import {Icon, Button} from 'native-base';


/*
const SideDrawerContent = (props, context) => {
	return (
		<View>
			<Button onPress={()=>{Actions.home();}}>
				<View style={{flexDirection:'row'}}>
					<Icon name='home' />
					<Text>Home</Text>
				</View>
			</Button>
			<Button onPress={()=>{Actions.goal();}}>
				<View style={{flexDirection:'row'}}>
					<Icon name='star' />
					<Text>Goals</Text>
				</View>
			</Button>
			<Button onPress={()=>{Actions.progress();}}>
				<View style={{flexDirection:'row'}}>
					<Icon name='bug' />
					<Text>Progress</Text>
				</View>
			</Button>
		</View>
	);
}
*/

export default class SideDrawerContent extends Component {
	setParentState(args){
	    this.props.setParentState(args)
	}
	render() {
		return (
			<View>
                <View>
                    <TouchableHighlight onPress={() => { this.props.closeDrawer(); Actions.Home.call() }}>
						<View style={{flexDirection:'row'}}>
							<Icon name='home' />
							<Text>Home</Text>
						</View>
                    </TouchableHighlight>
                </View>
                <View>
                    <TouchableHighlight onPress={() => { this.props.closeDrawer(); Actions.Goal.call() }}>
						<View style={{flexDirection:'row'}}>
							<Icon name='star' />
							<Text>Goals</Text>
						</View>
                    </TouchableHighlight>
                </View>
                <View>
                    <TouchableHighlight onPress={() => { this.props.closeDrawer(); Actions.Progress.call() }}>
						<View style={{flexDirection:'row'}}>
							<Icon name='bug' />
							<Text>Progress</Text>
						</View>
                    </TouchableHighlight>
                </View>
			</View>
		)
	}
}

//export default SideDrawerContent;
