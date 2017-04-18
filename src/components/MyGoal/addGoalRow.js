'use strict';
import React, {Component} from 'react';
import {
  StyleSheet,
  TextInput,
  View
} from 'react-native';

class AddGoalRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      focused: false,
      value: null
    };
  }
  onSubmit = () => {
    this.props.addGoal(this.state.title, this.state.desc, this.state.completed, this.state.frequency, this.state.notification);
  }
  onFocused = () => {
    console.log('focused');
    this.state.focused = true;
    this.setState(this.state);
  }
  onBlurred = () => {
    this.state.focused = false;
    this.setState(this.state);
  }
  render() {
    var {addGoal} = this.props;

    return (
      <View style={styles.row}>
        {this.renderBorder()}
      </View>
    );
  }
  renderBorder() {
    if (this.state.focused) {
      return (
        <View style={styles.border}></View>
      );
    }
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'column',
    paddingLeft: 40,
    paddingRight: 10
  },
  input: {
    height: 40,
    flex: 1
  },
  border: {
    flex: 1,
    height: 1,
    backgroundColor: 'gray'
  }
});

export default AddGoalRow;
