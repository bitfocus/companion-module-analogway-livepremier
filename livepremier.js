var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	this.maxScreens = 24;
	this.maxAuxScreens = 20;

	this.choicesDest = [];

	for (var i=1; i<= this.maxScreens; i++) {
		this.choicesDest[i-1] = {
			type: 'checkbox',
			label: 'Screen '+i,
			id: 's'+i,
			default: false
		}
	}

	for (var i=1; i<= this.maxAuxScreens; i++) {
		this.choicesDest[i-1+this.maxScreens] = {
			type: 'checkbox',
			label: 'Aux-Screen '+i,
			id: 'a'+i,
			default: false
		}
	}



	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;

	self.actions();
};

instance.prototype.init = function() {
	var self = this;

	self.init_presets();
	self.status(self.STATE_OK);

	debug = self.debug;
	log = self.log;
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'IP of LivePremier device',
			default: '192.168.2.140',
			regex: self.REGEX_IP,
			width: 6
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;
	debug("destroy");
};

instance.prototype.actions = function(system) {
	var self = this;
	var urlLabel = 'URL';

/*

		Here's the deal for self-generating commands:
		- all commands are translated to http POST requests
		- the action name is translated to the URI, it has to start with /
		- the action name can contain words in {}, if an option named likewise is found, the part will be replaced with that options value
		- all options, which are not replaced into the URI are used to build the body JSON object
		- if the body shall be no JSON, write it in the action after the URI and a space
		- {word} in the body can be replaced with option values as well
		- if there is an option called "body" its value will be used as the body instead of all the other stuff

 */

	self.setActions({
		'/api/tpp/v1/screens/{screenId}/load-memory': {
			label: 'Recall Memory to Screen',
			options: [
				{
					type: 'number',
					label: 'Memory',
					id: 'memoryId',
					min: 1,
					max: 1000,
					default: 1,
					required: true
				},
				{
					type: 'number',
					label: 'Screen',
					id: 'screenId',
					min: 1,
					max: self.maxScreens,
					default: 1,
					required: true
				},
				{
					type: 'dropdown',
					label: 'Recall to',
					id: 'target',
					choices: [
						{id: 'preview', label: 'Preview'},
						{id: 'program', label: 'Program'}
					],
					default: 'preview'
				}
			]
		},
		'/api/tpp/v1/auxiliary-screens/{auxId}/load-memory': {
			label: 'Recall Memory to Aux-Screen',
			options: [
				{
					type: 'number',
					label: 'Memory',
					id: 'memoryId',
					min: 1,
					max: 1000,
					default: 1,
					required: true
				},
				{
					type: 'number',
					label: 'Aux-Screen',
					id: 'auxId',
					min: 1,
					max: self.maxAuxScreens,
					default: 1,
					required: true
				},
				{
					type: 'dropdown',
					label: 'Recall to',
					id: 'destinationId',
					choices: [
						{id: 'preview', label: 'Preview'},
						{id: 'program', label: 'Program'}
					],
					default: 'preview'
				}
			]
		},
		'/api/tpp/v1/load-master-memory': {
			label: 'Recall Master-Memory',
			options: [
				{
					type: 'number',
					label: 'Memory',
					id: 'memoryId',
					min: 1,
					max: 500,
					default: 1,
					required: true
				},
				{
					type: 'dropdown',
					label: 'Recall to',
					id: 'target',
					choices: [
						{id: 'preview', label: 'Preview'},
						{id: 'program', label: 'Program'}
					],
					default: 'preview'
				}
			]
		},
		'/api/tpp/v1/multiviewers/{mvwId}/load-memory': {
			label: 'Recall Multiviewer-Memory',
			options: [
				{
					type: 'number',
					label: 'Memory',
					id: 'memoryId',
					min: 1,
					max: 50,
					default: 1,
					required: true
				},
				{
					type: 'number',
					label: 'Multiviewer',
					id: 'mvwId',
					min: 1,
					max: 2,
					default: 1,
					required: true
				}
			]
		},
		'/api/tpp/v1/screens/{screenId}/layers/{layerId}/presets/{target}/source': {
			label: 'Set Screen Layer Source',
			options: [
				{
					type: 'number',
					label: 'Screen',
					id: 'screenId',
					min: 1,
					max: self.maxScreens,
					default: 1,
					required: true
				},
				{
					type: 'number',
					label: 'Layer',
					id: 'layerId',
					min: 1,
					max: 48,
					default: 1,
					required: true
				},
				{
					type: 'dropdown',
					label: 'Set in',
					id: 'target',
					choices: [
						{id: 'preview', label: 'Preview'},
						{id: 'program', label: 'Program'}
					],
					default: 'preview'
				},
				{
					type: 'dropdown',
					label: 'Source Type',
					id: 'sourceType',
					choices: [
						{id: 'none', label: 'None'},
						{id: 'input', label: 'Input'},
						{id: 'image', label: 'Image'},
						{id: 'screen', label: 'Screen'},
						{id: 'color', label: 'Color'}
					],
					default: 'input'
				},
				{
					type: 'number',
					label: 'Source ID',
					id: 'sourceId',
					min: 1,
					max: 48,
					default: 1,
					required: true
				}
			]
		},
		'/api/tpp/v1/auxiliary-screens/{auxId}/layers/{layerId}/presets/{target}/source': {
			label: 'Set Aux-Screen Layer Source',
			options: [
				{
					type: 'number',
					label: 'Aux-Screen',
					id: 'auxId',
					min: 1,
					max: self.maxScreens,
					default: 1,
					required: true
				},
				{
					type: 'number',
					label: 'Layer',
					id: 'layerId',
					min: 1,
					max: 48,
					default: 1,
					required: true
				},
				{
					type: 'dropdown',
					label: 'Set in',
					id: 'target',
					choices: [
						{id: 'preview', label: 'Preview'},
						{id: 'program', label: 'Program'}
					],
					default: 'preview'
				},
				{
					type: 'dropdown',
					label: 'Source Type',
					id: 'sourceType',
					choices: [
						{id: 'none', label: 'None'},
						{id: 'input', label: 'Input'},
						{id: 'image', label: 'Image'},
						{id: 'screen', label: 'Screen'}
						// {id: 'color', label: 'Color'} No color in Aux?
					],
					default: 'input'
				},
				{
					type: 'number',
					label: 'Source ID',
					id: 'sourceId',
					min: 1,
					max: 48,
					default: 1,
					required: true
				}
			]
		},
		'/api/tpp/v1/screens/{screenId}/background-layer/presets/{target}/source': {
			label: 'Set Native Background',
			options: [
				{
					type: 'number',
					label: 'Screen',
					id: 'screenId',
					min: 1,
					max: self.maxScreens,
					default: 1,
					required: true
				},
				{
					type: 'dropdown',
					label: 'Set in',
					id: 'target',
					choices: [
						{id: 'preview', label: 'Preview'},
						{id: 'program', label: 'Program'}
					],
					default: 'preview'
				},
				{
					type: 'dropdown',
					label: 'Source Type',
					id: 'sourceType',
					choices: [
						{id: 'none', label: 'None'},
						{id: 'background-set', label: 'Background-Set'}
					],
					default: 'background-set'
				},
				{
					type: 'number',
					label: 'Background-Set Number',
					id: 'sourceId',
					min: 1,
					max: 8,
					default: 1,
					required: true
				}
			]
		},
		'/api/tpp/v1/multiviewers/{mvwId}/widgets/{widgetId}/source': {
			label: 'Set Multiviewer Widget Source',
			options: [
				{
					type: 'number',
					label: 'Multiviewer',
					id: 'mvwId',
					min: 1,
					max: 2,
					default: 1,
					required: true
				},
				{
					type: 'number',
					label: 'Widget',
					id: 'widgetId',
					min: 1,
					max: 24,
					default: 1,
					required: true
				},
				{
					type: 'dropdown',
					label: 'Source Type',
					id: 'sourceType',
					choices: [
						{id: 'none', label: 'None'},
						{id: 'input', label: 'Input'},
						{id: 'image', label: 'Image'},
						{id: 'screen-program', label: 'Screen Program'},
						{id: 'screen-preview', label: 'Screen Preview'},
						{id: 'auxiliary-screen', label: 'Aux-Screen'},
						{id: 'timer', label: 'Timer'}
					],
					default: 'input'
				},
				{
					type: 'number',
					label: 'Source ID',
					id: 'sourceId',
					min: 1,
					max: 48,
					default: 1,
					required: true
				}
			]
		},
		'/api/tpp/v1/screens/{screenId}/take': {
			label: 'Take Single Screen',
			options: [
				{
					type: 'number',
					label: 'Screen',
					id: 'screenId',
					min: 1,
					max: self.maxScreens,
					default: 1,
					required: true
				}
			]
		},
		'/api/tpp/v1/auxiliary-screens/{auxId}/take': {
			label: 'Take Single Aux-Screen',
			options: [
				{
					type: 'number',
					label: 'Aux-Screen',
					id: 'auxId',
					min: 1,
					max: self.maxAuxScreens,
					default: 1,
					required: true
				}
			]
		},
		'/api/tpp/v1/take': {
			label: 'Take all Screens and Aux-Screens'
		},
		'multitake': {
			label: 'Take multiple Screens and Aux-Screens',
			options: this.choicesDest
		}
	});
};

