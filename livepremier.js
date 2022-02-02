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

  this.choicesAudioIn = [{
    label: 'None',
    id: '"sourceType":"none"'
  }];
  this.choicesAudioOut = [];

  for (var i=1; i<= 64; i++) {
		this.choicesAudioOut.push( {
			label: `Dante Out ${Math.floor((i-1)/8)+1}/${(i-1)%8+1} (${i})`,
			id: 'dante/channels/'+i,
		} );
    this.choicesAudioIn.push( {
			label: `Dante In ${Math.floor((i-1)/8)+1}/${(i-1)%8+1} (${i})`,
			id: `"sourceType":"dante","channelId":${i}`,
		} );
	}

  for (var i=1; i<= 24; i++) {
    for (var c=1; c<= 8; c++) {
		  this.choicesAudioOut.push( {
			  label: `Output ${i} Channel ${c}`,
			  id: `outputs/${i}/channels/${c}`
		  } );
      this.choicesAudioIn.push( {
			  label: `Input ${i} Channel ${c}`,
			  id: `"sourceType":"input","sourceId":${i},"channelId":${c}`
		  } );
    }
	}

  for (var i=1; i<= 2; i++) {
    for (var c=1; c<= 8; c++) {
		  this.choicesAudioOut.push( {
			  label: `Multiviewer ${i} Channel ${c}`,
			  id: `multiviewers/${i}/channels/${c}`
		  } );
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
			regex: '/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(:([1-9]|[1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9]|[1-8][0-9]{3}|9[0-8][0-9]{2}|99[0-8][0-9]|999[0-9]|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-4]))?$/',
			width: 6,
      tooltip: 'Enter only the IPv4 adress without "http://", you may also add a port number'
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
					id: 'target',
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
		},
    'audiorouteblock': {
      label: 'Route audio block',
      options: [
        {
          type: 'dropdown',
          label: 'First Output Channel',
          id: 'out',
          choices: this.choicesAudioOut,
          default: 'dante/channels/1',
          minChoicesForSearch: 0
        },
        {
          type: 'dropdown',
          label: 'First Input Channel',
          id: 'in',
          choices: this.choicesAudioIn,
          default: '"sourceType":"none"',
          minChoicesForSearch: 0,
          tooltip: 'Tip: Source None virtually expands to the block size'
        },
        {
          type: 'number',
          label: 'Block Size',
          id: 'blocksize',
          default: 8,
          min: 1,
          max: this.choicesAudioOut.length,
          range: true
        }
      ]
    },
    'audioroute': {
      label: 'Route audio channel(s)',
      options: [
        {
          type: 'dropdown',
          label: '(first) output channel',
          id: 'out',
          choices: this.choicesAudioOut,
          default: 'dante/channels/1',
          minChoicesForSearch: 0
        },
        {
          type: 'dropdown',
          label: 'input channel(s)',
          id: 'in',
          choices: this.choicesAudioIn,
          default: '"sourceType":"none"',
          minChoicesForSearch: 0,
          multiple: true,
          minSelection: 0,
        }
      ]
    }
	});
};

instance.prototype.sendcmd = function(path, bodyjson) {
  let self = this;
	self.system.emit('rest', 'http://'+ self.config.host + path, bodyjson, function (err, result) {
		if (err !== null) {
			self.log('error', 'HTTP POST Request failed (' + result.error.code + ')');
			self.status(self.STATUS_ERROR, result.error.code);
		}
		else {
			self.status(self.STATUS_OK);
		}
	});

}

instance.prototype.action = function(action) {
	var self = this;
	var path = action.action.match(/^[\w/{}-]+/)[0] || '';
	var body = '';
	if (action.action.match(/ (.+)$/)) {
		body = action.action.match(/ (.+)$/)[1];
	}
	var bodyjson = {};

	if ( self.config.host === undefined || self.config.host === '' ) {
		self.log('error', 'No IP or hostname entered');
		debug('Abort, no ip');
		return;
	}


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

  if(action.action == 'audiorouteblock') {
      let outstart = this.choicesAudioOut.findIndex((item) => {
        return item.id === action.options.out;
      });
      let instart = this.choicesAudioIn.findIndex((item) => {
        return item.id === action.options.in;
      });
      if (outstart > -1 && instart > -1) {
        let max = Math.min(this.choicesAudioOut.length - outstart, this.choicesAudioOut.length - instart, action.options.blocksize) // since 'None' is input at index 0 no extra test is needed, it is possible to fill all outputs with none
        for (let s=0; s< max; s += 1) {
          path = `/api/tpp/v1/audio/transmitters/${this.choicesAudioOut[outstart + s].id}/source`;
          bodyjson = JSON.parse(`{${this.choicesAudioIn[instart === 0 ? 0 : instart + s].id}}`);
          self.sendcmd(path, bodyjson);
        }
      }
      return;
  }

	if(action.action == 'audioroute') {
    if (action.options.in.length >0) {
      let outstart = this.choicesAudioOut.findIndex((item) => {
        return item.id === action.options.out;
      }); 
      if (outstart > -1) {
        let max = Math.min(this.choicesAudioOut.length - outstart, action.options.in.length)
        for (let s=0; s< max; s += 1) {
          path = `/api/tpp/v1/audio/transmitters/${this.choicesAudioOut[outstart + s].id}/source`;
          bodyjson = JSON.parse(`{${action.options.in[s]}}`);
          self.sendcmd(path, bodyjson);
        }
      }
      return;
    } else {
      path = `/api/tpp/v1/audio/transmitters/${action.options.out}/source`;
      bodyjson = JSON.parse(`{${this.choicesAudioIn[0].id}}`);
      self.sendcmd(path, bodyjson);
      return;
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

  self.sendcmd(path, bodyjson);
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