import React, { Component, PropTypes } from 'react';
import {
  TextInput,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import dismissKeyboard from 'react-native/Libraries/Utilities/dismissKeyboard';
import timer from 'react-native-timer';

export default class SearchBar extends Component {

  static propTypes = {
    height: PropTypes.number.isRequired,
    returnKeyType: PropTypes.string,
    onSearchChange: PropTypes.func,
    onEndEditing: PropTypes.func,
    onSubmitEditing: PropTypes.func,
    placeholder: PropTypes.string,
    padding: PropTypes.number,
    paddingLeft: PropTypes.number,
    paddingRight: PropTypes.number,
    paddingTop: PropTypes.number,
    paddingBottom: PropTypes.number,
    inputStyle: PropTypes.object,
    iconCloseName: PropTypes.string,
    iconSearchName: PropTypes.string,
    placeholderColor: PropTypes.string,
    iconColor: PropTypes.string,
  }

  static defaultProps = {
    onSearchChange: () => {},
    onEndEditing: () => {},
    onSubmitEditing: () => {},
    inputStyle: {},
    iconCloseName: "md-close-circle",
    iconSearchName: "md-search",
    placeholder: "Search",
    returnKeyType: "search",
    padding: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
    placeholderColor: "#bdbdbd",
    iconColor: "#737373",
  }

  constructor(props) {
    super(props);

    this.state = {
      isOnFocus: false,
      textSearch: this.props.query,
    };
    
    this._onFocus = this._onFocus.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._onClose = this._onClose.bind(this);
  }

  componentDidMount() {
    this.hasMounted = true
    if (this.props.searchAutoFocus == true){
      this._textInput.focus();
      this.launchKeyboard();
    }
  }

  componentWillUnmount() {
    this.hasMounted = false
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.searchAutoFocus == true){
      this._textInput.focus();
      this.launchKeyboard();
    }

    if (nextProps.isCancel == true) {
      this._onCancel();
    }
  }

  launchKeyboard() {
    timer.setTimeout( this, 'LaunchKeyboard', () => {
      timer.clearTimeout(this, 'LaunchKeyboard');
      this._textInput.focus();
    }, 300);
  }

  _onClose() {
    this._textInput.setNativeProps({ text: '' });
    this.props.onSearchChange('');
    this.hasMounted && this.setState({ textSearch: '' });

    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  _onFocus() {
    // this._textInput.setNativeProps({ text: '' });
    this.hasMounted && this.setState({ isOnFocus: true });
    if (this.props.onFocus) {
      this.props.onFocus();
    }
  }

  _onBlur() {
    this.hasMounted && this.setState({ isOnFocus: false });
    if (this.props.onBlur) {
      this.props.onBlur();
    }
    this._dismissKeyboard();
  }

  _onSearchChange(text) {
    this.hasMounted && this.setState({ textSearch: text });
    if (this.props.onSearchChange) {
      this.props.onSearchChange(text);
    }
  }

  _onCancel() {
    this._textInput.setNativeProps({ text: '' });
    // this.props.onSearchChange('');
    this.hasMounted && this.setState({ textSearch: '' });
    this._dismissKeyboard();
  }

  _onGoToSearchScreen() {
    if (this.props.onGoSearchScreen) {
      this.props.onGoSearchScreen();
    }
  }

  _dismissKeyboard () {
    dismissKeyboard()
  }

  render() {
    const {
      height,
      returnKeyType,
      onSearchChange,
      placeholder,
      padding,
      inputStyle,
      iconColor,
      iconSearchName,
      iconCloseName,
      placeholderColor,
      paddingLeft,
      paddingRight,
      paddingTop,
      paddingBottom,
      searchMode,
    } = this.props;

    let { iconSize } = this.props;
    iconSize = typeof iconSize !== 'undefined' ? iconSize : height * 0.5;

    return (
      <View
        onStartShouldSetResponder={ this._dismissKeyboard }
        style={{ padding: padding, paddingLeft: paddingLeft, paddingRight: paddingRight, paddingTop: paddingTop, paddingBottom: paddingBottom, }}
      >
        <View
          style={
            [
              styles.searchBar,
              {
                height: height,
                paddingLeft: height * 0.25,
              },
              inputStyle
            ]
          }
        >
          <Icon
            name={ iconSearchName } size={ height * 0.7 }
            color={ iconColor }
          />
          <TextInput
            autoCapitalize="none"
            autoCorrect={ false }
            ref={ (c) => (this._textInput = c) }
            returnKeyType={ returnKeyType }
            onFocus={ this._onFocus }
            onBlur={ this._onBlur }
            onChangeText={ (text) => this._onSearchChange(text) }
            onEndEditing={ this.props.onEndEditing }
            onSubmitEditing={ this.props.onSubmitEditing }
            text={ this.state.textSearch }
            placeholder={ placeholder }
            placeholderTextColor={ placeholderColor }
            underlineColorAndroid="transparent"
            style={
              [styles.searchBarInput,
                {
                  paddingLeft: height * 0.3,
                  fontSize: height * 0.5,
                }
              ]
            }
          />
          {
            (this.state.isOnFocus && this.state.textSearch.length > 0) &&
            <TouchableOpacity onPress={ () => this._onClose() }>
              <Icon
                style={{ paddingHorizontal: height * 0.2 }}
                name={ iconCloseName} size={ iconSize }
                color={ iconColor }
              />
            </TouchableOpacity>
          }
          

          { 
            !searchMode && 
            <TouchableOpacity 
              onPress={ () => this._onGoToSearchScreen() }
              style={ styles.goButton }
            /> 
          }
      
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0000001e',
    borderRadius: 5,
  },
  searchBarInput: {
    flex: 1,
    fontWeight: 'normal',
    color: '#fff',
    backgroundColor: 'transparent',
    height: (Platform.OS === 'android') ? 40 : 28,
  },
  goButton: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
});