instance.prototype.action = function(action) {
	var self = this;
	var path = action.action.match(/^[\w/{}]+/)[0] || '';
	var body = '';
	if (action.action.match(/ (.+)$/)) {
		body = action.action.match(/ (.+)$/)[1];
	}
	var bodyjson = {};

	/*if ( self.config.host === undefined || self.config.host.match(self.REGEX_IP) === null ) {
		self.log('error', 'The entered host adress is not a valid IP');
		debug('Abort, wrong ip');
		return;
	}*/


	if (action.options) {
		var opt;
		for (opt in action.options) {
			if (path.match('{'+opt+'}') || body.match('{'+opt+'}')) {
				path = path.replace('{' + opt + '}', action.options[opt]);
				body = body.replace('{'+opt+'}', action.options[opt]);
			} else {
				bodyjson[opt] = action.options[opt];
			}
		}
		if (action.options.hasOwnProperty('body') && action.options['body'] != '') {
			body = action.options['body'];
		}
	}

	if(action.action == 'multitake') {
		path = '/api/tpp/v1/take';
		bodyjson = {
			screenIds: [],
			auxiliaryScreenIds: []
		};
		for (var opt in action.options) {
			if (action.options[opt] === true) {
				if (opt.substr(0,1) === 's') {
					bodyjson.screenIds.push(parseInt(opt.slice(1)));
				} else if (opt.substr(0,1) === 'a') {
					bodyjson.auxiliaryScreenIds.push(parseInt(opt.slice(1)));
				}
			}
		}
	}

	if (bodyjson === {}) {
		try {
			bodyjson = JSON.parse(body);
		} catch(e){
			self.log('error', 'Trying to send malformed JSON body (' + e.message+ ')');
			return;
		}
	}

	self.system.emit('rest', 'http://'+ self.config.host + path, bodyjson, function (err, result) {
		if (err !== null) {
			self.log('error', 'HTTP POST Request failed (' + result.error.code + ')');
			self.status(self.STATUS_ERROR, result.error.code);
		}
		else {
			self.status(self.STATUS_OK);
		}
	});

};


instance.prototype.init_presets = function () {
	var self = this;
	var presets = [];

	for (var scr = 1; scr <= this.maxScreens; scr++) {
		presets.push({
			category: 'Take Screen',
			label: 'Take screen ' + scr,
			bank: {
				style: 'png',
				text: 'TAKE S' + scr,
				size: 'auto',
				color: 0,
				bgcolor: self.rgb(255, 0, 0)
			},
			actions: [
				{
					action: '/api/tpp/v1/screens/{screenId}/take',
					options: {
						screenId: scr
					}
				}
			]
		});
	}
	for (var scr = 1; scr <= this.maxAuxScreens; scr++) {
		presets.push({
			category: 'Take Aux-Screen',
			label: 'Take screen ' + scr,
			bank: {
				style: 'png',
				text: 'TAKE Aux' + scr,
				size: 'auto',
				color: 0,
				bgcolor: self.rgb(255, 0, 0)
			},
			actions: [
				{
					action: '/api/tpp/v1/auxiliary-screens/{auxId}/take',
					options: {
						auxId: scr
					}
				}
			]
		});
	}

	this.setPresetDefinitions(presets);
};


instance_skel.extendedBy(instance);
exports = module.exports = instance;