import React from 'react'
import {
  Text,
  View,
  TouchableOpacity,
  Animated
} from 'react-native';

export const DoneButton = ({
  styles, 
  onDoneBtnClick, 
  onNextBtnClick,
  rightTextColor, 
  isDoneBtnShow,
  doneBtnLabel, 
  nextBtnLabel, 
  doneFadeOpacity, 
  skipFadeOpacity, 
  nextOpacity,
  skipBtnLabel, 
  index, 
  total,
}) => {

  return (
    <View style={ styles.btnContainer }>
      <Animated.View style={ [styles.full, { height: 0 }, {
        opacity: doneFadeOpacity,
        transform: [{
          translateX: skipFadeOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 20],
          }),
        }],
      }]}
      >
        <View style={ styles.full }>
          <Text style={[styles.controllText, { 
            color: rightTextColor, paddingRight: 30,
          }]}>
            { doneBtnLabel }
          </Text>
        </View>
      </Animated.View>
      <Animated.View style={ [styles.full, { height: 0 }, ] }>
        <TouchableOpacity style={ styles.full }
          onPress={ index >= (total - 1) ? onDoneBtnClick : onNextBtnClick }>
          <Text style={ [doneButtonStyles.nextButtonText, { color: rightTextColor },] }>
            {
              index >= (total - 1) ? 
                skipBtnLabel 
                : 
                nextBtnLabel
            }
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}

export default DoneButton

const doneButtonStyles = {
  nextButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Open Sans',
  },
}