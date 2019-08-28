module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/extension.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/extension.js":
/*!**************************!*\
  !*** ./src/extension.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __webpack_require__(/*! vscode */ "vscode");
const fs = __webpack_require__(/*! fs */ "fs");
const folha = __webpack_require__(/*! ./folhaCommands */ "./src/folhaCommands.js")
const commands = new folha.FolhaCommands();

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	var services = {};
	var docHovers = {};

	context.subscriptions.push(vscode.commands.registerCommand('folhaW.launcherPage', commands.createDefaultPage))
	context.subscriptions.push(vscode.commands.registerCommand('folhaW.crudPage', commands.createCrudPage))
	context.subscriptions.push(vscode.commands.registerCommand('folhaW.createComponent', commands.createComponent))
	context.subscriptions.push(vscode.commands.registerCommand('folhaW.debugSettings', commands.createDebugFile))

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "AngularJS extension" is now active!');
	vscode.window.showInformationMessage('AngularJS extension is now active');
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

		vscode.window.showInformationMessage('All files analysed');
	}

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


/***/ }),

/***/ "./src/folhaCommands.js":
/*!******************************!*\
  !*** ./src/folhaCommands.js ***!
  \******************************/
/*! exports provided: FolhaCommands */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FolhaCommands", function() { return FolhaCommands; });
const vscode = __webpack_require__(/*! vscode */ "vscode");
const fs = __webpack_require__(/*! fs */ "fs");
const join = __webpack_require__(/*! path */ "path").join;

const launcher = __webpack_require__(/*! ./templates/launcher */ "./src/templates/launcher.js").launcher

const PesVC = 'C:/sk-java/workspace/SankhyaW/MGE-Pes-VC/build/html5';

class FolhaCommands {

    constructor() {
        //#region Functions
        /** @param { string } path */
        const createFolder = (path) => {
            if(fs.existsSync(path)) return false;
            fs.mkdirSync(path);
            fs.mkdirSync( join(path, 'launcher') )
            return true;
        }

        const initPage = async () => {
            let result = await vscode.window.showInputBox();
            if(result === undefined || result.trim() == '') return;

            result = result.replace(/\s/g, '');
            let folder = join(PesVC, result)
            let created = createFolder(folder);

            if(!created) throw new Error(`Não foi possivel criar ${result} verifique se a pagina não existe`)
            return { folder, result }
        }

        /** 
         * @param {string} file
         * @param {string} type
         * @param {string} path
         */
        const filePath = (file, type, path) => join(path, `${file}.${type}`)

        /** 
         * @param {string} file 
         * @param {string} pageName 
         * */
        const content = (file, pageName) => file.substring(1).replace(/__PAGENAME__/g, pageName)

        /** 
         * @param {string} html
         * @param {string} js
         * @param {string} css
         */
        const createPage = async (html, js, css) => {
            let { folder, result } = await initPage();
            if(folder === undefined) return;

            fs.writeFileSync( filePath(result, 'html', folder) , content(html, result) )
            fs.writeFileSync( filePath(result, 'js'  , folder) , content(js, result)   )
            fs.writeFileSync( filePath(result, 'css' , folder) , content(css, result)  )

            let lchPath = join(folder, 'launcher')
            fs.writeFileSync( filePath(result, 'body'   , lchPath) , content(launcher.body, result)    )
            fs.writeFileSync( filePath(result, 'include', lchPath) , content(launcher.include, result) )

            fs.writeFileSync( join(PesVC, `launcher/${result}.libs`), content(launcher.mainLauncher, result) )
            vscode.window.showInformationMessage('Done!')
        }
        //#endregion

        this.createDefaultPage = async () => {
            let { html, js, css } = __webpack_require__(/*! ./templates/lancamento */ "./src/templates/lancamento.js").lancamento
            createPage(html, js, css)
        }

        this.createCrudPage = async () => {
            let { html, js, css } = __webpack_require__(/*! ./templates/crud */ "./src/templates/crud.js").crud
            createPage(html, js, css)
        }

        this.createComponent = async () => {
            let { folder, result } = await initPage();
            if(folder === undefined) return;

            if(result.indexOf('Mat') == -1) vscode.window.showWarningMessage('Por padrão todos os componentes devem ser seguidos por ***Mat***')
        }

        this.createDebugFile = () => {
            let path = join('C:/sk-java/workspace/SankhyaW/MGE-Pes-VC', '/.vscode/')
            let launch = join(path, 'launch.json')
            let content = __webpack_require__(/*! ./templates/vscodeLauncher */ "./src/templates/vscodeLauncher.js").vscodeLauncher

            if(!fs.existsSync(path)) fs.mkdirSync(path);
            if(!fs.existsSync(launch)) fs.writeFileSync(launch, content.substring(1));

            let grunt = 'C:/sk-java/workspace/SankhyaW/folha-js/Gruntfile.js'
            let gruntContent = fs.readFileSync(grunt).toString();

            if(gruntContent.indexOf('sourceMap') == -1) {
                gruntContent = gruntContent.replace("banner: '<%= finalModule.template %>',", "sourceMap: true,\n\t\t\t\t\tbanner: '<%= finalModule.template %>',");
                fs.writeFileSync(grunt, gruntContent)
            }

            vscode.window.showInformationMessage('.vscode created')
        }
    }
}

