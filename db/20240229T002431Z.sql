create table users (
  id INTEGER PRIMARY KEY,
  name VARCHAR(40) UNIQUE,
  password VARCHAR(40),
  api_key VARCHAR(40)
);

create table channels (
    id INTEGER PRIMARY KEY,
    name VARCHAR(40) UNIQUE
);

create table messages (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  channel_id INTEGER,
  body TEXT,
  replies_to INTEGER,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(channel_id) REFERENCES channels(id)
);

create table smileys (
    smiley_id INTEGER,
    msg_id INTEGER,
    user_id INTEGER,
    FOREIGN KEY(msg_id) REFERENCES messages(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
);

create table channel_ppl (
    user_id INTEGER,
    channel_id INTEGER,
    message_id INTEGER,
    PRIMARY KEY(user_id, channel_id)
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(message_id) REFERENCES messages(id)
    FOREIGN KEY(channel_id) REFERENCES channels(id)
);