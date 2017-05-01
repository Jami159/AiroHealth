import React, { Component } from 'react';
import {
	NativeAppEventEmitter,
	DeviceEventEmitter,
	Platform,
	PermissionsAndroid,
	AsyncStorage,
} from 'react-native';
import { connect } from 'react-redux';
import BleManager from 'react-native-ble-manager';
import RNFetchBlob from 'react-native-fetch-blob';
import Algorithms from '../Algorithms';
import {
	startScan,
	stopScan,
	deviceFound,
	changeDeviceState,

	updateBattery,
	addStress,
	addSteps,
	initPpgFile,
} from '../actions';
import * as ble from '../actions/types';
import {
	hexStringToByteArray,
	byteToInt,
	byteToAccl,
} from './ParseDataHelper';

const EventEmitter = Platform.select({
  ios: () => NativeAppEventEmitter,
  android: () => DeviceEventEmitter,
})();

var BLE_DEVICE_KEY = '@bleDevice:key';

const gb_dirs = RNFetchBlob.fs.dirs;
const gb_path = gb_dirs.DocumentDir;

class BleComponent extends Component {
	constructor() {
		super();

		this.data = {
			//battery: 0,
			voltage: 0,
			current: 0,
			smallPackTime: -1,
			bigPackTime: -1,

			sampleQueue: [],
			packetCounter: 0,
			old_time: 0,

			ppgSamples: [],
			numPPG: 0,
			ppgCounter: 0,

			acclSamples: [],
			numAccl: 0,
			acclCounter: 0,

			curTime: Math.floor(Date.now() / 1000),

			lostPackets: 0,

			callGetStress: 0,
			callGetSteps: 0,
		};

		this.state = {
			deviceID: '',
		};
	}

