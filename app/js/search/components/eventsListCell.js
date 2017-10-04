import React, { Component, PropTypes } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  Image,
  TouchableHighlight,
} from 'react-native';

import * as commonStyles from '../../styles/commonStyles';
import * as commonColors from '../../styles/commonColors';
import Point from '../../components/Point';
import UtilService from '../../components/util';

export default class EventsListCell extends Component {

  static propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.number,
    points: PropTypes.number,
    onClick: PropTypes.func,
  }

  static defaultProps = {
    points: 0,
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
      title,
      icon,
      points,
      onClick,
        userActivity
    } = this.props;

    return (
      <TouchableHighlight onPress={ () => onClick() }>
        <View style={ styles.cellContainer }>
          <View style={ styles.mainContainer }>
            <Image style={ styles.icon } source={ icon }/>
            {userActivity&&<View style={ styles.cellTopTextContainer }>
              <Text numberOfLines={2} style={ styles.textTitle }>{ title }</Text>
              <View style={ styles.cellBottomContainer }>
                <Image style={ styles.activityViewIcon } source={ UtilService.getActivityViewIcon(userActivity.type) }/>
                <Text style={ styles.text }>{ UtilService.getPastDateTime(userActivity._bmd.updatedAt) } </Text>
              </View>
            </View>}
            {
              !userActivity&&<Text numberOfLines={2} style={ [styles.textTitle, {paddingLeft:5}] }>{ title }</Text>
            }
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
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: commonColors.line,
    borderStyle: 'solid',
    alignItems: 'center',
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingRight: 5,
  },
  icon: {
    width: 44,
    height: 44,
  },
  textTitle: {
    flex: 1,
    color: commonColors.title,
    fontFamily: 'Open Sans',
    fontSize: 14,
  },
  cellTopTextContainer: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft:5
  },
  cellBottomContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  text: {
    color: commonColors.grayMoreText,
    fontFamily: 'Open Sans',
    fontSize: 12,
  },
  activityViewIcon: {
    width: 16,
    height: 8,
    resizeMode:'contain',
    marginRight:5,
    marginTop:5
  },
});
