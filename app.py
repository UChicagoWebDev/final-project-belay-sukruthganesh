import string
import random

from flask import request, Flask, g, send_file
import sqlite3

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

@app.after_request
def add_header(response):
    response.headers["Cache-Control"] = "no-cache"
    return response

def get_db():
    db = getattr(g, '_database', None)

    if db is None:
        db = g._database = sqlite3.connect('db/belay.sqlite3')
        db.row_factory = sqlite3.Row
        setattr(g, '_database', db)
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def query_db(query, args=(), one=False):
    db = get_db()
    cursor = db.execute(query, args)
    rows = cursor.fetchall()
    db.commit()
    cursor.close()
    if rows:
        if one: 
            return rows[0]
        return rows
    return None

def get_user_from_cookie(request):
    user_id = request.cookies.get('user_id')
    password = request.cookies.get('user_password')
    if user_id and password:
        return query_db('select * from users where id = ? and password = ?', [user_id, password], one=True)
    return None

@app.errorhandler(404)
def page_not_found(e):
    return app.send_static_file('404.html'), 404

def validate_api_key(req):
    api_key = req.headers['Api-Key']
    if api_key:
        return query_db('select * from users where api_key = ?', [api_key], one=True)
    return None

@app.route('/')
@app.route('/signup')
@app.route('/login')
@app.route('/channel')
@app.route('/landing')
@app.route('/updateprofile')
@app.route('/channel/<channel_id>')
@app.route('/channel/<channel_id>/message/<message_id>')
def index(channel_id = None, message_id = None):
    return app.send_static_file('index.html')

@app.route('/api/channels/new', methods=['GET', 'POST'])
def create_channel():
    user = validate_api_key(request)
    
    if user:
        if request.method == 'POST':
            name = request.headers['channel_name']
            channel = query_db('insert into channels (name) values (?) returning id', [name], one=True)            
            return {'channel_id': channel["id"]}
    else:
        return {'Status': 'Invalid User'}, 401
        
@app.route('/api/login', methods = ['POST'])
def login():
    if request.method == 'POST':
        name = request.headers['username']
        password = request.headers['password']
        user = query_db('select id, api_key, name from users where name = ? and password = ?', [name, password], one=True)
        if not user:
            return {'api_key': ''}
        return {'api_key': user[1], 'user_id': user[0], 'user_name': user[2]}
    return {'api_key': ''}