	componentDidMount() {
		if (Platform.OS === 'android') {
			this.setState({ deviceID: 'A0:E6:F8:D1:AF:81' });
			//this.setState({ deviceID: 'A0:E6:F8:D1:BD:07' }); //my watch
		} else if (Platform.OS === 'ios') {
			this.setState({ deviceID: '760BEE80-3BAB-4389-814A-91816FF2DB9B' });
			//this.setState({ deviceID: '44F3F0B6-3522-4E4B-B2BD-2F477B6BCC0E' }); //my watch
		}

		BleManager.start({ showAlert: false });

		this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
		this.handleDisconnectPeripheral = this.handleDisconnectPeripheral.bind(this);
		this.handleCharacteristicValueUpdate = this.handleCharacteristicValueUpdate.bind(this);

		EventEmitter
			.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral);
		EventEmitter
			.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectPeripheral);
		EventEmitter
			.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleCharacteristicValueUpdate);

		if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION)
				.then((result) => {
					if (result) {
						console.log('Permission is OK');
					} else {
						PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION)
							.then((result) => {
								if (result) {
									console.log('User accept');
								} else {
									console.log('User refuse');
								}
							});
					}
				});
    }

    this.initializeBLE().done();
    this.initializeLocalFiles().done();
	}

	async initializeBLE() {
		var storedBLE = await AsyncStorage.getItem(BLE_DEVICE_KEY);
		if (storedBLE !== null) {
			this.props.deviceFound(JSON.parse(storedBLE));
		} else {
			console.log('No stored BLE device found');
		}

		if (this.props.bleDevice !== null) {
			await BleManager.isPeripheralConnected(this.props.bleDevice.id, [])
				.then((isConnected) => {
					if (isConnected) {
						console.log('Connected');
						this.props.changeDeviceState(this.props.bleDevice.id, ble.DEVICE_STATE_CONNECTED);
					} else {
						console.log('Disconnected');
						this.props.changeDeviceState(this.props.bleDevice.id, ble.DEVICE_STATE_DISCONNECTED);
					}
				});
		}

		if (!this.props.scanning && this.props.bleState === ble.DEVICE_STATE_DISCONNECTED) {
			this.props.startScan();
		}
	}

	async initializeLocalFiles() {
		RNFetchBlob.fs.ls(gb_path)
			.then((folders) => {
				console.log(folders);
				if (folders.includes('toBeUploaded')) {
					RNFetchBlob.fs.isDir(gb_path + '/toBeUploaded')
						.then((isDir) => {
							if (isDir) {
								console.log('toBeUploaded is a directory');
							} else {
								RNFetchBlob.fs.unlink(gb_path + '/toBeUploaded')
									.then(() => {
										console.log('toBeUploaded (not a dir) deleted');

										this.makeDir(gb_path + '/toBeUploaded');
									})
									.catch((err) => {
										console.log(err);
									});
							}
						});
				} else {
					this.makeDir(gb_path + '/toBeUploaded');
				}

				if (folders.includes('currDataDir')) {
					RNFetchBlob.fs.isDir(gb_path + '/currDataDir')
						.then((isDir1) => {
							if (isDir1) {
								console.log('currDataDir is a directory')

								RNFetchBlob.fs.isDir(gb_path + '/toBeUploaded')
									.then((isDir2) => {
										if (isDir2) {
											console.log('toBeUploaded is a directory');

											RNFetchBlob.fs.ls(gb_path + '/currDataDir')
												.then((files) => {
													this.writeFile(gb_path + '/currDataDir/', Date.now());

													this.moveFiles(files);
												});
										} else {
											this.writeFile(gb_path + '/currDataDir/', Date.now());
										}
									});
							} else {
								RNFetchBlob.fs.unlink(gb_path + '/currDataDir')
									.then(() => {
										console.log('currDataDir (not a dir) deleted');

										this.writeFile(gb_path + '/currDataDir/', Date.now());
									})
									.catch((err) => {
										console.log(err);
									});
							}
						});
				} else {
					this.writeFile(gb_path + '/currDataDir/', Date.now());
				}
			});
	}

	makeDir(path) {
		RNFetchBlob.fs.mkdir(path)
			.then(() => {
				console.log(path, 'created');
			})
			.catch((err) => {
				console.log(err);
			});
	}

	writeFile(dir, time) {
		var filePath = dir + 'ppg' + JSON.stringify(time) + '.txt';
		RNFetchBlob.fs.writeFile(filePath, JSON.stringify(new Date(time)) + '\n', 'utf8')
			.then(() => {
				console.log('ppg' + JSON.stringify(time) + ' written');
				this.props.initPpgFile(filePath, time);
				console.log(this.props.ppgFilePath, this.props.ppgFileTime);
			})
			.catch((err) => {
				console.log(err);
			});
	}

	moveFiles(files) {
		for (var i = 0; i < files.length; i++) {
			var f = files[i];
			RNFetchBlob.fs.mv(gb_path + '/currDataDir/' + files[i], gb_path + '/toBeUploaded/' + files[i])
				.then(() => {
					console.log(f, 'moved');
				})
				.catch((err) => {
					console.log(err);
				});
		}
	}

	handleDiscoverPeripheral(device) {
		console.log('Got ble data', device);
		//this.props.deviceFound(device); //COME BACK TO THIS
		if (device.id === this.state.deviceID) {
			this.props.changeDeviceState(device.id, ble.DEVICE_STATE_CONNECT);
			this.props.deviceFound(device);

			AsyncStorage.setItem(BLE_DEVICE_KEY, JSON.stringify(device));
		}
	}

	handleDisconnectPeripheral(device) {
		console.log('Disconnected from', device);

		this.data.sampleQueue = [];
		this.data.smallPackTime = -1;
		this.data.bigPackTime = -1;

		this.props.changeDeviceState(device.peripheral, ble.DEVICE_STATE_DISCONNECTED);
		this.props.startScan();
	}

	handleCharacteristicValueUpdate(args) {
		//console.log(args);
		if (args.value.length > 2) {
			var byteArr = hexStringToByteArray(args.value);
			var n = byteArr.length;
			if (n === 6) {
				this.data.curTime = Math.floor(Date.now() / 1000);
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
			if (this.data.callGetStress === 0) {
				this.getStress();
			}
			if (this.data.callGetSteps === 0) {
				this.getSteps();
			}
		}
	}

	parseSmallPackets(byteArr, n) {
		var battery = byteToInt(byteArr.slice(0, 1), false);
		if (this.props.battery !== battery) {
			this.props.updateBattery(battery);
		}
		this.data.voltage = byteToInt(byteArr.slice(1, 2), false);
		this.data.current = byteToInt(byteArr.slice(2, 3), true);
		this.data.smallPackTime = byteToInt(byteArr.slice(3, 6), false);

		console.log(this.props.battery, this.data.voltage, this.data.current, new Date(this.data.smallPackTime * 1000));
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

        //TODO: change this filter
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
              var acclData = [time_now].concat(result);

              this.data.acclSamples = this.data.acclSamples.concat([acclData]);
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
            var ppgData = [time_now, byteToInt(this.data.sampleQueue, true)];

            this.data.ppgSamples = this.data.ppgSamples.concat([ppgData]);
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
					console.log(error);
				});
		}
	}

	componentWillReceiveProps(nextProps) {
		//Handle Scanning
		if (nextProps.scanning !== this.props.scanning) {
			if (nextProps.scanning) {
				BleManager.scan(['FFF0'], 72000, false)
					.then(() => {
						console.log('Scan Started');
					})
					.catch((error) => {
						nextProps.stopScan();
						console.log(error);
					});
			} else {
				BleManager.stopScan()
					.then(() => {
						console.log('Scan Stopped');
					})
					.catch((error) => {
						console.log(error);
					});
			}
		}

		//Handle connection state
		switch (nextProps.bleState) {
			case ble.DEVICE_STATE_DISCONNECT:
				BleManager.disconnect(nextProps.selectedDeviceId)
					.then(() => {
						console.log('Disconnected');
						nextProps.changeDeviceState(nextProps.selectedDeviceId, ble.DEVICE_STATE_DISCONNECTED);
						//after disconnecting is successful, then start scan to try to reconnect
						this.props.startScan();
					})
					.catch((error) => {
						console.log(error);
						//if there is an error trying to disconnect, then try to disconnect again
						nextProps.changeDeviceState(nextProps.selectedDeviceId, ble.DEVICE_STATE_DISCONNECT);
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
						console.log(error);
						//if there is an error trying to connect, then disconnect
						nextProps.changeDeviceState(nextProps.selectedDeviceId, ble.DEVICE_STATE_DISCONNECT);
					});
				console.log('Connecting');
				nextProps.changeDeviceState(nextProps.selectedDeviceId, ble.DEVICE_STATE_CONNECTING);
				break;
		}
	}

	writeToPpgFile(arr) {
		var ppgStr = '';

		for (var i = 0; i < arr.length; i++) {
			var tmpTime = arr[i][0] - Math.floor(this.props.ppgFileTime / 1000);
			ppgStr += JSON.stringify(tmpTime) + ',' + JSON.stringify(arr[i][1]) + '\n';
		}

		RNFetchBlob.fs.appendFile(this.props.ppgFilePath, ppgStr, 'utf8')
			.then(() => {
				console.log(this.props.ppgFilePath, 'WRITTEN');
			})
			.catch((err) => {
				console.log(err);
			});
	}

	async getStress() {
		try {
			var a = this.data.numPPG;
			var b = this.data.ppgCounter;

			if (a >= 1000 * (b + 1)) {
				var sliced = this.data.ppgSamples.splice(0, 1000);

				this.writeToPpgFile(sliced);

				this.data.callGetStress++;
				var newStress = await Algorithms.getStress(sliced);
				this.data.callGetStress--;

				this.data.ppgCounter++;

				this.props.addStress(newStress);

				console.log('STRESS: ', newStress);
				console.log(this.props.stressData);
			}
		} catch (error) {
			console.log(error);
		}
	}

  async getSteps() {
		try {
			var a = this.data.numAccl;
			var b = this.data.acclCounter;

			if (a >= 500 * (b + 1)) {
				var sliced = this.data.acclSamples.slice(0, 500);

				this.data.callGetSteps++;
				var newSteps = await Algorithms.getSteps(sliced);
				this.data.callGetSteps--;

				this.data.acclCounter++;

				this.props.addSteps(newSteps);

				console.log('STEPS: ', newSteps);
				console.log(this.props.stepsData);
			}
		} catch (error) {
			console.log(error);
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

	const {
		battery,
		stressData,
		stepsData,
		ppgFilePath,
		ppgFileTime,
	} = state.algoData;

	return {
		bleDevice,
		selectedDeviceId,
		scanning,
		bleState,

		battery,
		stressData,
		stepsData,
		ppgFilePath,
		ppgFileTime,
	};
};

export default connect(mapStateToProps, {
	startScan,
	stopScan,
	deviceFound,
	changeDeviceState,

	updateBattery,
	addStress,
	addSteps,
	initPpgFile,
})(BleComponent);
