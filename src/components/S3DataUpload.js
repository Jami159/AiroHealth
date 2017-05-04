import React, { Component } from 'react';
import {
	DeviceEventEmitter,
  NativeAppEventEmitter,
  Platform,
	View,
	NetInfo,
	AsyncStorage,
} from 'react-native';
import { connect } from 'react-redux';
import RNFetchBlob from 'react-native-fetch-blob';
import { zip } from 'react-native-zip-archive';
import {
	LoginButton,
} from 'react-native-fbsdk';
import { AWSCognitoCredentials } from 'aws-sdk-react-native-core';
import { AWSS3TransferUtility } from 'aws-sdk-react-native-transfer-utility';
import BackgroundTimer from 'react-native-background-timer';
import {
	loginStatus,
	checkWifi,
	initUserFB,

	initPpgFile,
} from '../actions';
import {
	Button,
	Card,
} from './common';

const EventEmitter = Platform.select({
  ios: () => NativeAppEventEmitter,
  android: () => DeviceEventEmitter,
})();

// start a global timer
BackgroundTimer.start(300000); // delay in milliseconds

var region = 'us-east-1';
var s3_bucket_name = 'airo-userfiles-mobilehub-1172289525';

var requestTmp = { isDownload: false, id: '' };

const gb_dirs = RNFetchBlob.fs.dirs;
const gb_path = gb_dirs.DocumentDir;

const USER_DATA_KEY = '@userData:key';

class S3DataUpload extends Component {
	constructor(props) {
		super(props);

		this.state = {
      requestid: '',
      type: '',
      completedUnits: '',
      totalUnits: '',
      fractionCompleted: '',
    };
	}

