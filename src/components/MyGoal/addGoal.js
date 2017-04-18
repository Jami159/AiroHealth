'use strict';

import React, {Component} from 'react';
import {StyleSheet, View, Text, TouchableOpacity, TextInput} from 'react-native';
import {connect} from 'react-redux'
import {Icon, Button} from 'native-base';
import {hideModal, addGoal} from '../../actions';

class AddGoal extends Component {
    constructor(props) {
        super(props);
        this.state = {goal:{title: null, desc:null, freq:null, notif:null, completed:false, expanded:false}};
    }
    saveTitleData(text){
        const thisGoal = this.state.goal;
        thisGoal.title = text;
        this.setState({goal: thisGoal});
    }

    saveDescData(text){
        const thisGoal = this.state.goal;
        thisGoal.desc = text;
        this.setState({goal: thisGoal});
    }

    saveFreqData() {
        const thisGoal = this.state.goal;
        thisGoal.freq = 'hello';
        this.setState({goal: thisGoal});
    }

    saveNotifData() {
        const thisGoal = this.state.goal;
        thisGoal.notif = 'hello';
        this.setState({goal: thisGoal});
    }

    addGoal = () => {
        const { title, desc, freq, notif } = this.state.goal;
        this.props.addGoal(title, desc, freq, notif);
        this.props.hideModal();

        const thisGoal = this.state.goal;
        thisGoal.title = null;
        thisGoal.desc = null;
        thisGoal.freq = null;
        thisGoal.notif = null;
        this.setState({goal:thisGoal});
    }
    render() {
        var {hideModal} = this.props;
        return (
            <View style={styles.container}>
                <View style={styles.modalContainer}>
                    <View style={{padding: 20}}>
                    <View style={{flexDirection: 'row', justifyContent:'space-between'}}>
                        <Text style={{fontSize: 22, textAlign:'left', fontWeight:'bold'}}>NEW GOAL</Text>
                        <Button transparent style={{flex:1}} onPress={() => {
                            this.props.hideModal();
                        }}>
                            <Icon name='close' style={{color: '#000', }} />
                        </Button>

                    </View>
                        <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                            <Icon name='list-box' style={{flex:1, textAlign: 'right', marginRight: 10}} />
                            <TextInput
                            style={styles.inputStyle}
                                autoCapitalize='characters'
                                placeholder= 'Title'
                                onChangeText={(title) =>  this.saveTitleData(title)} />
                        </View>
                        <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                            <Text id='newTitle' style={{flex:1, textAlign: 'right', marginRight: 10}}></Text>
                            <TextInput
                            style={styles.inputStyle}
                            autoCapitalize='sentences'
                            multiline={true}
                            placeholder= 'Description'
                            onChangeText={(desc) =>  this.saveDescData(desc)} />
                        </View>
                        <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                            <Icon name='notifications' style={{flex:1, textAlign: 'right', marginRight: 10}}/>
                            <TextInput
                                style={[styles.inputStyle, {flex:7}]}
                                autoCapitalize='sentences'
                                multiline={true}
                                placeholder= 'Change to checkboxes' />
                            <Button transparent style={{flex:2}}>
                                <Icon name='list' />
                            </Button>
                        </View>
                        <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                            <Icon name='alarm' style={{flex:1, textAlign: 'right', marginRight: 10}}/>
                            <TextInput
                                style={[styles.inputStyle, {flex:7}]}
                                autoCapitalize='sentences'
                                multiline={true}
                                placeholder= 'Change to appropriate input field' />
                            <Button transparent style={{flex:1}}>
                                <Icon name='add' />
                            </Button>
                            <Button transparent style={{flex:1}}>
                                <Icon name='close' />
                            </Button>

                        </View>
                        <View style={{marginTop: 25, justifyContent:'center', alignItems:'center'}}>
                            <Button onPress={() => { this.addGoal(); }}>
                                <Text style={{color:'#fff'}}>CREATE</Text>
                            </Button>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container:{flex:1, flexDirection:'column', justifyContent: 'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.7)'},
    modalContainer:{marginTop:22, width:350, height: 400, backgroundColor:'#fff'},
    inputTitle:{flex:1, textAlign: 'right', marginRight: 10},
    inputStyle:{flex:9, marginLeft:10},
});

const mapStateToProps = (state) => {
    const {
        visible,
    } = state.modal;
    return {
        visible,
    };
}

export default connect(mapStateToProps, {hideModal, addGoal})(AddGoal);
