import * as actions from '../types';
import _ from 'lodash';

export function addGoal(title, desc, freq, notif, completed, expanded,){
    return {
        type: actions.ADD,
        goal: {
            title,
            desc,
            freq,
            notif,
            completed: completed === true,
            expanded: expanded === true,
        },
        activeGoal:{
            id: _.uniqueId('goal_'),
            title,
            desc,
            freq,
            notif,
            completed: completed === true,
            expanded: expanded === true,
        }
    };
}

export function completeGoal(id){
    return {
        type: actions.COMPLETE,
        id
    };
}

export function activeGoal(id){
    return {
        type: actions.ACTIVE,
        id
    };
}

export function editGoal(id, title, desc, freq, notif, completed, expanded){
    return {
        type: actions.EDIT,
        id,
        title,
        desc,
        freq,
        notif,
        completed: completed === true,
        expanded: expanded === true,
    };
}

export function expandGoal(id){
    return {
        type: actions.EXPAND,
        id
    }
}

export function shrinkGoal(id) {
    return {
        type: actions.SHRINK,
        id
    }
}

export function fetchGoals(goals,activeListTemp, completeListTemp){
    return {
        type: actions.FETCH_GOALS,
        goals,
        activeListTemp,
        completeListTemp,
    }
}