/***/ }),

/***/ "./src/templates/crud.js":
/*!*******************************!*\
  !*** ./src/templates/crud.js ***!
  \*******************************/
/*! exports provided: crud */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "crud", function() { return crud; });
var data = {
    html: '', js: '', css: ''
}

//#region HTML
data.html = `
<folha-application ng-controller="__PAGENAME__Controller as ctrl" ng-cloak>
    <folha-chatbot-mat></folha-chatbot-mat>

    <div class="main-content">
        
        <div class="content-block show-block fill" id="list-view">
            <!-- CABECALHO -->
            <div class="mat-card col fill-width no-padding margin-bottom-9 flex-flow-row border-radius-8px">
                <div class="mat-row padding-left-16 border-radius-8px">
                    <folha-list-count-mat folha-proxy='get__PAGENAME__List()' folha-icon='/mgepes/assets/svg/ic_func.svg' folha-label='["funcionário", "funcionários"]'></folha-list-count-mat>
                    <div class="justify-right center-self display-flex align-center">
                        <folha-search-mat mat-model="searchFunc" folha-proxy='get__PAGENAME__List()' folha-fields='fieldsFuncionarios'></folha-search-mat>
                        <folha-proxy-paginator-mat folha-page-size-options="[6,9,12]" folha-begin='pagBegin' folha-limit='pagLimit' folha-initial-option='2' folha-proxy='get__PAGENAME__List()' folha-size='lista.size'></folha-proxy-paginator-mat>
                        <folha-order-mat folha-order-options='order__PAGENAME__Options' folha-proxy='get__PAGENAME__List()'></folha-order-mat>
                    </div>
                </div>
            </div>

            <!-- LISTA -->
            <div class="height-content enable-scroll fill-width">
                <div layout="row" class="lista-grid-container" ng-cloak ng-show='regras.length!=0'>
                    <md-card class="card-item card-list-calc justify-center" ng-click="onItemClick(item)" md-ink-ripple="true"
                    ng-repeat="item in paginated = (regras | limitTo: pagLimit : pagBegin)" ng-mouseover='hovering = true' ng-mouseleave='hovering = false'>

                        <div layout="column" layout-align="start start" class='padding-16 fill'>
                            <span class="md-headline margin-bottom-10">{{ item.DESCRICAO | truncate: 20}}
                                <md-tooltip  ng-if="item.DESCRICAO.length > 20" md-direction="top" md-auto-hide="true">{{ item.DESCRICAO }}</md-tooltip>
                            </span>
                            <span class='font-surface font-14'>Código:
                                <span class='font-surface-dark'>{{ item.CODREGCALC}}</span>
                            </span>
                            <span class='font-surface font-14' ng-show='!isEmpty(item.RESPFOLHA)'>Responsável:
                                <span class='font-surface-dark'>{{ item.RESPFOLHA | truncate: 30}}
                                    <md-tooltip  ng-if="item.RESPFOLHA.length > 30" md-direction="top" md-auto-hide="true">{{ item.RESPFOLHA }}</md-tooltip>
                                </span>
                            </span>
                            <div class="margin-top-auto fill-width" layout="row" layout-align="end center">
                                <md-button class="md-icon-button" aria-label='button' ng-if='hovering' ng-click='deletaItem($event, item)'>
                                    <md-icon md-svg-src='/mgepes/assets/svg/ic_delete.svg'></md-icon>
                                    <md-tooltip md-direction="left" md-auto-hide="true">Deletar item</md-tooltip>
                                </md-button>
                            </div>
                        </div>

                    </md-card>
                </div>

                <p ng-show='regras.length == 0' class="no-result-warning fill no-margin">Não existem dados</p>
            </div>

            <!--BOTAO ADICIONA -->
            <folha-fab-mat on-click='addNewItem()' folha-tooltip='Adicionar *Item*'></folha-fab-mat>
        </div>

        <!-- VISUALIZACAO DO ITEM SELECIONADA -->
        <div class="content-block fill" id="selected-view">

            <!-- CABECALHO -->
            <div class="mat-card col fill-width no-padding margin-bottom-9 flex-flow-row border-radius-8px" layout='row'>
                <div class="center-self margin-left-8 display-flex">
                    <md-button class="md-icon-button" ng-click="voltaLista()">
                        <md-icon md-svg-src="/mgepes/assets/svg/ic_arrow_back.svg"></md-icon>
                        <md-tooltip md-direction="bottom" md-auto-hide="true">Voltar</md-tooltip>
                    </md-button>

                    <strong class="font-medium margin-top-auto margin-bottom-auto" ng-if='!isAddingRegra'>{{ itemSelecionado.CODIGO }} - </strong>
                    <strong class="font-medium margin-top-auto margin-bottom-auto margin-left-5"> {{ itemSelecionado.DESCRICAO }}</strong>
                </div>

                <div class="justify-right center-self display-flex align-center">
                    <md-button class="filter-header-button md-icon-button" aria-label='Confirmar Adição'>
                        <md-icon md-svg-src='/mgepes/assets/svg/ic_done.svg' class='fill-green'></md-icon>
                        <md-tooltip md-direction="bottom" md-auto-hide="true">Confirmar Adição</md-tooltip>
                    </md-button>
                    <md-button class="filter-header-button md-icon-button" aria-label='Cancelar Adição'>
                        <md-icon md-svg-src='/mgepes/assets/svg/ic_close.svg' class='fill-red'></md-icon>
                        <md-tooltip md-direction="bottom" md-auto-hide="true">Cancelar Adição</md-tooltip>
                    </md-button>
                </div>
            </div>

            <!-- CONTEUDO -->
            <div class="content-block-children height-content">
                <div class="height-100 no-padding enable-scroll">

                    <!-- TABS -->
                    <md-tabs md-border-bottom layout-fill id='tabContainerRegras'>

                        <md-tab label="Aba1">
                            <md-content class="mat-card no-padding height-100">
                                <div class="display-flex fill">
                                </div>
                            </md-content>
                        </md-tab>

                        <md-tab label="Aba2">
                            <md-content class="mat-card no-padding height-100">
                                <div class="display-flex fill">
                                </div>
                            </md-content>
                        </md-tab>

                    </md-tabs>
                </div>
            </div>
        </div>
    </div>
</folha-application>
`
//#endregion

