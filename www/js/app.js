require.config({

    baseUrl: 'js/lib',

    paths: {
        app: '../app',
        tpl: '../tpl'
    }
});
// pour dev smartphone sans 3D
//require(['jquery', 'TweenMax.min', 'meny', 'iscroll', 'app/application', 'app/connexion', 'app/menu-navigation', 'app/contenu-principal', 'app/fiche-detail', 'app/gestionnaire-pubs'], function ($, TweenMax, Meny, iScroll, App, Connexion, MenuNavigation, ContenuPrincipal, FicheDetail, GestionnairePubs) {
require(['jquery', 'modernizr-2.6.2.min', 'TweenMax.min', 'meny', 'iscroll', 'app/application', 'app/connexion', 'app/menu-navigation', 'app/contenu-principal', 'app/fiche-detail', 'app/gestionnaire-pubs'], function ($, Modernizr, TweenMax, Meny, iScroll, App, Connexion, MenuNavigation, ContenuPrincipal, FicheDetail, GestionnairePubs) {
  app.initialize();
});