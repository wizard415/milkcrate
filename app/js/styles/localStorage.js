import {
  AsyncStorage,
  Platform,
} from 'react-native';

import Storage from 'react-native-storage';

export let LocalStorage = new Storage ({
  
  size: 1000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24 * 366,
  enableCache: true,
  sync: {

  },
})