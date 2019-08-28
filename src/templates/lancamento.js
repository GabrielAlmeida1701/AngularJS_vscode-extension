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

export const lancamento = data;