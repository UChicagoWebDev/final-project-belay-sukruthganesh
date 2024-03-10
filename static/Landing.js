import Channel from "./Channel";

function RoomsList({ channelList, channelNum, messageNum }) {
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
  const [showChannelsPanel, setShowChannelsPanel] = React.useState(false);
  const [showMessageContainer, setShowMessageContainer] = React.useState(false);
  const [showRepliesContainer, setShowRepliesContainer] = React.useState(false);
  console.log(channelNum);
  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleShowChannelsPanel = () => {
    setShowChannelsPanel(true);
    setShowMessageContainer(false);
    setShowRepliesContainer(false);
  };

  const handleShowMessageContainer = () => {
    setShowChannelsPanel(false);
    setShowMessageContainer(true);
    setShowRepliesContainer(false);
  };

  const handleShowRepliesContainer = () => {
    setShowChannelsPanel(false);
    setShowMessageContainer(false);
    setShowRepliesContainer(true);
  };

  const history = ReactRouterDOM.useHistory();
  const [selectedRoom, setSelectedRoom] = React.useState(channelNum);
  const [numChannels, setNumChannels] = React.useState(0);
  const [editMode, setEditMode] = React.useState(false);
  const [channelName, setChannelName] = React.useState("");
  const [editChannel, setEditChannel] = React.useState(false);
  const [activeRoomInd, setActiveRoom] = React.useState(-1);
  const [activeRoom, setCurrentActiveRoom] = React.useState("");
  let [messages, setMessages] = React.useState([]);

  if (
    localStorage.getItem("Sukruth-Ganesh-Api-Key") == null ||
    localStorage.getItem("Sukruth-Ganesh-Api-Key").trim().length == 0
  ) {
    const requestedPath = history.location.pathname;
    history.push("/login", { requestedPath });
    return <></>;
  }

  const [channelNames, setChannelNames] = React.useState([]);
  const [intervalIdState, setIntervalIdState] = React.useState();
  const [unReadMsgs, setUnreadMsgs] = React.useState({});

  React.useEffect(() => {
    const intervalId = setInterval(async () => {
      if (channelNum === 0) return;

      handleActiveChannel(channelNum - 1);
      let rooms = await CallApi(ALL_CHANNELS, {}, {}, "GET");
      if (channelNum != -1) await getActiveChannel(channelNum);
      setChannelNames(rooms.allC);
      getAllChatsDict.channel_id = channelNum;
      let retrievedMessages = await CallApi(
        ALL_MESSAGES,
        getAllChatsDict,
        {},
        "GET"
      );
      setMessages(retrievedMessages.allM);
      let unreadMsgs = await CallApi(GET_UNREAD, {}, {}, "GET");
      setUnreadMsgs(unreadMsgs.allUr);
      updateUnread.channel_id = channelNum;
      messages = retrievedMessages.allM;
      updateUnread.message_id = messages[messages.length - 1].id;
      await CallApi(POST_UNREAD, updateUnread, {}, "POST");
    }, 500);

    setIntervalIdState(intervalId);

    return () => {
      clearInterval(intervalId);
    };
  }, [channelNames, channelNum]);

  const updateScreen = () => {
    if (windowWidth < 800) {
      if (messageNum < 0 && channelNum > 0) {
        handleShowMessageContainer();
      } else if (messageNum > 0) {
        handleShowRepliesContainer();
      } else {
        handleShowChannelsPanel();
      }
    } else {
      setShowChannelsPanel(true);
      setShowMessageContainer(true);
      setShowRepliesContainer(true);
    }
  };

  React.useEffect(() => {
    updateScreen();
  }, [windowWidth, messages]);

  let simplifiedChannels = [];
  let channelListValues = Object.values(channelList);
  for (let i = 0; i < channelListValues.length; i++) {
    simplifiedChannels.push(channelListValues[i]["name"]);
  }
  let [channels, setRooms] = React.useState(simplifiedChannels);

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };

  const handleActiveChannel = (index) => {
    let allChannels = document.querySelectorAll(".landing-channels-div");
    for (let i = 0; i < allChannels.length; i++) {
      if (i != index) {
        allChannels[i].classList.remove("landing-active-channel");
      } else {
        allChannels[i].classList.add("landing-active-channel");
      }
    }
  };

  async function changeChannel(channelInd) {
    updateRoomRequest.name = selectedRoom;
    updateRoomRequest.channel_id = channelInd;
    var resp = await CallApi(CHANGE_CHANNEL, updateRoomRequest, {}, "POST");
    await getActiveChannel(channelInd);
  }

  async function addChannel() {
    setEditMode(false);
    setNumChannels(numChannels + 1);
    setRooms([...channelNames, channelName]);
    let newRoom = await CallApi(
      NEW_CHANNEL,
      {},
      { channel_name: channelName },
      "POST"
    );
    history.push("/channel/" + newRoom["channel_id"]);
    setChannelName("");
  }

  async function getActiveChannel(channelId) {
    let activeRoom = await CallApi(
      ACTIVE_CHANNEL,
      {},
      { "channel-num": channelId },
      "GET"
    );
    setCurrentActiveRoom(activeRoom.channel);
  }

  function changeRoom(l) {
    if (l) {
      setSelectedRoom(l);
      setActiveRoom(l);
      channels[activeRoomInd] = l;
      setChannelName("");
    }
  }

  return (
    <div className="landing">
      <div
        className={
          windowWidth < 800
            ? "header-class change-flow-direction"
            : "header-class"
        }
      >
        {activeRoom ? (
          <button
            type="button"
            className="btn btn-warning landing-update-channel-button"
            onClick={async () => {
              if (editChannel) await changeChannel(channelNum);
              setEditChannel(!editChannel);
            }}
          >
            {editChannel ? "Confirm Channel Name" : "Update Channel Name"}
          </button>
        ) : null}

        <button
          type="button"
          className="btn btn-info landing-update-profile-button"
          onClick={() => {
            history.push("/updateprofile");
          }}
        >
          Update Profile
        </button>
        <button
          type="button"
          className="btn btn-danger landing-logout-button"
          onClick={() => {
            localStorage.clear();
            history.push("/login");
          }}
        >
          Logout
        </button>
      </div>
      <div className="landing-grid">
        {showChannelsPanel && (
          <div className="landing-container landing-box1">
            <img src="./static/belay_logo.png" className="landing-belay-img" />
            <button
              className="login-submit-button landing-create-channel"
              type="submit"
              onClick={() => {
                setEditMode(true);
              }}
            >
              Create Channel
            </button>
            {editMode ? (
              <>
                <input
                  className="login-input-field landing-create-channel"
                  type="text"
                  name="newchannel"
                  placeholder="Enter Channel's Name"
                  value={channelName}
                  onChange={(e) => {
                    setChannelName(e.target.value);
                  }}
                />
                <div className="landing-create-channel">
                  <button
                    className="btn btn-success landing-logout-button"
                    type="submit"
                    onClick={addChannel}
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger landing-logout-button landing-close-channel"
                    onClick={() => {
                      setEditMode(false);
                      setChannelName("");
                    }}
                  >
                    Close
                  </button>
                </div>
              </>
            ) : null}
            <h4 className="landing-title">Channels</h4>
            <div className="landing-channels">
              {channelNames.map((room, index) => (
                <div
                  className="landing-channels-div"
                  key={index}
                  onClick={async () => {
                    await getActiveChannel(room.channel_id);
                    history.push("/channel/" + room.channel_id);
                  }}
                >
                  <p className="landing-channel-name">
                    # {room.channel_name}{" "}
                    {unReadMsgs[room.channel_id] != undefined &&
                      unReadMsgs[room.channel_id] > 0 && (
                        <div className="unreadmsgs">
                          {unReadMsgs[room.channel_id]} {"New Messages"}
                        </div>
                      )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        <h2 className="landing-welcome-message child">
          {windowWidth > 800 && (
            <>Hi {localStorage["Sukruth-Ganesh-User-Name"]}!!</>
          )}
        </h2>
        <Channel
          room={channelNum}
          activechannel={activeRoom}
          editMode={editChannel}
          repliesOf={messageNum}
          onSetSelectedRoom={(l) => {
            changeRoom(l);
          }}
          showMsgContainer={showMessageContainer}
          showReplyContainer={showRepliesContainer}
        />
      </div>
    </div>
  );
}

export default RoomsList;
