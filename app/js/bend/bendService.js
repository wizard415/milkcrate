import * as Bend from './bend'
import {
    AsyncStorage
} from 'react-native';
import * as async from 'async'
import * as _ from 'underscore'
import moment from 'moment'
import Cache from '../components/Cache'
import UtilService from '../components/util'

var appKey = '589d36e94bad3014f50128ce';
var appSecret = 'deduKe8DAuA1ry2cYYQXSQEFHgZy9qTvrL0D2lsc';

module.exports = {
    /**
     * init - bend initialize function, must call this function before using bend
     * @param cb - callback(error)
     *             if error is null, then success, else failure to initialize
     */
    init(cb) {
        Bend.init({
            appKey: appKey,
            appSecret: appSecret
        }).then(
            function (activeUser) {
                cb(null, activeUser);
            },
            function (error) {
                cb(error);
            }
        );
    },

    /**
     * login
     *
     * @param username
     * @param password
     * @param cb - callback(error, user),
     *             if login is success, then returns user instance, else returns error
     */
    login(username, password, cb) {
        Bend.User.login({
            username: username,
            password: password
        }).then((ret)=> {
            //this.setUserInfo();
            cb(null, ret);
        }, (err)=> {
            cb(err)
        })
    },
    logout() {
        Cache.setCommunity(null);
        Cache.resetMap();
        Bend.User.logout();
        //this.clearUserInfo()
    },
    /**
     * signup
     *
     * @param userData - user information to create
     *                   must include username, password
     * @param cb - callback(error, user)
     *             if success, then returns created user instance, else return error
     *             created user is altivated already, so can logged in automatically
     */
    signup(userData, cb) {
        //console.log(userData);
        Bend.executeAnonymous("signup", userData).then((ret)=>{
            //console.log("signup ret", ret);
            Bend.setActiveUser(ret.user);
            //this.setUserInfo();
            cb(null, ret);
        }, (err)=>{
            cb(err);
        })
    },
    resetPassword(email, cb) {
        Bend.executeAnonymous("reset-password", {email:email}).then((ret)=>{
            cb(null, ret);
        }, (err)=>{
            cb(err);
        })
    },

    updateUser(userData, cb) {
        if(userData.avatar) {
            userData.avatar = this.makeBendFile(userData.avatar._id)
        }
        if(userData.community) {
            userData.community = this.makeBendRef("community", userData.community._id)
        }
        if(userData.coverImage) {
            userData.coverImage = this.makeBendFile(userData.coverImage._id)
        }
        if(userData.email) {
            userData.username = userData.email
        }
        Bend.User.update(userData).then((ret)=> {
            cb(null, ret);
            Cache.removeMapData("user");
        }, (err)=> {
            cb(err)
        })
    },

    updatePassword(oldPassword, newPassword, cb) {
        var activeUserClone = _.clone(Bend.getActiveUser())
        Bend.setActiveUser(null);
        var credentials = {username:activeUserClone.username, password:oldPassword};
        Bend.User.login(credentials).then(
            function (res) {
                var activeUser = Bend.getActiveUser();
                activeUser.password = newPassword;
                Bend.User.update(activeUser).then(function(user){
                    credentials = {username:activeUser.username, password:newPassword};
                    //Bend.Sync.destruct();
                    Bend.setActiveUser(null);
                    Bend.User.login(credentials);
                    Cache.removeMapData("user");
                    cb(null, true)
                }, function(err){
                    console.log(err);
                    cb(1)
                });
            },
            function (error) {
                console.log(error);
                Bend.setActiveUser(activeUserClone);
                cb(2)
            }
        );
    },

    getActivity(id, cb) {
        Bend.DataStore.get("activity", id, {
            relations:{
                activity:["action", "business", "event", "volunteer_opportunity", "service"],
                community:"community",
                user:"user",
            }
        }).then((ret)=>{
            cb(null, ret)
        }, (err)=>{
            cb(err)
        })
    },

    getActivityWithId(activity,id, cb) {
        Bend.DataStore.get(activity, id, {
            relations:{
                certification:"certification",
                community:"community",
                coverImage:"BendFile",
                image:"bendFile",
            }
        }).then((ret)=>{
            cb(null, ret)
        }, (err)=>{
            cb(err)
        })
    },

    getOriginalActivity(type, id, cb) {
        Bend.DataStore.get(type, id, {
            relations:{
                community:"community",
                "certification":"certification",
                "coverImage":"bendFile",
                "image":"bendFile",
            }
        }).then((ret)=>{
            cb(null, ret)
        }, (err)=>{
            cb(err)
        })
    },


    getEvent(id, cb) {
        Bend.DataStore.get("event", id, {
            relations:{
                certification:"certification",
                community:"community",
                coverImage:"BendFile"
            }
        }).then((ret)=>{
            cb(null, ret)
        }, (err)=>{
            cb(err)
        })
    },

    //get user alerts
    getUserAlerts(cb) {
        var query = new Bend.Query()
        var qq = new Bend.Query();
        qq.equalTo("community._id", this.getActiveUser().community._id);
        qq.exists("actor", false)
        query.and(new Bend.Query().equalTo("user._id", this.getActiveUser()._id).or(qq));
        query.contains("type", ["activity-like", "notification"])
        query.descending("_bmd.createdAt");
        Bend.DataStore.find("alert", query, {
            relations:{
                activity:"activity",
                actor:"actor",
                "actor.avatar":"BendFile"
            }
        }).then((rets)=>{
            cb(null, rets)
        }, (err)=>{
            cb(err)
        })
    },

    getLastAlerts(lastTime, cb) {
        var query = new Bend.Query()
        var qq = new Bend.Query();
        qq.equalTo("community._id", this.getActiveUser().community._id);
        qq.exists("actor", false)
        query.and(new Bend.Query().equalTo("user._id", this.getActiveUser()._id).or(qq));
        query.contains("type", ["activity-like", "notification"])
        query.greaterThan("_bmd.createdAt", lastTime);
        query.descending("_bmd.createdAt");

        Bend.DataStore.find("alert", query, {
            relations:{
                activity:"activity",
                actor:"actor",
                "actor.avatar":"BendFile"
            }
        }).then((rets)=>{
            cb(null, rets)
        }, (err)=>{
            cb(err)
        })
    },

    /**
     * getActiveUser
     *
     * @returns current logged-in user information
     */
    getActiveUser() {
        return Bend.getActiveUser();
    },

    getUser(cb) {
        if(Cache.cacheMap["user"]) {
            cb(null, Cache.cacheMap["user"])
            return
        }
        var userId = this.getActiveUser()._id
        Bend.User.get(userId, {
            relations:{
                avatar:"BendFile",
                community:"community",
                coverImage:"BendFile",
            }
        }).then((ret)=>{
            cb(null, ret)
            Cache.setMapData('user', ret)
        }, (err)=>{
            cb(err)
        })
    },

    getUserWithoutCache(cb) {
        var userId = this.getActiveUser()._id
        Bend.User.get(userId, {
            relations:{
                avatar:"BendFile",
                community:"community",
                coverImage:"BendFile",
            }
        }).then((ret)=>{
            cb(null, ret)
            Cache.setMapData('user', ret)
        }, (err)=>{
            cb(err)
        })
    },

    resetUserCache(cb){
      async.parallel([
          (callback)=>{
              this.getUserWithoutCache(callback)
          },
          (callback)=>{
              this.getCommunityWithoutCache(callback)
          }
      ], cb)
    },

    setUserInfo() {
        //get user full information
        this.getUser((err, user)=>{
            if(err) {
                console.log(err);return;
            }

            //save user
            AsyncStorage.setItem('milkcrate-user', JSON.stringify(user));
        })
    },

    getUserInfo() {
        if(!this.getActiveUser())  return null;

        var str = AsyncStorage.getItem('milkcrate-user');
        if(str && str.length > 0) {
            return JSON.parse(str)
        }
    },

    clearUserInfo() {
        AsyncStorage.removeItem('milkcrate-user');
    },

    //get community
    getCommunity(cb) {
        if(Cache.community) {
            cb(null, Cache.community);
            return;
        }

        if(!this.getActiveUser()) {
            cb(null, null)
            return;
        }

        var communityId = this.getActiveUser().community._id;
        if(!communityId) {
            cb(null, null)
            return;
        }

        Bend.DataStore.get("community", communityId, {
            relations:{
                logo:"BendFile"
            }
        }).then((ret)=>{
            cb(null, ret)
            Cache.setCommunity(ret);
        }, (err)=>{
            cb(err)
        })
    },

    getCommunityWithoutCache(cb) {
        var communityId = this.getActiveUser().community._id;
        Bend.DataStore.get("community", communityId, {
            relations:{
                logo:"BendFile"
            }
        }).then((ret)=>{
            Cache.setCommunity(ret);
            cb(null, ret)
        }, (err)=>{
            cb(err)
        })
    },

    //-------- start of home apis ---------------

    //get all categories
    getCategories(cb) {

        if(Cache.categories) {
            cb(null, Cache.categories);
            return;
        }

        var query = new Bend.Query()
        query.notEqualTo("deleted", true)
        query.equalTo("enabled", true)
        Bend.DataStore.find("category", query, {
            relations:{
                coverImage:"BendFile"
            }
        }).then((rets)=>{
            cb(null, rets)
            Cache.setCategories(rets);
        }, (err)=>{
            cb(err)
        })
    },

    getCategory(catId, cb) {
        if(Cache.categories) {
            var category = _.find(Cache.categories, (o)=>{
                return o._id == catId
            })
            cb(null, category);
            return;
        }
        Bend.DataStore.get("category", catId, {
            relations:{
                coverImage:"BendFile"
            }
        }).then((ret)=>{
            cb(null, ret)
        }, (err)=>{
            cb(err)
        })
    },

    getActivityCategory(cats, activity) {
        if(!activity.categories || activity.categories.length == 0)  return null;
        var exist = _.find(cats, (o)=>{
            return o._id == activity.categories[0]
        })

        if(exist) {
            return exist.slug
        }

        return null
    },

    //get weekly challenges
    getWeeklyChallenges(activityQuery, cb) {
        //get community of current user
        var communityId = this.getActiveUser().community._id;
        if(!communityId) return []

        var query = new Bend.Query();
        query.containsAll("communities", [communityId])
        query.greaterThan("endsAt", Date.now() * 1000000)
        query.lessThan("startsAt", Date.now() * 1000000)
        query.notEqualTo("deleted", true)

        Bend.DataStore.find("challenge", query, {
            relations:{
                activity:"activity"
            }
        }).then((rets)=>{
            var activityIds = []
            _.map(rets, (o)=>{
                activityIds.push(o.activity._id)
            })

            if(activityIds.length > 0) {
                var q = new Bend.Query()
                q.contains("activity._id", activityIds)
                q.notEqualTo("deleted", true)
                q.equalTo("user._id", this.getActiveUser()._id)
                Bend.DataStore.find("activity", q).then((activities)=>{
                    _.map(activities,(o)=>{
                        var exists = _.filter(rets, (_o)=>{
                            return _o.activity._id == o.activity._id
                        })
                        rets = _.difference(rets, exists)
                    })

                    cb(null, rets)
                }, (err)=>{
                    cb(err)
                })
            } else
                cb(null, rets)
        }, (err)=>{
            cb(err)
        })
    },

    //get currently trending
    getTrending(cb) {
        //get community of current user
        var communityId = this.getActiveUser().community._id;
        if(!communityId) return []

        var query = new Bend.Query();
        query.and(new Bend.Query().equalTo("community._id", communityId)
            .or().exists("community", false));

        query.notEqualTo("deleted", true)
        query.and(new Bend.Query().equalTo("enabled", true).or().exists("enabled", false))
        query.descending("trendActivity." + communityId)
        query.greaterThan("trendActivity." + communityId, 0)
        query.limit(1)

        var types = ["action", "business", "event", "service", "volunteer_opportunity"]
        var trends = []
        async.map(types, (type, callback)=>{
            Bend.DataStore.find(type, query, {
                relations:{
                    certification:"certification",
                    community:"community",
                    coverImage:"BendFile"
                }
            }).then((rets)=>{
                if(rets.length > 0){
                    var trend = rets[0]
                    trend.type = type
                    trend.seq = types.indexOf(type)
                    trends.push(trend)
                }
                callback(null, null)
            }, (err)=>{
                callback(err)
            })
        }, (err, ret)=>{

            console.log("trends count", trends.length )

            if(trends.length > 0) {
                //get users
                async.map(trends,
                    (t, callback)=>{
                        async.parallel([
                            (callback) => {
                                var q = new Bend.Query()
                                q.equalTo("activity._id", t._id);
                                q.descending("_bmd.createdAt");
                                q.notEqualTo("deleted", true)
                                q.equalTo("community._id", communityId);
                                q.exists('user._id', true)
                                q.greaterThan("_bmd.createdAt", Date.now() * 1000000 - 14 * 24 * 3600 * 1000000000)
                                q.limit(6)
                                Bend.DataStore.find("activity", q, {
                                    relations:{
                                        user:"user",
                                        "user.avatar":"BendFile"
                                    }
                                }).then((rets)=>{
                                    console.log("activity count", rets.length)
                                    var users = []
                                    _.map(rets, (o)=>{
                                        if(o.user && o.user.defaultAvatar)
                                            users.push(o.user);
                                    })
                                    t.users = users
                                    if(rets.length > 0)
                                        t.lastTime = rets[0]._bmd.createdAt
                                    callback(null, null)
                                }, (err)=>{
                                    callback(err, null)
                                })
                            },
                            (callback) => {
                                var q = new Bend.Query()
                                q.notEqualTo("deleted", true)
                                q.exists('user._id', true)
                                q.equalTo("community._id", communityId);
                                q.equalTo("activity._id", t._id);
                                q.greaterThan("_bmd.createdAt", Date.now() * 1000000 - 14 * 24 * 3600 * 1000000000)
                                var aggregation = Bend.Group.count('user._id');
                                //aggregation.by('activity._id')
                                aggregation.query(q);

                                Bend.DataStore.group("activity", aggregation).then((rets)=>{
                                    t.userCount = rets.length
                                    callback(null, null)
                                }, (err)=>{
                                    callback(err, null)
                                })
                            }
                        ], (err, ret)=>{
                            callback(err, ret)
                        })
                    }
                    , (err, rets)=>{
                        trends = _.sortBy(trends, (o)=>{
                            return o.seq
                        })
                        trends = _.filter(trends, (o)=>{
                            return (o.users && o.users.length > 0)
                        })
                        console.log("trends counts-2", trends.length)
                        cb(null, trends)
                    })
            } else {
                cb(null,[])
            }
        })

    },
    getBusinessTrend(id, cb) {
        var trendUsers = [], trendUserCount=0,lastTrendTime=0
        var communityId = this.getActiveUser().community._id;
        async.parallel([
            (callback) => {
                var q = new Bend.Query()
                q.equalTo("activity._id", id);
                q.descending("_bmd.createdAt");
                q.notEqualTo("deleted", true)
                q.exists('user._id', true)
                q.equalTo("community._id", communityId)
                //q.greaterThan("_bmd.createdAt", Date.now() * 1000000 - 7 * 24 * 3600 * 1000000000)
                q.limit(6)
                Bend.DataStore.find("activity", q, {
                    relations:{
                        user:"user",
                        "user.avatar":"BendFile"
                    }
                }).then((rets)=>{
                    var users = []
                    _.map(rets, (o)=>{
                        users.push(o.user);
                    })
                    trendUsers = users
                    if(rets.length > 0)
                        lastTrendTime = rets[0]._bmd.createdAt
                    callback(null, null)
                }, (err)=>{
                    callback(err, null)
                })
            },
            (callback) => {
                var q = new Bend.Query()
                q.notEqualTo("deleted", true)
                q.exists('user._id', true)
                q.equalTo("community._id", communityId)
                q.equalTo("activity._id", id);
                //q.greaterThan("_bmd.createdAt", Date.now() * 1000000 - 7 * 24 * 3600 * 1000000000)
                var aggregation = Bend.Group.count('user._id');
                //aggregation.by('activity._id')
                aggregation.query(q);

                Bend.DataStore.group("activity", aggregation).then((rets)=>{
                    trendUserCount = rets.length
                    callback(null, null)
                }, (err)=>{
                    callback(err, null)
                })
            }
        ], (err, ret)=>{
            cb(err, {
                trendUsers:trendUsers,
                trendUserCount:trendUserCount,
                lastTrendTime:lastTrendTime,
            })
        })
    },
    //get recent activities
    getRecentActivities(createdAt, limit, cb) {
        //get community of current user
        var communityId = this.getActiveUser().community._id;
        if(!communityId) return cb(null, [])

        var query = new Bend.Query();
        query.equalTo("community._id", communityId)
        query.notEqualTo("deleted", true)
        query.notEqualTo("hidden", true)
        if(createdAt > 0)
            query.lessThan("_bmd.createdAt", createdAt)
        query.descending("_bmd.createdAt")
        query.limit(limit)

        Bend.DataStore.find("activity", query, {
            relations:{
                activity:["action", "business", "event", "volunteer_opportunity", "service"],
                community:"community",
                user:"user",
                "user.avatar":"BendFile",
                "activity.certification":'certification'
            }
        }).then((rets)=>{

            //consider likes
            var activityIds = []
            _.map(rets, (o)=>{
                activityIds.push(o._id)
            })

            query = new Bend.Query();
            query.equalTo("user._id", this.getActiveUser()._id)
            query.notEqualTo("deleted", true)
            query.contains("activity._id", activityIds)
            Bend.DataStore.find("activityLike", query).then(function(likes){
                var likedActivityIds = []
                _.map(likes, (_o)=>{
                    likedActivityIds.push(_o.activity._id)
                })
                if(likedActivityIds.length > 0) {
                    likedActivityIds = _.uniq(likedActivityIds)

                    _.map(rets, (o)=> {
                        if(likedActivityIds.indexOf(o._id) != -1)
                            o.likedByMe = true
                    })
                }

                cb(null, rets)
            }, function(err){
                cb(err)
            })
        }, (err)=>{
            cb(err)
        })
    },
    getTeamRecentActivities(teamUsers, createdAt, limit, cb) {
        //get community of current user
        var communityId = this.getActiveUser().community._id;
        if(!communityId) return cb(null, [])

        var query = new Bend.Query();
        query.equalTo("community._id", communityId)
        query.contains("user._id", teamUsers)
        query.notEqualTo("deleted", true)
        query.notEqualTo("hidden", true)
        if(createdAt > 0)
            query.lessThan("_bmd.createdAt", createdAt)
        query.descending("_bmd.createdAt")
        query.limit(limit)

        Bend.DataStore.find("activity", query, {
            relations:{
                activity:["action", "business", "event", "volunteer_opportunity", "service"],
                community:"community",
                user:"user",
                "user.avatar":"BendFile",
                "activity.certification":'certification'
            }
        }).then((rets)=>{

            //consider likes
            var activityIds = []
            _.map(rets, (o)=>{
                activityIds.push(o._id)
            })

            query = new Bend.Query();
            query.equalTo("user._id", this.getActiveUser()._id)
            query.notEqualTo("deleted", true)
            query.contains("activity._id", activityIds)
            Bend.DataStore.find("activityLike", query).then(function(likes){
                var likedActivityIds = []
                _.map(likes, (_o)=>{
                    likedActivityIds.push(_o.activity._id)
                })
                if(likedActivityIds.length > 0) {
                    likedActivityIds = _.uniq(likedActivityIds)

                    _.map(rets, (o)=> {
                        if(likedActivityIds.indexOf(o._id) != -1)
                            o.likedByMe = true
                    })
                }

                cb(null, rets)
            }, function(err){
                cb(err)
            })
        }, (err)=>{
            cb(err)
        })
    },

    /**
     *
     * @param from
     * @param cb
     * @returns {*}
     */
    getLastActivities(from, cb) {
        //get community of current user
        var communityId = this.getActiveUser().community._id;
        if(!communityId) return cb(null, [])

        var query = new Bend.Query();
        query.equalTo("community._id", communityId)
        query.notEqualTo("deleted", true)
        query.notEqualTo("hidden", true)
        query.greaterThan("_bmd.createdAt", from)
        query.descending("_bmd.createdAt")

        Bend.DataStore.find("activity", query, {
            relations:{
                activity:["action", "business", "event", "volunteer_opportunity", "service"],
                community:"community",
                user:"user",
                "user.avatar":"bendFile",
                "activity.certification":'certification'
            }
        }).then((rets)=>{
            //console.log(rets);
            //consider likes
            var activityIds = []
            _.map(rets, (o)=>{
                activityIds.push(o._id)
            })

            query = new Bend.Query();
            query.equalTo("user._id", this.getActiveUser()._id)
            query.notEqualTo("deleted", true)
            query.contains("activity._id", activityIds)
            Bend.DataStore.find("activityLike", query).then(function(likes){
                var likedActivityIds = []
                _.map(likes, (_o)=>{
                    likedActivityIds.push(_o.activity._id)
                })
                if(likedActivityIds.length > 0) {
                    likedActivityIds = _.uniq(likedActivityIds)

                    _.map(rets, (o)=> {
                        if(likedActivityIds.indexOf(o._id) != -1)
                            o.likedByMe = true
                    })
                }

                cb(null, rets)
            }, function(err){
                cb(err)
            })
        }, (err)=>{
            cb(err)
        })
    },

    getRecentActivity(activityId, cb) {
        Bend.DataStore.get("activity", activityId, {
            relations:{
                activity:["action", "business", "event", "volunteer_opportunity", "service"],
                community:"community",
                user:"user",
                "user.avatar":"BendFile",
                "activity.certification":'certification'
            }
        }).then((activity)=>{

            query = new Bend.Query();
            query.equalTo("user._id", this.getActiveUser()._id)
            query.notEqualTo("deleted", true)
            query.equalTo("activity._id", activity._id)
            Bend.DataStore.find("activityLike", query).then(function(likes){
                if(likes.length>0) {
                    activity.likedByMe = true
                }

                cb(null, activity)
            }, function(err){
                cb(err)
            })
        }, (err)=>{
            cb(err)
        })
    },

    getMyRecentActivities(createdAt, limit, cb) {
        var query = new Bend.Query();
        query.equalTo("user._id", this.getActiveUser()._id)
        query.notEqualTo("deleted", true)
        //query.notEqualTo("hidden", true)
        if(createdAt > 0)
            query.lessThan("_bmd.createdAt", createdAt)
        query.descending("_bmd.createdAt")
        query.limit(limit)

        Bend.DataStore.find("activity", query, {
            relations:{
                activity:["action", "business", "event", "volunteer_opportunity", "service"],
                community:"community",
                "activity.certification":'certification'
            }
        }).then((rets)=>{
            cb(null, rets)
            //consider likes
            /*var activityIds = []
            _.map(rets, (o)=>{
                activityIds.push(o._id)
            })

            query = new Bend.Query();
            query.equalTo("user._id", this.getActiveUser()._id)
            query.notEqualTo("deleted", true)
            query.contains("activity._id", activityIds)
            Bend.DataStore.find("activityLike", query).then(function(likes){
                var likedActivityIds = []
                _.map(likes, (_o)=>{
                    likedActivityIds.push(_o.activity._id)
                })
                if(likedActivityIds.length > 0) {
                    likedActivityIds = _.uniq(likedActivityIds)

                    _.map(rets, (o)=> {
                        if(likedActivityIds.indexOf(o._id) != -1)
                            o.likedByMe = true
                    })
                }

                cb(null, rets)
            }, function(err){
                cb(err)
            })*/
        }, (err)=>{
            cb(err)
        })
    },

    getMyRecentActivity(activityId, cb) {
        Bend.DataStore.get("activity", activityId, {
            relations:{
                activity:["action", "business", "event", "volunteer_opportunity", "service"],
                community:"community",
                "activity.certification":'certification'
            }
        }).then((activity)=>{
            cb(null, activity)
        }, (err)=>{
            cb(err)
        })
    },

    likeActivity(activity, like, cb) {
        Bend.execute("setActivityLikeStatus", {
            like:like,
            activityId:activity._id
        }).then((ret)=>{
            if(ret.result == 'ok') {
                cb(null, true);
            } else {
                cb(null, false);
            }
        }, (err)=>{
            cb(err);
        })
    },

    //poll
    pollResponse(question, answer, cb) {
        var communityId = this.getActiveUser().community._id
        //add new response into poll question response
        Bend.DataStore.save("pollQuestionResponse", {
            answer:this.makeBendRef("pollQuestionAnswer", answer._id),
            question:this.makeBendRef("pollQuestion", question._id),
            user:this.makeBendRef("user", this.getActiveUser()._id),
            community:this.makeBendRef("community", communityId),
        }).then((ret)=>{
            //increase response count and percentage
            async.waterfall([
                (callback)=>{
                    //pollQuestion update
                    Bend.DataStore.get("pollQuestion", question._id).then((ret)=>{
                        ret.responseCounts = ret.responseCounts||{}
                        ret.responseCounts[communityId] = ret.responseCounts[communityId]||0
                        ret.responseCounts[communityId]++;
                        Bend.DataStore.update("pollQuestion", ret).then((ret)=>{
                            callback(null, ret)

                            //capture activity
                            this.captureActivityForPoll(question._id, "poll", ret.points, (err, ret)=>{
                                console.log(err,ret);
                            })
                        }, (err)=>{
                            callback(err)
                        })
                    }, (err)=>{
                        callback(err)
                    })
                },
                (questionRet, callback)=>{
                    //pollQuestionAnswer update
                    Bend.DataStore.get("pollQuestionAnswer", answer._id).then((ret)=>{
                        ret.counts = ret.counts||{}
                        ret.counts[communityId] = ret.counts[communityId]||0
                        ret.counts[communityId]++;
                        ret.percentages = ret.percentages||{}
                        ret.percentages[communityId] = Math.round(ret.counts[communityId] * 100 / questionRet.responseCounts[communityId])
                        Bend.DataStore.update("pollQuestionAnswer", ret).then((ret)=>{
                            callback(null, ret)
                        }, (err)=>{
                            callback(err)
                        })
                    }, (err)=>{
                        callback(err)
                    })

                    //get another answers and also need to update percentage
                    var q = new Bend.Query();
                    q.equalTo("question._id", questionRet._id);
                    q.notEqualTo("_id", answer._id);
                    q.notEqualTo("deleted", true)

                    Bend.DataStore.find("pollQuestionAnswer", q).then((rets)=>{
                        _.map(rets, (a)=>{
                            a.percentages = a.percentages||{}
                            a.counts = a.counts||{}
                            a.percentages[communityId] = Math.round(Number(a.counts[communityId]||0) * 100 / questionRet.responseCounts[communityId])
                            Bend.DataStore.update("pollQuestionAnswer", a).then((ret)=>{
                                //console.log(ret);
                            }, (err)=>{
                                console.log(err);
                            })
                        })
                    })
                }
            ], (err, ret)=>{
                //console.log("pollResponse result", err, ret)
                cb(err, ret)
            })
        }, (err)=>{
            cb(err)
        })
    },

    getPinnedActivities(cb) {
        Bend.execute('getPinnedActivities', {}).then(function(rets){
            console.log(rets);
            cb(null, rets)
        }, function(err){
            console.log(err)
            cb(err)
        })
    },
    pinActivity(param, cb) {
        UtilService.mixpanelEvent("Pinned Activity", {type:param.type, id:param.id, name:param.name})
        Bend.execute('pinActivity', param).then(function(ret){
            cb(null)
        }, function(err){
            cb(err)
        })
    },
    unpinActivity(param, cb) {
        UtilService.mixpanelEvent("Unpinned Activity", {type:param.type, id:param.id, name:param.name})
        Bend.execute('unpinActivity', param).then(function(ret){
            cb(null)
        }, function(err){
            cb(err)
        })
    },
    getRecentPinnedActivities(cb) {
        var query = new Bend.Query()
        query.equalTo('user._id', this.getActiveUser()._id)
        query.notEqualTo("deleted", true)
        query.descending("_bmd.createdAt")
        query.limit(5)

        Bend.DataStore.find('userPinnedActivity', query, {
            relations:{
                activity:["action", "business", "event", "volunteer_opportunity", "service"]
            }
        }).then(function(rets){
            //console.log(rets);
            cb(null, rets)
        }, function(err){
            console.log(err)
            cb(err)
        })
    },
    getAllPinnedActivities(cb) {
        var query = new Bend.Query()
        query.equalTo('user._id', this.getActiveUser()._id)
        query.notEqualTo("deleted", true)

        Bend.DataStore.find('userPinnedActivity', query, {
            relations:{
                activity:["action", "business", "event", "volunteer_opportunity", "service"]
            }
        }).then(function(rets){
            console.log(rets);
            var actions = _.filter(rets, (o)=>{
                return o.type == 'action'
            })
            var businesses = _.filter(rets, (o)=>{
                return o.type == 'business'
            })
            var events = _.filter(rets, (o)=>{
                return o.type == 'event'
            })
            var volunteers = _.filter(rets, (o)=>{
                return o.type == 'volunteer_opportunity'
            })
            var services = _.filter(rets, (o)=>{
                return o.type == 'service'
            })
            cb(null, {
                action:actions,
                business:businesses,
                event:events,
                volunteer_opportunity:volunteers,
                service:services,
            })
        }, function(err){
            console.log(err)
            cb(err)
        })
    },

    //get poll question
    getPollQuestion(cb) {
        //check if user answered already today
        var query = new Bend.Query();
        query.equalTo("user._id", this.getActiveUser()._id)
        query.equalTo("community._id", this.getActiveUser().community._id)
        query.greaterThanOrEqualTo("_bmd.createdAt", (new Date().setHours(0,0,0,0)) * 1000000)
        Bend.DataStore.find("pollQuestionResponse", query, {
            relations:{
                answer:"answer",
                question:"question"
            }
        }).then((rets)=>{
            if(rets.length > 0) {
                //get related answers
                query = new Bend.Query();
                query.equalTo("question._id", rets[0].question._id)
                query.notEqualTo('deleted', true)
                query.ascending("position")
                Bend.DataStore.find("pollQuestionAnswer", query).then((answers)=>{
                    cb(null, rets[0].question, answers, rets[0].answer);
                }, (err)=>{
                    cb(err)
                })
            } else {
                //get already responsed questions
                var query = new Bend.Query();
                query.equalTo("user._id", this.getActiveUser()._id)
                Bend.DataStore.find("pollQuestionResponse", query).then((rets)=>{
                    var questions = []
                    _.map(rets, (o)=>{
                        questions.push(o.question._id)
                    })

                    //query
                    query = new Bend.Query();
                    query.equalTo("enabled", true)
                    query.notEqualTo("deleted", true)
                    query.notContainedIn("_id", questions)
                    query.and(new Bend.Query().containsAll("communities", [this.getActiveUser().community._id])
                        .or().exists("communities", false));
                    query.and(new Bend.Query().equalTo("pollDate", UtilService.getToday())
                        .or().exists("pollDate", false));
                    Bend.DataStore.find("pollQuestion", query).then((rets)=>{
                        if(rets.length > 0) {
                            //first check if there is poll date specified
                            var exist = _.find(rets, (o)=>{
                                return o.pollDate == UtilService.getToday()
                            })

                            if(exist) {
                                //get related answers
                                query = new Bend.Query();
                                query.equalTo("question._id", exist._id)
                                query.ascending("position")
                                query.notEqualTo("deleted", true)
                                Bend.DataStore.find("pollQuestionAnswer", query).then((answers)=>{
                                    cb(null, exist, answers, null);
                                }, (err)=>{
                                    cb(err)
                                })
                            } else {
                                //get related answers
                                query = new Bend.Query();
                                query.equalTo("question._id", rets[0]._id)
                                query.ascending("position")
                                query.notEqualTo("deleted", true)
                                Bend.DataStore.find("pollQuestionAnswer", query).then((answers)=>{
                                    cb(null, rets[0], answers, null);
                                }, (err)=>{
                                    cb(err)
                                })
                            }

                        } else {
                            cb("no data");
                        }
                    })
                }, (err)=>{
                    cb(err)
                })
            }
        }, (err)=>{
            cb(err)
        })
    },

    //-------- end of home apis ---------------

    //-------- search view ---------------------
    searchActivity(param, cb){
        UtilService.mixpanelEvent("Searched", {"type":param.type, "category":param.category, "query":param.query})
        Bend.execute("search-activity", param).then((ret)=>{
            cb(null, ret);
        }, (err)=>{
            cb(err);
        })
    },

    //-------- end of search view --------------

    //-------- recent activities ---------------------
    searchRecentActivity(param, cb){
        Bend.execute("search-activity-recent", param).then((ret)=>{
            cb(null, ret);
        }, (err)=>{
            cb(err);
        })
    },

    //-------- end of recent activities --------------

    //-------detail view ------
    checkActivityDid(id, type, cb) {
        Bend.execute("checkActivityDid", {
            id:id,
            type:type
        }).then((ret)=>{
            cb(null, ret.result);
        }, (err)=>{
            cb(err);
        })
    },

    checkActivityAnybodyDid(id, type, cb) {
        Bend.execute("checkActivityAnybodyDid", {
            id:id,
            type:type
        }).then((ret)=>{
            cb(null, ret.result);
        }, (err)=>{
            cb(err);
        })
    },

    removeActivity(id, cb) {
        Bend.execute("removeActivity", {
            id:id
        }).then((ret)=>{
            this.resetUserCache((_e, _r)=>{
                UtilService.mixpanelSetProperty({totalPoints:Cache.cacheMap["user"].points})
                cb(null, ret.result);
            })
        }, (err)=>{
            cb(err);
        })
    },

    captureActivity(id, type, cb) {
        Bend.execute("capture-activity", {
            type:type,
            id:id
        }).then((ret)=>{
            this.resetUserCache((_e, _r)=>{
                UtilService.mixpanelEvent("Earned Points", {
                    points: ret.activity.points,
                    totalPoints:Cache.cacheMap["user"].points,
                    from:type
                });
                UtilService.mixpanelSetProperty({totalPoints:Cache.cacheMap["user"].points})
                cb(null, ret);
            })
        }, (err)=>{
            cb(err);
        })
    },
    captureActivityForVolunteer(id, type, hours, cb) {
        Bend.execute("capture-activity-volunteer", {
            type:type,
            id:id,
            hours:hours
        }).then((ret)=>{
            this.resetUserCache((_e, _r)=>{
                UtilService.mixpanelEvent("Earned Points", {
                    points: ret.activity.points,
                    totalPoints:Cache.cacheMap["user"].points,
                    from:type
                });
                UtilService.mixpanelSetProperty({totalPoints:Cache.cacheMap["user"].points})
                cb(null, ret);
            })
        }, (err)=>{
            cb(err);
        })
    },

    sendFeedback(data, cb) {
        Bend.execute("send-feedback", data).then((ret)=>{
            cb(null, ret);
        }, (err)=>{
            cb(err);
        })
    },

    captureActivityForPoll(id, type, points, cb) {
        Bend.execute("capture-activity-poll", {
            type:type,
            id:id,
            points:points
        }).then((ret)=>{
            this.resetUserCache((_e, _r)=>{
                UtilService.mixpanelEvent("Earned Points", {
                    points: ret.activity.points,
                    totalPoints:Cache.cacheMap["user"].points,
                    from:type
                });
                UtilService.mixpanelSetProperty({totalPoints:Cache.cacheMap["user"].points})
                cb(null, ret);
            })
        }, (err)=>{
            cb(err);
        })
    },

    //-------end of detail view ------
    getLeaderBoardSimpleList(cb) {
        var query = new Bend.Query()
        query.equalTo("community._id", this.getActiveUser().community._id)
        Bend.DataStore.find("leaderboard", query).then((ret)=>{
            if(ret.length > 0) {
                var users = ret[0].data;
                var currentUserId = this.getActiveUser()._id
                var idx = users.indexOf(currentUserId);
                var startIdx = 0;
                var endIdx = 2;
                if(idx != -1) {
                    startIdx = idx -1;
                    endIdx = idx + 1;
                }

                if(startIdx < 0) {
                    startIdx++;endIdx++;
                } else if(endIdx > users.length - 1) {
                    startIdx--;endIdx--;
                }

                startIdx = Math.max(startIdx, 0);
                endIdx = Math.min(endIdx, users.length - 1);

                var userIdx = []
                for(var i = startIdx; i <= endIdx ; i++)
                    userIdx.push(users[i]);

                var q = new Bend.Query()
                q.contains('_id', userIdx);
                q.ascending('sprintRank')
                Bend.User.find(q, {
                    relations:{
                        avatar:"BendFile"
                    }
                }).then((userList)=>{
                    cb(null, userList, users)
                }, (err)=>{
                    cb(err)
                })
            } else {
                cb(null, null)
            }
        }, (err)=>{
            cb(err)
        })
    },

    getTeamUsers(teamId, cb) {
        var query = new Bend.Query()
        query.containsAll("teams", [teamId])
        query.notEqualTo("deleted", true)
        query.fields(["_id"])
        Bend.User.find(query).then(function(teamUsers){
            var result = []
            _.map(teamUsers, (o)=>{
                result.push(o._id)
            })
            cb(null, result)
        })
    },

    getTeamLeaderBoardSimpleList(teamUsers, cb) {
        var query = new Bend.Query()
        query.equalTo("community._id", this.getActiveUser().community._id)
        Bend.DataStore.find("leaderboard", query).then((ret)=>{
            if(ret.length > 0) {
                var users = ret[0].data;
                users = _.intersection(users, teamUsers)
                var currentUserId = this.getActiveUser()._id
                var idx = users.indexOf(currentUserId);
                var startIdx = 0;
                var endIdx = 2;
                if(idx != -1) {
                    startIdx = idx -1;
                    endIdx = idx + 1;
                }

                if(startIdx < 0) {
                    startIdx++;endIdx++;
                } else if(endIdx > users.length - 1) {
                    startIdx--;endIdx--;
                }

                startIdx = Math.max(startIdx, 0);
                endIdx = Math.min(endIdx, users.length - 1);

                var userIdx = []
                for(var i = startIdx; i <= endIdx ; i++)
                    userIdx.push(users[i]);

                var q = new Bend.Query()
                q.contains('_id', userIdx);
                q.ascending('sprintRank')
                Bend.User.find(q, {
                    relations:{
                        avatar:"BendFile"
                    }
                }).then((userList)=>{
                    cb(null, userList, users)
                }, (err)=>{
                    cb(err)
                })
            } else {
                cb(null, null)
            }
        }, (err)=>{
            cb(err)
        })
    },

    getLeaderBoardPage(offset, limit, cb) {
        var query = new Bend.Query()
        query.equalTo("community._id", this.getActiveUser().community._id)
        query.equalTo("enabled", true)
        query.notEqualTo("deleted", true)
        query.ascending('sprintRank')
        query.greaterThan('sprintRank', 0)
        query.skip(offset)
        query.limit(limit)
        Bend.User.find(query, {
            relations:{
                avatar:"BendFile"
            }
        }).then((rets)=>{
            cb(null, rets)
        }, (err)=>{
            cb(err)
        })
    },

    getTeamLeaderBoardPage(teamUsers, offset, limit, cb) {
        var query = new Bend.Query()
        query.equalTo("community._id", this.getActiveUser().community._id)
        query.equalTo("enabled", true)
        query.contains("_id", teamUsers)
        query.notEqualTo("deleted", true)
        query.ascending('sprintRank')
        query.greaterThan('sprintRank', 0)
        query.skip(offset)
        query.limit(limit)
        Bend.User.find(query, {
            relations:{
                avatar:"BendFile"
            }
        }).then((rets)=>{
            cb(null, rets)
        }, (err)=>{
            cb(err)
        })
    },

    getBusinessRating(id, cb) {
        var query = new Bend.Query()
        query.equalTo("business._id", id)
        query.descending("_bmd.createdAt")
        Bend.DataStore.find("businessRating", query, {
            relations:{
                user:"user",
                "user.avatar":"BendFile"
            }
        }).then((rets)=>{
            cb(null, rets)
        }, err=>{
            cb(err)
        })
    },

    captureBusinessRating(param, cb) {
        Bend.execute("captureBusinessRating", param).then((ret)=>{
            console.log(ret);
            var id = ret.result._id
            Bend.DataStore.get("businessRating", id, {
                relations:{
                    user:"user",
                    "user.avatar":"BendFile"
                }
            }).then((ret)=>{
                cb(null, ret)
            }, err=>{
                cb(err)
            })
        }, (err)=>{
            cb(err);
        })
    },

    captureComment(param, cb) {
        Bend.execute("captureComment", param).then((ret)=>{
            console.log(ret);
            var id = ret._id
            Bend.DataStore.get("comment", id, {
                relations:{
                    user:"user",
                    "user.avatar":"BendFile"
                }
            }).then((ret)=>{
                cb(null, ret)
            }, err=>{
                cb(err)
            })
        }, (err)=>{
            cb(err);
        })
    },

    saveInstallInformation(param, cb) {
        delete param._bmd;
        console.log("saveInstallInformation", param)
        Bend.executeAnonymous("save-installation", param).then((ret)=>{
            console.log(ret);
            cb(null, ret);
        }, (err)=>{
            cb(err);
        })
    },

    saveGeoLocation(param, cb) {
        Bend.execute("save-geo-location", param).then(function(result){
            cb(null, result);
        },function(error) {
            cb(error)
        })
    },

    getChartData(cb) {
        Bend.execute("get-chart-data", {}).then(function(result){
            cb(null, result);
        },function(error) {
            cb(error)
        })
    },

    getCurrentSprint(cb) {
        Bend.execute("getCurrentSprint", {}).then(function(result){
            cb(null, result);
        },function(error) {
            cb(error)
        })
    },

    getTeams(teamIds, cb) {
        var query = new Bend.Query()
        query.contains("_id", teamIds)
        query.notEqualTo("deleted", true)
        Bend.DataStore.find("team", query).then((rets)=>{
            cb(null, rets)
        }, (err)=>{
            cb(err)
        })
    },

    getCommunityActivityCountByCategory(cb) {
        Bend.execute("getCommunityActivityCountByCategory", {}).then((result)=>{
            //console.log("getCommunityActivityCountByCategory", result)
            cb(null, result);
        },(error)=> {
            console.log("getCommunityActivityCountByCategory error", error)
            cb(error)
        })
    },

    logActivityView(activityId, activityType, type, cb) {
        Bend.execute("logActivityView", {
            activityId:activityId,
            activityType:activityType,
            type:type,
        }).then((result)=>{
            //console.log("logActivityView", result)
            if(cb)
                cb(null, result);
        },(error)=> {
            console.log("logActivityView error", error)
            if(cb)
                cb(error)
        })
    },

    //file upload api
    uploadFile(file, cb, ext){
        file._filename = Date.now() + ""

        var obj = {
            _filename: file.fileName,
            mimeType: "image/jpeg",
            size: file.fileSize,
        };

        if(ext) {
            _.extend(obj,ext);
        }

        //console.log(obj);

        Bend.File.upload(file, obj, {"public": true}, (res) => {
            //console.log(res);
        }).then((res)=>{
            //console.log("Success upload", res._downloadURL)
            cb(null, res);
        }, (error) => {
            //console.log("Error upload", error)
            cb(error);
        });
    },
    makeBendRef(collectionName, id) {
        return {
            "_type": "BendRef",
            "_id": id,
            "_collection": collectionName
        }
    },
    makeBendFile(id) {
        return {
            "_type": "BendFile",
            "_id": id
        };
    }
}
