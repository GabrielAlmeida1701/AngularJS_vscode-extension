const vscode = require('vscode');
const fs = require('fs');
const join = require('path').join;

const launcher = require('./templates/launcher').launcher
const PesVC = 'C:/sk-java/workspace/SankhyaW/MGE-Pes-VC/build/html5';
const FolhaJS = 'C:/sk-java/workspace/SankhyaW/folha-js/src/components/';

export class FolhaCommands {

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
            let { html, js, css } = require('./templates/lancamento').lancamento
            createPage(html, js, css)
        }

        this.createCrudPage = async () => {
            let { html, js, css } = require('./templates/crud').crud
            createPage(html, js, css)
        }

        this.createComponent = async () => {
            let { folder, result } = await initPage();
            if(folder === undefined) return;

            if(result.indexOf('Mat') == -1) vscode.window.showWarningMessage('Por padrão todos os componentes devem ser seguidos por Mat')
        }

        this.createDebugFile = () => {
            let path = join('C:/sk-java/workspace/SankhyaW/MGE-Pes-VC', '/.vscode/')
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