import React, { Component } from 'react';
import {
	View,
	Alert,
	AsyncStorage,
} from 'react-native';
import { connect } from 'react-redux';
import {
	LoginButton,
	AccessToken,
} from 'react-native-fbsdk';
import { AWSCognitoCredentials } from 'aws-sdk-react-native-core';
import {
	loginStatus,
	initUserFB,
} from '../actions';
import {
	Card,
} from './common';

const USER_DATA_KEY = '@userData:key';

class LoginForm extends Component {
	constructor(props) {
		super(props);

		this.state = {
      Authenticated: false,
      identityID: '',
      AccessKey: '',
      SecretKey: '',
      SessionKey: '',
      Expiration: '',
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
					this.props.loginStatus(accessToken.toString());
				} else {
					this.props.loginStatus('');
				}
			});
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

	onLoginInvoked() {
		var map = {};
		map[AWSCognitoCredentials.RNC_FACEBOOK_PROVIDER] = this.props.facebookToken;
		console.log(map);
		AWSCognitoCredentials.setLogins(map); //ignored for iOS
	}

	initUser(token) {
		fetch('https://graph.facebook.com/v2.5/me?fields=email,name,friends&access_token=' + token)
			.then((response) => response.json())
			.then((json) => {
				console.log(json);
				this.props.initUserFB(json.name, json.id);
				AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(this.props.user));
			})
			.catch((error) => {
				console.log('ERROR GETTING DATA FROM FACEBOOK:', error);
			});
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
											this.props.loginStatus(accessToken.toString());
											this.onLoginInvoked();
											this.initUser(accessToken);
											this.Refresh();
										});
								}
							}
						}
						onLogoutFinished={
							() => {
								this.props.loginStatus('');
								this.ClearCred();
								this.ClearKeychain();
								//this.Refresh();
							}
						}
					/>
				</View>
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
		user,
	} = state.auth;

	return {
		facebookToken,
		login,
		user,
	};
};

export default connect(mapStateToProps, { loginStatus, initUserFB })(LoginForm);
