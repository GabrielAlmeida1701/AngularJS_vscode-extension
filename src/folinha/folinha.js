const vscode = require('vscode');
const join = require('path').join;

const FolinhaUtils = {
    /** @type {import('vscode').WebviewPanel} */
    panel: undefined,
    extensionPath: ''
}
export class Folinha {
    constructor() {
        /** @param {string} path */
        this.setExtensionPath = (path) => FolinhaUtils.extensionPath = path

        this.buildFolinha = () => {
            const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

            // if(FolinhaUtils.panel !== undefined) {
            //     FolinhaUtils.panel.reveal(column)
            //     return;
            // }

            const panel = vscode.window.createWebviewPanel('folinhaGame', 'Folinha', column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.file(join(FolinhaUtils.extensionPath, 'resources'))
                ]
            })

            FolinhaUtils.panel = panel;

            this.start();
        }

        this.start = () => {
            FolinhaUtils.panel.webview.html = this.getBaseHTML()
            FolinhaUtils.panel.onDidDispose(() => this.dispose())
        }

        this.dispose = () => {
            // FolinhaUtils.panel.webview.postMessage({ dispose: true })
            FolinhaUtils.panel.dispose();
            FolinhaUtils.panel = undefined
        }

        this.getBaseHTML = () => {
            /** Local path to main script run in the webview
             * And the uri we use to load this script in the webview
             * @param {string} file
             * @param {string} ext
             * */
            const getFile = (file, ext) => vscode.Uri.file( join(FolinhaUtils.extensionPath, 'resources', file +'.' + ext) ).with({ scheme: 'vscode-resource' });

            // Use a nonce to whitelist which scripts can be run
            const getNonce = () => {
                let text = '';
                const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                for (let i = 0; i < 32; i++) {
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                return text;
            }

            let nonce = getNonce()

            return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <!--
                Use a content security policy to only allow loading images from https or from our extension directory,
                and only allow scripts that have a specific nonce.
                -->
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src 'self' 'nonce-${nonce}'; style-src vscode-resource:">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Folinha</title>
                <link rel="stylesheet" href="${ getFile('style', 'css') }" type="text/css">
            </head>
            <body>
                <img src='${ getFile('tileTest', 'png') }' id="tilemap">
                <img src='${ getFile('dude', 'png') }' id="player">
                <canvas id='draw-area'></canvas>
                <script nonce="${ nonce }" src="${ getFile('main', 'js') }"></script>
            </body>
            </html>`;
        }
    }
}