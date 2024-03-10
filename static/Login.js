function Login({ loginText, onSetLoginState }) {
  const history = ReactRouterDOM.useHistory();
  const location = ReactRouterDOM.useLocation();

  if (
    loginText != "Update Profile" &&
    localStorage.getItem("Sukruth-Ganesh-Api-Key") != null &&
    localStorage.getItem("Sukruth-Ganesh-Api-Key").trim().length > 0
  ) {
    history.push("/landing");
    return <></>;
  } else if (
    loginText == "Update Profile" &&
    (localStorage.getItem("Sukruth-Ganesh-Api-Key") == null ||
      localStorage.getItem("Sukruth-Ganesh-Api-Key").trim().length == 0)
  ) {
    const requestedPath = history.location.pathname;
    history.push("/login", { requestedPath });
    return <></>;
  }
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [repeatPassword, setRepeatPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [updateUsername, setChangeUserName] = React.useState(false);

  const requestedPath = location.state?.requestedPath || "/";
  async function handleLogin(e) {
    e.preventDefault();
    setUsername("");
    setPassword("");
    setRepeatPassword("");
    setErrorMessage("");
    let userName = document.getElementById("username");
    let userPassword = document.getElementById("password");
    let userRepeatPassword = document.getElementById("repeatPassword");
    userName.setAttribute("required", true);
    userPassword.setAttribute("required", true);
    if (userRepeatPassword) userRepeatPassword.setAttribute("required", true);
    let isValidUser = await LoginUser(username, password);
    if (loginText === "Login" && isValidUser) {
      // Successful login
      if (requestedPath != "/") {
        history.replace(requestedPath);
      } else {
        history.push("/landing");
      }
    } else if (loginText === "Login") {
      // Failed login
      setErrorMessage("Invalid username or password");
    } else if (loginText === "Signup" || loginText === "Update Profile") {
      if (loginText === "Signup") {
        if (password != repeatPassword) {
          setErrorMessage("Passwords don't match");
        } else {
          await SignUp(username, password);
          const requestedPath = history.location.pathname;
          history.push("/login", { requestedPath });
        }
      }
    }
  }

  async function updateProfile(val) {
    let userName = document.getElementById("username");
    let userPassword = document.getElementById("password");
    let userRepeatPassword = document.getElementById("repeatPassword");
    userName.removeAttribute("required");
    userPassword.removeAttribute("required");
    userRepeatPassword.removeAttribute("required");
    userName.setCustomValidity("");
    userPassword.setCustomValidity("");
    userRepeatPassword.setCustomValidity("");
    if (val) {
      if (userName.value.length != 0) {
        setChangeUserName(val);
        await UpdateUsername();
      } else {
        userName.setCustomValidity("Please fill out the Username");
      }
    } else {
      if (
        userPassword.value.length != 0 &&
        userRepeatPassword.value.length != 0 &&
        userPassword.value == userRepeatPassword.value
      ) {
        setChangeUserName(val);
        await UpdatePassword();
      } else {
        if (userPassword.value.length == 0) {
          userPassword.setCustomValidity("Please fill out the Password");
        } else if (userRepeatPassword.value.length == 0) {
          userRepeatPassword.setCustomValidity(
            "Please fill out the Repeat Password"
          );
        } else if (userPassword.value != userRepeatPassword.value) {
          userRepeatPassword.setCustomValidity("Passwords do not match");
        }
      }
    }
  }

  return (
    <div className="login-container login">
      <form className="login-form" onSubmit={handleLogin}>
        <img className="login-img" src="./static/belay_title_logo.jpg" />
        <h2 className="login-title text-center default">{loginText}</h2>
        <div className="login-box">
          <input
            className="login-input-field"
            type="text"
            id="username"
            name="username"
            placeholder="Username"
            value={username}
            onClick={(e) => {
              setErrorMessage("");
              e.currentTarget.setCustomValidity("");
            }}
            onChange={(e) => {
              setErrorMessage("");
              setUsername(e.target.value);
              e.currentTarget.setCustomValidity("");
            }}
            required
          />
          <input
            className="login-input-field"
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            value={password}
            onClick={(e) => {
              setErrorMessage("");
              e.currentTarget.setCustomValidity("");
            }}
            onChange={(e) => {
              setErrorMessage("");
              setPassword(e.target.value);
              e.currentTarget.setCustomValidity("");
            }}
            required
          />

          {loginText == "Signup" || loginText == "Update Profile" ? (
            <input
              className="login-input-field repeatPassword"
              type="password"
              id="repeatPassword"
              name="repeatPassword"
              placeholder="Repeat Password"
              value={repeatPassword}
              onClick={(e) => {
                setErrorMessage("");
                e.currentTarget.setCustomValidity("");
              }}
              onChange={(e) => {
                setErrorMessage("");
                setRepeatPassword(e.target.value);
                e.currentTarget.setCustomValidity("");
              }}
              required
            />
          ) : null}
          {errorMessage && (
            <p className="login-error-message">{errorMessage}</p>
          )}
          {loginText == "Signup" || loginText == "Login" ? (
            <button className="login-submit-button" type="submit">
              {loginText}
            </button>
          ) : (
            <div className="dflex">
              <button
                className="login-submit-button"
                type="submit"
                onClick={() => updateProfile(true)}
              >
                Update Username
              </button>
              <button
                className="login-submit-button landing-close-channel"
                type="submit"
                onClick={() => updateProfile(false)}
              >
                Update Password
              </button>
            </div>
          )}
        </div>
        {loginText == "Login" ? (
          <p className="login-new-user text-center default">
            New to the platform?{" "}
            <a
              className="pointer"
              onClick={() => {
                onSetLoginState("Signup");
                setUsername("");
                setPassword("");
                setRepeatPassword("");
                setErrorMessage("");
                history.push("/signup");
              }}
            >
              Create Account
            </a>
          </p>
        ) : (
          <>
            {loginText == "Signup" ? (
              <p className="login-new-user text-center default">
                Existing User?{" "}
                <a
                  className="pointer"
                  onClick={() => {
                    onSetLoginState("Login");
                    setUsername("");
                    setPassword("");
                    setRepeatPassword("");
                    setErrorMessage("");
                    history.push("/login");
                  }}
                >
                  Login
                </a>
              </p>
            ) : (
              <p className="login-new-user text-center default">
                <a
                  className="pointer"
                  onClick={() => {
                    onSetLoginState("Login");
                    setUsername("");
                    setPassword("");
                    setRepeatPassword("");
                    setErrorMessage("");
                    history.push("/login");
                  }}
                >
                  Cancel?
                </a>
              </p>
            )}
          </>
        )}
      </form>
    </div>
  );
}

export default Login;
