// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const folha = require('./folhaCommands')
const commands = new folha.FolhaCommands();
const folinha = new (require('./folinha/folinha')).Folinha;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	var services = {};
	var docHovers = {};

	folinha.setExtensionPath(context.extensionPath)

	context.subscriptions.push(vscode.commands.registerCommand('folhaW.launcherPage', commands.createDefaultPage))
	context.subscriptions.push(vscode.commands.registerCommand('folhaW.crudPage', commands.createCrudPage))
	context.subscriptions.push(vscode.commands.registerCommand('folhaW.createComponent', commands.createComponent))
	context.subscriptions.push(vscode.commands.registerCommand('folhaW.debugSettings', commands.createDebugFile))
	context.subscriptions.push(vscode.commands.registerCommand('folhaW.duken', folinha.buildFolinha))

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('AngularJS extension is now active!');
	// vscode.window.showInformationMessage('AngularJS extension is now active');

	function loadServices() {
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: 'Analisando workspace',
			cancellable: false
		}, (progress, token) => {
			loadWorkpace(progress, token);
			return new Promise(resolve => resolve());
		})
	}

	/**
	 * @param {import("vscode").Progress<{ message?: string; increment?: number; }>} progress
	 * @param {import("vscode").CancellationToken} token
	 */
	function loadWorkpace(progress, token) {
		services = {};
		docHovers = {};
		let folders = vscode.workspace.workspaceFolders;
		let status = 0
		let allFiles = []
		let promisses = []

		folders.forEach(folder => {
			let path = folder.uri.toString(true);
			path = path.replace('file:///', '');
			
			promisses.push(teste(path))
		})

		Promise.all(promisses).then(files => {
			files.forEach(f => allFiles = allFiles.concat(f))

			allFiles.forEach(file => {
				fs.readFile(file, 'utf8', (err, data) => {
					let success = false
					if (err) console.error('could´t read file ' + file);
					else if (processFile(data)) success = true

					status++
					progress.report({
						increment: Math.round((status / allFiles.length) * 100),
						message: `${file} finalizado com ${success? 'Sucesso' : 'Erro'}!`
					})
				});
			})
		})
	}

	loadServices();

	vscode.workspace.onDidSaveTextDocument(document => {
		let fileType = document.fileName.substring(document.fileName.indexOf('.') + 1);
		if (fileType == 'service.js') loadServices();
	});

	vscode.workspace.onDidChangeWorkspaceFolders(event => loadServices());

	vscode.languages.registerHoverProvider('javascript', {
		provideHover(document, position, token) {
			let txt = document.getText();
			let range = document.getWordRangeAtPosition(position);
			let line = document.lineAt(range.start.line)
			let word = line.text.substr(range.start.character, range.end.character - range.start.character);

			let result = '';
			let docObj = docHovers[word];
			if (docObj != '' && docObj !== null) result = docObj;

			return {
				contents: [result]
			};
		}
	});

	let servicesProvider = vscode.languages.registerCompletionItemProvider('javascript', {
		provideCompletionItems(document, position, token, context) {
			let snippets = [];

			Object.keys(services).forEach(key => {
				let servSnip = new vscode.CompletionItem(key);
				servSnip.insertText = new vscode.SnippetString(key);
				//servSnip.documentation = new vscode.MarkdownString(key + ' documentation.... bla bla bla<br>bla');
				servSnip.kind = vscode.CompletionItemKind.Class;

				snippets.push(servSnip);
			});

			return snippets;
		}
	});

	let methodsProvider = vscode.languages.registerCompletionItemProvider('javascript', {
		provideCompletionItems(document, position, token, context) {
			let snippets = [];
			let cText = getTextBeforeCursor(document, position);

			let beforeDot = (cText.match(/.*(?=\.)/) || [''])[0].replace(/\s*/, '');
			if (beforeDot == '') return [];

			Object.keys(services).forEach(key => {
				let canAdd = beforeDot == '' || (beforeDot != '' && beforeDot.indexOf(key) != -1);

				if (canAdd) {
					let serv = services[key];

					Object.keys(serv).forEach(prop => {
						let funcSnip = new vscode.CompletionItem(prop);
						funcSnip.sortText = '0000';

						let doc = services[key][prop].doc;
						if (doc !== null && doc !== '' && doc !== undefined) {
							let mark = new vscode.MarkdownString(doc);
							mark.isTrusted = true;
							funcSnip.documentation = mark;
						}

						if (services[key][prop].isFunc) funcSnip.kind = vscode.CompletionItemKind.Function;
						else funcSnip.kind = vscode.CompletionItemKind.Property;

						let snip = services[key][prop].snip;
						if (snip !== null && snip !== '' && snip !== undefined)
							funcSnip.insertText = new vscode.SnippetString(snip);
						else funcSnip.insertText = new vscode.SnippetString(prop);

						snippets.push(funcSnip);
					});
				}
			});

			return snippets;
		}
	}, '.');

	let snippetProvider = vscode.languages.registerCompletionItemProvider('javascript', {
		provideCompletionItems(document, position, token, context) {
			let snippet = new vscode.CompletionItem('snippet');
			snippet.insertText = new vscode.SnippetString('snippet');
			snippet.documentation = new vscode.MarkdownString('Define a snippet in your documentation');
			snippet.kind = vscode.CompletionItemKind.Keyword;
			snippet.sortText = '000';

			return [
				snippet
			];
		}
	}, '@');

	/** @param { string } path */
	function readFolder(path) {
		fs.readdir(path, function (err, files) {
			if (err) {
				console.log('error!');
			}

			files.forEach((file) => {
				let fPath = path + "/" + file;
				let isFolder = fs.lstatSync(fPath).isDirectory();

				if (isFolder) readFolder(fPath)
				else {
					let fileType = file.substring(file.indexOf('.') + 1);
					if (fileType == 'service.js') {
						fs.readFile(fPath, 'utf8', (err, data) => {
							if (err) console.error('could´t read file ' + file);
							else if (processFile(data)) console.log(file + ' Analysed!');
						});
					}
				}
			});
		});
	}

	function teste(path) {
		let fList = []
		let aux = []

		return new Promise(resolve => {
			fs.readdir(path, function (err, files) {
				if (err) {
					console.log('error!');
				}
	
				files.forEach(async (file) => {
					let fPath = path + "/" + file;
					let isFolder = fs.lstatSync(fPath).isDirectory();
	
					if (isFolder) aux.push(teste(fPath))
					else {
						let fileType = file.substring(file.indexOf('.') + 1);
						if (fileType == 'service.js') fList.push(fPath)
					}
				});

				if(aux.length == 0) resolve(fList);
				else {
					Promise.all(aux).then(subFiles => {
						subFiles.forEach(f => fList = fList.concat(f))
						resolve(fList);
					})
				}
			});
		});
	}

	/** @param { string } data */
	function processFile(data) {
		let isFactory = false;
		let serviceNameStr = data.match(/service\('(.*?)(?=')/g);
		if(serviceNameStr === null) {
			isFactory = true;
			serviceNameStr = data.match(/factory\('(.*?)(?=')/g);
		}

		if (serviceNameStr !== null) {
			let serviceName = '';

			/** @param { string[] } funcName */
			let functions = null;
			
			if(isFactory) serviceName = serviceNameStr[0].replace(/factory\('/g, '');
			else serviceName = serviceNameStr[0].replace(/service\('/g, '');

			if(isFactory) functions = data.match(/function\s([a-zA-Z0-9])*/g);
			else functions = data.match(/(this|self)\.(.*)=(\s*)((?=f)|(?=a))/g);
			let funcsAux = [];

			services[serviceName] = {};

			if (functions !== null) {
				functions.forEach(funcName => {
					let name = funcName.replace(/\s/g, '').replace('this.', '').replace('=', '');
					let documentation = serviceName + '.' + name;
					let snippet = null;
					funcsAux.push(name);

					let id = data.indexOf(funcName);
					if (id != -1) {
						let docAux = getDocumentation(data, id, serviceName);

						documentation = docAux.documentation;
						snippet = docAux.snippet;

						docHovers[name] = documentation;
					}

					services[serviceName][name] = {
						isFunc: true,
						doc: documentation,
						snip: snippet
					};
				});
			}

			let vars = data.match(/(this|self)\.(\w*)/g);
			if (vars !== null) {
				let aux = [];
				vars.forEach(varName => {
					let name = varName.replace(/\s/g, '').replace('this.', '').replace('self.', '');

					if (aux.indexOf(name) == -1 && funcsAux.indexOf(name) == -1) {
						aux.push(name);
						services[serviceName][name] = { isFunc: false };
					}
				});
			}

			return true;
		}

		return false;
	}

	/**
	 * @param { string } data
	 * @param { number } id
	 * @param { string } serviceName
	 */
	function getDocumentation(data, id, serviceName) {
		let aux = data.substring(0, id);
		let endDoc = aux.lastIndexOf('*/');

		if (endDoc != -1) {
			let validate = aux.substring(endDoc, id);
			if (validate.indexOf(';') == -1 && validate.indexOf('}') == -1) {
				let strDoc = aux.lastIndexOf('/**');
				let doc = aux.substring(strDoc, endDoc);
				let axDoc = doc.split('*');
				let fDoc = '';

				axDoc.forEach(line => {
					let l = line.trim().replace(/\s{2,}/g, '');
					if (l != '/' && l != '') {
						if (fDoc != '') fDoc += '     \n';
						fDoc += l;
					}
				});

				fDoc = fDoc.replace('@param', '     \n**Parameters:**     \n@param')
					.replace('@return', '     \n**Returns:**     \n**[return](/)**');

				let params = fDoc.match(/@param\s\w*/g);
				if (params !== null) {
					params.forEach(p => {
						fDoc = fDoc.replace(p, '**[' + p.replace('@param', '').trim() + '](/)**');
					});
				}

				let docSnip = '';
				let snip = fDoc.match(/@snippet(\s|.)*(;|^\*)/g);
				if (snip !== null) {
					docSnip = snip[0].replace('@snippet', '').replace(serviceName + '.', '').trim();
					fDoc = fDoc.replace(snip[0], '');
				}

				return {
					documentation: fDoc,
					snippet: docSnip
				};
			}
		}

		return {
			documentation: '',
			snippet: ''
		};
	}

	/**
	 * @param {import("vscode").TextDocument} document
	 * @param {import("vscode").Position} position
	 */
	function getTextBeforeCursor(document, position) {
		return document.lineAt(position).text.slice(0, position.character);
	}

	context.subscriptions.push(servicesProvider);
	context.subscriptions.push(methodsProvider);
	context.subscriptions.push(snippetProvider);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
