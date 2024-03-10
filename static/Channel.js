function Chat({
  room,
  editMode,
  repliesOf,
  onSetSelectedRoom,
  activechannel,
  showMsgContainer,
  showReplyContainer,
}) {
  const [intervalIdState, setIntervalIdState] = React.useState();

  const [messages, setMessages] = React.useState([]);
  const [newMessage, setNewMessage] = React.useState("");
  const [roomVal, setRoomVal] = React.useState("");

  const [reply, setReply] = React.useState("");
  const [repliesOfState, setRepliesOfState] = React.useState(repliesOf);
  const [replies, setReplies] = React.useState([]);

  const [smileyUsers, setSmileyUsers] = React.useState([]);
  const [whichSmiley, setWhichSmiley] = React.useState({
    msgId: -1,
    smileyId: -1,
  });
  const [msgId, setMsgId] = React.useState(-1);
  const [msgReply, setMsgReply] = React.useState();

  const history = ReactRouterDOM.useHistory();

  const handleMouseEnter = async (msg_id, smiley_id) => {
    noOfSmileys.message_id = msg_id;
    noOfSmileys.smiley_id = smiley_id;
    let retrievedSmileys = await CallApi(ALL_SMILEYS, noOfSmileys, {}, "GET");
    setSmileyUsers(retrievedSmileys.allE);
    setWhichSmiley({
      msgId: msg_id,
      smileyId: smiley_id,
    });
  };

  const handleMouseLeave = (msg_id, smiley_id) => {
    setWhichSmiley({
      msgId: -1,
      smileyId: -1,
    });
  };

  const smileys = [
    { id: 1, symbol: "👍" },
    { id: 2, symbol: "❤️" },
    { id: 3, symbol: "😂" },
    { id: 4, symbol: "😊" },
    { id: 5, symbol: "😍" },
  ];

  const handleSmileyClick = async (messageId, smileyId) => {
    postSmiley.smiley_id = smileyId;
    postSmiley.message_id = messageId;
    await CallApi(POST_SMILEY, postSmiley, {}, "POST");
  };

  const closeReplies = () => {
    let msgReply = document.querySelector(".message-reply");
    msgReply.classList.remove("message-reply-container");
    msgReply.classList.remove("dflex");
    document
      .querySelector(".channel-message-section")
      .classList.remove("footer");
    history.push("/channel/" + room);
    document.querySelector(".channel-messages").classList.remove("width-rep");
  };

  const closeMessages = () => {
    clearInterval(intervalIdState);
    history.push("/landing");
  };

  const handleReply = (messageId) => {
    setMsgId(messageId);
    let msgReply = document.querySelector(".message-reply");
    msgReply.classList.add("message-reply-container");
    msgReply.classList.add("dflex");
    document.querySelector(".channel-message-section").classList.add("footer");
    history.push("/channel/" + room + "/message/" + messageId);
    document.querySelector(".channel-messages").classList.add("width-rep");
  };

  const handleLogout = () => {
    clearInterval(intervalIdState);
  };

  function extractImageUrls(message) {
    const regex = /(https?:\/\/.*\.(?:png|jpg|gif))/gi;
    return message.match(regex) || [];
  }

  function displayImages(message) {
    const imageUrls = extractImageUrls(message);
    return imageUrls.map((imageUrl, index) => (
      <img
        className="imgLink"
        key={index}
        src={imageUrl}
        alt={`Image ${index + 1}`}
      />
    ));
  }

  React.useEffect(() => {
    const intervalId = setInterval(async () => {
      if (room == 0) return;

      getAllChatsDict.channel_id = room;
      getAllRepliesRequest.channel_id = room;
      getAllRepliesRequest.message_id = repliesOf;
      let retrievedMessages = await CallApi(
        ALL_MESSAGES,
        getAllChatsDict,
        {},
        "GET"
      );
      console.log("Aak");
      setMessages(retrievedMessages.allM);
      if (repliesOf > 0) {
        let replies = await CallApi(
          ALL_REPLIES,
          getAllRepliesRequest,
          {},
          "GET"
        );
        setReplies(replies.allR);
      }
    }, 500);

    setIntervalIdState(intervalId);

    return () => {
      clearInterval(intervalId);
    };
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() !== "") {
      postRequest.channel_id = room;
      postRequest.body = newMessage;
      let postMsg = await CallApi(POST_MESSAGE, postRequest, {}, "POST");
      setNewMessage("");
    }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (reply.trim() !== "") {
      console.log(reply);
      postReplyRequest.channel_id = room;
      postReplyRequest.body = reply;
      postReplyRequest.replies_to = repliesOf;
      await CallApi(ADD_REPLY, postReplyRequest, {}, "POST");
      setReply("");
    }
  };

  const handleInputReplyChange = (e) => {
    setReply(e.target.value);
  };

  function getMessageReply() {
    for (let x = 0; x < messages.length; x++) {
      if (messages[x].id == msgId) {
        return messages[x].text;
      }
    }
  }

  function getMsgReplyAuthor() {
    for (let x = 0; x < messages.length; x++) {
      if (messages[x].id == repliesOf) {
        return messages[x].author;
      }
    }
  }

  function getMessageBody() {
    for (let x = 0; x < messages.length; x++) {
      if (messages[x].id == repliesOf) {
        return messages[x].text;
      }
    }
  }

  return (
    <div className="landing-box2">
      {room != -1 ? (
        <>
          <div className="message-reply">
            {showMsgContainer && room > 0 ? (
              <div className="channel-messages parent">
                <h3 className="channel-title">
                  {editMode ? (
                    <input
                      className="login-input-field"
                      type="text"
                      id="channelName"
                      placeholder="Enter Channel Name"
                      value={roomVal}
                      onChange={(e) => {
                        if (e.currentTarget.value)
                          onSetSelectedRoom(e.currentTarget.value);
                        setRoomVal(e.currentTarget.value);
                      }}
                      required
                    />
                  ) : (
                    <strong className="channel-hide">
                      Channel: # {activechannel}
                    </strong>
                  )}
                </h3>
                <div
                  className="close-button-message pointer"
                  onClick={() => closeMessages()}
                >
                  <span className="material-symbols-outlined md-18">close</span>
                </div>
                {messages.length ? (
                  <>
                    {messages.map((message, index) => (
                      <div className="channel-message-container" key={index}>
                        <p className="channel-author">{message.author}</p>
                        <p className="channel-msg">{message.text}</p>
                        {displayImages(message.text)}
                        <div
                          className="reply-button pointer"
                          onClick={() => handleReply(message.id)}
                        >
                          <span className="material-symbols-outlined md-18">
                            reply
                          </span>
                        </div>
                        <div className="smileys">
                          {smileys.map((smiley) => (
                            <span
                              key={smiley.id}
                              className="smiley"
                              onClick={() => {
                                handleSmileyClick(message.id, smiley.id);
                              }}
                              onMouseEnter={() =>
                                handleMouseEnter(message.id, smiley.id)
                              }
                              onMouseLeave={() =>
                                handleMouseLeave(message.id, smiley.id)
                              }
                              style={{
                                cursor: "pointer",
                                marginRight: "5px",
                                fontSize: "20px",
                              }}
                            >
                              {smiley.symbol}
                              {smiley.id == whichSmiley["smileyId"] &&
                              message.id == whichSmiley["msgId"] ? (
                                smileyUsers.length
                              ) : (
                                <></>
                              )}
                            </span>
                          ))}
                        </div>
                        {message.replies > 0 && (
                          <div
                            className="replies pointer"
                            onClick={() => handleReply(message.id)}
                          >
                            {message.replies}{" "}
                            {message.replies == 1 ? "reply" : "replies"}
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                ) : (
                  <h4 className="channel-title">
                    No messages yet!! Start a conversation
                  </h4>
                )}
              </div>
            ) : (
              <></>
            )}

            {repliesOf > 0 && showReplyContainer && room > 0 ? (
              <div className="divider width-rep">
                <h4 className="channel-title chnl-reply">
                  Replying to {getMsgReplyAuthor()}
                  's {getMessageBody()}
                </h4>
                <div>
                  <div className="parent conversation">
                    <div
                      className="close-button pointer"
                      onClick={() => closeReplies()}
                    >
                      <span className="material-symbols-outlined md-18">
                        close
                      </span>
                    </div>
                    {replies.map((msg) => (
                      <>
                        <div
                          key={msg.id}
                          className="message channel-replies-container"
                        >
                          <p className="channel-author">{msg.name}</p>
                          <p className="channel-msg">{msg.body}</p>
                          {displayImages(msg.body)}
                          <div className="smileys">
                            {smileys.map((smiley) => (
                              <span
                                key={smiley.id}
                                className="smiley"
                                onClick={() => {
                                  handleSmileyClick(msg.id, smiley.id);
                                }}
                                onMouseEnter={() =>
                                  handleMouseEnter(msg.id, smiley.id)
                                }
                                onMouseLeave={() =>
                                  handleMouseLeave(msg.id, smiley.id)
                                }
                                style={{
                                  cursor: "pointer",
                                  marginRight: "5px",
                                  fontSize: "20px",
                                }}
                              >
                                {smiley.symbol}
                                {smiley.id == whichSmiley["smileyId"] &&
                                msg.id == whichSmiley["msgId"] ? (
                                  smileyUsers.length
                                ) : (
                                  <></>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      </>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
          <div className="channel-message-section">
            {showMsgContainer && room > 0 ? (
              <form onSubmit={handleSendMessage}>
                <div className="dflex">
                  <input
                    className="channel-input-field"
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                  />
                  <button className="channel-message-button" type="submit">
                    Send
                  </button>
                </div>
              </form>
            ) : (
              <></>
            )}
            {repliesOf > 0 && showReplyContainer && room > 0 ? (
              <form>
                <div className="dflex">
                  <input
                    className="channel-input-field"
                    type="text"
                    value={reply}
                    onChange={handleInputReplyChange}
                    placeholder="Type your reply..."
                  />
                  <button
                    className="channel-message-button"
                    onClick={sendReply}
                  >
                    Send
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </>
      ) : null}
      {room == -1 && showMsgContainer ? (
        <h4 className="channel-title">
          Please select a channel to get started!!
        </h4>
      ) : (
        <></>
      )}
    </div>
  );
}

export default Chat;
