// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	var services = {};
	var docHovers = {};

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "AngularJS extension" is now active!');
	loadServices();

	function loadServices() {
		services = {};
		docHovers = {};

		let folders = vscode.workspace.workspaceFolders;
		folders.forEach(folder => {
			let path = folder.uri.toString(true);
			path = path.replace('file:///', '');

			readFolder(path);
		});
	}

	vscode.workspace.onDidSaveTextDocument(document => {
		let fileType = document.fileName.substring(document.fileName.indexOf('.') + 1);
		if (fileType == 'service.js') processFile(document.getText());
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

						let mark = new vscode.MarkdownString(services[key][prop].doc);
						mark.isTrusted = true;


						let funcSnip = new vscode.CompletionItem(prop);
						funcSnip.sortText = '00';
						funcSnip.documentation = mark;

						if (services[key][prop].isFunc) funcSnip.kind = vscode.CompletionItemKind.Function;
						else funcSnip.kind = vscode.CompletionItemKind.Property;

						if (services[key][prop].snip !== null && services[key][prop].snip != '')
							funcSnip.insertText = new vscode.SnippetString(services[key][prop].snip);
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

	function processFile(data) {
		let serviceNameStr = data.match(/service\('(.*?)(?=')/g);

		if (serviceNameStr !== null) {
			let serviceName = serviceNameStr[0].replace(/service\('/g, '');
			let functions = data.match(/this\.(.*)=(\s*)((?=f)|(?=a))/g);
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

			let vars = data.match(/this\.(\w*)/g);
			if (vars !== null) {
				let aux = [];

				vars.forEach(varName => {
					let name = varName.replace(/\s/g, '').replace('this.', '');

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
