'use strict';
import React, {Component} from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text
} from 'react-native';
import {VisibilityFilters} from '../../actions/types';

class Filters extends Component {
  render() {
    return (
      <View style={styles.bar}>
        {this.renderFilters()}
      </View>
    );
  }
  renderFilters() {
    var {showAll, showCompleted, showActive, activeFilter} = this.props;
    return [
      {name: VisibilityFilters.ALL, action: showAll},
      {name: VisibilityFilters.COMPLETED, action: showCompleted},
      {name: VisibilityFilters.ACTIVE, action: showActive}
    ].map(filter => {
      var style = [styles.button];
      if (activeFilter === filter.name) {
        style.push(styles.current);
      }
      return (
        <TouchableOpacity
          style={style}
          onPress={filter.action}>
          <Text style={styles.text}>{filter.name}</Text>
        </TouchableOpacity>
      )
    });
  }
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#81c04d',
    flexDirection: 'row'
  },
  button: {
    paddingTop: 20,
    paddingBottom: 20,
    flex: 1
  },
  text: {
    flex: 1,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  current: {
    backgroundColor: '#70a743'
  }
})


export default Filters;
