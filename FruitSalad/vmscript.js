// Emitter is used when looking at files, when they are changed/deleted, it broadcast using w/e method to let know recievers on different child processes.
// That had added dependencies and gets reloaded or loaded w/e its needed.

var fs = require('fs');
var fspath = require('path');
var event_emitter = require('events').EventEmitter;
var vm = require('vm');
var util = require('util');
var m = require('module');
var spawn = require('child_process');


/**
 * A module that exports methods to watch script files for changes.
 * And to load scripts at runtime.
 * @module vmscript
 */
module.exports = {

	/** A method which will listen for file changes and emit events. */
	emitter: function(opts){
		if(!opts) opts = {};

		this.allowedExtensions = opts.allowedExtensions || ['js'];

		this._directories = {};
		this._revisionTimeout = null;
		this._files = {};
		this._threads = {};
		this._dependencies = {};
		this._contexts = {};
		this.EventEmitter = new event_emitter();
		// this._joinedContexts = {};


		var self = this;

		self.EventEmitter.on('remove_file', function(path){
			var file = self._files[path];
			// TODO: Checks for files depending on it and remove it from loaded/total?
			// delete self._files[path];
			delete self._dependencies[file.name];
		});

		self.EventEmitter.on('change_file', function(path){
			var file = self._files[path];
			var depends = [];

			if(file.sandbox){
				depends = file.sandbox.vms._depends;
			}

			if(file.thread){
				depends = self._threads[file.thread].depends;
			}

			self._dependencies[file.name].depends = depends;

			self.EventEmitter.emit('check_dependencies', file.name);
		});

		self.EventEmitter.on('directory load_file', function(dirName, path){
			var dir = self._directories[dirName];
			dir.totalLoaded++;

			var file = self._files[path];
			var depends = [];
			var nDir = file.info.dir.replace(/\\/g, '/').split('/');
			var name = (nDir.length > 1 ? nDir[nDir.length-1] + "." : "") + file.info.name + file.info.ext;
			
			if(file.sandbox){
				depends = file.sandbox.vms._depends;
				name = file.sandbox.vms._name;
			}

			if(file.thread){
				depends = self._threads[file.thread].depends;
			}

			file.name = name;

			self._dependencies[name] = {
				depends: depends,
				path: path,
				running: false // Running on reciever/s, that are depending on in context
			};

			if(dir.totalLoaded === dir.totalFiles){
				dir.loaded = true;
				self.EventEmitter.emit('directory loaded', dirName);
			}

			self.EventEmitter.emit('check_dependencies');
		});

		self.EventEmitter.on('directory remove_file', function(dirName, path){
			var dir = self._directories[dirName];
			dir.totalLoaded--;
		});

		self.EventEmitter.on('directory change_file', function(dirName, path){
			var file = self._files[path];
			var depends = [];

			if(file.sandbox){
				depends = file.sandbox.vms._depends;
			}

			if(file.thread){
				depends = self._threads[file.thread].depends;
			}

			self._dependencies[file.name].depends = depends;

			self.EventEmitter.emit('check_dependencies', file.name);
		});

		self.EventEmitter.on('load_file', function(path){
			var file = self._files[path];
			var depends = [];
			var nDir = file.info.dir.replace(/\\/g, '/').split('/');
			var name = (nDir.length > 1 ? nDir[nDir.length-1] + "." : "") + file.info.name + file.info.ext;
			
			if(file.sandbox){
				depends = file.sandbox.vms._depends;
				name = file.sandbox.vms._name;
			}

			if(file.thread){
				depends = self._threads[file.thread].depends;
			}

			file.name = name;

			self._dependencies[name] = {
				depends: depends,
				path: path,
				running: false // Running on reciever/s, that are depending on in context
			};

			self.EventEmitter.emit('check_dependencies');
		});

		self.EventEmitter.on('directory loaded', function(dirName){
			// console.log("Directory loaded");
			// var dir = self._directories[dirName];

			self._dependencies[dirName] = {
				directory: true,
				running: false
			};

			self.EventEmitter.emit('check_dependencies');
		});

		var index = 0;
		self.EventEmitter.on('check_dependencies', function(file_name){
			for(var name in self._dependencies){
				// console.log(name);
				var d = self._dependencies[name];
				if(d.running) continue;
				// console.log(name, d.directory ? 'Is directory' : d.depends);
				var loaded = 0;
				var total = 0;

				if(d.directory){
					for(var file in self._directories[name].files){
						if(self._dependencies[self._directories[name].files[file].name].running){
							loaded++;
						}

						total++;
					}

					// console.log("Directory files", total, "loaded", loaded);
				}else{
					for(var i in d.depends){
						var dependency = self._dependencies[d.depends[i]];
						if(dependency && dependency.running)
							loaded++;

						total++;
					}

					// console.log("File", total, "loaded", loaded);
				}

				if(loaded === total){
					// console.log("Can load: ", name);
					d.index = index;
					index++;
					d.running = true;
					console.log('Loaded: ' + name);
					self.EventEmitter.emit('check_dependencies');
				}
			}

			for(var c in self._contexts){
				var context = self._contexts[c];
				if(context.loaded) continue;
				if(context.thread){
					var depends = context.depends;
					var totalLoaded = 0;
					for(var i=0; i<depends.length; i++){
						var dependency = self._dependencies[depends[i]];
						if(dependency && dependency.running){
							totalLoaded++;
						}
					}

					if(depends.length === totalLoaded){
						context.loaded = true;
						context.depends = self.dependencyChain(context.depends);

						var files = {};
						for(var i in context.depends){
							var t = self._dependencies[context.depends[i]];
							if(t.directory || t.context)
								files[context.depends[i]] = {directory: true, revision: new Date().getTime()};
							else
								files[context.depends[i]] = {path: fspath.resolve(t.path), revision: new Date().getTime()};
						}
						context.thread.send({type: 'files', files: files});
					}
				}
			}

			if(file_name){
				for(var c in self._contexts){
					var context = self._contexts[c];
					var fileName = self._files[context.file].name;

					if(context.thread){
						var t = self._dependencies[file_name];
						var depends = context.depends;
						if(fileName === file_name || depends.indexOf(file_name) >= 0){
								context.thread.send({type: 'dependency', name: file_name, path: fspath.resolve(t.path), context: fileName === file_name});
								console.log('Reloaded: ' + file_name);
							break;
						}
					}
				}
			}
		});
	},

	/** A method which will receive script files to load and handle dependencys of those scripts. */
	reciever: function(process){
		// this.name = name;
		this._depends = [];
		this.process = process || null;
		this.dependencies = {};
		this.modules = [];
		this.loaded_modules = 0;
		this.EventEmitter = new event_emitter();


		var self = this;

		process.on('message', function(m){
			switch(m.type){
				case 'files':
				for(var i in m.files){
					self.dependencies[i] = m.files[i];
					for(var name in self.dependencies){
						self.runInThisContext(name, self.dependencies[name]);
					}
				}
				break;

				case 'dependency':
				if(m.context) try{
					// NOTE: Recache callback method
					// self.modules[i].callback();
					// console.log(m.path);
					// var code = fs.readFileSync(m.path);
					try{
						// var context = {
						// 	process: null,
						// 	vms: {
						// 		depends: function(depends, callback){

						// 		}
						// 	}
						// };

						// var m = require('module')
						// var code = 'module.exports = 42'
						// vm.runInThisContext(m.wrap(code))(exports, require, module, __filename, __dirname);

						// console.log('test');
						// vm.runInThisContext(code);
						// console.log(eval(code).GetValue);

						// vm.call(global, code);
						// var thread = spawn.fork(m.path);
						var newModules = [];
						try{
							var thread = spawn.fork(m.path, [], {
								env: {
									vmscript_debug: true
								}
							});

							self.modules = [];
							self.loaded_modules = 0;
							self._depends = [];
							thread.on('message', function(m){
								switch(m.type){
									case 'vms_depends':
									// console.log(m);
									var func = eval("func = "+m.callback);
									self.depends(m.depends, func);
									break;
									case 'kill':
									thread.kill('SIGINT');
									break;
								}
							});
						}catch(e){

						}
					}catch(e){
						console.log(e);
						console.log(e.stack());
					}
				}catch(e){
					console.log(e);
				}
				else
					self.runInThisContext(m.name, self.dependencies[m.name]);
				break;
			}
		});


		// EventEmitter.on('dependencies', function(){
		// 	for(var name in self.dependencies){
		// 		self.runInThisContext(name, self.dependencies[name]);
		// 	}
		// });
		// this.emitter = new EventEmitter();
		// Used to listen for changes and apply them. Its dependent listener.
	}
};

