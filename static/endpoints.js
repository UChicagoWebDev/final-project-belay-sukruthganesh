const LANDING = document.querySelector(".landing");
const LOGIN = document.querySelector(".login");

const CHANGE_USERNAME = "/api/user/name";
const CHANGE_PASSWORD = "/api/user/password";
const CHANGE_CHANNEL = "/api/channel/name";
const SIGNUP = "/api/signup";
const POST_MESSAGE = "/api/channel/new_msg";
const LOGIN_URL = "/api/login";
const NEW_CHANNEL = "/api/channels/new";
const ALL_MESSAGES = "/api/channel/messages";
const ALL_CHANNELS = "/api/channels";
const ACTIVE_CHANNEL = "/api/activechannel";
const ADD_REPLY = "/api/channel/reply";
const ALL_REPLIES = "/api/channel/replies";
const ALL_SMILEYS = "/api/message/smileys";
const POST_SMILEY = "/api/message/smileypost";
const GET_UNREAD = "/api/user/unread";
const POST_UNREAD = "/api/update/user/unread";

var rooms = {};
var previousPath = "";
var CURRENT_CHANNEL = 0;

var getAllChatsDict = {
  channel_id: 0,
};

var postRequest = {
  channel_id: 0,
  body: "",
};

var updateUserNameRequest = {
  user_name: "",
};

var updatePasswordRequest = {
  password: "",
};

var loginDict = {
  username: "",
  password: "",
};

var updateRoomRequest = {
  name: "",
  channel_id: 0,
};

var getAllRepliesRequest = {
  channel_id: 0,
  message_id: 0,
};

var postRequest = {
  channel_id: 0,
  body: "",
};

var postReplyRequest = {
  channel_id: 0,
  body: "",
  message_id: 0,
  replies_to: 0,
};

var noOfSmileys = {
  message_id: "",
  smiley_id: "",
};

var postSmiley = {
  message_id: "",
  smiley_id: "",
};

var updateUnread = {
  message_id: "",
  channel_id: "",
};
