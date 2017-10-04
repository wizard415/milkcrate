import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image,
    Surface,
    Group,
    TouchableOpacity,
    Platform,
    Button,
    Animated,
    Easing,
    Dimensions
} from 'react-native';
import * as _ from 'underscore'

var HOME = require('../../../assets/imgs/chart/home.png');
var search = require('../../../assets/imgs/chart/search.png');
var w_search = require('../../../assets/imgs/chart/w_search.png');
var alert = require('../../../assets/imgs/chart/alert.png');
var you = require('../../../assets/imgs/chart/you.png');
var setting = require('../../../assets/imgs/chart/setting.png');
var COMMUNITY = require('../../../assets/imgs/chart/icons/community-white.png');
var b_COMMUNITY = require('../../../assets/imgs/chart/icons/community-blue.png');
var DIET = require('../../../assets/imgs/chart/icons/diet-white.png');
var b_DIET = require('../../../assets/imgs/chart/icons/diet-blue.png');
var SHOPPING = require('../../../assets/imgs/chart/icons/shopping-white.png');
var b_SHOPPING = require('../../../assets/imgs/chart/icons/shopping-blue.png');
var TRANSIT = require('../../../assets/imgs/chart/icons/transit-white.png');
var b_TRANSIT = require('../../../assets/imgs/chart/icons/transit-blue.png');
var HOME = require('../../../assets/imgs/chart/icons/home-white.png');
var b_HOME = require('../../../assets/imgs/chart/icons/home-blue.png');
var WASTE = require('../../../assets/imgs/chart/icons/waste-white.png');
var b_WASTE = require('../../../assets/imgs/chart/icons/waste-blue.png');
var ic_upper = require('../../../assets/imgs/chart/icons/ic_upper.png');
var sample_logo = require('../../../assets/imgs/chart/sample_logo.png');
var sample_avatar = require('../../../assets/imgs/chart/sample_avatar.png');

var profile = require('../../../assets/imgs/chart/profile.png');
var line = require('../../../assets/imgs/chart/line.png');

import Svg,{
    Circle,
    Ellipse,
    G,
    LinearGradient,
    RadialGradient,
    Line,
    Path,
    Polygon,
    Polyline,
    Rect,
    Symbol,
    Use,
    Defs,
    Stop
} from 'react-native-svg';
const { width, height } = Dimensions.get('window');
var chartRadius = 150
var chartInnerRadius = 35
var rate = 0.50;
var itemKeys = ['HOME','COMMUNITY', 'DIET', 'TRANSIT', 'SHOPPING', 'WASTE']
var chartDataList = [
  {"week":"week1", "HOME": 10, "COMMUNITY": 16, "DIET": 87, "TRANSIT": 43, "SHOPPING": 36, "WASTE": 43},
  {"week":"week2", "HOME": 58, "COMMUNITY": 18, "DIET": 63, "TRANSIT": 78, "SHOPPING": 20, "WASTE": 60},
  {"week":"week3", "HOME": 30, "COMMUNITY": 65, "DIET": 30, "TRANSIT": 20, "SHOPPING": 90, "WASTE": 70},
  {"week":"week4", "HOME": 40, "COMMUNITY": 78, "DIET": 28, "TRANSIT": 32, "SHOPPING": 70, "WASTE": 5},
]

var colors = ["#F69274", "#F0B074", "#EAD575", "#B7D099", "#82CCBE"];
var colors2 = ["#5E8AA3", "#B7D099", "#EAD575", "#82CCBE", "#F69274", "#95B5D8"];

export default class PieChart extends Component {

  constructor(props) {
    super(props);

    this.state={
      viewMode:0,
      animIndex:[0,0,0,0,0,0],
      labelOpacity:[new Animated.Value(0),new Animated.Value(0),new Animated.Value(0),new Animated.Value(0),new Animated.Value(0),new Animated.Value(0)],
      currentWeek:'week1',
      chartValue:[0,0,0,0,0,0],
      showChartValue:[false,false,false,false,false,false],
      chartMode:'Mode1',
      logoMode:'avatar'
    }
    this.animationHandler = []
    this.oldScaleData = [0,0,0,0,0,0]
    this.newScaleData = [0,0,0,0,0,0]
    this.oldChartData = {
      "HOME": 0, "COMMUNITY": 0, "DIET": 0, "TRANSIT": 0, "SHOPPING": 0, "WASTE": 0
    }
  }

