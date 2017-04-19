/*@flow*/

import React, {Component} from 'react'
import{ StyleSheet, } from 'react-native';
import {Icon, Header, Left, Button, Right, Body, Title} from 'native-base';

export default class ToolBar extends Component {
    constructor(props){
        super(props);

    }
    render() {
        return (
            <Header style={{backgroundColor:"powderblue", height: 64}}>
                <Left>
                    <Button transparent>
                        <Icon name='menu' style={{color:'#fff', fontSize: 20}}/>
                    </Button>
                </Left>
                <Body>
                    <Title>{this.props.title}</Title>
                </Body>
                <Right>
                </Right>
            </Header>
        );
    }
}

const styles = StyleSheet.create({
  toolbar: {
    backgroundColor: 'powderblue',
    height:50,
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
