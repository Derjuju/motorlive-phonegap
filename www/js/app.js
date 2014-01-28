require.config({

    baseUrl: 'js/lib',

    paths: {
        app: '../app',
        tpl: '../tpl'
    }
});
// pour dev smartphone sans 3D
//require(['jquery', 'meny', 'iscroll', 'app/application', 'app/connexion', 'app/menu-navigation', 'app/contenu-principal'], function ($, Meny, iScroll, App, Connexion, MenuNavigation, ContenuPrincipal) {
require(['jquery/jquery', 'modernizr/modernizr', 'meny/meny', 'iScroll', 'app/application', 'app/connexion', 'app/menu-navigation', 'app/contenu-principal'], function ($, Modernizr, Meny, iScroll, App, Connexion, MenuNavigation, ContenuPrincipal) {
  app.initialize();
});