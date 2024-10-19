export enum QUERY_KEYS {
    // AUTH KEYS
    CREATE_USER_ACCOUNT = "createUserAccount",
  
    // USER KEYS
    GET_CURRENT_USER = "getCurrentUser",
    GET_USERS = "getUsers",
    GET_USER_BY_ID = "getUserById",
  
    // POST KEY
    GET_POSTS = "getPosts",
    GET_INFINITE_POSTS = "getInfinitePosts",
    GET_RECENT_POSTS = "getRecentPosts",
    GET_POST_BY_ID = "getPostById",
    GET_USER_POSTS = "getUserPosts",
    GET_FILE_PREVIEW = "getFilePreview",
  
    //  SEARCH KEYS
    SEARCH_POSTS = "getSearchPosts",

    //FOLLOWERS
    GET_USER_FOLLOWERS = "getUserFollowers",
    GET_USER_FOLLOWING = "getUserFollowing",

    //COMMENTS
    GET_COMMENTS = "getComments",

    //MESSAGES
    GET_MESSAGES = "getMessages",

    //NOTIFICATIONS 
    GET_NOTIFICATIONS = "getNotifications",

    //GROUPS
    GET_USER_GROUPS = "getUserGroups",
    GET_GROUP_MESSAGES = "getGroupMessages",
  }