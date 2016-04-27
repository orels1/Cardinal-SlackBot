//Slack
var RtmClient = require('@slack/client').RtmClient;
var WebClient = require('@slack/client').WebClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;

//Everything else
var cheerio = require('cheerio');
var request = require('request');
var _ = require('underscore');
var fs = require('fs');
var moment = require('moment');
var CronJob = require('cron').CronJob;

moment.locale('ru');

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
	commands: {},
	service: {}
}

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
	console.log('Cardinal Online');
});

rtm.on(RTM_EVENTS.MESSAGE, function (message) {
	// Listens to all `message` events from the team
	if(message.user != bot && message.text){
		if (message.text.substr(0,1) == prefix && message.text.length > 1){
			console.log('incoming ', message);
			//web.chat.delete(message.ts, message.channel);
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
	//Pings stuff back //
	rtm.sendMessage('pong', ctx.channel);
	console.log(ctx.commands.ping);
}

ctx.commands.help = function(ctx, args){
	var helpObj = {};
	var message = '';
	Object.keys(ctx.commands).forEach(function(element, i){
		var fnStr = ctx.commands[element].toString();
		var helpStart = fnStr.indexOf('//') + 2;
		var helpLength = fnStr.substr(helpStart).indexOf('//');
		var fnHelp = fnStr.substr(helpStart, helpLength)
		if (element == 'help') fnHelp = ' Returns help info'
		helpObj[element] = fnHelp;
	});
	console.log(helpObj);
	if (args.length == 0){
		message += 'Available commands:\n```';
		Object.keys(ctx.commands).forEach(function(element, i){
			message += element + '\n';
			message += '	' + helpObj[element] + '\n';
		});
		message += '```';
	}else{
		if(helpObj[args[0]]){
			message += '```';
			message += helpObj[args[0]] += '\n';
			message += '```';
		}else{
			message += 'No such command, type ' + prefix + 'help for a list of commands';
		}
		
	}
	rtm.sendMessage(message, ctx.channel);
}

ctx.commands.fetch = function(ctx, args){
	//Fetches <stuff> to <user> //
	rtm.sendMessage('Have your ' + args[0] + ', ' + (args[1] ? args[1] : '<@'+ctx.user+'>'), ctx.channel);
}

function flipUser(user, reverse){
	var char = "abcdefghijklmnopqrstuvwxyz".split('');
    var tran = "ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz".split('');
    if (reverse){
    	var temp = char;
    	char = tran;
    	tran = temp;
    }
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

    return userArr.reverse().join('');
}

ctx.service.getUser = function(mention, callback){
	var user = mention.replace('<@','').replace('>','');
	web.users.info(user, function(err, info){
		user = info.user.name;
		callback(user);
	})
}

ctx.commands.flip = function(ctx, args){
	//Flips a coin... or a <user> or a table :D //
	var choice = ['HEADS!*', 'TAILS!*'];

	function getRandomInt(min, max){
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	

	if (args.length > 0){
		if(args[0].substr(0,1) == '<' ){
			var user = args[0].replace('<@','').replace('>','');
			web.users.info(user, function(err, info){
				user = info.user.name;

				rtm.sendMessage('(╯°□°）╯︵ ' + flipUser(user, false), ctx.channel);
			})
		} 
		else if (args[0] == 'table'){
			rtm.sendMessage('(╯°□°）╯︵ ┻━┻', ctx.channel);
		}
		else {
			rtm.sendMessage('(╯°□°）╯︵ ' + flipUser(args.join(' '), false), ctx.channel);
		}
	}else{
		rtm.sendMessage('*flips a coin and... ' + choice[getRandomInt(0,1)], ctx.channel);
	}
}

ctx.commands.unflip = function(ctx, args){
	//Unflipps <flipped_user> //
	rtm.sendMessage(flipUser(args.join(' '), true)+' ノ( ゜-゜ノ)', ctx.channel);
}

ctx.commands.exterminatus = function(ctx, args){       
	//You don't need help with that //
	if(args.length == 0){
		var message = "LOADING BOMBS... BOMBS CAPACITY 20%... 40%... 60%... 80%... 100%... BOMBS READY! AWAITING COMMANDS... TYPE \""+prefix+"EXTERMINATUS LAUNCH\" TO CONFIRM"
		var arr = message.split('... ');
		rtm.sendMessage('EXTERMINATUS PERMISSION GRANTED... ', ctx.channel);

		function myLoop (i) {          
			setTimeout(function () {  
				rtm.sendMessage(arr[i]+'...\n', ctx.channel);        //  your code here                
					if (i++ < arr.length -1) myLoop(i);      //  decrement i and call myLoop again if i > 0
			}, 1500)
		};  

		myLoop(0);

		setTimeout(function(){
			rtm.sendMessage('http://static.oper.ru/data/site/111012sm10.jpg', ctx.channel);
		}, 12000)

	}else{
		if(args[0] == 'launch'){
			var img = 'http://cs302502.vk.me/v302502247/378a/3CY-A1eVptI.jpg';
			rtm.sendMessage('LAUNCH CONFIRMED...\nEXTERMINATE ALL HERESY!!!\n'+img, ctx.channel);
		}
	}
}

ctx.commands.dota = function(ctx, args){
	//Various dota 2 commands //
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

ctx.commands.lenny = function(ctx, args){
	//Draws a random ASII face //
	function getRandomInt(min, max){
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	var ears = ['q{}p', 'ʢ{}ʡ', '⸮{}?', 'ʕ{}ʔ', 'ᖗ{}ᖘ', 'ᕦ{}ᕥ', 'ᕦ({})ᕥ', 'ᕙ({})ᕗ', 'ᘳ{}ᘰ', 'ᕮ{}ᕭ', 'ᕳ{}ᕲ', '({})', '[{}]', '¯\\\_{}_/¯', '୧{}୨', '୨{}୧', '⤜({})⤏', '☞{}☞', 'ᑫ{}ᑷ', 'ᑴ{}ᑷ', 'ヽ({})ﾉ', '\\\({})/', '乁({})ㄏ', '└[{}]┘', '(づ{})づ', '(ง{})ง', '|{}|'];
	var eyes = ['⌐■{}■', ' ͠°{} °', '⇀{}↼', '´• {} •`', '´{}`', '`{}´', 'ó{}ò', 'ò{}ó', '>{}<', 'Ƹ̵̡ {}Ʒ', 'ᗒ{}ᗕ', '⪧{}⪦', '⪦{}⪧', '⪩{}⪨', '⪨{}⪩', '⪰{}⪯', '⫑{}⫒', '⨴{}⨵', "⩿{}⪀", "⩾{}⩽", "⩺{}⩹", "⩹{}⩺", "◥▶{}◀◤", "≋{}≋", "૦ઁ{}૦ઁ", "  ͯ{}  ͯ", "  ̿{}  ̿", "  ͌{}  ͌", "ළ{}ළ", "◉{}◉", "☉{}☉", "・{}・", "▰{}▰", "ᵔ{}ᵔ", "□{}□", "☼{}☼", "*{}*", "⚆{}⚆", "⊜{}⊜", ">{}>", "❍{}❍", "￣{}￣", "─{}─", "✿{}✿", "•{}•", "T{}T", "^{}^", "ⱺ{}ⱺ", "@{}@", "ȍ{}ȍ", "x{}x", "-{}-", "${}$", "Ȍ{}Ȍ", "ʘ{}ʘ", "Ꝋ{}Ꝋ", "๏{}๏", "■{}■", "◕{}◕", "◔{}◔", "✧{}✧", "♥{}♥", " ͡°{} ͡°", "¬{}¬", " º {} º ", "⍜{}⍜", "⍤{}⍤", "ᴗ{}ᴗ", "ಠ{}ಠ", "σ{}σ"];
	var mouth = ['v', 'ᴥ', 'ᗝ', 'Ѡ', 'ᗜ', 'Ꮂ', 'ヮ', '╭͜ʖ╮', ' ͟ل͜', ' ͜ʖ', ' ͟ʖ', ' ʖ̯', 'ω', '³', ' ε ', '﹏', 'ل͜', '╭╮', '‿‿', '▾', '‸', 'Д', '∀', '!', '人', '.', 'ロ', '_', '෴', 'ѽ', 'ഌ', '⏏', 'ツ', '益'];

	var earsChoice = ears[getRandomInt(0,ears.length-1)];
	var eyesChoice = eyes[getRandomInt(0,eyes.length-1)];
	var mouthChoice = mouth[getRandomInt(0,mouth.length-1)];
	var lenny = earsChoice.substr(0,earsChoice.indexOf('{'));
	lenny += eyesChoice.substr(0,eyesChoice.indexOf('{'));
	lenny += mouthChoice;
	lenny += eyesChoice.substr(eyesChoice.indexOf('}')+1);
	lenny += earsChoice.substr(earsChoice.indexOf('}')+1);

	rtm.sendMessage(lenny, ctx.channel);
}

ctx.commands.moder = function(ctx, args){
	//Useful moder's stuff. count <user> returns amount of entries in DB for the user. last - returns last 3 entries //
	if(args[0] == 'count'){
		if(args.length > 2) {
			var user = args.splice(1).join(' ');
		}else{
			var user = args[1];
		}
		request('http://moder.kanobu.ru/api/feedList/user/' + encodeURI(user), function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var data = JSON.parse(body);
				rtm.sendMessage('User *' + decodeURI(user) + '* has *' + data.result.length + '* entries in DB', ctx.channel);
			}
		});		
	} else if (args[0] == 'last' ){
		console.log('last');
		request('http://moder.kanobu.ru/api/feedList', function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var data = JSON.parse(body).result;
				var attachments = [];
				var i = 0;
				data.some(function(element){
					attachments.push({
						fallback: 'Last 3 entries in DB',
						color: (element.action == 'Предупреждение' ? '#f1c40f' : '#e74c3c'),
						author_name: element.targetUser,
						author_icon: element.targetUserAvatar,
						author_link: 'http://moder.kanobu.ru/feed/user/' + element.targetUser,
						fields: [
							{value: element.action},
							{value: element.reason}
						]
					});
					if(i == 2) {return true}
					else {i++; return false}
				});
				console.log(attachments);
				web.chat.postMessage(ctx.channel, 'Showing 3 last entries', {attachments: attachments, as_user: true});
			}
		});	
	} else if (args[0] == 'history' ){

		function getPrevNames(user, search){
			request('http://moder.kanobu.ru/api/feedSearch/' + search, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					var data = JSON.parse(body);
					var result = _.uniq(_.pluck(data, 'name'));
					rtm.sendMessage('User *' + user + '* was also known as *' + result.join('*, *') + '*', ctx.channel);
				}
			});	
		}

		if(args[1] == 'name'){
			var knbId = '';

			if(args.length > 3) {
				var user = args.splice(2).join(' ');
			}else{
				var user = args[2];
			}

			request('http://moder.kanobu.ru/api/feedList/user/' + encodeURI(user), function (error, response, body) {
				if (!error && response.statusCode == 200) {
					var data = JSON.parse(body);
					if (data.result.length > 0){
						var knbId = data.result[0].knbId;
						getPrevNames(user, encodeURI('id:' + knbId));
					} else {
						rtm.sendMessage('User not found', ctx.channel);
					}
				}
			});	
			

		} else if (args[1] == 'id'){
			var knbId = args[2];
			getPrevNames('id: '+knbId, 'id:'+knbId);
		}
	}
}


//DARK SOULS
ctx.commands.ds3 = function(ctx, args){
	var time = '2016-04-12 01:00:00';
	
	rtm.sendMessage('Dark Souls 3 выйдет *' + moment(time).fromNow() + '*\nhttp://risovach.ru/upload/2015/06/mem/muzhik-sypet-pesok-na-plyazhe_84411601_orig_.jpg', ctx.channel);
}

//new CronJob('* * * * * *', function() {
//	var payload = {channel: 'C062K581Z'};
//	ctx.commands.ds3(payload);
//}, null, true, 'Europe/Moscow');




