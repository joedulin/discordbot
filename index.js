var Discord = require('discord.js');
var client = new Discord.Client();
var rest = require('restler');
var fs = require('fs');
var db = require('./lib/db.js');
var emoji = require('node-emoji');

var bot_name = 'Experiement#6193';
var bot_id = '382982255531786250';

client.on('ready', () => {
	console.log('Discord Ready');
});

/*
  author:
  ClientUser {
     id: '382982255531786250',
     username: 'Experiment',
     discriminator: '6193',
     avatar: null,
     bot: true,
     lastMessageID: '383012254422925313',
     lastMessage: [Circular],
     verified: true,
     email: null,
     localPresence: {},
     _typing: Map {},
     friends: Collection {},
     blocked: Collection {},
     notes: Collection {},
     premium: null,
     mfaEnabled: false,
     mobile: null,
     settings: ClientUserSettings { user: [Circular]  },
     guildSettings: Collection {} 
  }
*/

client.on('message', message => {
	if (message.author.id == bot_id) return false;
	console.log('Command:', message.content);
	var text = message.content.toLowerCase();
	var for_me = false;
	if (text.substring(0, 1) == '!') {
		for_me = true;
		text = text.substring(1);
	}
	if (text.indexOf(bot_id) !== -1) {
		for_me = true;
	}
	text = text
		.replace(/<@.*>/, '')
		.replace(/[^0-9a-z\s]/g, '')
		.replace('experiment', '')
		.replace('6193', '')
		.trim();
	console.log('After Parse:', text);

	if (!for_me) return false;

	if (typeof text.split(' ')[0] != 'undefined') {
		switch (text.split(' ')[0]) {
			case 'ping': return message.reply('pong');
			case 'reddit': return search_reddit(message);
			case 'gif':
			case 'giphy': return search_giphy(message);
			case 'jellybean': return find_jellybean((resp) => { message.reply(resp);  });
			default: return prompts(message, text);
		}
	}

/*
	switch (text) {
		case 'ping':
			message.reply('pong');
			break;
		case 'jellybean':
			return find_jellybean((resp) => {
				message.reply(resp);
			});
		default:
			return prompts(message, text);
	}
*/
});

function prompts(message, text) {
	db.query("SELECT * FROM auto_response WHERE prompt = ?", [ text ], (err, rows) => {
		if (err) return console.log('MySQL Error:', err);
		if (!rows.length) return false;
		var p = rows[0];
		db.query("SELECT * FROM auto_response_messages WHERE prompt_id = ? ORDER BY RAND() LIMIT 1", [ p.id ], (e2, r2) => {
			if (e2) return console.log('MySQL Error:', e2);
			if (!r2.length) return false;
			message.reply(r2[0].message);
		});
	});
}

function search_giphy (message) {
	var search = message.content.split(' ');
	search.shift();
	search = search.join(' ');
	search = encodeURIComponent(search);
	rest.get('https://api.giphy.com/v1/gifs/translate?api_key=Jky0a6WWEQhVyCV9HmVo3B9bj2vZXHVx&s=' + search).on('complete', (data) => {
		if (typeof data.meta == 'undefined' || typeof data.meta.status == 'undefined' || data.meta.status != 200 || typeof data.data.embed_url == 'undefined') {
			return message.reply('Something done gone screwy here. Please try again. Or give up. The choice is yours.');
		}
		return message.reply(data.data.embed_url);
	});
}

var reddit_regex = /\/r\/([^\s\/]+)/;
function search_reddit(message) {
	var sr = message.content.match(reddit_regex);
	if (!sr) {
		return message.reply('I do not know what you were looking for. Please use the form: !reddit /r/subreddit');
	}
	
	rest.get('https://www.reddit.com' + sr[0] + '.json').on('complete', (data) => {
		var i=0,len=data.data.children.length;
		for (i; i<len; i++) {
			var post = data.data.children[i].data;
			if (!post.url) continue;
			if (post.post_hint != 'image' && post.post_hint != 'rich:video') continue;
			return message.reply(post.url);
		}
		return message.reply('Hmm... Looks like I couldn\'t find it. I\'m sorry. I have been shamed..');
	});
}

function find_jellybean(cb) {
	if (!cb) return false;
	rest.get('https://www.reddit.com/r/jellybeantoes.json').on('complete', (data) => {
		//console.log('Reddit:', data.data.children);
		var i=0,post,len=data.data.children.length;
		for (i; i < len; i++) {
			post = data.data.children[i].data;
			if (!post.url) continue;
			if (post.post_hint != 'image' && post.post_hint != 'rich:video') continue;
			return cb(post.url);
		}
	});
}

function greeting_response(message) {
	var responses = [ 'Great! How are you?', 'Doing well, thank you.', 'Can\'t complain', 'Reasonably fair', 'Life\'s good', 'Having happy times', 'Monkeys', 'Wonderfully decent' ];
	message.reply(responses[Math.floor(Math.random()*responses.length)]);
}

