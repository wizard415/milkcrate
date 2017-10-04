import {
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';

export const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function wp (percentage) {
  const value = (percentage * screenWidth) / 100;
  return Math.round(value);
}

export function hp (percentage) {
  const value = (percentage * screenHeight) / 100;
  return Math.round(value);
}

export function scaleScreen() {
  
  if (screenWidth > 320)
    return 1;
  
  return 0.85;
}

export const carouselHeight = screenHeight * 0.3;
export const carouselWidth = wp(88);
export const carouselerWidth = screenWidth;
export const carouselItemHorizontalPadding = wp(1);
export const carouselItemWidth = carouselWidth + carouselItemHorizontalPadding * 2;

export const activityCellSize = screenWidth * 0.22;
export const categoryCellSize = 100;

export const NavNoneButton = 0;
export const NavBackButton = 1;
export const NavFilterButton = 2;
export const NavSettingButton = 4;
export const NavCloseButton = 8;
export const NavCloseTextButton = 16;
export const NavSendButton = 32;
export const NavNotificationButton = 64;
export const NavPinButton = 128;


export const geoLocation = {
  enableHighAccuracy: Platform.OS !== 'android',
  timeout: 10000,
  maximumAge: 1000,
};
/*
export const stickerImages = [
  require('../../assets/imgs/category-stickers/animals.png'),
  require('../../assets/imgs/category-stickers/baby.png'),
  require('../../assets/imgs/category-stickers/beauty.png'),
  require('../../assets/imgs/category-stickers/bicycles.png'),
  require('../../assets/imgs/category-stickers/civic.png'),
  require('../../assets/imgs/category-stickers/coffee.png'),
  require('../../assets/imgs/category-stickers/community.png'),
  require('../../assets/imgs/category-stickers/construction.png'),
  require('../../assets/imgs/category-stickers/dining.png'),
  require('../../assets/imgs/category-stickers/drinks.png'),
  require('../../assets/imgs/category-stickers/education.png'),
  require('../../assets/imgs/category-stickers/energy.png'),
  require('../../assets/imgs/category-stickers/fashion.png'),
  require('../../assets/imgs/category-stickers/finance.png'),
  require('../../assets/imgs/category-stickers/food.png'),
  require('../../assets/imgs/category-stickers/garden.png'),
  require('../../assets/imgs/category-stickers/green-space.png'),
  require('../../assets/imgs/category-stickers/health-wellness.png'),
  require('../../assets/imgs/category-stickers/home-office.png'),
  require('../../assets/imgs/category-stickers/media-communications.png'),
  require('../../assets/imgs/category-stickers/products.png'),
  require('../../assets/imgs/category-stickers/services.png'),
  require('../../assets/imgs/category-stickers/special-events.png'),
  require('../../assets/imgs/category-stickers/tourism-hospitality.png'),
  require('../../assets/imgs/category-stickers/transit.png'),
  require('../../assets/imgs/category-stickers/waste.png'),
];
*/

// XXX Kostas: Not crazy about this offset-based approach; slugs is more reliable.

export const categoryIcons = [
  require('../../assets/imgs/category-icons/animals.png'),
  require('../../assets/imgs/category-icons/baby.png'),
  require('../../assets/imgs/category-icons/beauty.png'),
  require('../../assets/imgs/category-icons/bicycles.png'),
  require('../../assets/imgs/category-icons/civic.png'),
  require('../../assets/imgs/category-icons/coffee.png'),
  require('../../assets/imgs/category-icons/community.png'),
  require('../../assets/imgs/category-icons/construction.png'),
  require('../../assets/imgs/category-icons/dining.png'),
  require('../../assets/imgs/category-icons/drinks.png'),
  require('../../assets/imgs/category-icons/education.png'),
  require('../../assets/imgs/category-icons/energy.png'),
  require('../../assets/imgs/category-icons/fashion.png'),
  require('../../assets/imgs/category-icons/finance.png'),
  require('../../assets/imgs/category-icons/food.png'),
  require('../../assets/imgs/category-icons/garden.png'),
  require('../../assets/imgs/category-icons/green-space.png'),
  require('../../assets/imgs/category-icons/health-wellness.png'),
  require('../../assets/imgs/category-icons/home-office.png'),
  require('../../assets/imgs/category-icons/media-communications.png'),
  require('../../assets/imgs/category-icons/products.png'),
  require('../../assets/imgs/category-icons/services.png'),
  require('../../assets/imgs/category-icons/special-events.png'),
  require('../../assets/imgs/category-icons/tourism-hospitality.png'),
  require('../../assets/imgs/category-icons/transit.png'),
  require('../../assets/imgs/category-icons/waste.png'),
];