module.exports.reciever.prototype.runInThisContext = function(name, obj){
	if(!obj){
		console.log("Obj doesnt exists");
		return;
	}
	if(obj.directory) {
		this.dependencies[name].running = true;
		this.runModule();
		return;
	}

	var content = fs.readFileSync(obj.path).toString();
	var info = fspath.parse(obj.path);
	var split_name = name.split('.');
	var self = this;

	switch(info.ext){
		case '.json':
			try{
				vm.runInThisContext(split_name[split_name.length-3] + "." +split_name[split_name.length-2] + " = " +content+ ";");
				self.dependencies[name].running = true;
			}catch(e){
				try{
					vm.runInThisContext(split_name[split_name.length-3] + " = {};");
					vm.runInThisContext(split_name[split_name.length-3] + "." +split_name[split_name.length-2] + " = " + content + ";");
					self.dependencies[name].running = true;
				}catch(e){
					console.log(e);
				}
			}
		break;

		case '.js':
			try{
				global.vms = {depends: function(name, depends, callback){
					// console.log(name, depends);
					if(!self.dependencies[name]){
						self.dependencies[name] = {};
					}

					self.dependencies[name].callback = callback;
				}};
				vm.runInThisContext(content);
				delete global.vms;
				self.dependencies[name].running = false;
				try{
					self.dependencies[name].callback();
					self.dependencies[name].running = true;
				}catch(e){
					console.log(e);
				}
			}catch(e){
				console.log(e);
			}
		break;
	}

	this.runModule();
};