  componentDidMount(){
    this.hasMounted = true
  }

  componentWillReceiveProps(newProps) {

    var chartData = newProps.chartData;
    if(!_.isEqual(chartData, this.oldChartData)) {
      this.updateChartData(this.props.chartData)
    }
  }

  componentWillUnmount() {
    this.hasMounted = false
    for(var i = 0 ; i < 6 ; i++) {
      if(this.animationHandler[i])
        clearInterval(this.animationHandler[i]);
    }
  }

  updateChartData=(data)=>{
    this.updateChart(this.oldChartData, data)
  }

  updateChartMode=(mode)=>{
    this.hasMounted && this.setState({
      chartMode:mode
    })
  }

  updateLogoMode=(mode)=>{
    this.hasMounted && this.setState({
      logoMode:mode
    })
  }

  updateChart=(oldData, newData)=>{
    //get new Scale Data
    var total = newData.HOME + newData.COMMUNITY + newData.DIET + newData.TRANSIT + newData.SHOPPING + newData.WASTE
    var maxValue = _.max([newData.HOME, newData.COMMUNITY, newData.DIET, newData.TRANSIT, newData.SHOPPING, newData.WASTE])
    if(maxValue == 0) return;
    var unitScale = maxValue/5;//total < 20 ? 1 : total / 20;
    var newScaleData = [
      this.getScaleValue(newData.HOME/unitScale),
      this.getScaleValue(newData.COMMUNITY/unitScale),
      this.getScaleValue(newData.DIET/unitScale),
      this.getScaleValue(newData.TRANSIT/unitScale),
      this.getScaleValue(newData.SHOPPING/unitScale),
      this.getScaleValue(newData.WASTE/unitScale),
    ]
    this.newScaleData = newScaleData

    newScaleData.map((newData, idx)=>{
      console.log(newData, idx)
      this.updateChartSlice(this.oldScaleData[idx], newScaleData[idx], idx)
    })
  }

  updateChartSliceValue=(idx)=>{
    var itemValue = this.props.chartData[itemKeys[idx]]
    this.state.chartValue[idx] = itemValue
    this.hasMounted && this.setState({
      chartValue:this.state.chartValue
    })
  }

  updateChartSlice=(oldScale, newScale, idx) => {
    //console.log('updateChartSlice', oldScale, newScale, idx)
    if(oldScale == newScale) {
      //only replace label Text
      this.updateChartSliceValue(idx);
    } else {
      var chartValue = this.state.showChartValue
      chartValue[idx] = true;
      this.state.animIndex[idx] = newScale
      //console.log("showChartValue", this.state.showChartValue)
      this.hasMounted && this.setState({
        showChartValue:chartValue,
        animIndex:this.state.animIndex
      })
      this.updateChartSliceValue(idx);
      this.oldScaleData[idx] = newScale;

      /*{
        var chartValue = this.state.showChartValue
        chartValue[idx] = false;
        //console.log("showChartValue", this.state.showChartValue)
        this.hasMounted && this.setState({
          showChartValue:chartValue
        })


        var rateIndex = oldScale < newScale?rate:rate * (-1);
        //hide current label & icon

        this.animationHandler[idx] = setInterval(()=>{
          if(this.state.animIndex[idx] == newScale) {
            clearInterval(this.animationHandler[idx]);
            this.animationHandler[idx] = null;

            var chartValue = this.state.showChartValue
            chartValue[idx] = true;
            //console.log("showChartValue", this.state.showChartValue)
            this.hasMounted && this.setState({
              showChartValue:chartValue
            })
            this.updateChartSliceValue(idx);
            this.oldScaleData[idx] = newScale;
            return;
          } else {
            var animIndex = this.state.animIndex
            animIndex[idx] = Math.round((animIndex[idx] + rateIndex) * 100)/100
            this.hasMounted && this.setState({
              animIndex:animIndex
            })
          }
        }, 40);
      }*/

    }
  }

  getScaleValue(val) {
    if(val < 1) return 1;
    if(val > 5) return 5;

    return Math.round(val);
  }

  showLabelAnimation() {

    Animated.timing(this.state.labelOpacity, {
      duration: 1000,
      toValue: 1,
      easing: Easing.out(Easing.cubic),
    }).start(()=>{

    })
  }

