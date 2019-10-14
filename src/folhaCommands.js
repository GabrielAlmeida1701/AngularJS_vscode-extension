const vscode = require('vscode');
const fs = require('fs');
const join = require('path').join;
const launcher = require('./templates/launcher').launcher

export class FolhaCommands {

    constructor() {
        //#region Read Settings
        /** @returns {string} */
        const GetPesVC = () => {
            let pesVC = vscode.workspace.getConfiguration().get('conf.view.diretorioRaizDasPaginas')
            return pesVC
        }

        /** @returns {string} */
        const GetFolhaJS = () => {
            let pesVC = vscode.workspace.getConfiguration().get('conf.view.diretorioRaizDosComponentes')
            return pesVC
        }
        //#endregion

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
            let folder = join(GetPesVC(), result)
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

        /** @param {string} val */
        const frstUpper = (val) => val.substring(0,1).toUpperCase() + val.substring(1)

        /** 
         * @param {string} file 
         * @param {string} pageName 
         * */
        const content = (file, pageName) => file.substring(1).replace(/__PAGENAME__/g, pageName).replace(/__UPPERPAGENAME__/g, frstUpper(pageName))

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

            fs.writeFileSync( join(GetPesVC(), `launcher/${result}.libs`), content(launcher.mainLauncher, result) )
            vscode.window.showInformationMessage(`Pagina ${result} criada com sucesso!`)
        }
        //#endregion

        this.createDefaultPage = async () => {
            GetPesVC();
            let { html, js, css } = require('./templates/lancamento').lancamento
            createPage(html, js, css)
        }

        this.createCrudPage = async () => {
            let { html, js, css } = require('./templates/crud').crud
            createPage(html, js, css)
        }

        this.createComponent = async () => {
            let result = await vscode.window.showInputBox();
            if(result === undefined || result.trim() == '') return;
            
            result = result.replace(/\s/g, '');
            if(result.toLowerCase().indexOf('mat') == -1) {
                vscode.window.showWarningMessage('Por padrão todos os nomes de componentes devem terminar com Mat')
                result += 'Mat'
            }

            let folder = join(GetFolhaJS(), result)
            if(fs.existsSync(folder)) {
                vscode.window.showErrorMessage(`O componente ${result} ja existe`)
                return;
            } else fs.mkdirSync(folder);

            let { html, less, _module, directive, controller } = require('./templates/component').component
            fs.writeFileSync( filePath(result, 'tpl.html', folder) , content(html, result) )
            fs.writeFileSync( filePath(result, 'module.js', folder) , content(_module, result) )
            fs.writeFileSync( filePath(result, 'directive.js', folder) , content(directive, result) )
            fs.writeFileSync( filePath(result, 'controller.js', folder) , content(controller, result) )

            let upper = 'ABCDEFGHIJKLMNOPQRSTUVXYWZ'
            let directiveName = 'folha-';
            for(let i=0; i<result.length; i++) {
                let c = result[i]
                if(i == 0) c = c.toLowerCase();

                if(upper.indexOf(c) != -1) directiveName += '-'
                directiveName += c.toLowerCase();
            }
            let lessContent = less.substring(1).replace(/__PAGENAME__/g, directiveName)
            fs.writeFileSync( filePath(result, 'less', folder), lessContent )

            vscode.window.showInformationMessage(`Componente ${result} criado com sucesso!`)
        }

        this.createDebugFile = () => {
            let base = GetPesVC().replace('/build/html5', '');
            let path = join(base, '/.vscode/')
            let launch = join(path, 'launch.json')
            let content = require('./templates/vscodeLauncher').vscodeLauncher

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