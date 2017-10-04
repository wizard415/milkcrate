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

export default class ExploreWaysListCell extends Component {

  static propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    icon: PropTypes.number.isRequired,
    iconWidth: PropTypes.number,
    iconHeight: PropTypes.number,
    onClick: PropTypes.func,
  }

  static defaultProps = {
    onClick: () => {},
    iconWidth: 16,
    iconHeight: 16,    
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
      description,
      icon,
      iconWidth,
      iconHeight,
      onClick,
    } = this.props;

    return (
      <TouchableHighlight onPress={ () => onClick() }>
        <View style={ styles.cellContainer }>
          <View style={ styles.iconContainer }>
            <Image style={ [{ width: iconWidth }, { height: iconHeight }] } source={ icon }/>            
          </View>
          <View style={ styles.contentContainer }>
            <Text style={ styles.textTitle }>{ title }</Text>
            <Text style={ styles.textDscription }>{ description } </Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}
const styles = StyleSheet.create({
  cellContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: commonColors.line,
    borderStyle: 'solid',
  },
  iconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 7,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  textTitle: {
    flex: 1,
    color: commonColors.title,
    fontFamily: 'Open Sans',
    fontSize: 14,
  },
  textDscription: {
    flex: 1,
    color: commonColors.grayText,
    fontFamily: 'Open Sans',
    fontSize: 12,
  },
});