module.exports.reciever.prototype.runModule = function(force){
	for(var m in this.modules){
		var module = this.modules[m];
		if(!force && module.running) return;

		var total = module.depends.length;
		var loaded = 0;
		for(var i=0; i<module.depends.length; i++){
			if(this.dependencies[module.depends[i]] && this.dependencies[module.depends[i]].running)
				loaded++;
		}

		if(total === loaded){
			try{
				module.callback();
				module.running = true;
				this.loaded_modules++;
				if(this.loaded_modules === this.modules.length){
					this.EventEmitter.emit('load');
					if(this.process)
						this.process.send({type: 'context_loaded'});
					// NOTE: Consider adding a event to let know the local instance of vms that we have loaded all modules.
					// Then local function depends, will wait for dependencis, call callback setting up the dependencies if needed,
					// and let the final event when loaded all modules will run necessary files.
				}
			}catch(e){
				console.log(e);
			}
		}
	}
}

module.exports.reciever.prototype.depends = function(depends, callback){
	this._depends = this._depends.concat(depends);
	this.modules.push({depends: depends, callback: callback});

	if(this.process && this.process.env.vmscript_debug)
		this.process.send({type: 'vms_depends', depends: this._depends, callback: callback.toString()});
	else if(this.process)
		this.process.send({type: 'vms_depends', depends: this._depends});

	var self = this;
	if(this.process && this.process.env.vmscript_debug)
	setTimeout(function(){
		self.process.send({type: 'kill'});
	}, 5000); // NOTE: Consider adding a option to configure this up.
};



module.exports.emitter.prototype.dependencyChain = function(dependency){
	var files = [];

	var total = 0;
	var prvTotal = 0;

	var indexes = {};
	while(true){
		prvTotal = total;
		for(var i=0; i<dependency.length; i++){
			var depends = dependency[i];

			if(files.indexOf(depends) < 0){
				if(!this._dependencies[depends]) continue;

				indexes[depends] = this._dependencies[depends].index;
				files.push(depends);
				total++;
	
				if(!this._dependencies[depends].directory){
					dependency = dependency.concat(this._dependencies[depends].depends);
				}else{
					for(var file in this._directories[depends].files){
						var f = this._directories[depends].files[file];
						var d = this._dependencies[f.name];
						indexes[f.name] = d.index;
						files.push(f.name);

						dependency = dependency.concat(d.depends);
					}
				}
			}
		}

		if(prvTotal === total){
			break;
		}
	}

	files.sort(function(a, b){
		return indexes[a] > indexes[b];
	});

	return files;
}


