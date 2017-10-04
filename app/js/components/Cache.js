class Cache {
  constructor() {
    this.categories = null
    this.community = null
    this.cacheMap = {}
  }

  setCategories(categories) {
    this.categories = categories
  }
  
  setCommunity(community) {
    this.community = community
  }

  setMapData(key, val) {
    this.cacheMap[key] = val
  }

  getMapData(key) {
    return this.cacheMap[key]
  }

  removeMapData(key) {
    if(this.cacheMap[key])
      delete this.cacheMap[key]
  }

  resetMap() {
    this.cacheMap = {}
  }
}

export default (new Cache())
