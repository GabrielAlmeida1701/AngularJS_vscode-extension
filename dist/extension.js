module.exports=function(e){var t={};function n(r){if(t[r])return t[r].exports;var i=t[r]={i:r,l:!1,exports:{}};return e[r].call(i.exports,i,i.exports,n),i.l=!0,i.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)n.d(r,i,function(t){return e[t]}.bind(null,i));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){const r=n(1),i=n(2);function o(e){var t={},n={};function o(){t={},n={},r.window.showInformationMessage("Start Analyzing"),r.workspace.workspaceFolders.forEach(e=>{let t=e.uri.toString(!0);(function e(t){i.readdir(t,function(n,r){n&&console.log("error!"),r.forEach(n=>{let r=t+"/"+n,o=i.lstatSync(r).isDirectory();if(o)e(r);else{let e=n.substring(n.indexOf(".")+1);"service.js"==e&&i.readFile(r,"utf8",(e,t)=>{e?console.error("could´t read file "+n):c(t)&&console.log(n+" Analysed!")})}})})})(t=t.replace("file:///",""))}),r.window.showInformationMessage("All files analysed")}console.log('Congratulations, your extension "AngularJS extension" is now active!'),r.window.showInformationMessage("AngularJS extension is now active"),o(),r.workspace.onDidSaveTextDocument(e=>{"service.js"==e.fileName.substring(e.fileName.indexOf(".")+1)&&c(e.getText())}),r.workspace.onDidChangeWorkspaceFolders(e=>o()),r.languages.registerHoverProvider("javascript",{provideHover(e,t,r){e.getText();let i=e.getWordRangeAtPosition(t),o=e.lineAt(i.start.line).text.substr(i.start.character,i.end.character-i.start.character),s="",a=n[o];return""!=a&&null!==a&&(s=a),{contents:[s]}}});let s=r.languages.registerCompletionItemProvider("javascript",{provideCompletionItems(e,n,i,o){let s=[];return Object.keys(t).forEach(e=>{let t=new r.CompletionItem(e);t.insertText=new r.SnippetString(e),t.kind=r.CompletionItemKind.Class,s.push(t)}),s}}),a=r.languages.registerCompletionItemProvider("javascript",{provideCompletionItems(e,n,i,o){let s=[],a=(function(e,t){return e.lineAt(t).text.slice(0,t.character)}(e,n).match(/.*(?=\.)/)||[""])[0].replace(/\s*/,"");return""==a?[]:(Object.keys(t).forEach(e=>{if(""==a||""!=a&&-1!=a.indexOf(e)){let n=t[e];Object.keys(n).forEach(n=>{let i=new r.MarkdownString(t[e][n].doc);i.isTrusted=!0;let o=new r.CompletionItem(n);o.sortText=e+".",o.documentation=i,t[e][n].isFunc?o.kind=r.CompletionItemKind.Function:o.kind=r.CompletionItemKind.Property,null!==t[e][n].snip&&""!==t[e][n].snip?o.insertText=new r.SnippetString(t[e][n].snip):o.insertText=new r.SnippetString(n),s.push(o)})}}),s)}},"."),l=r.languages.registerCompletionItemProvider("javascript",{provideCompletionItems(e,t,n,i){let o=new r.CompletionItem("snippet");return o.insertText=new r.SnippetString("snippet"),o.documentation=new r.MarkdownString("Define a snippet in your documentation"),o.kind=r.CompletionItemKind.Keyword,o.sortText="000",[o]}},"@");function c(e){let r=e.match(/service\('(.*?)(?=')/g);if(null!==r){let i=r[0].replace(/service\('/g,""),o=e.match(/this\.(.*)=(\s*)((?=f)|(?=a))/g),s=[];t[i]={},null!==o&&o.forEach(r=>{let o=r.replace(/\s/g,"").replace("this.","").replace("=",""),a=i+"."+o,l=null;s.push(o);let c=e.indexOf(r);if(-1!=c){let t=function(e,t,n){let r=e.substring(0,t),i=r.lastIndexOf("*/");if(-1!=i){let e=r.substring(i,t);if(-1==e.indexOf(";")&&-1==e.indexOf("}")){let e=r.lastIndexOf("/**"),t=r.substring(e,i),o=t.split("*"),s="";o.forEach(e=>{let t=e.trim().replace(/\s{2,}/g,"");"/"!=t&&""!=t&&(""!=s&&(s+="     \n"),s+=t)});let a=(s=s.replace("@param","     \n**Parameters:**     \n@param").replace("@return","     \n**Returns:**     \n**[return](/)**")).match(/@param\s\w*/g);null!==a&&a.forEach(e=>{s=s.replace(e,"**["+e.replace("@param","").trim()+"](/)**")});let l="",c=s.match(/@snippet(\s|.)*(;|^\*)/g);return null!==c&&(l=c[0].replace("@snippet","").replace(n+".","").trim(),s=s.replace(c[0],"")),{documentation:s,snippet:l}}}return{documentation:"",snippet:""}}(e,c,i);a=t.documentation,l=t.snippet,n[o]=a}t[i][o]={isFunc:!0,doc:a,snip:l}});let a=e.match(/this\.(\w*)/g);if(null!==a){let e=[];a.forEach(n=>{let r=n.replace(/\s/g,"").replace("this.","");-1==e.indexOf(r)&&-1==s.indexOf(r)&&(e.push(r),t[i][r]={isFunc:!1})})}return!0}return!1}e.subscriptions.push(s),e.subscriptions.push(a),e.subscriptions.push(l)}t.activate=o,e.exports={activate:o,deactivate:function(){}}},function(e,t){e.exports=require("vscode")},function(e,t){e.exports=require("fs")}]);
//# sourceMappingURL=extension.js.map