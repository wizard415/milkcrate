import React, { Component } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default class FadeOutView extends Component {

  // state: any;

  constructor(props) {
    super(props);
    this.state = {
      fadeAnim: new Animated.Value(1), // opacity 0
    };
  }

  componentDidMount() {

    Animated.timing(       // Uses easing functions
      this.state.fadeAnim, // The value to drive
      {
        toValue: 0.3,        // Target
        duration: 500,    // Configuration
      },
    ).start();             // Don't forget start!
  }

  render() {
    return (
      <Animated.View   // Special animatable View
        style={{ 
          opacity: this.state.fadeAnim,  // Binds
        }}>
        { this.props.children }
      </Animated.View>
    );
  }
}