/*
	file -When file has been changed
	directory -When directory has been changed
*/
module.exports.emitter.prototype.on = function(name, listener){
	this.EventEmitter.on(name, listener);
}
module.exports.emitter.prototype.once = function(name, listener){
	this.EventEmitter.once(name, listener);
}
module.exports.reciever.prototype.on = function(name, listener){
	this.EventEmitter.on(name, listener);
}
module.exports.reciever.prototype.once = function(name, listener){
	this.EventEmitter.once(name, listener);
}
module.exports.emitter.prototype.joinContext = function(context, depends){
	if(this._contexts[name]){
		return;
	}

	this._contexts[name] = {
		context: context,
		depends: depends
	};
}

module.exports.emitter.prototype.watchThread = function(name, path, thread){
	if(this._threads[name]){
		console.log("Thread ["+name+"] already exists.");
		return;
	}

	// console.log(fspath.resolve(path));
	var file_path = fspath.resolve(path);
	var self = this;

	thread.on('message', function(m){
		switch(m.type){
			case 'vms_depends':
			self._threads[name] = {
				thread: thread,
				file: file_path,
				depends: m.depends
			};

			self._contexts[name] = {
				thread: thread,
				file: file_path,
				// Look for dependency chain, so we can send a files that are dependent to this context, in appropriate order :)
				depends: m.depends // Make sure that depends array has all files that are needed.
			};

			// self._dependencies[name] = {
			// 	running: false
			// };
			// self.watch(file_path, name);

			self.watch(null, file_path, name);
			break;

			case 'context_loaded':

			// console.log("Context loaded");
			// console.log(self._dependencies[self._files[file_path].name])
			// console.log(self._dependencies[self._files[file_path].name].index);
			self._dependencies[name] = {context: true, running: true, index: self._dependencies[self._files[file_path].name].index, path: path};
			// console.log(self._dependencies[name]);
			self.EventEmitter.emit('check_dependencies');
			break;
		}
	});
}

module.exports.emitter.prototype.watch = function(arg1, arg2, arg3){
	var path = null;
	var thread_name = null;
	if(arg1 && !arg2 && !arg3){
		path = arg1;
	}else if(arg1 === null && arg2 && arg3){
		path = arg2;
		thread_name = arg3;
	}else if(arg1 && arg2 && !arg3){
		this.watchDir(arg1, arg2);
		return;
	}else if(arg1 && arg2 && arg3){
		this.watchThread(arg1, arg2, arg3);
		return;
	}

	var self = this;
	thread_name = thread_name || null;

	try{
		var stats = fs.statSync(path);
		if(!this._files[path]){
			this._files[path] = {
				info: fspath.parse(path),
				ts: stats.size,
				thread: thread_name
			};
		}

		this.loadFile(path, function(){
			// self._files[path].size = stats.size;
			// console.log("Loaded:", self._files[path].info.dir, self._files[path].info.name + self._files[path].info.ext);
			self.EventEmitter.emit('load_file', path);
		});

		var fileWatcher = fs.watch(path, { persistent: true }, function(event, f){
			try{
				var stats = fs.statSync(path);
				if(event === "change" && self._files[path].size !== stats.size){

					try{
						self.loadFile(path, function(){
							self._files[path].size = stats.size;
							// console.log("Reloaded:", self._files[path].info.dir, self._files[path].info.name + self._files[path].info.ext);
							self.EventEmitter.emit('change_file', path);
						});
					}catch(e){
						console.log(e);
					}
				}
			}catch(e){
				// console.log("test", e);
				// console.log("Removed:", self._files[path].info.dir, self._files[path].info.name + self._files[path].info.ext);
				// EventEmitter.emit('remove_file', path);
			}
		});

		fileWatcher.on('error', function(){
			// On watching file error.
		});
	}catch(e){
		console.log(path, e);
		// console.log(path, 'doesnt exits.');
	}
}

