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

export const crud = data;