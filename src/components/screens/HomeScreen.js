
var _ = require('lodash')

//LIB
import React  from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Text,
  Image
} from 'react-native';

var {Actions} = require('react-native-router-flux');
import { connect } from 'react-redux';
import {Icon} from 'native-base';
//action
import UserActions_MiddleWare from '../../actions/UserActions_MiddleWare'
//components
import MapView from 'react-native-maps';
var Define = require('../../Define');
var Debug = require('../../Util/Debug');
var Themes = require('../../Themes');
var Util = require('../../Util/Util');
var Include = require('../../Include');

var {popupActions} = require('../popups/PopupManager');
var {globalVariableManager}= require('../modules/GlobalVariableManager');
var locationManager = require('../modules/LocationManager');


var ButtonWrap = require('../elements/ButtonWrap');

//screens
import Screen from './Screen'
import PickCardTypeScreen from './PickCardTypeScreen'

// popups
import DefaultPopup from '../popups/DefaultPopup'
import Carousel, { ParallaxImage } from 'react-native-snap-carousel';
import AntIcon from 'react-native-vector-icons/AntDesign';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import * as Animatable from 'react-native-animatable';

// actions

//variable

// var styles = StyleSheet.create({
//
// })

//

class HomeScreen extends Screen{
  static componentName = 'ContainerScreen'
  static sceneConfig ={
    ...Screen.sceneConfig
  }
  // static defaultProps = {}
  // static propTypes = {}
  constructor(props){
    super(props);
    this.state = _.merge(this.state,{
      listPlaces:[],
      slideIndex:0,
      renderServices:false,
      currentService:'',
      locationName:''
    })
    this._renderItem = this._renderItem.bind(this);
    this.renderServices = this.renderServices.bind(this);
    this.setLocation = this.setLocation.bind(this);
  }
  // static renderRightButton(scene){
  //   return (
  //     <View style={Themes.current.screen.rightButtonWrapNavBar}>
  //       <Include.Text>RightButton</Include.Text>
  //     </View>
  //   )
  // }
  // static renderLeftButton(scene){
  //   return (
  //     <View style={Themes.current.screen.leftButtonWrapNavBar}>
  //       <Include.Text>LeftButton</Include.Text>
  //     </View>
  //   )
  // }
  // static renderTitle(scene){
  //   return(
  //     <View style={Themes.current.screen.titleWrapNavBarCenter}>
  //       <Include.Text style={Themes.current.text.navBartitle}>Trang chủ</Include.Text>
  //     </View>
  //   )
  // }

  onRefresh(){
    super.onRefresh();
    var {dispatch} = this.props;
  }

