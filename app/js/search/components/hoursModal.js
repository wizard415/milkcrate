'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  ScrollView,
  TouchableHighlight,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';


import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import TextField from 'react-native-md-textinput';

import * as commonColors from '../../styles/commonColors';
import * as commonStyles from '../../styles/commonStyles';

export default  class HoursModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      hoursNumber:"0"
    }
  }

  onSave() {
    Actions.pop();
  }

  goBack() {
    Actions.pop();
  }

  render() {
    return (
      <View style={ styles.container }>
        <View style={ styles.contentWrapper }>
          <Text style={ styles.textSettingsSection }>Number of Hours Volunteered</Text>
          <TextField
            autoCorrect={ false }
            inputStyle={ inputStyle }
            wrapperStyle={ wrapperStyle }
            onChangeText={ (text) => { this.state.hoursNumber = text }}
            height={ 72 }
            borderColor="transparent"
            value={ this.state.hoursNumber }
          />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={ () => this.onSave() }>
            <View style={ styles.submitButton }>
              <Text style={ styles.textWhite }>Submit</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={ () => this.goBack() }>
            <View style={ styles.cancelButton }>
              <Text style={ styles.textWhite }>Cancel</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const inputStyle = {
  color: '#fff',
  fontFamily: 'OpenSans-Semibold',
  fontSize: 72,
  backgroundColor:'transparent',
  textAlign:'center',
  borderWidth:0
};

const wrapperStyle={
  height: 100,
  backgroundColor: 'transparent',
  borderWidth:0,
  width:commonStyles.screenWidth
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8ED0C4',
  },
  contentWrapper:{
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  },
  textSettingsSection: {
    color: 'white',
    fontFamily: 'OpenSans-Semibold',
    fontSize: 14,
    marginBottom: 80,
  },
  textWhite: {
    color: '#fff',
    fontFamily: 'Open Sans',
    fontWeight: 'bold',
    fontSize: 14,
    backgroundColor: 'transparent',
    paddingHorizontal: 15,
  },
  submitButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5E8AA3',
    height: 40,
    width:commonStyles.screenWidth/2,
  },
  cancelButton: {
    width:commonStyles.screenWidth/2,
    backgroundColor: commonColors.bottomButton,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer:{
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
  }
});
