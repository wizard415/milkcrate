import React, { Component, PropTypes } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Platform,
} from 'react-native';

import { screenWidth, screenHeight } from '../styles/commonStyles';

const diamond = [
  require('../../assets/imgs/diamond_solo.gif'),
  require('../../assets/imgs/diamond1.gif'),
  require('../../assets/imgs/diamond2.gif'),
  require('../../assets/imgs/diamond3.gif'),
  require('../../assets/imgs/diamond4.gif'),
  require('../../assets/imgs/diamond5.gif'),
  require('../../assets/imgs/diamond6.gif'),
  require('../../assets/imgs/diamond7.gif'),
  require('../../assets/imgs/diamond8.gif'),
  require('../../assets/imgs/diamond9.gif'),
  require('../../assets/imgs/diamond10.gif'),
]


export default class EarnedPoint extends Component {


  static propTypes = {
    show: PropTypes.bool,
    point: PropTypes.number,
  }


  static defaultProps = {
    show: false,
    point:1
  }


  constructor(props) {
    super(props);

    this.timer = 0;
    this.state = {
      show: this.props.show,
    }
  }

  
  componentWillMount() {
    this._isMounted = true;
  }

  
  componentWillUnmount() {
    this._isMounted = false;
    if(this.timer)
      clearInterval(this.timer);
  }


  componentWillReceiveProps(nextProps){

    if (this.props.show !== nextProps.show ) {
      this.setState({ show: nextProps.show });
    }
  }


  render() {
    const {point}=this.props;

    if ((this._isMounted === false) || (this.state.show === false)) {
      return null;
    }

    if (this.timer === 0) {
      this.timer = setInterval(() => {
        clearInterval(this.timer);
        this.timer = 0;
        this._isMounted && this.setState({ show: false });
      }, 2500)
    }

    var pointImage;
    if(point <= 10) {
      pointImage = diamond[point]
    } else {
      pointImage = diamond[0]
    }

    return (
      <Image source={ pointImage } style={ styles.imageAnimation } resizeMode="cover"/>
    );
  }
}


const styles = StyleSheet.create({  
  container: {
    flex: 1,
  },
  imageAnimation: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: screenWidth,
    height: screenHeight,
  },
});
