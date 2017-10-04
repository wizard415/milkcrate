'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TextInput,
  Platform,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { bindActionCreators } from 'redux';
import * as profileActions from '../actions';
import { connect } from 'react-redux';

import { Actions } from 'react-native-router-flux';
import ResponsiveImage from 'react-native-responsive-image';
import ImagePicker from 'react-native-image-picker';
import ModalDropdown from 'react-native-modal-dropdown';
import DatePicker from 'react-native-datepicker'
import timer from 'react-native-timer';
import Permissions from 'react-native-permissions';
import Orientation from 'react-native-orientation';

import * as commonColors from '../../styles/commonColors';
import { screenWidth, screenHeight } from '../../styles/commonStyles';

import moment from 'moment';
import bendService from '../../bend/bendService'
import UtilService from '../../components/util'

const background = require('../../../assets/imgs/background_profile.png');
const camera = require('../../../assets/imgs/camera_full.png');
const triangle_down = require('../../../assets/imgs/triangle_down.png');
const arrayGender = ['Male', 'Female', 'Other', 'Prefer not to say'];

class SetupProfile extends Component {
  constructor(props) {
    super(props);

    var user = bendService.getActiveUser();

    this.state = {
      profilePhoto: camera,
      profilePhotoFile: null,
      name: user.name ? user.name : '',
      birthday: user.birthdate ? moment(user.birthdate, 'YYYY-MM-DD').format('MMM DD, YYYY') : '',
      gender: user.gender ? user.gender : '',
      isUploadingFile: false
    };
  }

  componentDidMount() {
    Orientation.unlockAllOrientations();

    if (Platform.OS === 'ios') {
      setTimeout(()=>{
        Permissions.requestPermission('notification')
            .then(response => {
              console.log(response)
            });
      }, 1000)
    }

    this.hasMounted = true
  }

  componentWillUnmount() {
    this.hasMounted = false
  }

  onSelectGender(gender) {
    this.hasMounted && this.setState({
      gender: gender,
    });
  }

  onChangeBirthday(date) {
    let birthday = moment(date, 'MMM DD, YYYY');
    let today = moment();

    const age = today.diff(birthday, 'years');
    if (Number(age) < 13) {
      timer.setTimeout( this, 'AgeRequirementTimer', () => {
        timer.clearTimeout(this, 'AgeRequirementTimer');
        Alert.alert('Age Requirement Not Met', 'You must be at least 13 years of age to use this app.');
      }, 500);
      return;
    }
    this.hasMounted && this.setState({ birthday: date });
  }

  onCompleteProfile() {
    //check name
    if (this.state.name == '') {
      alert("Please input your first and last name");
      return;
    }

    this.hasMounted && this.setState({
      isUploadingFile:true
    })
    if (this.state.profilePhotoFile) {
      //upload image first
      bendService.uploadFile(this.state.profilePhotoFile, (error, file)=>{
            this.hasMounted && this.setState({
          isUploadingFile:false
        })
        if (error) {
          alert("Failed to upload file. Please try again later");
          return;
        }

        this.updateUserInfo(file);
      }, 
      {
        _workflow: 'avatar'
      });
    } else {
      this.updateUserInfo();
    }
  }

  updateUserInfo(f) {
    var userData = bendService.getActiveUser();

    if (f) {
      userData.avatar = bendService.makeBendFile(f._id)
    }

    userData.name = this.state.name;

    if (this.state.birthday) {
      userData.birthdate = moment(new Date(this.state.birthday)).format('YYYY-MM-DD');
    }

    if (this.state.gender) {
      userData.gender = this.state.gender;
    }

    //console.log(userData);

    bendService.updateUser(userData, (error, result)=>{
      //console.log(error, result)

      if (error) {
        alert("Failed to update user profile")
        this.hasMounted && this.setState({
          isUploadingFile:false
        })
        return;
      }

      this.hasMounted && this.setState({
        isUploadingFile: false
      })

      Actions.Main();
    })
  }

