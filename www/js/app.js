require.config({

    baseUrl: 'js/lib',

    paths: {
        app: '../app',
        tpl: '../tpl'
    }
});
// pour dev smartphone sans 3D
//require(['jquery', 'meny', 'iscroll', 'app/application', 'app/connexion', 'app/menu-navigation', 'app/contenu-principal'], function ($, Meny, iScroll, App, Connexion, MenuNavigation, ContenuPrincipal) {
require(['jquery', 'modernizr-2.6.2.min', 'meny', 'iscroll', 'app/application', 'app/connexion', 'app/menu-navigation', 'app/contenu-principal', 'app/fiche-detail'], function ($, Modernizr, Meny, iScroll, App, Connexion, MenuNavigation, ContenuPrincipal, FicheDetail) {
  app.initialize();
});