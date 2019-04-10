# AngularJS extension

This extension add the support for autocomplete, documentation and a faster approach to snippets.

## Features

#### Autocomplete
The extension scans all files in your workspace to find the services that you have made so it can provide the autocomplete for your functions and variables.

Exemple:
\!\[feature X\]\(images/feature-x.png\)

> Atension: the extension search for *FILE_NAME*.service.js to look for services, this is made for optimization reasons.

#### Documentation
You can fill the documentation for your methods to show in the autocomplete box
```javascript
/**
 * Description of what your function does
 * @param yourParameter Your parameter description
 * @return what your function returns
 */
```

#### Snippets
You can now add the snippet for your code into the documentation of your function
> Tip: To add a snippet you have to follow the definitions from vscode. You can find more information [here](https://code.visualstudio.com/docs/editor/userdefinedsnippets)
```javascript
/**
 * Description of what your function does
 * @param yourParameter Your parameter description
 * @snippet yourMethod($1) {$2}
 * @return what your function returns
 */
```

Snippets also can be multi line
```javascript
/**
 * Description of what your function does
 * @param yourParameter Your parameter description
 * @snippet
 * $$scope.${1:FUNCTION_NAME} = function($2) {
 *     $3
 * };
 * @return what your function returns
 */
```

## Requirements

vscode version 1.26.1 or higher

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of AngularJS extension