//#region JS
data.js = `
angular
    .module("__PAGENAME__App", ["folha","ngMaterial","ngMessages"])
    .controller("__PAGENAME__Controller", ["$scope", 'FolhaProxy',"$timeout","$mdDialog", "PopupServiceMat", "StringUtilsMat", 'FolhaColor', 'FolhaUtils',
    function($scope, FolhaProxy, $timeout, $mdDialog, PopupServiceMat, StringUtilsMat, FolhaColor, FolhaUtils){
        FolhaColor.loadTheme();

        //#region FUNÇÕES E VARIAVEIS PADRÕES DA PAGINA
        //VARIAVEIS ===================================================================================================================== VARIAVEIS
        {
            $scope.fields__PAGENAME__ = [
                {
                    field: 'NOMEFUNC',
                    type: 'VARCHAR2'
                },
                {
                    field: 'CODFUNC',
                    type: 'NUMBER'
                }
            ];
        
            $scope.order__PAGENAME__Options = [
                {
                    label: 'Nome',
                    value: 'NOMEFUNC'
                },{
                    label: 'Código',
                    value: 'CODFUNC'
                }
            ];
        }

        //INICIALIZADORES ========================================================================================================== INICIALIZADORES
        {
            // CHAMADO QUANDO A PAGINA ESTA CARREGADA
            $(document).ready(function(){
                $scope.init();
            });

            // FUNCAO DE INICIALIZACAO DA PAGINA
            $scope.init = function(){
                FolhaUtils.initBlocks(['content-block']);
                get__PAGENAME__List();
            }

            //MÉTODO EXECUTANDO QUANDO ESTA TELA É LANÇADA POR OUTRA
            $scope.loadByPK = function (obj) {
            };
        }

        //GERAL ============================================================================================================================= GERAL
        {
            function clicaTab(tab){
                if(!angular.isDefined($scope.tabIndex)){
                    let initialId = Number($($('#tabContainerRegras md-pagination-wrapper')[0].firstElementChild).attr('md-tab-id'));
                    $scope.tabIndex = {
                        propriedades: initialId,
                        medias: initialId + 1,
                        ponto: initialId + 2,
                        hitorico: initialId + 3,
                        trct: initialId + 4
                    }
                }

                $timeout(() => {
                    $("#tab-item-" + $scope.tabIndex[tab])[0].click();
                }, 0);
            }

            const isEmpty = (val) => val === undefined || val === null || val == ''
            $scope.isEmpty = isEmpty

            // BUSCA LISTA DE ITENS
            function get__PAGENAME__List() {
                FolhaProxy.callService('mgepes@__PAGENAME__SP.get__PAGENAME__List', {
                }, 'get__PAGENAME__List').then(function (result) {
                    
                });
            }
            
            // CARREGA CADASTRO DO ITEM SELECIONADO
            $scope.onItemClick = function(item){
                FolhaUtils.showBlock('content-block', 'selected-view');
                clicaTab('propriedades'); // REDIRECIONA ABA ABERTA PRORIEDADES
            }
    
            // VOLTA PARA LISTA
            $scope.voltaLista = function(){
                FolhaUtils.showBlock('content-block', 'list-view');
            }

            $scope.addNewItem = function() {
                FolhaUtils.showBlock('content-block', 'selected-view');
                clicaTab('propriedades'); // REDIRECIONA ABA ABERTA PRORIEDADES
            };

            $scope.deletaItem = function(evt, item) {
                evt.stopPropagation();
                PopupServiceMat.showPopup({
                    content: 'Tem certeza que deseja #deletar# este item?',
                    isConfirm: true,
                    callback: () => {
                        alert('DELETADO')
                        console.log(item);
                    }
                })
            };
        }
        //#endregion
    }]);`