  onGetMore(){
    super.onGetMore();
    var {dispatch} = this.props;
  }
  renderServices() {
    const {dispatch} = this.props;
    if(!this.state.renderServices) {
      return null
    }
    return(
      <Animatable.View
        animation="fadeInDownBig"
        easing="linear"
        duration={400}
        style={{position:'absolute', top:24, left:0, right:0, elevation:10, backgroundColor:'#fff', alignItems:'center', paddingVertical:15}}
        >
          <ButtonWrap
            onPress={() => {
              this.setState({renderServices:false})
            }}
          >
            <View style={{position:'absolute', top:5, right:5}}>
              <AntIcon name={'closecircleo'} style={{fontSize:20}}/>
            </View>
          </ButtonWrap>
          <Include.Text style={{color:'#00a8ff', fontSize:16, textAlign:'center', paddingBottom:10}}>Chọn dịch vụ xung quanh bạn:</Include.Text>
          <View style={{flexDirection:'row', flexWrap:'wrap', alignItems:'center', justifyContent:'center'}}>
            {this.state.services.map((service) => {
              return(
                <ButtonWrap
                  onPress={() => {
                    dispatch(UserActions_MiddleWare.placesSearch({
                      type:service.key,
                      location:[this.state.location.latitude, this.state.location.longitude]
                    }))
                    .then((result) => {
                      this.setState({
                        listPlaces:result.res.data,
                        renderServices:false,
                        slideIndex:0,
                        currentService:service.key
                      })
                      this._carousel._snapToItem(0);
                    })
                  }}
                >
                  <View style={{justifyContent:'center', alignItems:'center', borderRadius:5, width:80, height:80, marginHorizontal:5, marginVertical:5, backgroundColor:'#fff', elevation:4}}>
                    <View style={{width:50, height:50, borderRadius:25, backgroundColor:'#FE8F01', alignItems:'center', justifyContent:'center'}}>
                      <Image style={{width:35, height:35}} resizeMode={'stretch'} source={Define.assets.Images[service.key]}/>
                    </View>

                    <Include.Text style={{fontSize:13}}>{service.name}</Include.Text>
                  </View>
                </ButtonWrap>
              )
            })}
          </View>
          <ButtonWrap
            onPress={() => {
              this.setState({
                renderServices:false
              })
              const iconMarker = `${this.state.currentService}_map`
              Actions.PickLocationScreen({
                setLocation: this.setLocation,
                initialRegion: this.state.location,
                pinIcon: Define.assets.Images[iconMarker]
              })
            }}
          >
            <View style={{marginTop:15, borderWidth:1, borderColor:'#00a8ff', justifyContent:'center', alignItems:'center', padding:5, borderRadius:4, backgroundColor:'#fff', flexDirection:'row'}}>
              <FontAwesome5 name={'exchange-alt'} style={{ paddingRight:3, fontSize:20, color:'#00a8ff'}}/>
              <Text style={{ color:'#00a8ff', fontSize:17}}>CHỌN ĐỊA ĐIỂM KHÁC</Text>
            </View>
          </ButtonWrap>
      </Animatable.View>
    )
  }
  setLocation(location, locationName) {
    this.setState({
      location,locationName
    })
    this.props.dispatch(UserActions_MiddleWare.placesSearch({
      type:this.state.currentService,
      location:[location.latitude, location.longitude]
    }))
    .then((result) => {
      this.setState({
        listPlaces:result.res.data,
        slideIndex:0,
      })
      this._carousel._snapToItem(0);
      this._mapView && this._mapView.animateToRegion(location, 400)
    })
  }
  renderScreenContent(){
    var {dispatch} = this.props;
    var content = null;
    content =(
      <View style={{flex:1, backgroundColor:'#aaa'}}>
        <MapView
          ref = {ref => {
            this._mapView = ref;
          }}
          style={{
            flex: 1
          }}
          provider={MapView.PROVIDER_GOOGLE}
          showsMyLocationButton={false}
          showsUserLocation={true}
          followsUserLocation={false}
          showsPointsOfInterest={false}
          showsCompass={false}
          showsScale={false}
          showsBuildings={false}
          showsTraffic={false}
          showsIndoors={false}
          cacheEnabled={false}
          loadingEnabled={true}
          initialRegion={this.state.location}>
          {this.state.listPlaces.map((place,index) => {
              const iconMarker = `${this.state.currentService}_map`
              if(this.state.slideIndex !== index) {
                return(
                  <MapView.Marker
                    key={`place_marker${index}`}
                    image = {this.state.currentService === '' ? Define.assets.Images.pin :Define.assets.Images[iconMarker]}
                    style={{
                      width: 10,
                      height: 10
                    }}
                    coordinate={{
                      latitude: place.location.lat,
                      longitude: place.location.lng
                    }}>
                  </MapView.Marker>
                )
              }
              return(
                <MapView.Marker
                  key={`place_marker${index}`}
                  coordinate={{
                    latitude: place.location.lat,
                    longitude: place.location.lng
                  }}>
                </MapView.Marker>
              )
           })}
        </MapView>
        <View style={{position:'absolute', top:28, left:3}}>
          <ButtonWrap
            onPress={() => {
              globalVariableManager.rootView.drawSideMenu(true)
            }}>
            <AntIcon name='menufold' style={{ elevation:4, fontSize: 32, marginTop: 0, marginLeft: 5, lineHeight: 36, backgroundColor: 'transparent', color: '#000' }} />
          </ButtonWrap>
        </View>
        <ButtonWrap
          onPress={() => {
            const iconMarker = `${this.state.currentService}_map`
            Actions.PickLocationScreen({
              setLocation: this.setLocation,
              initialRegion: this.state.location,
              pinIcon: Define.assets.Images[iconMarker]
            })
          }}>
          <View style={{position:'absolute', top:30, alignItems:'center', justifyContent:'center', left:50, width:'75%', paddingLeft:5, paddingRight:10,  height:35, borderRadius:5, backgroundColor:'#fff', elevation:4}}>
            <Text numberOfLines={1} style={{fontSize:15, color:'#000'}}>{this.state.locationName}</Text>
          </View>
        </ButtonWrap>
        <View style={{position:'absolute', borderWidth:1, borderColor: '#00a8ff',top:25, alignItems:'center', justifyContent:'center', right:8, width:45, height:45, borderRadius:22.5, backgroundColor:'#fff', elevation:5}}>
          <ButtonWrap
            onPress={() => {
              this.props.dispatch(UserActions_MiddleWare.listAvailableService())
              .then((result) => {
                this.setState({
                  services: result.res.data,
                  renderServices: true
                })
              })
            }}>
            <AntIcon name='search1' style={{ fontSize: 25, backgroundColor: 'transparent', color: '#000' }} />
          </ButtonWrap>
        </View>
        <View style={{
              width: Define.constants.widthScreen,
              height: Define.constants.widthScreen/2+20,
              backgroundColor: 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              padding: 10,
              elevation: 5,
              bottom:0,
              right:0,
              left:0
            }}>
          <Carousel
                 data={this.state.listPlaces}
                 renderItem={this._renderItem}
                 hasParallaxImages={true}
                 itemWidth={Define.constants.widthScreen*0.6}
                 sliderWidth={Define.constants.widthScreen}
                 ref={(ref) =>this._carousel = ref}
                 onSnapToItem = {(slideIndex) =>{
                    this.setState({
                     slideIndex
                    });
                    const region = {
                      latitude: this.state.listPlaces[slideIndex].location.lat,
                      longitude: this.state.listPlaces[slideIndex].location.lng,
                      latitudeDelta: this.state.currentService === '' ? 0.001 : 0.005,
                      longitudeDelta: this.state.currentService === '' ? 0.001 : 0.005,
                    }
                    this._mapView && this._mapView.animateToRegion(region, 400)
                 }}
             />
         </View>
        {this.state.renderServices ?
          <ButtonWrap
             onPress={() => {
               this.setState({renderServices:false})
             }}
          >
             <Animatable.View
              animation="fadeIn"
              easing="linear"
              duration={400}
              style={{position:'absolute', backgroundColor:'rgba(0,0,0,0.4)', elevation:7, width:'100%', height:'100%'}}>
            </Animatable.View>
          </ButtonWrap>
        :null}
        {this.renderServices()}
      </View>
    )
    return content;
  }
  _renderItem ({item, index}, parallaxProps) {
    return (
      <ButtonWrap
        onPress = {() => {
          let objSend = {
            placeId: item.place_id
          }
          if(this.props.user.memberInfo && this.props.user.memberInfo.member) {
            objSend.userId = this.props.user.memberInfo.member._id
          }

          this.props.dispatch(UserActions_MiddleWare.placeDetail(objSend))
          .then((result) => {
            Actions.DetailPlaceScreen({
              data: result.res.data,
              avartar: item.photo,
            })
          })
        }}
      >
        <View style={{backgroundColor:'#fff', elevation:10, borderRadius:6, alignItems:'center',padding:3, width:Define.constants.widthScreen/2+10, height:Define.constants.widthScreen/2}}>
            <ParallaxImage
                resizeMode={'stretch'}
                source={item.photo ? { uri:item.photo } : Define.assets.Images.defaultSlider}
                containerStyle={{ width:'100%', height:120, borderRadius:4}}
                style={{resizeMode:'center', borderRadius:4}}
                parallaxFactor={0.4}
                {...parallaxProps}
            />
            <View>
              <Text style={{textAlign:'center', fontSize:14, fontWeight:'bold'}} numberOfLines={1}>
                      { item.name }
              </Text>
              <Text style={{textAlign:'center'}} numberOfLines={2}>
                      { item.address }
              </Text>
            </View>
        </View>
      </ButtonWrap>
    );
}
  componentDidMount(){
    super.componentDidMount();
    var {dispatch} = this.props;
    locationManager.getCurrentLocation()
      .then((currentLocation) => {
        const region = {
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        }
        this.setState({
          location: region
        })
        dispatch(UserActions_MiddleWare.getLocationName({
          lat:currentLocation.lat,
          lng:currentLocation.lng
        }))
        .then((result) => {
          this.setState({
            locationName:result.res.data
          })
        })
        dispatch(UserActions_MiddleWare.placesSearch({
          location:[currentLocation.lat, currentLocation.lng]
        }))
        .then((result) => {
          this.setState({
            listPlaces:result.res.data
          })
        })
        .catch((err)=> {
          this.setState({
            location:{
              latitude: 20.9902111,
              longitude: 105.8452833,
              latitudeDelta: 0.001,
              longitudeDelta: 0.001,
            }
          })
          dispatch(UserActions_MiddleWare.placesSearch({
          }))
          .then((result) => {
            this.setState({
              listPlaces:result.res.data
            })
          })
          .catch((err)=> {
            console.log('ahihi err',result);
          })
        })
      })
      .catch((err) => {
        console.log('ahihi',err);
      });
  }
}


/**
 * [selectActions description]
 * @param  {[type]} state [description]
 * @return {[type]}       [description]
 */
function selectActions(state) {
  return {
    navigator: state.Navigator,
    user: state.User
  }
}

module.exports=connect(selectActions, undefined, undefined, {withRef: true})(HomeScreen);
// export default HomeScreen
