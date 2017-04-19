/*@flow*/

import React, {Component} from 'react'
import{
  StyleSheet,
  TouchableOpacity,
  View,
  Text
} from 'react-native';
import {connect} from 'react-redux'
import {Icon, Header, Left, Button, Right, Body, Title} from 'native-base';
import {showModal, hideModal} from '../../actions';
import {Actions} from 'react-native-router-flux';

class ToolBar extends Component {

    render() {
        return (
            <Header style={{backgroundColor: 'powderblue', height:64,}}>
                <Left>
                    <Button transparent onPress={()=>Actions.pop()}>
                        <Icon name='arrow-back' style={{color:'#fff', fontSize: 20}}/>
                    </Button>
                </Left>
                <Body>
                    <Title>Goal</Title>
                </Body>
                <Right>
                    <Button transparent onPress={()=>{
                        this.props.showModal();
                    }}>
                        <Icon name='add' />
                    </Button>
                    <Button transparent>
                        <Icon name='list' />
                    </Button>
                </Right>
            </Header>
        );
    }
}

const styles = StyleSheet.create({
  toolbar: {
    backgroundColor: 'powderblue',
    height:64,
    // paddingTop: 30,
    // paddingBottom: 10,
    // flexDirection: 'row'
  },
  button: {
    width: 50
  },
  text: {
    color: '#fff',
    textAlign: 'center'
  },
  title: {
    flex: 1,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold'
  }
});

const mapStateToProps = (state) => {
    const {
        visible
    } = state.modal;

    return {
        visible
    };
}

export default connect(mapStateToProps, {showModal, hideModal})(ToolBar);
