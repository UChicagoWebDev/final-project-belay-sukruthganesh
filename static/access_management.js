async function SignUp(username, password) {
  loginDict.username = username;
  loginDict.password = password;
  postMsg = await CallApi(SIGNUP, {}, loginDict, "POST");
  PersistUser(postMsg);
}

async function LoginUser(username, password) {
  loginDict.username = username;
  loginDict.password = password;
  let loginUsr = await CallApi(LOGIN_URL, {}, loginDict, "POST");
  if (loginUsr.api_key.length > 0) {
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    PersistUser(loginUsr);
    return true;
  } else {
    return false;
  }
}

function Logout() {
  rooms = {};
  let roomsMainClass = document.body.querySelector(".landing-channels");
  EmptyTheClass(roomsMainClass);
  localStorage.removeItem("Sukruth-Ganesh-Api-Key");
  document.querySelector(".noRooms").setAttribute("style", "display: block");
}

async function UpdateUsername() {
  updateUserNameRequest.user_name = document.querySelector(
    'input[name="username"]'
  ).value;
  postMsg = await CallApi(CHANGE_USERNAME, updateUserNameRequest, {}, "POST");
  localStorage.setItem("Sukruth-Ganesh-User-Name", postMsg["name"]);
}

async function UpdatePassword() {
  let password = document.querySelector('input[name="password"]').value;
  let repeatPassword = document.querySelector(
    'input[name="repeatPassword"]'
  ).value;

  if (password == repeatPassword) {
    updatePasswordRequest.password = password;
    postMsg = await CallApi(CHANGE_PASSWORD, {}, updatePasswordRequest, "POST");
  }
}
