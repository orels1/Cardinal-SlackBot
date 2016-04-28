'use strict'

class General {
	constructor() {
		this.commands = [
			'ping',
			'fetch',
			'flip',
			'unflip'
		]
	}

	ping(ctx) {
		// Pings stuff back //
		ctx.rtm.sendMessage('pong', ctx.channel)
	}

	fetch(ctx, stuff, user) {
		// Fetches <stuff> to <user> //
		ctx.rtm.sendMessage('Have your ' + stuff + ', ' + user, ctx.channel)
	}

	static flipUser(user, reverse) {
		let char = 'abcdefghijklmnopqrstuvwxyz'.split('')
		let tran = 'ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz'.split('')
		if (reverse) {
			let temp = char
			char = tran
			tran = temp
		}
		let table = {}
		char.forEach(function(element, i) {
			table[element] = tran[i]
		})

		let userArr = user.split('')
		userArr.forEach(function(element, i) {
			if (table[element]) {
				userArr[i] = table[element]
			}
		})

		return userArr.reverse().join('')
	}

	flip(ctx, user) {
		// Flips a coin... or a <user> or a table :D //
		let choice = ['HEADS!*', 'TAILS!*']

		function getRandomInt(min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min
		}

		if (user.substr(0, 1) === '<' ) {
			user = user.replace('<@', '').replace('>', '')
			ctx.web.users.info(user, function(err, info) {
				user = info.user.name
				ctx.rtm.sendMessage('(╯°□°）╯︵ ' + General.flipUser(user, false), ctx.channel)
			})
		} else if (user === 'table') {
			ctx.rtm.sendMessage('(╯°□°）╯︵ ┻━┻', ctx.channel)
		} else {
			ctx.rtm.sendMessage('(╯°□°）╯︵ ' + General.flipUser(args.join(' '), false), ctx.channel)
		}
	}

	unflip(ctx, user) {
		// Unflipps <flipped_user> //
		ctx.rtm.sendMessage(General.flipUser(user, true) + ' ノ( ゜-゜ノ)', ctx.channel)
	}

}

module.exports = General