	componentDidMount() {
		this.getUserData();

		AWSS3TransferUtility.progressEvent = (requestid, completedUnits, totalUnits, fractionCompleted, type) => {
			this.setState({
				requestid: requestid,
				type: type,
				completedUnits: completedUnits,
				totalUnits: totalUnits,
				fractionCompleted: fractionCompleted,
			});
    };

    AWSS3TransferUtility.completionHandlerEvent = (requestid, error, request) => {
			console.log('requestID:', requestid);
			console.log('error:', JSON.stringify(error));
			console.log('request:', JSON.stringify(request));

			if (Platform.OS === 'android') {
				if (error === undefined) {
					console.log('Upload to S3 successful!');
					RNFetchBlob.fs.ls(gb_path + '/toBeUploaded')
						.then((files) => {
							console.log(files);

							this.deleteFiles(files);
						});
				} else {
					console.log('Upload to S3 failed!');
				}
			}
    };

		AWSCognitoCredentials.identityChanged = (Previous, Current) => {
			console.log('PreviousID:', Previous);
			console.log('CurrentID:', Current);
    };

    AWSCognitoCredentials.getLogins = () => {
			var map = {};
			map[AWSCognitoCredentials.RNC_FACEBOOK_PROVIDER] = this.props.facebookToken;
			console.log(map);
			return map;
    };

    NetInfo.fetch().done(reach => this.props.checkWifi(reach.toString()));
    NetInfo.addEventListener('change', this.handleConnectivityChange.bind(this));

    // listen for event
    EventEmitter.addListener('backgroundTimer', () => {
      // this will be executed every n seconds
      // even when app is the the background
      console.log('WIFI STATUS:', this.props.wifiStatus);
      if (this.props.wifiStatus) {
				RNFetchBlob.fs.ls(gb_path + '/currDataDir')
					.then((files) => {
						console.log(files);

						this.writeFile(gb_path + '/currDataDir/', Date.now());

						this.uploadObject(files);
					});
      }
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

	deleteFiles(files) {
		for (var i = 0; i < files.length; i++) {
			var f = files[i];
			RNFetchBlob.fs.unlink(gb_path + '/toBeUploaded/' + files[i])
				.then(() => {
					console.log(f, 'deleted');
				})
				.catch((err) => {
					console.log(err);
				});
		}
	}

	async getUserData() {
		var userData = await AsyncStorage.getItem(USER_DATA_KEY);
		if (userData !== null) {
			this.props.initUserFB(JSON.parse(userData).name, JSON.parse(userData).id);
		}
	}

	componentWillUnmount() {
		// stop the timer
		BackgroundTimer.stop();	

		NetInfo.removeEventListener('change', this.handleConnectivityChange.bind(this));
	}

	handleConnectivityChange(reach) {
		this.props.checkWifi(reach.toString());
	}

	async uploadObject(files) {
		var map = {};
		map[AWSCognitoCredentials.RNC_FACEBOOK_PROVIDER] = this.props.facebookToken;
		console.log(map);
		AWSCognitoCredentials.setLogins(map); //ignored for iOS

		AWSS3TransferUtility.initWithOptions({ region: region });

		var delFlag = false;

		await RNFetchBlob.fs.ls(gb_path)
			.then((files) => {
				console.log(files);
				if (files.includes('toBeUploaded.zip')) {
					delFlag = true;
				}
			});

		if (delFlag) {
			await RNFetchBlob.fs.unlink(gb_path + '/toBeUploaded.zip')
				.then(() => {
					console.log('toBeUploaded.zip deleted');
				})
				.catch((err) => {
					console.log(err);
				});
		}

		for (var i = 0; i < files.length; i++) {
			var f = files[i];
			await RNFetchBlob.fs.mv(gb_path + '/currDataDir/' + files[i], gb_path + '/toBeUploaded/' + files[i])
				.then(() => {
					console.log(f, 'moved');
				})
				.catch((err) => {
					console.log(err);
				});
		}

		await zip(gb_path + '/toBeUploaded', `${gb_path}/toBeUploaded.zip`)
			.then((path) => {
				console.log(`zip completed at ${path}`);
			})
			.catch((error) => {
				console.log(error);
			});

		var s3Path = '';
		if (Platform.OS === 'android') {
			s3Path = gb_path + '/toBeUploaded.zip';
		} else if (Platform.OS === 'ios') {
			s3Path = 'file://' + gb_path + '/toBeUploaded.zip';
		}

		var userName = this.props.user.name.replace(/\s/g, '');

		var UploadKeyName = userName + '/ppg_' + JSON.stringify(this.props.ppgFileTime);
		AWSS3TransferUtility.createUploadRequest(
			{
				path: s3Path,
				bucket: s3_bucket_name,
				key: UploadKeyName,
				contenttype: 'application/zip',
				subscribe: true,
				completionhandler: true,
			},
			(error, value) => { 
				if (error) {
					console.log(error);
				} else {
					requestTmp = { isDownload: false, id: value };
					this.upload(value);
				}
			}
		);
	}

	async upload(value) {
    try {
      var val = await AWSS3TransferUtility.upload({ requestid: value });
      console.log('AWSS3TransferUtility.upload() called');

      if (Platform.OS === 'ios') {
      	console.log('Upload to S3 successful!');
				RNFetchBlob.fs.ls(gb_path + '/toBeUploaded')
					.then((files) => {
						console.log(files);

						this.deleteFiles(files);
					});
      }
    } catch (e) {
      console.log('upload failed:', e);
      console.log('Upload to S3 failed!');
    }
  }

  pause() {
    AWSS3TransferUtility.editEvent({ config: 'pause', request: requestTmp.id });
  }

  resume() {
    AWSS3TransferUtility.editEvent({ config: 'resume', request: requestTmp.id });
  }

  cancel() {
    AWSS3TransferUtility.editEvent({ config: 'cancel', request: requestTmp.id });
  }

  ClearCred() {
    AWSCognitoCredentials.clearCredentials();
    console.log('Credentials cleared');
  }

  ClearKeychain() {
    AWSCognitoCredentials.clear();
    console.log('Keychain cleared');
  }

	render() {
		return null;
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
		facebookToken,
		wifiStatus,
		user,
	} = state.auth;

	const {
		ppgFilePath,
		ppgFileTime,
	} = state.algoData;

	return {
		facebookToken,
		wifiStatus,
		user,

		ppgFilePath,
		ppgFileTime,
	};
};

export default connect(mapStateToProps, { loginStatus, checkWifi, initUserFB, initPpgFile })(S3DataUpload);
