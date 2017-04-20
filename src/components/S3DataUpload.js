import React, { Component } from 'react';
import {
	Platform,
	View,
} from 'react-native';
import { connect } from 'react-redux';
import RNFetchBlob from 'react-native-fetch-blob';
import { zip } from 'react-native-zip-archive';
import {
	LoginButton,
} from 'react-native-fbsdk';
import { AWSCognitoCredentials } from 'aws-sdk-react-native-core';
import { AWSS3TransferUtility } from 'aws-sdk-react-native-transfer-utility';
import {
	loginStatus,
} from '../actions';
import {
	Button,
	Card,
} from './common';

var region = 'us-east-1';
var s3_bucket_name = 'airo-userfiles-mobilehub-1172289525';

var requestTmp = { isDownload: false, id: '' };

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

    AWSS3TransferUtility.progressEvent = (requestid, completedUnits, totalUnits, fractionCompleted, type) => {
			this.progressEvent(requestid, completedUnits, totalUnits, fractionCompleted, type);
    };

    AWSS3TransferUtility.completionHandlerEvent = (requestid, error, request) => {
			this.completionHandlerEvent(requestid, error, request);
    };
	}

	progressEvent(requestid, completedUnits, totalUnits, fractionCompleted, type) {
		this.setState({
			requestid: requestid,
			type: type,
			completedUnits: completedUnits,
			totalUnits: totalUnits,
			fractionCompleted: fractionCompleted,
		});
	}

	completionHandlerEvent(requestid, error, request) {
		console.log('requestID:', requestid);
		console.log('error:', JSON.stringify(error));
		console.log('request:', JSON.stringify(request));
	}

	componentDidMount() {
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
	}

	async uploadObject() {
		var map = {};
		map[AWSCognitoCredentials.RNC_FACEBOOK_PROVIDER] = this.props.facebookToken;
		console.log(map);
		AWSCognitoCredentials.setLogins(map); //ignored for iOS

		AWSS3TransferUtility.initWithOptions({ region: region });

		const dirs = RNFetchBlob.fs.dirs;
		const path = dirs.DocumentDir;

		await RNFetchBlob.fs.writeFile(path + '/testFile.txt', JSON.stringify(new Date(Date.now())), 'utf8')
			.then(() => {
				console.log('FILE WRITTEN!');
				console.log(path);
			})
			.catch((err) => {
				console.log(err);
			});

		var s3Path = '';
		if (Platform.OS === 'android') {
			s3Path = path + '/testFile.txt';
		} else if (Platform.OS === 'ios') {
			s3Path = 'file://' + path + '/testFile.txt';
		}

		var UploadKeyName = 'Jami/testFile';
		AWSS3TransferUtility.createUploadRequest(
			{
				path: s3Path,
				bucket: s3_bucket_name,
				key: UploadKeyName,
				contenttype: 'text/plain',
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
    } catch (e) {
      console.log('upload failed:', e);
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
		return (
			<Card>
				<View style={styles.buttonStyle}>
					<Button onPress={this.uploadObject.bind(this)}>
						Upload to server
					</Button>
				</View>
				<View style={styles.buttonStyle}>
					<LoginButton
						onLogoutFinished={
							() => {
								this.props.loginStatus('');
								this.ClearCred();
								this.ClearKeychain();
							}
						}
					/>
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
		facebookToken,
	} = state.auth;

	return {
		facebookToken,
	};
};

export default connect(mapStateToProps, { loginStatus })(S3DataUpload);
