import Login from "./Login";
import Landing from "./Landing";

function App() {
  let channels = {};
  const history = ReactRouterDOM.useHistory();

  function routePageHelper(element) {
    CURRENT_CHANNEL = 0;
    LOGIN.classList.add("hide");
    LANDING.classList.add("hide");
    element.classList.remove("hide");
  }

  const [loginState, setLoginState] = React.useState("Login");

  function loggedIn() {
    let userNameInput = document.querySelector('input[name="username"]');
    userNameInput.value = localStorage.getItem("Sukruth-Ganesh-User-Name");
  }

  function loggedOut() {
    localStorage.clear();
    router();
  }

  function loadPage(url) {
    window.history.pushState(null, null, "/" + url);
    router();
  }

  function loadChannel(channelId) {
    loadPage("channel/" + channelId);
  }

  async function populateRooms() {
    console.log("channels" + JSON.stringify(channels));
    channels = await CallApi(ALL_CHANNELS, {}, {}, "GET");
  }

  return (
    <ReactRouterDOM.BrowserRouter history={history}>
      <div className="App">
        <ReactRouterDOM.Switch>
          <ReactRouterDOM.Route
            path="/signup"
            render={(props) => (
              <Login
                loginText={"Signup"}
                onSetLoginState={(l) => setLoginState(l)}
              />
            )}
          />
          <ReactRouterDOM.Route
            path="/login"
            render={(props) => (
              <Login
                loginText={"Login"}
                onSetLoginState={(l) => setLoginState(l)}
              />
            )}
          />
          <ReactRouterDOM.Route
            path="/landing"
            render={(props) => (
              <Landing channelList={channels} channelNum={"-1"} />
            )}
          />
          {/* <ReactRouterDOM.Route path="/login" component={Login} /> */}
          <ReactRouterDOM.Route
            path="/updateprofile"
            render={(props) => (
              <Login
                loginText={"Update Profile"}
                onSetLoginState={(l) => setLoginState(l)}
              />
            )}
          />

          <ReactRouterDOM.Route
            path="/channel/:channelId/message/:messageId"
            render={(props) => (
              <Landing
                channelList={channels}
                channelNum={props.match.params.channelId}
                messageNum={props.match.params.messageId}
              />
            )}
          />
          <ReactRouterDOM.Route
            path="/channel/:channelId"
            render={(props) => (
              <Landing
                channelList={channels}
                channelNum={props.match.params.channelId}
                messageNum={-1}
              />
            )}
          />
          {/* <ReactRouterDOM.Route
            path="/newchannel"
            render={(props) => <NewChannel />}
          /> */}
          <ReactRouterDOM.Route
            path="/"
            render={(props) => (
              <Login
                loginText={"Login"}
                onSetLoginState={(l) => setLoginState(l)}
              />
            )}
          />
        </ReactRouterDOM.Switch>
      </div>
    </ReactRouterDOM.BrowserRouter>
  );
}

export default App;
