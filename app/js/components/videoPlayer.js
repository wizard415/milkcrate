import React, { Component, PropTypes } from 'react';
import { 
  View, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Platform,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

import Video from 'react-native-video'; // eslint-disable-line
import timer from 'react-native-timer';

const styles = StyleSheet.create({
  preloadingPlaceholder: {
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playArrow: {
    color: 'white',
  },
  video: {
    backgroundColor: 'black',
  },
  controls: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    height: 48,
    marginTop: -48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playControl: {
    color: 'white',
    padding: 8,
  },
  extraControl: {
    color: 'white',
    padding: 8,
  },
  seekBar: {
    alignItems: 'center',
    height: 30,
    flexGrow: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginLeft: -10,
    marginRight: -5,
  },
  seekBarFullWidth: {
    marginLeft: 0,
    marginRight: 0,
    paddingHorizontal: 0,
    marginTop: -3,
    height: 3,
  },
  seekBarProgress: {
    height: 3,
    backgroundColor: '#F00',
  },
  seekBarKnob: {
    width: 20,
    height: 20,
    marginHorizontal: -8,
    marginVertical: -10,
    borderRadius: 10,
    backgroundColor: '#F00',
    transform: [{ scale: 0.8 }],
    zIndex: 1,
  },
  seekBarBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    height: 3,
  },
  overlayButton: {
    flex: 1,
  },
});

export default class VideoPlayer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isStarted: props.autoplay,
      isPlaying: props.autoplay,
      width: 200,
      progress: 0,
      isMuted: props.defaultMuted,
      isControlsVisible: !props.hideControlsOnStart,
      duration: 0,
      isSeeking: false,
    };

    this.seekBarWidth = 200;
    this.wasPlayingBeforeSeek = props.autoplay;
    this.seekTouchStart = 0;
    this.seekProgressStart = 0;

    this.onLayout = this.onLayout.bind(this);
    this.onStartPress = this.onStartPress.bind(this);
    this.onProgress = this.onProgress.bind(this);
    this.onEnd = this.onEnd.bind(this);
    this.onLoad = this.onLoad.bind(this);
    this.onPlayPress = this.onPlayPress.bind(this);
    this.onMutePress = this.onMutePress.bind(this);
    this.showControls = this.showControls.bind(this);
    this.onToggleFullScreen = this.onToggleFullScreen.bind(this);
    this.onSeekBarLayout = this.onSeekBarLayout.bind(this);
    this.onSeekGrant = this.onSeekGrant.bind(this);
    this.onSeekRelease = this.onSeekRelease.bind(this);
    this.onSeek = this.onSeek.bind(this);
    this.onFullscreenPlayerWillDismiss = this.onFullscreenPlayerWillDismiss.bind(this);
    this.onClose = this.onClose.bind(this);


    this.player = null;
    this._isMounted = false;
  }

  componentDidMount() {
    this._isMounted = true;
    if (this.props.autoplay) {
      this.hideControls();
      // this.setFullScreen();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  onLayout(event) {
    const { width } = event.nativeEvent.layout;
    this._isMounted && this.setState({
      width,
    });
  }

  onStartPress() {
    this._isMounted && this.setState({
      isPlaying: true,
      isStarted: true,
    });
    this.hideControls();

    // this.setFullScreen();
  }

  onProgress(event) {
    if (this.state.isSeeking) {
      return;
    }
    if (this.props.onProgress) {
      this.props.onProgress(event);
    }
    this._isMounted && this.setState({
      progress: event.currentTime / (this.props.duration || this.state.duration),
    });
  }

  onEnd(event) {
    if (this.props.onEnd) {
      this.props.onEnd(event);
    }

    if (this.props.endWithThumbnail) {
      this._isMounted && this.setState({ isStarted: false });
    }

    this.player.seek(0);
    if (!this.props.loop) {
      this._isMounted && this.setState({
        isPlaying: false,
      });
    }
  }

  onLoad(event) {
    if (this.props.onLoad) {
      this.props.onLoad(event);
    }

    const { duration } = event;
    this._isMounted && this.setState({ duration });
  }

  onPlayPress() {
    this._isMounted && this.setState({
      isPlaying: !this.state.isPlaying,
    });
    this.showControls();
  }

  onMutePress() {
    this._isMounted && this.setState({
      isMuted: !this.state.isMuted,
    });
    this.showControls();
  }

  onToggleFullScreen() {
    this.player.presentFullscreenPlayer();
  }

  onClose() {
    this._isMounted && this.setState({
      isStarted: false,
      isPlaying: false,
    });

    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  setFullScreen() {
    if (Platform.OS === 'android')
      return;

    timer.setTimeout( this, 'FullScreenVideoPlayer', () => {

      if (this.player === null)
        return;

      timer.clearTimeout(this, 'FullScreenVideoPlayer');

      this.onToggleFullScreen();
    }, 100);
  }

  onSeekBarLayout({ nativeEvent }) {
    const customStyle = this.props.customStyles.seekBar;
    let padding = 0;

    if (customStyle && customStyle.paddingHorizontal) {
      padding = customStyle.paddingHorizontal * 2;
    } else if (customStyle) {
      padding = customStyle.paddingLeft || 0;
      padding += customStyle.paddingRight ? customStyle.paddingRight : 0;
    } else {
      padding = 20;
    }

    this.seekBarWidth = nativeEvent.layout.width - padding;
  }

  onSeekStartResponder() {
    return true;
  }

  onSeekMoveResponder() {
    return true;
  }

  onSeekGrant(e) {
    this.seekTouchStart = e.nativeEvent.pageX;
    this.seekProgressStart = this.state.progress;
    this.wasPlayingBeforeSeek = this.state.isPlaying;
    this._isMounted && this.setState({
      isSeeking: true,
      isPlaying: false,
    });
  }

  onSeekRelease() {
    this._isMounted && this.setState({
      isSeeking: false,
      isPlaying: this.wasPlayingBeforeSeek,
    });
    this.showControls();
  }

  onSeek(e) {
    const diff = e.nativeEvent.pageX - this.seekTouchStart;
    const ratio = 100 / this.seekBarWidth;
    const progress = this.seekProgressStart + ((ratio * diff) / 100);

    this._isMounted && this.setState({
      progress,
    });

    this.player.seek(progress * this.state.duration);
  }

  onFullscreenPlayerWillDismiss(event) {
    if (this.props.onFullscreenPlayerWillDismiss) {
      this.props.onFullscreenPlayerWillDismiss(event);
    }

    this._isMounted && this.setState({ isStarted: false });
  }

  getSizeStyles() {
    const { 
      videoWidth, 
      videoHeight,
    } = this.props;

    const { 
      width,
    } = this.state;

    const ratio = videoHeight / videoWidth;

    return {
      height: width * ratio,
      width,
    };
  }

  hideControls() {
    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout);
      this.controlsTimeout = null;
    }

    this.controlsTimeout = setTimeout(() => {
      if (this._isMounted === true) {
        this.setState({ isControlsVisible: false });
      }
    }, this.props.controlsTimeout);
  }

  showControls() {
    this._isMounted && this.setState({
      isControlsVisible: true,
    });
    this.hideControls();
  }

  renderStartButton() {
    const { customStyles } = this.props;
    return (
      <TouchableOpacity
        style={ [styles.playButton, customStyles.playButton] }
        onPress={ this.onStartPress }
      >
        <Icon 
          style={ [styles.playArrow, customStyles.playArrow] } 
          name="play-arrow" 
          size={ 42 } 
        />
      </TouchableOpacity>
    );
  }

  renderThumbnail() {
    const { thumbnail, 
      style, 
      customStyles, 
      ...props,
    } = this.props;

    return (
      <Image
        { ...props }
        style={[
          styles.thumbnail,
          this.getSizeStyles(),
          style,
          customStyles.thumbnail,
        ]}
        source={ thumbnail }
      >
        { this.renderStartButton() }
      </Image>
    );
  }

  renderSeekBar(fullWidth) {
    const { customStyles } = this.props;

    return (
      <View
        style={[
          styles.seekBar,
          fullWidth ? styles.seekBarFullWidth : {},
          customStyles.seekBar,
          fullWidth ? customStyles.seekBarFullWidth : {},
        ]}
        onLayout={ this.onSeekBarLayout }
      >
        <View
          style={[
            { flexGrow: this.state.progress },
            styles.seekBarProgress,
            customStyles.seekBarProgress,
          ]}
        />
        { !fullWidth ? (
          <View
            style={[
              styles.seekBarKnob,
              customStyles.seekBarKnob,
              this.state.isSeeking ? { transform: [{ scale: 1 }] } : {},
              this.state.isSeeking ? customStyles.seekBarKnobSeeking : {},
            ]}
            hitSlop={{ top: 20, bottom: 20, left: 10, right: 20 }}
            onStartShouldSetResponder={ this.onSeekStartResponder }
            onMoveShouldSetPanResponder={ this.onSeekMoveResponder }
            onResponderGrant={ this.onSeekGrant }
            onResponderMove={ this.onSeek }
            onResponderRelease={ this.onSeekRelease }
            onResponderTerminate={ this.onSeekRelease }
          />
        ) : null }
        <View style={ [styles.seekBarBackground, { flexGrow: 1 - this.state.progress }] }/>
      </View>
    );
  }

  renderControls() {
    const { 
      customStyles,
    } = this.props;

    return (
      <View style={ [styles.controls, customStyles.controls] }>
       <TouchableOpacity 
          onPress={ this.onClose } 
          style={ customStyles.controlButton }
        >
          <SimpleLineIcons
            style={ [styles.extraControl, customStyles.controlIcon] }
            name="close"
            size={ 32 }
          />
        </TouchableOpacity>
      
        <TouchableOpacity
          onPress={ this.onPlayPress }
          style={ [customStyles.controlButton, customStyles.playControl] }
        >
          <Icon
            style={ [styles.playControl, customStyles.controlIcon, customStyles.playIcon] }
            name={ this.state.isPlaying ? 'pause' : 'play-arrow' }
            size={ 32 }
          />
        </TouchableOpacity>
        { this.renderSeekBar() }
        { this.props.muted ? null : (
          <TouchableOpacity 
            onPress={ this.onMutePress } 
            style={ customStyles.controlButton }
          >
            <Icon
              style={ [styles.extraControl, customStyles.controlIcon] }
              name={ this.state.isMuted ? 'volume-off' : 'volume-up' }
              size={ 24 }
            />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  renderVideo() {
    const {
      video,
      style,
      resizeMode,
      customStyles,
      ...props,
    } = this.props;

    return (
      <View>
        <Video
          { ...props }
          style={[
            styles.video,
            this.getSizeStyles(),
            style,
            customStyles.video,
          ]}
          ref={ p => { this.player = p; }}
          muted={ this.props.muted || this.state.isMuted }
          paused={ !this.state.isPlaying }
          onProgress={ this.onProgress }
          onEnd={ this.onEnd }
          onLoad={ this.onLoad }
          source={ video }
          resizeMode={ resizeMode }
          onFullscreenPlayerWillDismiss={ this.onFullscreenPlayerWillDismiss }
          onVideoFullscreenPlayerDidDismiss={ this.onVideoFullscreenPlayerDidDismiss }
        />
        <View
          style={[
            this.getSizeStyles(),
            { marginTop: -this.getSizeStyles().height },
          ]}
        >
          <TouchableOpacity 
            style={ styles.overlayButton } 
            onPress={ this.showControls } 
          />
        </View>
        { ((!this.state.isPlaying) || this.state.isControlsVisible)
          ? this.renderControls() : this.renderSeekBar(true)}
      </View>
    );
  }

  renderContent() {
    const { 
      thumbnail, 
      style,
    } = this.props;
    
    const { 
      isStarted,
    } = this.state;

    if (!isStarted && thumbnail) {
      return this.renderThumbnail();
    } else if (!isStarted) {
      return (
        <View style={ [styles.preloadingPlaceholder, this.getSizeStyles(), style] }>
          { this.renderStartButton() }
        </View>
      );
    }
    
    return this.renderVideo();
  }

  render() {
    return (
      <View 
        onLayout={ this.onLayout } 
        style={ this.props.customStyles.wrapper }
      >
        { this.renderContent() }
      </View>
    );
  }
}

VideoPlayer.propTypes = {
  video: Video.propTypes.source,
  thumbnail: Image.propTypes.source,
  videoWidth: PropTypes.number,
  videoHeight: PropTypes.number,
  duration: PropTypes.number,
  autoplay: PropTypes.bool,
  defaultMuted: PropTypes.bool,
  muted: PropTypes.bool,
  style: View.propTypes.style,
  controlsTimeout: PropTypes.number,
  loop: PropTypes.bool,
  resizeMode: Video.propTypes.resizeMode,
  hideControlsOnStart: PropTypes.bool,
  endWithThumbnail: PropTypes.bool,
  customStyles: PropTypes.shape({
    wrapper: View.propTypes.style,
    video: Video.propTypes.style,
    controls: View.propTypes.style,
    playControl: TouchableOpacity.propTypes.style,
    controlButton: TouchableOpacity.propTypes.style,
    controlIcon: Icon.propTypes.style,
    playIcon: Icon.propTypes.style,
    seekBar: View.propTypes.style,
    seekBarFullWidth: View.propTypes.style,
    seekBarProgress: View.propTypes.style,
    seekBarKnob: View.propTypes.style,
    seekBarKnobSeeking: View.propTypes.style,
    seekBarBackground: View.propTypes.style,
    thumbnail: Image.propTypes.style,
    playButton: TouchableOpacity.propTypes.style,
    playArrow: Icon.propTypes.style,
  }),
  onEnd: PropTypes.func,
  onProgress: PropTypes.func,
  onLoad: PropTypes.func,
  onFullscreenPlayerWillDismiss: PropTypes.func,
  onClose: PropTypes.func,
};

VideoPlayer.defaultProps = {
  videoWidth: 1280,
  videoHeight: 720,
  autoplay: false,
  controlsTimeout: 2000,
  loop: false,
  resizeMode: 'contain',
  customStyles: {},
};