//#endregion

//#region CSS
data.css = `
.lista-grid-container{
    display: grid;
    grid-template-columns: repeat(auto-fill, 325px);
    row-gap: 10px;
    column-gap: 20px;
    justify-content: center;
    align-content: flex-start;
    padding: 10px 0;
}`
//#endregion

const crud = data;

/***/ }),

/***/ "./src/templates/lancamento.js":
/*!*************************************!*\
  !*** ./src/templates/lancamento.js ***!
  \*************************************/
/*! exports provided: lancamento */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "lancamento", function() { return lancamento; });
var data = {
    html: '', js: '', css: ''
}

//#region HTML
data.html = `
<folha-application ng-controller="__PAGENAME__Controller as ctrl" ng-cloak>
	<!-- #region datasets -->
	<folha-dataset id='dataset' entity-name='Funcionario' folha-dataset-created='onCreatedDataset(dataset)'>
        <folha-fields path='EmpresaPessoal' pattern='*'></folha-fields>
        <folha-fields pattern='*'></folha-fields>
    </folha-dataset>
		
	<folha-dataset id='dsDepartamento' entity-name='Departamento' folha-dataset-created='onCreatedDataset(dataset)'>
		<folha-fields pattern='*'></folha-fields>
	</folha-dataset>

	<folha-dataset id='dsSindicato' entity-name='Sindicato' folha-dataset-created='onCreatedDataset(dataset)'>
		<folha-fields pattern='*'></folha-fields>
	</folha-dataset>
	
	<folha-dataset id='dsAfast' entity-name='CodigoAfastamento' folha-dataset-created='onCreatedDataset(dataset)'>
		<folha-fields pattern='CODAFAST,TIPTAB'></folha-fields>
	</folha-dataset>
	<!-- #endregion -->

	<folha-chatbot-mat></folha-chatbot-mat>

	<div class="main-content" ng-class="{'no-padding-left': !filtroOpened}">
	 
		<!-- #region FILTRO LATERAL E BOTÃO DO FILTRO -->
		<div id="left-container" ng-class="{'hideleft': !filtroOpened}">
			<div class="fill display-flex">
				<div class="mat-card no-padding-top border-radius-8px" ng-keyup="($event.keyCode == 13 && data.codEmp !== undefined) ? filtrar() : null">
					<!--EMPRESA-->
					<div class="row no-margin height-fit-content">
						<folha-pesquisa-mat mat-model="data.codEmp" entity-name="EmpresaPessoal" dataset='dataset' field-name='CODEMP' folha-enviroment-criteria="getEmpCriteria()" relation-ship-description='Empresa'	
						id='codempField' description-value='data.codEmpDescription'></folha-pesquisa-mat>
					</div>

					<!--TIPO DE FILTRO--> 
					<div class="row no-margin height-fit-content">
						<folha-combobox-mat folha-value='tipoFiltro' folha-label='Tipo de Filtro' folha-enabled='data.codEmp !== undefined' folha-options='tiposDeFiltro' folha-initial-index='0' folha-allow-null='false'></folha-combobox-mat>
					</div>

					<!--SINDICATO-->
					<div class="row no-margin height-fit-content" ng-show="tipoFiltro =='CODSIND'">
						<folha-pesquisa-mat id="sindInput" mat-model="data.codSind" entity-name="Sindicato" dataset='dataset' field-name='CODSIND'
						folha-enabled='data.codEmp !== undefined' folha-enviroment-criteria='getSindCriteria()' relation-ship-description='Sindicato'></folha-pesquisa-mat>
					</div>

					<!--DEPARTAMENTO-->
					<div class="row no-margin height-fit-content" ng-show="tipoFiltro =='CODDEP'">
						<folha-pesquisa-mat id="deptoInput" mat-model="data.codDep" entity-name="Departamento" dataset='dataset' field-name='CODDEP'
						folha-enviroment-criteria='getDepCriteria()' relation-ship-description='Departamento' folha-enabled='data.codEmp !== undefined'></folha-pesquisa-mat>
					</div>

					<!--FUNCIONARIO-->
					<div class="row no-margin height-fit-content" ng-show="tipoFiltro =='CODFUNC'">
						<folha-pesquisa-mat id="funcInput" mat-model="data.codFunc" dataset='dataset' field-name='CODFUNC' entity-name='Funcionario' folha-enabled='data.codEmp != undefined'
						dependent-fields='["CODEMP"]' folha-enviroment-criteria="getFuncCriteria()" relation-ship-description='Funcionário'></folha-pesquisa-mat>
					</div>

					<div class="row no-margin height-fit-content">
						<md-button class="primary-button fill-width" ng-disabled="data.codEmp === undefined" ng-click="applySearch()">Aplicar</md-button>
					</div>
				</div>
			</div>
		</div>

        <div class="mat-card fill no-padding" id="middle-container" ng-click="filtroOpened=!filtroOpened">
			<md-icon ng-if="!filtroOpened" class="center-self" md-svg-src="/mgepes/assets/svg/ic_right_filter.svg" id="openFilter"></md-icon>
			<md-icon ng-if="filtroOpened" class="center-self" md-svg-src="/mgepes/assets/svg/ic_left_filter.svg" id="closeFilter"></md-icon>
			<md-tooltip ng-if="!filtroOpened" md-direction="right" md-auto-hide="true">Mostrar Filtro</md-tooltip>
			<md-tooltip ng-if="filtroOpened" md-direction="right" md-auto-hide="true">Ocultar Filtro</md-tooltip>
		</div>
		<!-- #endregion -->

		<!--CONTEÚDO-->
        <div class="md-card" id="right-container" ng-class="{'fillright': !filtroOpened}">
			<folha-fab-mat on-click='onFabClick()' folha-tooltip='{{fabTooltip()}}' ng-show='canShowFab()'></folha-fab-mat>
			
			<div class="fill display-flex">
				<div class="fill no-padding no-margin">
					
					<div class="fill border-radius-8px overflow-hidden">
						<div class="no-padding height-100">
							<div ng-cloak class="tab" layout-fill>
								<md-tabs md-border-bottom layout-fill md-selected="selectedIndex">

									<!--ABA DE FUNCIONARIOS==============================================================ABA DE FUNCIONARIOS--->
									<md-tab label="Lançamento" ng-disabled='isDirty()'>
										<md-content class="no-padding height-100">

											<!-- #region LISTAGEM DE FUNCIONARIOS -->
											<div class="fill child-block show-block" id="funcList" ng-show="!firstTime">
												<!--CABECALHO DENTRO ABA FUNCIONARIOS-->
												<div class="bg-surface shadowed z-index-10 col fill-width no-padding">
													<div class="mat-row padding-left-8">
														<folha-list-count-mat folha-proxy='getFuncionarios()' folha-icon='/mgepes/assets/svg/ic_func.svg' folha-label='["funcionário", "funcionários"]'></folha-list-count-mat>
														<div class="justify-right center-self display-flex align-center">
															<folha-search-mat mat-model="searchFunc" folha-proxy='getFuncionarios()' folha-fields='fieldsFuncionarios'></folha-search-mat>
															<folha-proxy-paginator-mat folha-page-size-options="[6,9,12]" folha-begin='funcPagBegin' folha-limit='funcPagLimit' folha-initial-option='2' folha-proxy='getFuncionarios()' folha-size='listaFuncionarios.size'></folha-proxy-paginator-mat>
															<folha-order-mat folha-order-options='orderFuncOptions' folha-proxy='getFuncionarios()'></folha-order-mat>
														</div>
													</div>
												</div>

												<!--EXIBICAO DE FUNCIONARIOS=======================EXIBICAO DE FUNCIONARIOS-->
												<div class="height-content-40 enable-scroll">
													<div class="height-100">
														<div layout="row" class="func-card-container" ng-cloak>
															<div class="animation" ng-repeat="func in paginatedFunc = (funcionarios | limitTo: funcPagLimit : funcPagBegin)" ng-click='onClickFuncionario(func, $event)'>
																<md-card class="card-item card-func-from-mov justify-center border-solid-3-transparent">
																	<md-card-title class= "no-padding-bottom">
																		<md-card-title-media>
																			<img ng-if="func.IMAGEM!=''" src={{func.IMAGEM}} alt="funcionario" id="foto-large" />
																			<md-icon ng-if="func.IMAGEM==''" class="no-pic-func pic-large" md-svg-src="/mgepes/assets/svg/ic_func.svg" alt="funcionario"></md-icon>
																		</md-card-title-media>
																		<md-card-title-text>
																			<span class="font-22">{{ func.NOMEFUNC | truncate: 15 | upperCaseFirsts }}
																				<md-tooltip md-direction="top" md-auto-hide="true"><span class="highlight">{{func.CODFUNC}}</span> - {{ func.NOMEFUNC | upperCaseFirsts }}</md-tooltip>
																			</span>
																			<div class='display-flex flex-flow-row align-items-center padding-top-2 padding-bottom-2 height-28px'>
																				<md-icon ng-if='func.SEXO == "M"' class='icon-adjust fill-blue' md-svg-src=/mgepes/assets/svg/ic_cargo_homem.svg>
																					<md-tooltip md-direction="left" md-auto-hide="true">Cargo</md-tooltip>
																				</md-icon>
																				<md-icon ng-if='func.SEXO == "F"'class='icon-adjust fill-blue' md-svg-src=/mgepes/assets/svg/ic_cargo_mulher.svg>
																					<md-tooltip md-direction="left" md-auto-hide="true">Cargo</md-tooltip>
																				</md-icon>  
																				<span class='cargo-text font-surface font-14 letter-spacing-0-14px font-bold-500'>{{ func.CARGO | truncate: 25 }}
																					<md-tooltip md-direction="top" md-auto-hide="true">{{ func.CARGO }}</md-tooltip>
																				</span>
																			</div>
																			<div class='display-flex flex-flow-row align-items-center height-28px'>
																				<md-icon class='icon-adjust fill-blue' md-svg-src=/mgepes/assets/svg/ic_departamento_4.svg>
																					<md-tooltip md-direction="left" md-auto-hide="true">Departamento</md-tooltip>
																				</md-icon>
																				<span class='cargo-text font-surface font-14 letter-spacing-0-14px font-bold-500'>{{ func.DEPARTAMENTO | truncate: 25 }}
																					<md-tooltip md-direction="top" md-auto-hide="true"><span class="highlight font-bold">{{func.CODDEP}}</span> - {{ func.DEPARTAMENTO}}</md-tooltip>
																				</span>
																			</div>
																			<div class='display-flex flex-flow-row align-items-center height-28px'>
																				<md-icon class='icon-adjust fill-blue' md-svg-src=/mgepes/assets/svg/ic_sindicato_2.svg>
																					<md-tooltip md-direction="left" md-auto-hide="true">Sindicato</md-tooltip>
																				</md-icon>
																				<span class='cargo-text font-surface font-14 letter-spacing-0-14px font-bold-500'>{{ func.SINDICATO | truncate: 25 }}
																					<md-tooltip md-direction="top" md-auto-hide="true"><span class="highlight font-bold">{{func.CODSIND}}</span> - {{ func.SINDICATO }}</md-tooltip>
																				</span>
																			</div>
																		</md-card-title-text>
																	</md-card-title>
																</md-card>
															</div>
														</div>
														<div class="display-flex fill" ng-show='listaFuncionarios.size == 0 && searchFunc != "" && searchFunc != undefined'>
															<p class="no-result-warning-2 fill">Nenhum funcionário foi encontrado para a pesquisa<span class="highlight padding-left-5">"{{ searchFunc }}"</span>.</p>		
														</div>
													</div>
												</div>
											</div>
											<!-- #endregion -->

											<p ng-show='firstTime==true' class="no-result-warning fill no-margin">Aplique um filtro =)</p>
										</md-content>
									</md-tab>
								</md-tabs>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</folha-application>
`;
//#endregion