  onPickProfilePhoto() {

    let options;

    if (this.state.profilePhotoFile == null) {
      options = {
        quality: 1.0,
        storageOptions: {
          skipBackup: true,
        }
      };
    } else {
      options = {
        quality: 1.0,
        storageOptions: {
          skipBackup: true,
        },
        customButtons:[{
          name:"remove",
          title:"Remove Photo"
        }]
      };
    }
    
    ImagePicker.showImagePicker(options, (response) => {

      if (response.customButton == 'remove') {
        this.hasMounted && this.setState({
          profilePhoto: camera,
          profilePhotoFile: null,
        });
        return;
      }
      //console.log('Response = ', response);
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } 
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error); 
      }
      else {
        let source = { uri: response.uri };

        this.hasMounted && this.setState({
          profilePhoto: source,
          profilePhotoFile: response,
        });
      }
    });
  }

  render() {
    return (
      <View style={ styles.container }>
        <Image source={ background } style={ styles.background } resizeMode="cover">
          <View style={ styles.descriptionContainer }>
            <Text style={ styles.textTitle }>Set up Your Profile!</Text>
          </View>
          <View style={ styles.photoContainer }>
            <TouchableOpacity activeOpacity={ .5 } onPress={ () => this.onPickProfilePhoto() }>
              <View style={ styles.photoWrapper }>
                <ResponsiveImage source={ this.state.profilePhoto } style={ styles.imagePhoto } />
              </View>
            </TouchableOpacity>  
            <Text style={ styles.textDescription }>Snap or upload profile photo</Text>
          </View>
          <View style={ styles.inputContainer }>
            <TextInput
              autoCapitalize="none"
              autoCorrect={ false }
              placeholder="First & Last Name"
              placeholderTextColor={ commonColors.placeholderText }
              textAlign="center"
              style={ styles.input }
              underlineColorAndroid="transparent"
              returnKeyType={ 'next' }
              onChangeText={ (text) => this.setState({ name: text }) }
            />
            <View style={ styles.inputRowContainer }>
              <DatePicker
                style={ styles.birthdayWrapper }
                date={ this.state.birthday }
                mode="date"
                androidMode="spinner"
                placeholder="Birthday"
                format="MMM DD, YYYY"
                minDate="Jan 01, 1900"
                maxDate="Dec 31, 2200"
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
                showIcon={ false }
                customStyles={{
                  dateInput: {
                    borderColor: '#fff',
                  },
                  placeholderText: {
                    color: commonColors.placeholderText,
                  },
                  dateText: {
                    color: '#000',
                  },
                }}
                onDateChange={ (date) => this.onChangeBirthday(date) }
              />
              <View style={ styles.dropDownWrapper }>
                <ModalDropdown
                  options={ arrayGender }
                  defaultValue='Gender'
                  style={ styles.dropdown }
                  textStyle ={ this.state.gender ==='' ? styles.dropDownPlaceholderText : styles.dropDownText }
                  dropdownStyle={ styles.dropdownStyle }
                  onSelect={ (rowId, rowData) => this.onSelectGender(rowData) }
                />
                <Image source={ triangle_down } style={ styles.imageTriangleDown }/>
              </View>
            </View>
            <View style={ styles.buttonCompleteProfileWrapper }>
              {!this.state.isUploadingFile&&<TouchableOpacity activeOpacity={ .5 } onPress={ () => this.onCompleteProfile() }>
                <View style={ styles.buttonCompleteProfile }>
                  <Text style={ styles.textButton }>Complete Profile</Text>
                </View>  
              </TouchableOpacity>}
              {this.state.isUploadingFile&&
                <View style={ styles.buttonCompleteProfile }>
                  <ActivityIndicator
                    hidesWhenStopped={ true }
                    animating={ true }
                  />
                </View>
                }
            </View>
          </View>
          <View style={ styles.bottomContainer }>            
          </View>
        </Image>
      </View>
    );
  }
}

export default connect(state => ({
  status: state.profile.status
  }),
  (dispatch) => ({
    actions: bindActionCreators(profileActions, dispatch)
  })
)(SetupProfile);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    width: screenWidth,
    height: screenHeight,
  },
  descriptionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  photoContainer: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoWrapper: {
    width: screenWidth * 0.22,
    height:  screenWidth * 0.22,
    borderRadius: 5,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCamera: {
    width: 22,
    height: 20,
  },
  imagePhoto: {
    width: screenWidth * 0.22,
    height:  screenWidth * 0.22,
    borderRadius: 5,
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 40,
  },
  inputRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
    alignSelf: 'stretch',
  },
  bottomContainer: {
    flex: 1.5,
  },
  textTitle: {
    color: commonColors.title,
    fontFamily: 'Blanch',
    fontSize: 48,
    backgroundColor: 'transparent',
  },
  textDescription: {
    color: commonColors.title,
    fontFamily: 'OpenSans-Semibold',
    fontSize: 12,
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  buttonCompleteProfileWrapper: {
    alignSelf: 'stretch',
  },
  buttonCompleteProfile: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: commonColors.theme,
    borderRadius: 4,
    borderWidth: 4,
    borderColor: commonColors.theme,
    borderStyle: 'solid',
    marginTop: 10,
    height: 40,
  },
  textButton: {
    color: '#fff',
    fontFamily: 'Open Sans',
    fontWeight: 'bold',
    fontSize: 14,
    backgroundColor: 'transparent',
  },
  input: {
    alignSelf: 'stretch',
    fontSize: 14,
    // color: commonColors.title,
    height: 45,
    borderColor: '#fff',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 4,
  },
  birthdayWrapper: {
    height: 45,
    width: (screenWidth - 80) / 2 - 3,
    borderColor: '#fff',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 4,
  },
  dropdown: {
    width: (screenWidth - 80) / 2 - 3,
    height: 45,
    borderColor: '#fff',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 4,
    marginLeft: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownStyle: {
    height: 140,
    width: (screenWidth - 80) / 2 - 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropDownPlaceholderText: {
    width: (screenWidth - 80) / 2 - 3,
    color: commonColors.placeholderText,
    fontFamily: 'Open Sans',
    fontSize: 14,
    textAlign: 'center',
  },
  dropDownText: {
    width: (screenWidth - 80) / 2 - 3,
    fontFamily: 'Open Sans',
    fontSize: 14,
    textAlign: 'center',
  },
  dropDownWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  imageTriangleDown: {
    width: 8,
    height: 6,
    position: 'absolute',
    right: 10,
  },
});