client.login('MzgyOTgyMjU1NTMxNzg2MjUw.DPdnog.Oqkr7Prfo7Ocb-x_MTcXVgHRlTg');


//web management
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var uuid = require('uuid');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false  }));
app.use('/js', express.static('/opt/discord-bot/lib/js'));
app.use('/css', express.static('/opt/discord-bot/lib/css'));
app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false  },
	genid: function (req) {
		return uuid.v4();
	}
}));
app.use((req,res,next) => {
	console.log('GET:', req.query);
	console.log('POST:', req.body);
	console.log('Session:', req.session);
	next();
});

app.get('/', index);
app.get('/login', login);
app.post('/auth', auth);
app.post('/prompts/list', get_prompts);
app.post('/prompts/message/add', add_message);
app.post('/prompts/message/remove', remove_message);
app.post('/prompts/add', add_prompt);
app.post('/prompts/remove', remove_prompt);


function login(req, res) {
	req.session.isLoggedIn = false;
	res.render('login');
}

var users = {
	joe: 'asdf'
};

function auth(req, res) {
	req.session.isLoggedIn = false;
	var username = req.body.username;
	var password = req.body.password;
	if (users[username] == password) {
		req.session.isLoggedIn = true;
		return res.json({ code: 200, data: 'Yep' });
	}
	return res.end('That was wrong');
}

function index(req, res) {
	if (!req.session.isLoggedIn) return login(req, res);
	res.render('index');
}

function get_prompts(req, res) {
	db.query("SELECT * FROM auto_response", (e,prompts) => {
		if (e) {
			console.log('MySQL Error:', err);
			return res.json({ code: 500, data: err });
		}
		var i=0,len=prompts.length;
		var nprompts = [];
		for (i; i<len; i++) {
			var row = prompts[i];
			row.messages = [];
			nprompts[row.id] = row;
		}
		prompts = nprompts;
		db.query("SELECT * FROM auto_response_messages", (e2, messages) => {
			if (e2) {
				console.log('MySQL Error:', err);
				return res.json({ code: 500, data: 'I couldn\'t do that. I wasn\'t good enough' });
			}
			var i=0,len=messages.length;
			for (i; i<len; i++) {
				var message = messages[i];
				prompts[message.prompt_id].messages.push(message);
			}
			prompts = prompts.filter(val => val);
			return res.json({ code: 200, data: prompts });
		});
	});
}

function add_message(req, res) {
	var prompt_id = req.body.prompt_id;
	var message = req.body.message;
	if (!prompt_id || !message) return res.json({ code: 400, data: 'Need more data' });
	message = emoji.unemojify(message);
	db.query("SELECT * FROM auto_response WHERE id = ?", [ prompt_id ], (err, rows) => {
		if (err) console.log('MySQL Error:', err);
		if (!rows.length) return res.json({ code: 400, data: 'Prompt not found' });
		var p = rows[0];
		db.query("INSERT INTO auto_response_messages VALUES (null, ?, ?, null, null)", [ prompt_id, message ], (err2) => {
			if (err2) {
				console.log('MySQL Error:', err2);
				return res.json({ code: 500, data: 'MySQL Error' });
			}
			return res.json({ code: 200, data: 'Message added' });
		});
	});
}

function add_prompt(req, res) {
	var ptext = req.body.ptext.toLowerCase().trim();
	if (!ptext) return res.json({ code: 400, data: 'Really?' });
	ptext = emoji.unemojify(ptext);
	db.query("SELECT * FROM auto_response WHERE prompt = ?", [ ptext ], (err, rows) => {
		if (err) {
			console.log('MySQL Error:', err);
			return res.json({ code: 500, data: 'Something done gone funky' });
		}
		if (rows.length) return res.json({ code: 400, data: 'You already have that one...' });
		db.query("INSERT INTO auto_response VALUES (null, ?, null, null)", [ ptext ], (err2) => {
			if (err2) {
				console.log('MySQL Error:', err2);
				return res.json({ code: 500, data: 'Well shit. This ain\'t right' });
			}
			return res.json({ code: 200, data: 'Did the thing' });
		});
	});
}

function remove_message(req, res) {
	var message_id = req.body.message_id;
	if (!message_id) return res.json({ code: 400, data: 'That isn\'t quite right' });
	db.query("DELETE FROM auto_response_messages WHERE id = ?", [ message_id ], (err) => {
		if (err) {
			console.log('MySQL Error:', err);
			return res.json({ code: 500, data: 'Broke something' });
		}
		return res.json({ code: 200, data: 'Whoosh' });
	});
}

function remove_prompt(req, res) {
	var prompt_id = req.body.prompt_id;
	if (!prompt_id) return res.json({ code: 400, data: "I can't do that, Dave" });
	db.query("DELETE FROM auto_response WHERE id = ?", [ prompt_id ], (err) => {
		if (err) {
			console.log('MySQL Error:', err);
			return res.json({ code: 500, data: 'Yeah, that isn\'t working right' });
		}
		return res.json({ code: 200, data: 'Bam!' });
	});
}

app.listen(8123);