  getColors(index) {
    if (this.state.logoMode == 'avatar'){
      return colors2[index];
    }
    if(this.oldScaleData[index] == this.newScaleData[index]) {
      var currentScale = this.state.animIndex[index];
      return colors[currentScale-1]
    } else {
      var currentScale = this.state.animIndex[index];
      var color1 = this.hexToRgb(colors[Math.max(this.oldScaleData[index]-1, 0)]);
      var color2 = this.hexToRgb(colors[Math.max(this.newScaleData[index]-1, 0)]);
      var weight = (currentScale - this.oldScaleData[index]) / (this.newScaleData[index] - this.oldScaleData[index])
      var rgbColor = this.pickHex(color1, color2, 1-weight)
      return this.rgbToHex(rgbColor[0], rgbColor[1], rgbColor[2])
    }
  }

  pickHex(color1, color2, weight) {
    var p = weight;
    var w = p * 2 - 1;
    var w1 = (w/1+1) / 2;
    var w2 = 1 - w1;
    var rgb = [Math.round(color1.r * w1 + color2.r * w2),
      Math.round(color1.g * w1 + color2.g * w2),
      Math.round(color1.b * w1 + color2.b * w2)];
    return rgb;
  }

  hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  changeViewMode(mode) {
    this.hasMounted && this.setState({
      viewMode:mode
    })
  }

  renderPieChart() {
    if(this.state.viewMode != 0) return null;

    const {
        avatar,
        defaultAvatar,
        avatarBackColor,
    } = this.props;

    return (
        <View style={styles.chartContainer}>
          <View style={{width:chartRadius * 2,height:chartRadius * 2, justifyContent: 'center',alignItems: 'center'}}>
            <Svg height={chartRadius * 2} width={chartRadius * 2}>
              <G>
                {
                  this.state.chartMode == 'Mode1'&&
                  this.state.animIndex.map( (item, index) => (
                          <Path key={index}
                                d={this._drawPieBack(item, index)}
                                fill={this.getColors(index)}
                                opacity="0.2"
                          />
                      )
                  )
                }

                {
                  this.state.animIndex.map( (item, index) => (
                          <Path key={index}
                                d={this._createPieChart(item, index)}
                                fill={this.getColors(index)} />
                      )
                  )
                }
              </G>
            </Svg>
            <View style = {styles.percentView}>
              { (avatar != '') && <Image style={ [styles.avartar, { backgroundColor: avatarBackColor }] } source={{ uri:avatar }}/> }
              { (avatar == '') && <Image style={ styles.avartar } source={ defaultAvatar }/> }
            </View>
            {
              this.state.animIndex.map(
                  (val, index) => this.renderChartValue(val, index)
              )
            }
            {
              this.state.chartMode == 'Mode2'&&
              this.state.animIndex.map(
                  (val, index) => this.renderChartPercent(val, index)
              )
            }
          </View>
        </View>
    )
  }

  render() {
    return (
        <View style = {styles.container}>
          {
            this.renderPieChart()
          }
        </View>
    );
  }

  renderChartValue=(val, index) =>{
    //console.log("renderChartValue", val, index)
    return (
        <View key={index + 'view'} style = {[this._createPieDetailViewCSS(val, index)]}>
          {
            <Image source = {this._createPieImage(val, index)} style = {{marginRight: 5, marginLeft: 5, width: 20, height: 20, resizeMode: 'contain'}}/>
          }
          {
            <Text style = {this._createPieLabelCSS(val, index)}>{itemKeys[index]}</Text>
          }
          {
            this.state.showChartValue[index]&&this.state.chartMode != 'Mode2'&&
            <Text style = {this._createPiePercentCSS(val, index)}>{this.state.chartValue[index] + ' pts'}</Text>
          }
        </View>
    )
  }

  renderChartPercent=(val, index) =>{
    return (
        <View key={index + 'percent'} style = {[this._createPieDetailPercentCSS(val, index)]}>
          {<Text style = {this._createPiePercentCSS(val, index)}>{this.state.chartValue[index]}</Text>}
        </View>
    )
  }

