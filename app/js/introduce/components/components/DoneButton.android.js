import React from 'react'
import {
  Text,
  View,
  TouchableOpacity,
} from 'react-native';

export const DoneButton = ({
  styles, 
  onDoneBtnClick, 
  onNextBtnClick,
  rightTextColor, 
  isDoneBtnShow,
  doneBtnLabel, 
  nextBtnLabel,
  skipBtnLabel, 
  index, 
  total,
}) => {
  return (
    <View style={ [styles.btnContainer, { height: 0, paddingBottom: 5 }] }>
      <TouchableOpacity style={ styles.full }
        onPress={ isDoneBtnShow ? onDoneBtnClick : onNextBtnClick }
      >
       <Text style={ [styles.nextButtonText, { color: rightTextColor }] }>
         {
           showButton(isDoneBtnShow, doneBtnLabel, nextBtnLabel, skipBtnLabel, index, total)
         }
       </Text>
      </TouchableOpacity>
    </View>
  )
}

function showButton(isDoneBtnShow, doneBtnLabel, nextBtnLabel, skipBtnLabel, index, total) {
  // if (isDoneBtnShow)
  //   return doneBtnLabel;

  if (index >= (total - 1))
    return skipBtnLabel;
  
  return nextBtnLabel;
}

export default DoneButton