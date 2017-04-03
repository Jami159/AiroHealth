import React, { Component } from 'react';
import {
	View,
	Text,
} from 'react-native';
import { connect } from 'react-redux';
import {
	startScan,
	stopScan,
} from '../actions';
import * as ble from '../actions/types';
import {
	Button,
} from './common';

class ErrorComponent extends Component {
	toggleScanning(bool) {
		if (bool) {
			this.props.startScan();
		} else {
			this.props.stopScan();
		}
	}

	render() {
		const isConnected = this.props.bleState === ble.DEVICE_STATE_CONNECTED;

		if (isConnected) {
			return null;
		}

		return (
			<View style={styles.container}>
        <Text style={styles.message}>{this.props.bleState}</Text>
        <Button onPress={() => this.toggleScanning(!this.props.scanning)}>
					Scan ({this.props.scanning ? 'on' : 'off'})
				</Button>
      </View>
		);
	}
}

const styles = {
  container: {
    padding: 20,
    backgroundColor: '#253248',
    flexDirection: 'row',
    position: 'relative',
    paddingBottom: 5,
  },
  message: {
  	alignSelf: 'center',
    color: 'white',
    fontWeight: 'bold',
    width: 150,
  },
};

const mapStateToProps = (state) => {
	const {
		scanning,
		bleState,
	} = state.ble;

	return {
		scanning,
		bleState,
	};
};

export default connect(mapStateToProps, {startScan, stopScan})(ErrorComponent);