  _drawPieBack(data, index) {
    var radius = 110;
    var padding = 3;
    var dx = padding * Math.cos(Math.PI / 6 + Math.PI / 6 * (2*index+1));
    var dy = padding * Math.sin(Math.PI / 6 + Math.PI / 6 * (2*index+1));
    var innerRadius = chartInnerRadius - padding;

    var mx1 = chartRadius + (innerRadius) * Math.cos(Math.PI / 6 + Math.PI / 3 * index)+dx;
    var my1 = chartRadius + (innerRadius) * Math.sin(Math.PI / 6 + Math.PI / 3 * index)+dy;
    var l1 = chartRadius + (innerRadius + radius) * Math.cos(Math.PI / 6 + Math.PI / 3 * index)+dx;
    var l2 = chartRadius + (innerRadius + radius) * Math.sin(Math.PI / 6 + Math.PI / 3 * index)+dy;
    var mx11 = chartRadius + (innerRadius) * Math.cos(Math.PI / 6 + Math.PI / 3 * (index + 1))+dx;
    var my12 = chartRadius + (innerRadius) * Math.sin(Math.PI / 6 + Math.PI / 3 * (index + 1))+dy;
    var l11 = chartRadius + (innerRadius + radius) * Math.cos(Math.PI / 6 + Math.PI / 3 * (index + 1))+dx;
    var l12 = chartRadius + (innerRadius + radius) * Math.sin(Math.PI / 6 + Math.PI / 3 * (index + 1))+dy;

    var path1 = "M" + l1 + " " + l2 + " " + "L" + mx1 + " " + my1;
    var path2 = "A" + chartInnerRadius + " " + chartInnerRadius + " 0 0 1 " + mx11 + " " + my12;
    var path3 = "L" + l11 + " " + l12;
    var path4 = "A" + (chartInnerRadius + radius) + " " + (chartInnerRadius + radius) + " 0 0 0 " + l1 + " " + l2;
    return path1 + " " + path2 + " " + path3 + " " + path4;
  }

  _createPieChart(data, index) {
    var padding = 3;
    var radius = 10 + data * 20;
    var innerRadius = chartInnerRadius;
    if(this.state.chartMode == 'Mode2'){
      radius = 13 + data * 11;
      innerRadius = 25;
    }
    innerRadius -= padding;
    var dx = padding * Math.cos(Math.PI / 6 + Math.PI / 6 * (2*index+1));
    var dy = padding * Math.sin(Math.PI / 6 + Math.PI / 6 * (2*index+1));

    var mx1 = chartRadius + (innerRadius) * Math.cos(Math.PI / 6 + Math.PI / 3 * index)+dx;
    var my1 = chartRadius + (innerRadius) * Math.sin(Math.PI / 6 + Math.PI / 3 * index)+dy;
    var l1 = chartRadius + (innerRadius + radius) * Math.cos(Math.PI / 6 + Math.PI / 3 * index)+dx;
    var l2 = chartRadius + (innerRadius + radius) * Math.sin(Math.PI / 6 + Math.PI / 3 * index)+dy;
    var mx11 = chartRadius + (innerRadius) * Math.cos(Math.PI / 6 + Math.PI / 3 * (index + 1))+dx;
    var my12 = chartRadius + (innerRadius) * Math.sin(Math.PI / 6 + Math.PI / 3 * (index + 1))+dy;
    var l11 = chartRadius + (innerRadius + radius) * Math.cos(Math.PI / 6 + Math.PI / 3 * (index + 1))+dx;
    var l12 = chartRadius + (innerRadius + radius) * Math.sin(Math.PI / 6 + Math.PI / 3 * (index + 1))+dy;



    var path1 = "M" + l1 + " " + l2 + " " + "L" + mx1 + " " + my1;
    var path2 = "A" + (innerRadius+padding) + " " + (innerRadius+padding) + " 0 0 1 " + mx11 + " " + my12;
    var path3 = "L" + l11 + " " + l12;
    var path4 = "A" + (innerRadius + radius+padding) + " " + (innerRadius + radius+padding) + " 0 0 0 " + l1 + " " + l2;
    return path1 + " " + path2 + " " + path3 + " " + path4;
  }