//#region JS
data.js = `
angular
    .module("__PAGENAME__App", ["folha","ngMaterial","ngMessages"])
    .controller("__PAGENAME__Controller", ["$scope", "Criteria", "PopupServiceMat", 'FolhaProxy', 'SelectionService', 'FolhaColor', 'FolhaUtils', '$timeout', '$mdDialog',
    function($scope, Criteria, PopupServiceMat, FolhaProxy, SelectionService, FolhaColor, FolhaUtils, $timeout, $mdDialog) {

        FolhaColor.loadTheme();
        
        //#region FUNÇÕES E VARIAVEIS PADRÕES DA PAGINA
        //VARIAVEIS ================================================================================================================================== VARIAVEIS
        {
            $scope.filtroOpened = true;
            $scope.firstTime = true

            $scope.dataset = {
                dsFunc: undefined
            };

            $scope.data = {
                codEmp : undefined,
                codFunc: undefined,
                codDep : undefined,
                codSind: undefined
            }

            $scope.fieldsFuncionarios = [
                {
                    field: 'NOMEFUNC',
                    type: 'VARCHAR2'
                },
                {
                    field: 'CODFUNC',
                    type: 'NUMBER'
                },
                {
                    field: 'DEPARTAMENTO',
                    type: 'VARCHAR2'
                },
                {
                    field: 'CARGO',
                    type: 'VARCHAR2'
                },
                {
                    field: 'SINDICATO',
                    type: 'VARCHAR2'
                }
            ];

            $scope.orderFuncOptions = [
                {
                    label: 'Nome',
                    value: 'NOMEFUNC'
                },{
                    label: 'Código',
                    value: 'CODFUNC'
                },{
                    label: 'Cargo',
                    value: 'CARGO'
                },{
                    label: 'Departamento',
                    value: 'DEPARTAMENTO'
                },{
                    label: 'Sindicato',
                    value: 'SINDICATO'
                }
            ];

            $scope.tiposDeFiltro = [
                {
                    value: 'Empresa',
                    data: 'CODEMP'
                },{
                    value: 'Departamento',
                    data: 'CODDEP'
                },{
                    value: 'Funcionário',
                    data: 'CODFUNC'
                },{
                    value: 'Sindicato',
                    data: 'CODSIND'
                }
            ];

            $scope.searchFunc;  
            $scope.funcionarios = [];
        }

        //GERAL ========================================================================================================================================== GERAL
        {
            $scope.onCreatedDataset = function(dataset) {
                if(dataset.getEntityName()=="Funcionario"){
                    $scope.dataset.dsFunc = dataset;
                    $scope.dataset.dsFunc.initializeDataSet();
                }
            }

            $(document).ready(function () {
                $scope.init();
            });

            $scope.getFuncionarios = function() {
                return FolhaProxy.callService('mgepes@OcorrenciasSP.getFuncionarios', {
                    codEmp : $scope.data.codEmp,
                    codFunc: $scope.data.codFunc,
                    codDep : $scope.data.codDep,
                    codSind: $scope.data.codSind
                }, 'getFuncionarios').then(function (result) {
                    $scope.funcionarios = result.responseBody.funcionarios
                    $scope.firstTime = false
                }); 
            };
        }

        //BUSCA FUNC E CRITERIAS ======================================================================================================== BUSCA FUNC E CRITERIAS
        {
            //MÉTODO CHAMADO QUANDO SE CLICA NO BOTÃO APLICAR
            $scope.applySearch = async function () {
                SelectionService.resetSelected('getFuncionarios');
                SelectionService.clearSelectedMap();
                return $scope.getFuncionarios();
            }

            $scope.getFuncCriteria = function() {
                return Criteria("this.SITUACAO NOT IN (8)");
            }

            $scope.getEmpCriteria = function() {
                return Criteria("this.ATIVO = 'S'");
            }

            $scope.getDepCriteria = function() {
                return Criteria(\`this.CODDEP IN (SELECT CODDEP FROM TFPFUN WHERE CODEMP=\${$scope.data.codEmp} AND SITUACAO <> 8 AND VINCULO <> 99)\`);
            };

            $scope.getSindCriteria = function() {
                return Criteria(\`this.CODSIND IN (SELECT CODSIND FROM TFPFUN WHERE CODEMP=\${$scope.data.codEmp} AND SITUACAO <> 8 AND VINCULO <> 99)\`);
            };

            $scope.$watch('tipoFiltro', function(newVal, oldVal){
                if(angular.isDefined(newVal)){
                    if(newVal != oldVal){
                        $scope.data.codFunc = undefined;
                        $scope.data.codDep  = undefined;
                        $scope.data.codSind = undefined;

                        //simula o click para limpar o componente de pesquisa
                        setTimeout(() => {
                            $('#funcInput #codField input')[0].focus();  
                            $('#funcInput #codField input')[0].blur();
                            $('#deptoInput #codField input')[0].focus();  
                            $('#deptoInput #codField input')[0].blur();
                            $('#sindInput #codField input')[0].focus();  
                            $('#sindInput #codField input')[0].blur();
                        }, 200);
                    }
                }
            });
        }
        //#endregion

        //GERAL ================================================================================================================================ GERAL
        {
            const hasFuncSelected = () => SelectionService.hasSelected('getFuncionarios');
            $scope.hasFuncSelected = hasFuncSelected
    
            $scope.init = function() {
                FolhaUtils.initBlocks([ 'child-block', 'tip-content-block' ]);
                $scope.getAfastamentos()
            }

            $scope.onClickFuncionario = function(func, evt) {
                evt.stopPropagation();
                console.log(func);
            };
        }
    }])
`;
//#endregion

