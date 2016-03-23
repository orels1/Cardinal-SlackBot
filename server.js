//Slack
var RtmClient = require('@slack/client').RtmClient;
var WebClient = require('@slack/client').WebClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;

//Everything else
var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');

var token = process.env.SLACK_API_TOKEN || 'xoxb-28712752370-dYR4fkIPJ4s31N7uZwd9mIVN';

var rtm = new RtmClient(token); // For realtime
var web = new WebClient(token);	// For webhooks

rtm.start();

var prefix = '?';

var owner = '062K6796';
var bot = 'U0ULYN4AW'

var ctx = {
	channel : '',
	user: '',
	commands: {}
}

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
	console.log('Cardinal Online');
});

rtm.on(RTM_EVENTS.MESSAGE, function (message) {
	// Listens to all `message` events from the team
	if(message.user != bot && message.text){
		if (message.text.substr(0,1) == prefix){
			console.log('incoming ', message);
			get_command(message);	
		}
	}
});

function get_command(message){
	var args = message.text.substr(1).split(' ');
	ctx.channel  = message.channel;
	ctx.user = message.user;
	executeFunctionByName(args[0], ctx, args.splice(1));
}

function executeFunctionByName(functionName, context, args) {
	if (!context['commands'][functionName]){
		rtm.sendMessage('No such command, type ' + prefix + 'help for a list of commands', ctx.channel);
	}else{
		context['commands'][functionName](context, args);
	}
}

ctx.commands.ping = function(ctx, args){
	rtm.sendMessage('pong', ctx.channel);
}

ctx.commands.help = function(ctx, args){
	rtm.sendMessage('Available commands:\n```' + Object.keys(ctx.commands).join('\n') + '```', ctx.channel);
}

ctx.commands.fetch = function(ctx, args){
	rtm.sendMessage('Have your ' + args[0] + ', <@'+ctx.user+'>', ctx.channel);
}

ctx.commands.flip = function(ctx, args){
	var choice = ['HEADS!*', 'TAILS!*'];

	function getRandomInt(min, max){
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function flipUser(user){
		var char = "abcdefghijklmnopqrstuvwxyz".split('');
        var tran = "ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz".split('');
        var table = {};
        char.forEach(function(element, i){
        	table[element] = tran[i];
        });

        var userArr = user.split('')
        userArr.forEach(function(element, i){
        	if(table[element]){
        		userArr[i] = table[element];
        	}
        });

        rtm.sendMessage('(╯°□°）╯︵ ' + userArr.reverse().join(''), ctx.channel);
	}

	if (args.length > 0){
		if(args[0].substr(0,1) == '<' ){
			var user = args[0].replace('<@','').replace('>','');
			web.users.info(user, function(err, info){
				user = info.user.name;

				flipUser(user);
			})
		} 
		else{
			flipUser(args[0]);
		}
	}else{
		rtm.sendMessage('*flips a coin and... ' + choice[getRandomInt(0,1)], ctx.channel);
	}
	
}

ctx.commands.dota = function(ctx, args){
	if(args.length > 0){

		if(args[0] == 'online'){
			request('http://steamcharts.com/app/570', function (error, response, body) {
				if (!error && response.statusCode == 200) {
					
					$ = cheerio.load(body);
					var online = $($('.app-stat')[0]).find('.num').text(); 
					rtm.sendMessage('There are ' + online + ' players in Dota 2 at the moment.', ctx.channel);
				}
			})	
		}else if (args[0] == 'hero' && args.length > 1){
			fs.readFile('./data/herodata.json', function(err, data){
				if(err) return rtm.sendMessage(':gun:\n' + err, ctx.channel);
				var herodata = JSON.parse(data);
				var herokeys = Object.keys(herodata);
				var heronames = {};
				var heronames_i = {};
				herokeys.forEach(function(element, i){
					heronames[herodata[element]['displayname']] = element;
					heronames_i[element] = herodata[element]['displayname'];
				})
				function toTitle(string) {
				    return string.charAt(0).toUpperCase() + string.slice(1);
				}
				var herojson = herodata[heronames[toTitle(args[1])]];
				image = 'http://cdn.dota2.com/apps/dota2/images/heroes/' + heronames[toTitle(args[1])].replace('npc_dota_hero_','') + '_full.png';
				if (herojson['attackrange'] == 128){
					var herotype = 'Melee';
				}else{
					var herotype = 'Ranged';
				}

				var message = '';
				message += image + '\n';
				message += '*' + toTitle(args[1]) + '* (' + herotype + ')\n';
				var bio = herojson['bio'];
				bio = bio.split('.')[0];
				var role = herojson['role'].replace(',',', ');
				message += '_' + role + '_\n';

				var data = {
					attachments : [
						{
							pretext: 'Bio',
							text: bio
						},
						{
							pretext: 'Skills'
						}
					],
					as_user: true
				}

				herojson['abilities'].forEach(function(element, i){
					if (element['displayname'] != 'Attribute Bonus'){
						data.attachments.push({
							pretext: element['displayname']
							//text: element['description']
						});
						var damageTxt = 'Damage: ';
						element['damage'].forEach(function(damage, i){
							damageTxt += '[lvl' + (i+1) + ']: ' + damage + ' ';
						});
						damageTxt += '\n';
						var cooldownTxt = 'Cooldown: ';
						element['cooldown'].forEach(function(cooldown, i){
							cooldownTxt += '[lvl' + (i+1) + ']: ' + cooldown + ' ';
						});
						cooldownTxt += '\n';
						var manacostTxt = 'Manacost: ';
						element['manacost'].forEach(function(manacost, i){
							manacostTxt += '[lvl' + (i+1) + ']: ' + manacost + ' ';
						});
						data.attachments.push({
							text: damageTxt+cooldownTxt+manacostTxt
						});
					}
				});

				web.chat.postMessage(ctx.channel, message, data);

			})
		}else{
			rtm.sendMessage('Enter valid command: `hero <hero> info` or `online`', ctx.channel);
		}

	}else{
		rtm.sendMessage('Returns various dota 2 info', ctx.channel);
	}
}