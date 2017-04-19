/*@flow*/

import React, {Component} from 'react'
import{ StyleSheet, } from 'react-native';
import {Icon, Header, Left, Button, Right, Body, Title} from 'native-base';
import SideDrawer from './SideDrawer';
import {Actions} from 'react-native-router-flux';

export default class ToolBar extends Component {
    constructor(props){
        super(props);
    }
    render() {

        return (
            <Header style={{backgroundColor:"powderblue", height: 64}}>
                <Left>
                    <Button transparent onPress={()=>{(this.props.leftIcon === 'menu') ? Actions.get('drawer').ref.toggle() : ()=>Actions.pop()}}>
                        <Icon name={this.props.leftIcon} style={{color:'#fff', fontSize: 20}}/>
                    </Button>
                </Left>
                <Body>
                    <Title>{this.props.title}</Title>
                </Body>
                <Right>
                    { (this.props.addIcon) ?
                        <Button transparent>
                            <Icon name='add' style={{color:'#fff', fontSize: 20}} />
                        </Button>
                        : null
                    }
                    {(this.props.filterIcon) ?
                        <Button transparent>
                            <Icon name='list' style={{color:'#fff', fontSize: 20}} />
                        </Button>
                        : null
                    }
                </Right>
            </Header>
        );
    }
}

const styles = StyleSheet.create({
  title: {
    flex: 1,
    color: '#fff',
    fontWeight: 'bold'
  }
});
