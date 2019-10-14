var data = {
    html: '', less: '', directive: '', controller: '', _module: ''
}

//#region LESS
data.less = `
__PAGENAME__ {
}`
//#endregion

//#region HTML
data.html = ' <p>__PAGENAME__ it`s working!</p>'
//#endregion

//#region MODULE
data._module = ` angular.module('folha.components.__PAGENAME__', ['ngMaterial']);`
//#endregion

//#region DIRECTIVE
data.directive = `
angular
    .module('folha.components.__PAGENAME__')
    .directive('folha__UPPERPAGENAME__', ['$timeout', 'StringUtils',
    function ($timeout, StringUtils) {
        var link = function(scope,element, attrs,controller){}
        return{
            templateUrl: "components/__PAGENAME__/__PAGENAME__.tpl.html",
            transclude: true,
            scope:{
            },
            controller: "Folha__UPPERPAGENAME__Controller",
            link: link
        };
    }]);`
//#endregion

//#region CONTROLLER
data.controller = `
angular
    .module('folha.components.__PAGENAME__')
    .controller('Folha__UPPERPAGENAME__Controller', ['$scope', '$timeout',
    function ($scope, $timeout) {

    }]);`
//#endregion

export const component = data