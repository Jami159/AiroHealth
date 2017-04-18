import React, {Component} from 'react';
import {StyleSheet, View, Modal, AsyncStorage, ScrollView, Text} from 'react-native';
import {bindActionCreators, dispatch} from 'redux';
import {connect} from 'react-redux';
import ScrollableTabView, {ScrollableTabBar, DefaultTabBar} from 'react-native-scrollable-tab-view';
import ToolBar from './components/MyGoal/toolBar';
import GoalList from './components/MyGoal/goalList';
import AddGoal from './components/MyGoal/addGoal';
import Filters from './components/MyGoal/filters';
import { hideModal, fetchGoals } from './actions';
import reducers from './reducers';

class GoalApp extends Component {
    constructor(props) {
        super(props);
    }
    async saveGoals() {
        try{
            var goals = this.props.activeGoals.concat(this.props.completeGoals);
            await AsyncStorage.setItem('goals', JSON.stringify(goals))
                .then(AsyncStorage.setItem('activeGoals', JSON.stringify(this.props.activeGoals)))
                .then(AsyncStorage.setItem('completeGoals', JSON.stringify(this.props.completeGoals)))
        } catch(err) {
            console.log(err);
        }
    }
    componentDidMount() {
        this.initializeData();
    }

    //TODO: change variable namesgitori
    async initializeData() {
        try{
            var initialGoalList = await AsyncStorage.getItem('goals');
            if (initialGoalList === 'undefined' || initialGoalList === null){
                initialGoalList = [];
            } else {
                initialGoalList = JSON.parse(initialGoalList);
            }
            var activeGoalList = await AsyncStorage.getItem('activeGoals');
            if (activeGoalList === 'undefined' || activeGoalList === null){
                activeGoalList = [];
            } else {
                activeGoalList = JSON.parse(activeGoalList);
            }
            var completeGoalList = await AsyncStorage.getItem('completeGoals');
            if (completeGoalList === 'undefined' || completeGoalList === null){
                completeGoalList = [];
            } else {
                completeGoalList = JSON.parse(completeGoalList);
            }

        } catch(error){
            console.error(error);
        }

        this.props.fetchGoals(initialGoalList, activeGoalList, completeGoalList);
    }

    render(){
        const {goals, visibleGoals, visible} = this.props;
        return (
            <View style={styles.container}>
                <ToolBar activeFilter={visibleGoals} />
                <ScrollableTabView
                    style={styles.tabbar}
                    initialPage={0}
                    tabBarActiveTextColor='navy'
                    tabBarInactiveTextColor='white'
                    tabBarBackgroundColor = 'powderblue'
                    tabBarUnderlineStyle = {{borderBottomWidth:0}}
                    renderTabBar={() => <ScrollableTabBar />}
                    ref={(tabView) => {this.tabView = tabView;}}>
                    <ScrollView tabLabel='My Goals'>
                    <GoalList
                        activeFilter = {visibleGoals}
                        goals={goals} />
                    </ScrollView>
                    <ScrollView tabLabel='New Goals'>

                    </ScrollView>
                </ScrollableTabView>
                <Modal
                    animationType={'fade'}
                    transparent={true}
                    visible={visible}
                    onRequestClose= {()=>{hideModal()}}>
                    <AddGoal />
                </Modal>
            </View>
        );
    }
    _onActionSelected = (position) => {
        this.setState({
            actionText: 'Selected ' + toolbarActions[position].title,
        });
    };

    componentWillUnmount(){
        this.saveGoals();
    }
}

const styles= StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'blue',
    },
    tabbar: {
        backgroundColor: '#fff',
        height:64,
        borderBottomWidth:0,
    },
    navTab: {
        backgroundColor: '#fff',
        height:64,
        borderTopWidth:0.2,
        borderTopColor:'grey'
    },
    navTabText:{
        fontSize:9,
        color:'navy'
    }
});


const mapStateToProps = (state) => {
    const {
        visibleGoals
    } = state.goalFilter;
    const {
        activeGoals,
        completeGoals,
        goals,
    } = state.goal;
    const {
        visible,
    } = state.modal;
    return {
        visible,
        visibleGoals,
        goals,
        activeGoals,
        completeGoals
    }
}

export default connect(mapStateToProps,{hideModal, fetchGoals})(GoalApp);
