import React, { Component } from 'react';
import {
	View,
} from 'react-native';
import { connect } from 'react-redux';
import {
	deviceFound,
	changeDeviceState,
} from '../actions';
import * as ble from '../actions/types';
import {
	Card,
	Button,
} from './common';

class ProgressPage extends Component {
	pairDevice() {
		this.props.changeDeviceState(this.props.selectedDeviceId, ble.DEVICE_STATE_DISCONNECT);
		this.props.deviceFound(null);
	}
	render() {
		return (
			<Card>
				<View style={styles.buttonStyle}>
					<Button onPress={this.pairDevice.bind(this)}>
						Pair/Unpair
					</Button>
				</View>
			</Card>
		);
	}
}

const styles = {
	buttonStyle: {
		borderBottomWidth: 1,
		padding: 5,
		backgroundColor: '#fff',
		justifyContent: 'center',
		flexDirection: 'row',
		borderColor: '#ddd',
		position: 'relative',
	},
};

const mapStateToProps = (state) => {
	const {
		bleDevice,
		selectedDeviceId,
	} = state.ble;

	return {
		bleDevice,
		selectedDeviceId,
	};
};

export default connect(mapStateToProps, { deviceFound, changeDeviceState })(ProgressPage);
