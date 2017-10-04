import React, { Component, PropTypes } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  Image,
  TouchableHighlight,
  TouchableOpacity,
  Alert,
} from 'react-native';

import * as commonStyles from '../../styles/commonStyles';
import * as commonColors from '../../styles/commonColors';
import Point from '../../components/Point';

// const calendar = require('../../../assets/imgs/events.png');

export default class WeeklyRecapListCell extends Component {

  static propTypes = {
    height: PropTypes.number,
    width: PropTypes.number,
    title: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    icon: PropTypes.number.isRequired,
    time: PropTypes.number,
    points: PropTypes.number,
    onClick: PropTypes.func,
  }

  static defaultProps = {
    width: commonStyles.screenWidth,
    onClick: () => {}
  }

  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    if (this.props.onClick) {
      this.props.onClick();
    }
  }

  render() {
    const {
      height,
      width,
      title,
      date,
      icon,
      time,
      points,
      onClick,
    } = this.props;

    return (
      <TouchableHighlight onPress={ () => onClick() }>
        <View style={ styles.cellContainer }>
          <Image style={ styles.imageIcon } source={ icon }/>
          <View style={ styles.mainContentContainer }>
            <Text style={ styles.textDescription }>{ date }</Text>
            <Text style={ styles.textTitle }>{ title }</Text>
          </View>
          <Point point={ points }/>
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  cellContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: commonColors.line,
    borderStyle: 'solid',
    alignItems: 'center',
  },
  mainContentContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  imageIcon: {
    width: 40,
    height: 40,
    borderRadius: 2,
  },
  textTitle: {
    color: commonColors.title,
    backgroundColor: 'transparent',
    fontFamily: 'Open Sans',
    fontSize: 14,
  },
  textDescription: {
    color: commonColors.grayMoreText,
    fontFamily: 'Open Sans',
    fontSize: 12,
    backgroundColor: 'transparent',
  },
  // imageCalendar: {
  //   width: 15,
  //   height: 16,
  //   marginRight: 5,
  // },
  // calendarContainer: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'flex-start',
  // },
});
