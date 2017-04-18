/*@flow*/

'use strict';
import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Text,
    ListView,
    TouchableWithoutFeedback,
    Platform,
    Animated,
} from 'react-native';
import {connect} from 'react-redux';
import CompleteToggle from './completeToggle';
import AddGoalRow from './addGoalRow';
import {VisibilityFilters} from '../../actions/types';
import {showAll, showActive, showCompleted, completeGoal, activeGoal, expandGoal,shrinkGoal} from '../../actions';
import {ListItem, List} from 'native-base';

class GoalList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeDataSource: new ListView.DataSource({
                rowHasChanged: (r1, r2) => r1 !== r2
            }),
            completeDataSource: new ListView.DataSource({
                rowHasChanged: (r1, r2) => r1 !== r2
            }),
            animation: new Animated.Value()
        };
        if (this.props.activeGoals) {
            this.state.activeDataSource = this.state.activeDataSource.cloneWithRows(
                this.getGoalsWithTemplate(this.props.activeGoals)
            )
        }
        if (this.props.completeGoals){
            this.state.completeDataSource = this.state.completeDataSource.cloneWithRows(
                this.getGoalsWithTemplate(this.props.completeGoals)
            )
        }
    }

    getGoalsWithTemplate(goals) {
        return goals.concat([{template: true}])
    }

    componentWillReceiveProps (nextProps) {
        if (nextProps.activeGoals !== this.props.activeGoals) {
            this.setState({
                activeDataSource: this.state.activeDataSource.cloneWithRows(
                    this.getGoalsWithTemplate(nextProps.activeGoals)
                )
            });
        }
        if (nextProps.completeGoals !== this.props.completeGoals) {
            this.setState({
                completeDataSource: this.state.completeDataSource.cloneWithRows(
                    this.getGoalsWithTemplate(nextProps.completeGoals)
                )
            });
        }

    }

    renderRow = (goal) => {
        return this.renderGoalItem(goal);
    }

    toggleGoal(goal){
        let initialValue = goal.expanded? this.state.maxHeight + this.state.minHeight : this.state.minHeight,
            finalValue = goal.expanded? this.state.minHeight : this.state.maxHeight+this.state.minHeight;

        if (goal.expanded){
            this.props.shrinkGoal(goal.id);
        } else if (!goal.expanded){
            this.props.expandGoal(goal.id);
        }

        this.state.animation.setValue(initialValue);
        Animated.spring(
            this.state.animation,
            {
                toValue: finalValue
            }
        ).start();
    }

    _setMaxHeight(event){
        this.setState({
            maxHeight: event.nativeEvent.layout.height
        });
    }

    _setMinHeight(event){
        this.setState({
            minHeight: event.nativeEvent.layout.height
        })
    }

    renderGoalItem(goal) {
        return (
            <Animated.View style= {[styles.goalContainer, {height: this.state.animationa}]}>
                <View style={styles.titleContainer} onLayout={this._setMinHeight.bind(this)}>
                    <TouchableWithoutFeedback
                        onPress={()=>{ (goal.id) ? this.toggleGoal(goal):console.log('empty')}}
                        underlayColor="#e4f2d9"
                        key={goal.id}>
                        <View style={styles.title}>
                            <Text style={styles.goal}>{goal.title}</Text>
                            {
                                (!goal.completed && goal.id && goal.expanded) ?
                                    <TouchableWithoutFeedback
                                        onPress={()=>{this.props.completeGoal(goal.id)}}>
                                        <View>
                                            <Text style={styles.completeButton}>COMPLETE</Text>
                                        </View>
                                    </TouchableWithoutFeedback> : null
                            }
                        </View>
                    </TouchableWithoutFeedback>
                </View>
                {
                    ( goal.expanded ) ?
                        <View style={styles.body} onLayout={this._setMaxHeight.bind(this)}>
                            <Text>{goal.desc}</Text>
                        </View> : null
                }
            </Animated.View>
        )
    }

    render() {
        console.log('RENDERING LIST....');
        return (
            <View>
                <ListItem itemDivider style={{backgroundColor:'#fff', height:50}}>
                    <Text style={styles.dividerText}>ACTIVE</Text>
                </ListItem>
                <ListView
                    dataSource={this.state.activeDataSource}
                    renderRow={this.renderRow} />
                <ListItem itemDivider style={{backgroundColor:'#fff'}}>
                    <Text style={styles.dividerText}>COMPLETED</Text>
                </ListItem>
                <ListView
                    dataSource={this.state.completeDataSource}
                    renderRow={this.renderRow} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    row: {
        flexDirection: 'row',
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 20,
        paddingRight: 20
    },
    templateRow: {
        paddingLeft: 30
    },
    text: {
        flex: 1,
        fontSize: 16,
        marginLeft: 10
    },
    dividerText: {
        marginTop: 15,
        color: 'skyblue',
        fontSize: 18,
        fontWeight: 'bold',
    },
    title:{
        flexDirection:'row',
        marginTop:20,
    },
    goal:{
        fontSize:25,
        flex:5,
        paddingLeft:15,
        marginBottom:3,
        textAlign:'left',
        color:'grey',
        ...Platform.select({
            ios:{
                justifyContent:'center'
            },
            android:{
                textAlignVertical:'center'
            }
        }),
    },
    completeButton:{
        color:'#6499BE',
        flex:1.8,
        textAlign:'right',
        fontSize:20,
        paddingRight:15,
        ...Platform.select({
            android:{
                textAlignVertical:'center'
            }
        }),
    },
    body:{
        paddingLeft:15,
    },
});

const mapStateToProps = (state)=>{
    const {
        visibleGoals
    } = state.goalFilter;
    const {
        activeGoals,
        completeGoals,
        goals,
    } = state.goal;
    return {
        visibleGoals,
        goals,
        activeGoals,
        completeGoals
    }
}

export default connect(mapStateToProps, {showAll, showCompleted, showActive, completeGoal, activeGoal, expandGoal, shrinkGoal})(GoalList);
//export default connect (GoalList);