  _createPieDetailViewCSS(scale, index) {
    var radius = 10 + scale * 20
    var css = {};
    if (this.state.chartMode == 'Mode2'){
      radius = 0;
      if ( index == 0 || index == 1 || index == 3 || index == 4)
      {
        css['flexDirection'] = 'row';
      }
    }
    css['width'] = 80;
    css['height'] = 80;
    css['justifyContent'] = 'center';
    css['backgroundColor'] = 'transparent';
    css['alignItems'] = 'center';
    css['position'] = 'absolute';
    if(radius > (chartRadius - chartInnerRadius)/2){
      css['left'] = chartRadius + (radius - 5) * Math.cos(Math.PI / 3 + Math.PI / 3 * index) - 40;
      css['top'] = chartRadius + (radius - 5) * Math.sin(Math.PI / 3 + Math.PI / 3 * index) - 40;
    } else {
      css['left'] = chartRadius + (chartRadius-45) * Math.cos(Math.PI / 3 + Math.PI / 3 * index) - 40;
      css['top'] = chartRadius + (chartRadius-45) * Math.sin(Math.PI / 3 + Math.PI / 3 * index) - 40;
    }
    //css['opacity'] = this.state.labelOpacity

    if ( this.state.chartMode == 'Mode2'){
      if ( index == 0 || index == 4 ){
        css['left'] += 14;
      }
      if ( index == 1 || index == 3 ){
        css['left'] -= 10;
      }
    }
    return css;
  }

  _createPieDetailPercentCSS(scale, index) {
    var radius = 15 + scale * 11
    var css = {};
    css['width'] = 80;
    css['height'] = 80;
    css['justifyContent'] = 'center';
    css['backgroundColor'] = 'transparent';
    css['alignItems'] = 'center';
    css['position'] = 'absolute';
    css['left'] = chartRadius + (30 + scale * 8) * Math.cos(Math.PI / 3 + Math.PI / 3 * index) - 40;
    css['top'] = chartRadius + (30 + scale * 8) * Math.sin(Math.PI / 3 + Math.PI / 3 * index) - 40;

    return css;
  }

  _createPieImage(scale, index) {
    var radius = 10 + scale * 20;
    if(this.state.chartMode == 'Mode2'){
      radius = 0;
    }
    switch(index){
      case 0:
        if(radius > (chartRadius - chartInnerRadius)/2) return HOME;
        else return b_HOME;
      case 1:
        if(radius > (chartRadius - chartInnerRadius)/2) return COMMUNITY;
        else return b_COMMUNITY;
      case 2:
        if(radius > (chartRadius - chartInnerRadius)/2) return DIET;
        else return b_DIET;
      case 3:
        if(radius > (chartRadius - chartInnerRadius)/2) return TRANSIT;
        else return b_TRANSIT;
      case 4:
        if(radius > (chartRadius - chartInnerRadius)/2) return SHOPPING;
        else return b_SHOPPING;
      case 5:
        if(radius > (chartRadius - chartInnerRadius)/2) return WASTE;
        else return b_WASTE;
      default:
    }
  }

  _createPiePercentCSS(scale, index) {
    var radius = 10 + scale * 20;
    if ( this.state.chartMode == 'Mode2'){
      radius = 110;
    }
    var css = {};
    css['textAlign'] = 'center';
    css['fontSize'] = 9;
    if ( this.state.logoMode == 'avatar'){
      css['fontSize'] = 16;
    }
    if(radius > (chartRadius - chartInnerRadius)/2) css['color'] = 'white';
    else css['color'] = '#5e8aa3';
    css['fontWeight'] = 'bold';
    return css;
  }

  _createPieLabelCSS(scale, index) {
    var radius = 10 + scale * 20
    if ( this.state.chartMode == 'Mode2'){
      radius = 0;
    }
    var css = {};
    css['textAlign'] = 'center';
    css['fontSize'] = 8;
    if(radius > (chartRadius - chartInnerRadius)/2) css['color'] = 'white';
    else css['color'] = '#5e8aa3';
    css['fontWeight'] = 'bold';
    return css;
  }

  _createPieCenter(){
    var css = {};
    css['width'] = 64;
    css['height'] = 64;
    css['resizeMode'] = 'contain';
    if ( this.state.chartMode == 'Mode2'){
      css['width'] = 44;
      css['height'] = 44;
    }
    if ( this.state.logoMode == 'logo'){
      css['width'] -= 4;
      css['height'] -= 4;
    }
    return css;
  }
}

const styles = StyleSheet.create({
  container:{
    flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative',width: null,
  },
  chartContainer:{
    flex:1,justifyContent: 'center',alignItems: 'center', width:width,marginTop:20,
  },
  avartar:{
    width:64,
    height:64,
    resizeMode:'contain',
    borderRadius: 32
  },
  percentView: {
    position: 'absolute',
    left: 118,
    top: 118,
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekLabel:{
    marginLeft:10,
    marginRight:10
  }
})