@app.route('/api/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        name = request.headers['username']
        password = request.headers['password']
        api_key = ''.join(random.choices(string.ascii_lowercase + string.digits, k=40))
        u = query_db('insert into users (name, password, api_key) ' + 
            'values (?, ?, ?) returning id, name, password, api_key',
            (name, password, api_key),
            one=True)
        
        return {'api_key': u['api_key'], 'user_id': u['id'], 'user_name': u['name']}
    
    return {'Status: Unable to create the user!'}, 401


@app.route('/api/activechannel', methods=['GET'])
def getActiveChannel():
    if request.method == 'GET':
        
        channel = query_db('select name from channels where id = ?',[request.headers['channel-num']], one=True)
        
        return {'channel': channel['name']}
    
    return {'Status: Unable to create the user!'}, 401


@app.route('/api/user/name', methods=['POST'])
def change_username():
    user = validate_api_key(request)
    if user:
        if request.method == 'POST':
            update_user = query_db('update users set name = ? where api_key = ? returning id, name', 
                [request.args['user_name'], request.headers['Api-Key']],
                one=True
            )
            return {'name': update_user['name']}
    else:
        return {'Status': 'Invalid User'}, 401
    return {}

# POST to change the user's password
@app.route('/api/user/password', methods=['POST'])
def change_password():
    user = validate_api_key(request)
    if user:
        if request.method == 'POST':
            query_db('update users set password = ? where api_key = ?',
                [request.headers['password'], request.headers['Api-Key']],
                one=True
            )
            return {}, 200
    else:
        return {'Status': 'Invalid User'}, 401
    
    return {'Status': 'Something went wrong!!'}, 403


@app.route('/api/channels', methods=['GET'])
def get_all_channels():
    output = {'allC': []}
    user = validate_api_key(request)
    if user:
        if request.method == 'GET':
            channels = query_db('select * from channels')
            for channel in channels:
                output['allC'].append({'channel_id': channel['id'], 'channel_name': channel['name']})
    else:
        return {'Status': 'Invalid User'}, 401
    return output, 200

# POST to change the name of a channel
@app.route('/api/channel/name', methods=['POST'])
def change_channel():
    user = validate_api_key(request)
    if user:
        if request.method == 'POST':
            query_db('update channels set name = ? where id = ?',
                [request.args['name'], request.args['channel_id']],
                one=True
            )
            return {}, 200
    else:
        return {'Status': 'Invalid User'}, 401
    
    return render_template('404.html'), 404

# GET to get all the messages in a channel
@app.route('/api/channel/messages', methods=['GET'])
def get_chat_messages():
    output = {'allM': []}
    user = validate_api_key(request)
    if user:
        if request.method == 'GET':
            # print(request.headers)
            channel_id = request.args['channel_id']
            messages = query_db('with tmp as (select count(m.replies_to) as replies, m.replies_to, m.id, u.name, m.body, m.channel_id from messages m, ' + 
                        'users u where m.channel_id = ? and m.user_id = u.id and m.replies_to > 0 group by m.replies_to ' + 
                        'order by m.id), tmp2 as (select ifnull(tmp.replies, 0) as repliescount, m.id, u.name, m.body, ' + 
                        'm.replies_to, m.channel_id from messages m inner join users u on m.user_id = u.id left join tmp on m.id = tmp.replies_to and m.channel_id = tmp.channel_id) ' + 
                        'select * from tmp2 where tmp2.replies_to == 0 and tmp2.channel_id = ?', [channel_id, channel_id], one=False)
            if not messages:
                return output
            
            for msg in messages:
                output['allM'].append({'id': msg[1], 'author': msg[2], 'text': msg[3], 'replies': msg[0]})
        return output, 200
    else:
        return {'Status': 'Invalid User'}, 401
    
@app.route('/api/channel/reply', methods=['POST'])
def post_reply():
    user = validate_api_key(request)
    if user:
        if request.method == 'POST':
            u = query_db('insert into messages (user_id, channel_id, body, replies_to) ' + 
                'values (?, ?, ?, ?) returning id, user_id, channel_id, body, replies_to',
                (request.headers['User-Id'], request.args['channel_id'], request.args['body'], request.args['replies_to'] ), one=True)
            return {'status': 'Success'}, 200
    else:
        return {'Status': 'Invalid User'}, 401
    
@app.route('/api/channel/replies', methods=['GET'])
def get_all_replies():
    out = {'allR': []}
    user = validate_api_key(request)
    if user:
        if request.method == 'GET':
            channel_id = request.args['channel_id']
            message_id = request.args['message_id']
            msgs = query_db('select m.id, u.name, m.body from messages m, users u ' + 
                        'where m.channel_id = ? and m.replies_to = ? and m.user_id = u.id order by m.id', [channel_id, message_id], one=False)
            if not msgs:
                return out
            msgsList = []
            for msg in msgs:
                msgsList.append({'id': msg[0], 'name': msg[1], 'body': msg[2], 'replies': 1})
            out['allR'] = msgsList
    else:
        return {'Status': 'Invalid User'}, 401
    return out, 200


# POST to post a new message to a channel
@app.route('/api/channel/new_msg', methods=['POST'])
def post_message():
    user = validate_api_key(request)
    if user:
        if request.method == 'POST':
            u = query_db('insert into messages (user_id, channel_id, body, replies_to) ' + 
            'values (?, ?, ?, ?) returning id, user_id, channel_id, body',
            (request.headers['User-Id'], request.args['channel_id'], request.args['body'], 0), one=True)
        return {'status': 'Success'}, 200
    else:
        return {'Status': 'Invalid User'}, 401
    
@app.route('/api/message/smileys', methods=['GET'])
def get_all_emojjis():
    out = {'allE': []}
    user = validate_api_key(request)
    if user:
        if request.method == 'GET':
            message_id = request.args['message_id']
            smiley_id = request.args['smiley_id']
            
            msgs = query_db('select user_id, name from smileys e, users u where msg_id= ? and smiley_id = ? and u.id = e.user_id', [message_id, smiley_id], one=False)
            if not msgs:
                return out
            smileys = []
            for msg in msgs:
                smileys.append(msg['name'])
            out['allE'] = smileys
    else:
        return {'Status': 'Invalid User'}, 401
    return out, 200

@app.route('/api/message/smileypost', methods=['POST'])
def post_smiley():
    user = validate_api_key(request)
    if user:
        if request.method == 'POST':
            u = query_db('insert into smileys values (?, ?, ?)',
                (request.args['smiley_id'], request.args['message_id'], request.headers['User-Id'] ), one=True)
            return {'status': 'Success'}, 200
    else:
        return {'Status': 'Invalid User'}, 401

@app.route('/api/user/unread', methods=['GET'])
def get_user_unread():
    out = {'allUr': {}}
    user = validate_api_key(request)
    if user:
        if request.method == 'GET':
            user_id = request.headers['User-Id']
            
            msgs = query_db(' select count(m.channel_id) numb, channel_id from messages m where m.replies_to = 0 and m.channel_id in '+ 
                            '(select distinct channel_id from messages except select distinct channel_id from channel_ppl) ' + 
                            'group by m.channel_id union select count(m.channel_id) numb, m.channel_id from messages m, channel_ppl ' +
                            'gp where m.replies_to = 0 and m.channel_id = gp.channel_id and m.id > gp.message_id and gp.user_id = ? group by m.channel_id', [user_id], one=False)
            if not msgs:
                return out
            for msg in msgs:
                out['allUr'][msg ['channel_id']] = msg['numb']
    else:
        return {'Status': 'Invalid User'}, 401
    return out, 200

@app.route('/api/update/user/unread', methods=['POST'])
def update_unread():
    user = validate_api_key(request)
    if user:
        if request.method == 'POST':
            d = query_db('delete from channel_ppl where user_id = ? and channel_id = ?', (request.headers['User-Id'], request.args['channel_id']), one=True)
            u = query_db('insert into channel_ppl values (?, ?, ?)', (request.headers['User-Id'], request.args['channel_id'],  request.args['message_id']), one=True)
            return {'status': 'Success'}, 200
    else:
        return {'Status': 'Invalid User'}, 401