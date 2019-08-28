export const vscodeLauncher = `
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