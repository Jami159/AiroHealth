import React, { Component } from 'react';
import {
	View,
	Alert,
} from 'react-native';
import { connect } from 'react-redux';
import {
	LoginButton,
	AccessToken,
} from 'react-native-fbsdk';
import { AWSCognitoCredentials } from 'aws-sdk-react-native-core';
import {
	loginStatus,
} from '../actions';
import {
	Card,
} from './common';
import S3DataUpload from './S3DataUpload';

var fbookToken = '';
var supplyLogins = false;

var region = 'us-east-1';
var identity_pool_id = 'us-east-1:7cd56497-cf3c-43b7-81ad-a31b5b60a4c3';

class LoginForm extends Component {
	constructor(props) {
		super(props);

		this.user = {
			name: '',
			id: '',
		};

		this.state = {
      loginMessage: 'Log Into Facebook',
      Authenticated: 'False',
      identityID: '',
      AccessKey: '',
      SecretKey: '',
      SessionKey: '',
      Expiration: '',
      isLoggedIn: false,
    };
	}

	componentWillMount() {
		this.getToken();
	}

	async getToken() {
		await AccessToken.getCurrentAccessToken()
			.then((data) => {
				if (data !== null) {
					const { accessToken } = data;
					fbookToken = accessToken.toString();
				}
			});
		this.props.loginStatus(fbookToken);
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

	async getCredAndID() {
		try {
			var fetchedCreds = await AWSCognitoCredentials.getCredentialsAsync();
			console.log(fetchedCreds);
			this.setState({
				AccessKey: fetchedCreds.AccessKey,
				SecretKey: fetchedCreds.SecretKey,
				SessionKey: fetchedCreds.SessionKey,
				Expiration: fetchedCreds.Expiration.toString(),
			});

			var fetchedId = await AWSCognitoCredentials.getIdentityIDAsync();
			console.log(fetchedId);
			this.setState({ identityID: fetchedId.identityID });
		} catch (e) {
			console.log('Error:', e);
			return;
		}
	}

	Refresh() {
		this.getCredAndID();

		AWSCognitoCredentials.isAuthenticated((error, variable) => {
			if (error) {
				console.log('Error:', error);
			} else {
				if (variable) {
					this.setState({ Authenticated: true });
					console.log('AUTHENTICATED!');
				} else {
					this.setState({ Authenticated: false });
					console.log('NOT AUTHENTICATED!');
				}
			}
		});
	}

	onLoginInvoked(isLoggingIn, Accesstoken) {
		if (isLoggingIn) {
			fbookToken = Accesstoken;
			supplyLogins = true;
			AWSCognitoCredentials.initWithOptions({ region: region, identity_pool_id: identity_pool_id });
			var map = {};
			map[AWSCognitoCredentials.RNC_FACEBOOK_PROVIDER] = fbookToken;
			AWSCognitoCredentials.setLogins(map); //ignored for iOS
      return;
		} else {
			supplyLogins = false;
		}
	}

	initUser(token) {
		fetch('https://graph.facebook.com/v2.5/me?fields=email,name,friends&access_token=' + token)
			.then((response) => response.json())
			.then((json) => {
				console.log(json);
				this.user.name = json.name;
				this.user.id = json.id;
			})
			.catch((error) => {
				console.log('ERROR GETTING DATA FROM FACEBOOK:', error);
			});
	}

	ClearCred() {
    AWSCognitoCredentials.clearCredentials();
  }

  ClearKeychain() {
    AWSCognitoCredentials.clear();
  }

	render() {
		return (
			<Card>
				<View style={styles.fbButtonStyle}>
					<LoginButton
						style={{ width: 200, height: 30 }}
						/*readPermissions={['public_profile']}*/ //causes error on android
						publishPermissions={['publish_actions']}
						onLoginFinished={
							(error, result) => {
								if (error) {
									Alert.alert('login has error:', result.error);
								} else if (result.isCancelled) {
									Alert.alert('login is cancelled');
								}	else {
									AccessToken.getCurrentAccessToken()
										.then((data) => {
											const { accessToken } = data;
											this.onLoginInvoked(true, accessToken.toString());
											this.initUser(accessToken);
											this.Refresh();
											this.props.loginStatus(accessToken.toString());
										});
								}
							}
						}
						onLogoutFinished={
							() => {
								this.onLoginInvoked(false, '');
								this.ClearCred();
								this.ClearKeychain();
								this.Refresh();
								this.props.loginStatus('');
							}
						}
					/>
				</View>
				<S3DataUpload />
			</Card>
		);
	}
}

const styles = {
	fbButtonStyle: {
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
		login,
	} = state.auth;

	return {
		facebookToken,
		login,
	};
};

export default connect(mapStateToProps, { loginStatus })(LoginForm);
