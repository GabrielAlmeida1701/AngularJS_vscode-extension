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
export const launcher = data;