//#region CSS
data.css = `
/* #region ESTILO PADRÃO DA PAGINA */
/* CONTROLE DE LARGURA DA PAGINA COM E SEM FILTRO */
.hideleft {
    position: absolute;
    top: -3000px;
    width: 0 !important;
    min-width: 0 !important;
}
.fillright {
    min-width: 90%;
    max-width: calc(100% - 28px) !important;
}

/* CONFIGURAÇÕES GERAIS */
.card-item.card-func-from-mov{
    width: 390px;
    height: 180px;
}
.card-func-from-mov md-card-title-text{
    margin-left: 10px;
}

/* CARD FUNCIONARIOS */
.func-card-container{
    display: grid;
    grid-template-columns: repeat(auto-fill, 400px);
    row-gap: 10px;
    column-gap: 15px;
    justify-content: center;
    align-content: flex-start;
    padding: 10px 0;
    margin: auto auto;
}
/* #endregion */

`;
//#endregion

const lancamento = data;

/***/ }),

/***/ "./src/templates/launcher.js":
/*!***********************************!*\
  !*** ./src/templates/launcher.js ***!
  \***********************************/
/*! exports provided: launcher */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "launcher", function() { return launcher; });
var data = {
    body: ' <ignored></ignored>',
    include: `
<ignored>
	<link rel="stylesheet" type="text/css" href="/mgepes/assets/css/folha.min.css"/>
	<link media="all" type="text/css" href="css/angular-material.min.css" rel="stylesheet" />
	<link media="all" type="text/css" href="css/newFolha.css" rel="stylesheet" />
	<link media="all" type="text/css" href="html5/__PAGENAME__/__PAGENAME__.css" rel="stylesheet" />
</ignored>`,
    mainLauncher: `
<script src="/mgepes/scripts/jquery/jquery-3.3.1.min.js"></script>
<script src="/mgepes/scripts/jquery/jquery-ui.min.js"></script>
<script src="/mgepes/scripts/angular/angular-material.min.js"></script>
<script src="/mgepes/scripts/angular/angular-cookies.min.js"></script>
<script src="/mgepes/scripts/angular/angular-messages.min.js"></script>
<script src="/mgepes/scripts/google-charts/loader.js"></script>
<script src="/mgepes/scripts/folha.js?v=1"></script> 
<script src="/mgepes/scripts/ngMask.min.js"></script>`
}
const launcher = data;

/***/ }),

/***/ "./src/templates/vscodeLauncher.js":
/*!*****************************************!*\
  !*** ./src/templates/vscodeLauncher.js ***!
  \*****************************************/
/*! exports provided: vscodeLauncher */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "vscodeLauncher", function() { return vscodeLauncher; });
const vscodeLauncher = `
{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "type": "chrome",
            "request": "launch",
            "name": "Launch Chrome against localhost",
            "url": "http://localhost:8080",
            "webRoot": "C:/sk-java/workspace/SankhyaW/",
            "pathMapping": {
                "/": "C:/sk-java/workspace/SankhyaW/MGE-Pes-VC/build",
                "/mgepes/scripts": "C:/sk-java/workspace/SankhyaW/folha-js/src/*"
            }
        }
    ]
}`

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),

/***/ "vscode":
/*!*************************!*\
  !*** external "vscode" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("vscode");

/***/ })

/******/ });
//# sourceMappingURL=extension.js.map