module.exports.emitter.prototype.loadFile = function(path, callback){
	var extension = path.split('.').pop();
	if(extension !== 'js'){
		callback();
		return;
	}

	var code = fs.readFileSync(path).toString();
	var compiles = false;
	try{
		var script = new vm.Script(code, {displayErrors: true});
		compiles = true;
			try{

				var sandboxVMS = function(){
					this._name = null;
					this._depends = null;
					this._code = null;

					this.depends = function(name, depends, code){
						this._name = name;
						this._depends = depends;
						this._code = code;
					}
				}

				var sandbox = {vms: new sandboxVMS()};
				vm.runInNewContext(code, vm.createContext(sandbox));
				// console.log(util.inspect(sandbox));
				this._files[path].sandbox = sandbox;
			}catch(e){
				// console.log(e);
			}
	}catch(e){
		console.log(e);
	}

	if(compiles){
		if(!this._files[path].compiles){
			this._files[path].compiles = true;
			callback(true);
			return;
		}
		callback();
	}
}

module.exports.emitter.prototype.watchDir = function(vmsName, directory){
	if(this._directories[vmsName]){
		console.log("Cannot load", vmsName, "once more.");
		return;
	}

	this._directories[vmsName] = {
		files: {},
		totalFiles: 0,
		totalLoaded: 0
	};

	var self = this;
	var directory_scripts = fs.readdir(directory, function(err, files){
		if(err){
		  console.log(err);
		  return;
		}

		self._directories[vmsName].totalFiles = files.length;
		for(var i=0; i<files.length; i++){
			var extension = files[i].split('.').pop();
			var file_path = fspath.resolve(directory) + '\\' + files[i];
			var stats = fs.statSync(file_path);
			if(!self._files[file_path]){
				self._files[file_path] = {
					info: fspath.parse(file_path),
					size: stats.size, // Rather than looking for difference between sizes, look at modified date.
					thread: false
				};

			}
			self._directories[vmsName].files[file_path] = self._files[file_path];


			self.loadFile(file_path, function(){
				// console.log("Loaded:", "["+vmsName+"]", self._files[file_path].info.name);
				self.EventEmitter.emit('directory load_file', vmsName, file_path);
			});
		}

		if(files.length === 0){
			self.EventEmitter.emit('directory loaded', vmsName);
		}
	});

	var dirWatcher = fs.watch(directory, {persistent: true}, function(event, f){
		if(f && !f.match(/\~/) && !f.match(/tmp/) && f.split('.').length > 1){
			var file_path = fspath.resolve(directory) + '\\' + f;

			var stats = fs.statSync(file_path);
			if(!self._files[file_path]){
				self._files[file_path] = {
					info: fspath.parse(file_path),
					size: stats.size,
					thread: false
				};
				
				self._directories[vmsName].files[file_path] = self._files[file_path];
				self._directories[vmsName].totalFiles++;

				self.loadFile(file_path, function(){
					// console.log("Loaded:", "["+vmsName+"]", self._files[file_path].info.name);
					self.EventEmitter.emit('directory load_file', vmsName, file_path);
				});
			}

			try{
				var stats = fs.statSync(file_path);
				if(event === "change" && self._files[file_path].size !== stats.size){

					self.loadFile(file_path, function(compiled){
						self._files[file_path].size = stats.size;
						// console.log("Reloaded:", "["+vmsName+"]", self._files[file_path].info.name + self._files[file_path].info.ext);
						if(compiled)
							self.EventEmitter.emit('directory load_file', vmsName, file_path);
						else
							self.EventEmitter.emit('directory change_file', vmsName, file_path);
					});
				}
			}catch(e){
				self._directories[vmsName].totalFiles--;
				// console.log("Removed2:", vmsName, self._files[file_path].info.name + self._files[file_path].info.ext);
				delete self._files[file_path];
				delete self._directories[vmsName].files[file_path];
			}
		}else if(event === 'rename'){
			for(var path in self._directories[vmsName].files){
				var file = self._directories[vmsName].files[path];
				try{
					fs.statSync(path);
				}catch(e){
					self._directories[vmsName].totalFiles--;
					// console.log("Removed:", "["+vmsName+"]", file.info.name + file.info.ext);
					self.EventEmitter.emit('directory remove_file', vmsName, file_path);
					delete self._files[path];
					delete self._directories[vmsName].files[path];
				}
			}
		}
	});

	dirWatcher.on('error', function(){
		// console.log("test");
	});
}