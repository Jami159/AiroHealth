import React, { Component } from 'react';
import {
	NativeAppEventEmitter,
	Platform,
	PermissionsAndroid,
} from 'react-native';
import { connect } from 'react-redux';
import BleManager from 'react-native-ble-manager';
import {
	startScan,
	stopScan,
	deviceFound,
	changeDeviceState,
} from '../actions';
import * as ble from '../actions/types';
import {
	hexStringToByteArray,
	byteToInt,
	byteToAccl,
} from './ParseDataHelper';

class BleComponent extends Component {
	constructor() {
		super();

		this.data = {
			battery: 0,
			voltage: 0,
			current: 0,
			smallPackTime: -1,
			bigPackTime: -1,

			sampleQueue: [],
			packetCounter: 0,
			old_time: 0,

			ppgSamples: [],
			numPPG: 0,

			acclSamples: [],
			numAccl: 0,

			curTime: Math.floor(Date.now()/1000),

			lostPackets: 0,
		};

		this.state = {
			deviceID: '',
		};
	}

	componentDidMount() {
		if (Platform.OS === 'android') {
			this.setState({ deviceID: '' });
		} else if (Platform.OS === 'ios') {
			this.setState({ deviceID: "760BEE80-3BAB-4389-814A-91816FF2DB9B" });
		}

		BleManager.start({ showAlert: false });

		this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
		this.handleDisconnectPeripheral = this.handleDisconnectPeripheral.bind(this);
		this.handleCharacteristicValueUpdate = this.handleCharacteristicValueUpdate.bind(this);

		NativeAppEventEmitter
			.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral);
		NativeAppEventEmitter
			.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectPeripheral);
		NativeAppEventEmitter
			.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleCharacteristicValueUpdate);

		if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.checkPermission(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION)
      	.then((result) => {
          if (result) {
            console.log("Permission is OK");
          } else {
            PermissionsAndroid.requestPermission(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION)
	            .then((result) => {
	              if (result) {
	                console.log("User accept");
	              } else {
	                console.log("User refuse");
	              }
	            });
          }
	      });
    }
	}

	handleDiscoverPeripheral(device) {
		console.log('Got ble data', device);
		//this.props.deviceFound(device); //COME BACK TO THIS
		if (device.id === this.state.deviceID) {
			this.props.changeDeviceState(device.id, ble.DEVICE_STATE_CONNECT);
			this.props.deviceFound(device);
		}
	}

	handleDisconnectPeripheral(device) {
		console.log("Disconnected from", device);

		this.data.sampleQueue = [];
		this.data.smallPackTime = -1;
		this.data.bigPackTime = -1;
		
		this.props.changeDeviceState(device.peripheral, ble.DEVICE_STATE_DISCONNECTED);
	}

	handleCharacteristicValueUpdate(args) {
		//console.log(args);
		if (args.value.length > 2) {
			var byteArr = hexStringToByteArray(args.value);
			var n = byteArr.length;
			if (n === 6) {
				this.data.curTime = Math.floor(Date.now()/1000);
				this.parseSmallPackets(byteArr, n);
			} else if (n === 182) {
				var counter = byteToInt(byteArr.slice(180, 182), false);

				if (counter !== this.data.packetCounter) {
					if (counter - this.data.packetCounter !== 1) {
						this.data.sampleQueue = [];

						if ((counter - this.data.packetCounter > 1) && (this.data.packetCounter !== 0)) {
							this.data.lostPackets += counter - this.data.packetCounter - 1;
						}
					}
					this.parseLargePackets(byteArr, n, this.data.curTime);
				}
			}
		}
	}

	parseSmallPackets(byteArr, n) {
		this.data.battery = byteToInt(byteArr.slice(0, 1), false);
		this.data.voltage = byteToInt(byteArr.slice(1, 2), false);
		this.data.current = byteToInt(byteArr.slice(2, 3), true);
		this.data.smallPackTime = byteToInt(byteArr.slice(3, 6), false);

		console.log(this.data.battery, this.data.voltage, this.data.current, new Date(this.data.smallPackTime * 1000));
	}

	parseLargePackets(byteArr, n, curtime) {
		for (var i = 0; i < n; i += 3) {
			var tmp = byteArr.slice(i, i + 3);

			if (tmp.length > 2) {
				this.data.sampleQueue = this.data.sampleQueue.concat(tmp);
			} else if (tmp.length === 2) {
				this.data.packetCounter = byteToInt(tmp, false);
			}

			if ((this.data.smallPackTime >= 0) && (this.data.bigPackTime >= 0)) {
        var time = this.data.smallPackTime - this.data.bigPackTime;
        var time_now = curtime - time;

        if ((time_now - this.data.old_time) < 0) {
          time_now = this.data.old_time;
        }
        this.data.old_time = time_now;
      }

      if (this.data.sampleQueue.length >= 3) {
        if ((this.data.sampleQueue[0] & 0xC0) === 0x40) {
          if (this.data.sampleQueue.length === 6)  {
            if ((this.data.smallPackTime >= 0) && (this.data.bigPackTime >= 0)) {
              var result = byteToAccl(this.data.sampleQueue);
              var data = [time_now].concat(result);

              this.data.acclSamples = this.data.acclSamples.concat([data]);
              this.data.numAccl++;
            }

            this.data.sampleQueue = [];
          }
        } else if (this.checkIfTime(this.data.sampleQueue.slice(0, 3))) {
          if (this.data.sampleQueue.length === 6) {
            this.data.bigPackTime = byteToInt(this.data.sampleQueue.slice(3, 6), false);

            this.data.sampleQueue = [];
            console.log(new Date(this.data.bigPackTime * 1000));
          }
        } else {
          if ((this.data.smallPackTime >= 0) && (this.data.bigPackTime >= 0)) {
            var data = [time_now, byteToInt(this.data.sampleQueue, true)];

            this.data.ppgSamples = this.data.ppgSamples.concat([data]);
            this.data.numPPG++;
          }

          this.data.sampleQueue = [];
        }
      }
		}
	}

	checkIfTime(arr) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === 0x1F) {
        if (i === 2) {
          return true;
        }
      } else {
        return false;
      }
    }
    return false;
  }

	async setUpNotifications(device) {
		var characteristics = device.characteristics;

		for (let c of characteristics) {
			BleManager.startNotification(device.id, c.service, c.characteristic)
				.then(() => {
					console.log('Notification started');
				})
				.catch((error) => {
					console.error(error);
				});
		}
	}

	componentWillReceiveProps(nextProps) {
		//Handle Scanning
		if (nextProps.scanning !== this.props.scanning) {
			if (nextProps.scanning) {
				BleManager.scan([], 30, true)
					.then(() => {
						console.log('Scan Started');
					})
					.catch((error) => {
						nextProps.stopScan();
						console.error(error);
					});
			} else {
				BleManager.stopScan();
			}
		}

		//Handle connection state
		switch (nextProps.bleState) {
			case ble.DEVICE_STATE_DISCONNECT:
				BleManager.disconnect(nextProps.selectedDeviceId)
					.then(() => {
						console.log('Disconnected');
						nextProps.changeDeviceState(nextProps.selectedDeviceId, ble.DEVICE_STATE_DISCONNECTED);
					})
					.catch((error) => {
						console.error(error);
						nextProps.changeDeviceState(nextProps.selectedDeviceId, ble.DEVICE_STATE_DISCONNECTED);
					});
				console.log('Disconnecting');
				nextProps.changeDeviceState(nextProps.selectedDeviceId, ble.DEVICE_STATE_DISCONNECTING);
				break;

			case ble.DEVICE_STATE_CONNECT:
				BleManager.connect(nextProps.selectedDeviceId)
					.then((device) => {
						BleManager.isPeripheralConnected(device.id, [])
							.then((isConnected) => {
								if (isConnected) {
									console.log('Connected');
									nextProps.changeDeviceState(nextProps.selectedDeviceId, ble.DEVICE_STATE_CONNECTED);

									return this.setUpNotifications(device);
								} else {
									console.log('Disonnected');
									nextProps.changeDeviceState(nextProps.selectedDeviceId, ble.DEVICE_STATE_DISCONNECTED);
								}
							});
					})
					.catch((error) => {
						console.error(error);
						nextProps.changeDeviceState(nextProps.selectedDeviceId, ble.DEVICE_STATE_DISCONNECTED);
					});
				console.log('Connecting');
				nextProps.changeDeviceState(nextProps.selectedDeviceId, ble.DEVICE_STATE_CONNECTING);
				break;
		}
	}

	render() {
		console.log('RE RENDER');
		/*const bleList = this.props.bleDevice
			? <Text> Device found: {this.props.bleDevice.name} </Text>
			: <Text> no devices nearby </Text>*/
		return null;
	}
}

const mapStateToProps = (state) => {
	const {
		bleDevice,
		selectedDeviceId,
		scanning,
		bleState,
	} = state.ble;

	return {
		bleDevice,
		selectedDeviceId,
		scanning,
		bleState,
	};
};

export default connect(mapStateToProps, {
	startScan,
	stopScan,
	deviceFound,
	changeDeviceState,
})(BleComponent);