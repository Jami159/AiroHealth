import React, { Component } from 'react';
import {
	View,
} from 'react-native';
import { connect } from 'react-redux';
import {
	startScan,

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
		if (bleState !== ble.DEVICE_STATE_DISCONNECTED) {
			this.props.changeDeviceState(this.props.selectedDeviceId, ble.DEVICE_STATE_DISCONNECT);
			this.props.deviceFound(null);
		} else {
			this.props.deviceFound(null);
			this.props.startScan();
		}
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
		bleState,
	} = state.ble;

	return {
		bleDevice,
		selectedDeviceId,
		bleState,
	};
};

export default connect(mapStateToProps, { startScan, deviceFound, changeDeviceState })(ProgressPage);
