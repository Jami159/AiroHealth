'use strict';

import * as actions from '../../actions/types';
import {AsyncStorage} from 'react-native';
import _ from 'lodash';

const initialState = {
    goals: [],
    activeGoals: [],
    completeGoals: []
}

export default (state=initialState, action) => {
    switch(action.type){
        case actions.FETCH_GOALS:
            return {...state, goals: action.goals, activeGoals: action.activeListTemp, completeGoals: action.completeListTemp}
        case actions.ADD:
            return {...state, activeGoals: [...state.activeGoals, action.activeGoal]};
        case actions.COMPLETE:
            var activeIndex = _.findIndex(state.activeGoals, (goal) => goal.id.slice(0,6)+goal.id.slice(10) === action.id);
            if (activeIndex === -1) {
                return state
            }
            return {...state,
                activeGoals: [...state.activeGoals.slice(0, activeIndex),...state.activeGoals.slice(activeIndex+1)],
                completeGoals: [...state.completeGoals.concat(Object.assign({}, state.activeGoals[activeIndex], {
                    completed: true
                }))],
            }
        case actions.ACTIVE:
            var index = _.findIndex(state.goals, (goal) => goal.id === action.id);
            if (index === -1){
                return state;
            }
            return {...state,
                goals: [
                    ...state.goals.slice(0, index),
                    Object.assign({}, ...state.goals[index], {
                        completed: false
                    }),
                    ...state.goals.slice(index + 1)
                ]
            }
        case actions.EDIT:
            var index = _.findIndex(state.goals, (goal) => goal.id === action.id);
            if (index === -1){
                return;
            }
            return;

        case actions.EXPAND:
            var index = _.findIndex(state.activeGoals, (goal) => goal.id === action.id);
            return {...state,
                activeGoals:[...state.activeGoals.slice(0, index),
                    Object.assign({}, state.activeGoals[index], {
                        expanded: true
                    }),
                    ...state.activeGoals.slice(index+1)
                ]}
        case actions.SHRINK:
            var index = _.findIndex(state.activeGoals, (goal) => goal.id === action.id);
            return {...state,
                activeGoals:[...state.activeGoals.slice(0, index),
                    Object.assign({}, state.activeGoals[index], {
                        expanded: false
                    }),
                    ...state.activeGoals.slice(index+1)
                ]}
        default:
            return state;
    }
}
