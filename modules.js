const General = require('./modules/general')
const general = new General()

module.exports = {
	'general': {
		'module': general,
		'commands': general.commands,
	},
}
