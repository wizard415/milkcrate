import React, { Component, PropTypes } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  Image,
  TouchableHighlight,
} from 'react-native';

import * as commonColors from '../../styles/commonColors';
import { screenWidth } from '../../styles/commonStyles';
import UtilService from '../../components/util';

const star = require('../../../assets/imgs/star.png');

export default class BusinessesListCell extends Component {

  static propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.number,
    description: PropTypes.string,
    price: PropTypes.number,
    rating: PropTypes.number,
    onClick: PropTypes.func,
    mode: PropTypes.number
  }

  static defaultProps = {
    mode: 0,
    rating: 0.0,
    distance: 1,
    price: 0,
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
      description,
      distance,
      price,
      rating,
      onClick,
      mode,
        userActivity
    } = this.props;

    let dollars = '';

    for (i = 1 ; i <= price ; i++)
      dollars += '$';

    return (
      <TouchableHighlight
        onPress={ () => onClick() }
        underlayColor='#dddddd'
      >
        <View style={ mode == 0 ? styles.cellContainer : styles.detailContainer }>
          <View style={ styles.cellTopContainer }>
            <Image style={ styles.imageCategory } source={ icon } />
            <View style={ styles.cellTopTextContainer }>
              <View style={ styles.cellTopTitleRatingContainer }>
                <View style={ styles.cellTopTitleContainer }>
                  <Text numberOfLines={ 2 } style={ styles.title }>{ title }</Text>
                </View>
                { (rating > 0) && <View style={ styles.cellTopRatingContainer }>
                  <Text style={ styles.text }>{ rating.toFixed(1) } </Text>
                  <Image style={ styles.star } source={ star } />
                </View> }
              </View>
              <View style={ styles.cellBottomContainer }>
                <Text style={ styles.text }>{ (distance > 0) ? distance.toFixed(1) : 0 } Miles  { dollars }</Text>
                {userActivity&&<Image style={ styles.activityViewIcon } source={ UtilService.getActivityViewIcon(userActivity.type) }/>}
                {userActivity&&<Text style={ styles.text }>{ UtilService.getPastDateTime(userActivity._bmd.updatedAt) } </Text>}
              </View>
            </View>
          </View>
          {/*<View style={ styles.cellBottomContainer }>
            <Text numberOfLines={ 1 } style={ styles.dscription }>{ description } </Text>
          </View>*/}
        </View>
      </TouchableHighlight>
    );
  }
}
const styles = StyleSheet.create({
  cellContainer: {
    flex: 1,
    width: screenWidth,
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderBottomColor: commonColors.line,
  },
  detailContainer: {
    flex: 1,
    width: screenWidth - 20,
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: commonColors.line,
    borderRadius: 5,
  },
  cellTopContainer: {
    flexDirection: 'row',
    flex: 3,
    alignItems: 'center',
  },
  cellTopTextContainer: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: 5,
    paddingVertical: 5,
  },
  cellTopTitleRatingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cellTopTitleContainer: {
    flex: 5,
    alignItems: 'flex-start',
  },
  cellTopRatingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  cellBottomContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  imageCategory: {
    width: 44,
    height: 44,
  },
  star: {
    width: 16,
    height: 16,
    marginLeft: 3,
  },
  title: {
    color: commonColors.title,
    fontFamily: 'Open Sans',
    fontSize: 14,
  },
  dscription: {
    color: commonColors.grayText,
    fontFamily: 'Open Sans',
    fontSize: 12,
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
    marginTop:2,
    marginLeft:10
  },
});
