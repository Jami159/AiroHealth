import React, { Component } from 'react';
import {
	Platform,
	View,
} from 'react-native';
import { connect } from 'react-redux';
import RNFetchBlob from 'react-native-fetch-blob';
import { zip } from 'react-native-zip-archive';
import {AWSCognitoCredentials} from 'aws-sdk-react-native-core';
import {AWSS3TransferUtility} from 'aws-sdk-react-native-transfer-utility';
import {
	Button,
} from './common';

var region = 'us-east-1';
var identity_pool_id = 'us-east-1:7cd56497-cf3c-43b7-81ad-a31b5b60a4c3';
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

    AWSCognitoCredentials.initWithOptions({ region: region, identity_pool_id: identity_pool_id });

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

	async uploadObject() {
		var map = {};
		map[AWSCognitoCredentials.RNC_FACEBOOK_PROVIDER] = this.props.facebookToken;
		console.log(map);
		AWSCognitoCredentials.setLogins(map); //ignored for iOS

		/*var fetchedCreds = await AWSCognitoCredentials.getCredentialsAsync();
		console.log(fetchedCreds);
		var fetchedId = await AWSCognitoCredentials.getIdentityIDAsync();
		console.log(fetchedId);*/

		AWSS3TransferUtility.initWithOptions({ region: region });

		const dirs = RNFetchBlob.fs.dirs;
		const path = dirs.DocumentDir;

		await RNFetchBlob.fs.writeFile(path + '/testFile.txt', JSON.stringify(new Date(Date.now())), 'utf8')
			.then(() => {
				console.log('FILE WRITTEN!');
				//console.log(path);
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

	render() {
		return (
			<View style={styles.buttonStyle}>
				<Button onPress={this.uploadObject.bind(this)}>
					Upload to server
				</Button>
			</View>
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

export default connect(mapStateToProps, {})(S3DataUpload);
