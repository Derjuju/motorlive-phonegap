/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

//---------------------------------
// DEPENDANCES
//---------------------------------
var APP_PROD = true;
APP_PROD = false;


//---------------------------------
// GLOBAL
//---------------------------------
var myApp;
var entries, entriesLink, entriesLabel, entriesTitle, entriesTpl;
var donneesJson;

var permanentStorage = window.localStorage;

var rubriqueActuelle = 0;

var myScroll, myScrollMenu;
var useTransition3D = true;

var IS_ANDROID = navigator.userAgent.match( /android/gi ),
    IS_IPHONE = navigator.userAgent.match( /iphone/gi ),
    IS_IOS = navigator.userAgent.match( /(iPad|iPhone|iPod)/i );
    
// url des services
var website_app = "http://motorlive.derjuju.com";
var webservice_version = "http://motorlive.derjuju.com/services/checkVersion/";
var webservice_update = "http://motorlive.derjuju.com/services/update/";
var webservice_stats = "http://motorlive.derjuju.com/services/stats/";

var cdn_visuel_menu = "http://motorlive.derjuju.com/";
var cdn_visuel = "http://media.motoservices.com/media/cache/motorlive_big_thumbnail/media/video/";
var cdn_visuel_small = "http://media.motoservices.com/media/cache/motorlive_playlist_thumbnail/media/video/";


//---------------------------------
// APPLICATION RACINE
//---------------------------------
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();        
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    
    // Events Handlers
    //
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        myApp = new MyApplication();
        
        // masque la barre de status sous iOS7
        if(IS_IOS){  
          if(APP_PROD)
          {
            if (StatusBar.isVisible) {
              StatusBar.overlaysWebView(false); // status bar redevient comme sous iOS6
              StatusBar.hide();          
            }
          }
        }
        
        // simulation du chargement
        //setTimeout(function() { myApp.initialise(); }, 1000);
        // pour la prod : 
        myApp.initialise();
        
    }
};

//---------------------------------
// APPLICATION PRINCIPALE
//---------------------------------
function MyApplication(){
  var self = this;
  var menuNav;
  var contenuPrincipal;
  var connexion;
  
  var demarrageApplication = false;
  
  // constructeur
  this.initialise = function() {
    //navigator.splashscreen.show();
    connexion = new Connexion();    
    
    document.body.addEventListener('touchmove', function(event) {event.preventDefault();}, false);
    //$("#app").css('width',window.innerWidth+"px");
    //$("#app").css('height',window.innerHeight+"px");
    
    self.verifieUsage3D();
    
    self.demarrageApplication = true;
    self.verifieDonneesServeur();
  };
  
  this.verifieUsage3D = function(){
    if($("html").hasClass("csstransforms3d")){
      useTransition3D = true;
    }else{
      useTransition3D = false;
    }
    // pas de bonne gestion du menu en 3D sous Android
    if(IS_ANDROID) { 
      useTransition3D = false;
      $("html").removeClass("csstransforms3d");
    }
    
  }
  
  this.verifieDonneesServeur = function(){
    $("#eventManager").on('versionVerifiee', function() { onVersionVerifiee(); } );
    
    if(!connexion.verifieVersion())
    {
      $("#eventManager").off('versionVerifiee');
      notificationMessage('Vous devez être connecté pour pouvoir utiliser cette application.', null, 'Absence de connectivité', 'OK');
      
      //initialise les Données depuis le cache
      $("#eventManager").on('initialiseDonneesReady', function() { onInitialiseDonneesReady(); } );
      connexion.initialiseDonnees();
    }
  }
  
  this.reVerifieDonneesServeur = function(){
    $("#eventManager").on('versionVerifiee', function() { onReVersionVerifiee(); } );
    
    if(!connexion.verifieVersion())
    {
      $("#eventManager").off('versionVerifiee');
      notificationMessage('Vous devez être connecté pour pouvoir utiliser cette application.', null, 'Absence de connectivité', 'OK');
    }
  }
  
  function onVersionVerifiee() {
    $("#eventManager").off('versionVerifiee');
    // on teste la valeur de la verification
    var etatApplication = connexion.getEtatApplication();
    
    if(etatApplication >= 0)
    {
        // charge les données
        $("#eventManager").on('initialiseDonneesReady', function() { onInitialiseDonneesReady(); } );
        if(!connexion.initialiseDonnees())
        {
          $("#eventManager").off('initialiseDonneesReady');
          //initialise les Données depuis le cache
          //@todo : initialise les Données
          // charge les données du cache
          // quand on utilisera un système de fichier
          // pour le moment on bloque en réclamant une connectivité
          notificationMessage('Vous devez être connecté pour pouvoir utiliser cette application.', null, 'Absence de connectivité', 'OK');        
        }
    }else{
      notificationMessage("Vous devez mettre à jour l'application pour pouvoir l'utiliser", goToStore, 'Application périmée', 'OK');
    }
    
  }
  
  function onReVersionVerifiee() {
    $("#eventManager").off('versionVerifiee');
    // on teste la valeur de la verification
    var etatApplication = connexion.getEtatApplication();
    
    if(etatApplication >= 0)
    {
      // met à jour l'application
      if(etatApplication == 0)
      {
        // charge les données du cache
        $("#eventManager").on('initialiseDonneesReady', function() { onInitialiseDonneesReady(); } );
        if(!connexion.initialiseDonnees())
        {
          $("#eventManager").off('initialiseDonneesReady');
          //initialise les Données depuis le cache
          //@todo : initialise les Données
          // charge les données du cache
          // pour le moment on bloque en réclamant une connectivité
          notificationMessage('Vous devez être connecté pour pouvoir utiliser cette application.', null, 'Absence de connectivité', 'OK');        
        }
      }else{
        // données inchangées, on est déjà à jour, on ne fait rien
        self.menuNav.finMiseAJour();
      }

    }else{
      notificationMessage("Vous devez mettre à jour l'application pour pouvoir l'utiliser", goToStore, 'Application périmée', 'OK');
    }
    
  }
  
  function onInitialiseDonneesReady(){
    $("#eventManager").off('initialiseDonneesReady');
    // données chargées en local, lance UI
    initialiseUI(); 
  }
  
  
  function initialiseUI() {
    $("#eventManager").on('menuNavigationReady', function() { onMenuNavigationReady(); } );
    if(self.demarrageApplication)
    {
      self.menuNav = new MenuNavigation();
    }
    self.menuNav.fabricationListeMenu(self, self.demarrageApplication);    
  }  
  
  function onMenuNavigationReady(){
    $("#eventManager").off('menuNavigationReady');
    if(self.demarrageApplication)
    {
      self.demarrageApplication = false;
      navigator.splashscreen.hide();
    
    
      // masque la barre de status sous iOS7
      if(IS_IOS){
        if(APP_PROD)
        {
          if (StatusBar.isVisible) {
            StatusBar.overlaysWebView(false); // status bar redevient comme sous iOS6
            StatusBar.hide();          
          }
        }
      }


      self.menuNav.ouvreMenu();

      self.contenuPrincipal = new ContenuPrincipal();
      self.contenuPrincipal.initialise(self); 
      //self.miseAjourContenu(); 
    }
    rubriqueActuelle = 0;
    self.menuNav.simuleClickNavigation(rubriqueActuelle);
  }
  
  this.miseAjourContenu = function(){   
    self.contenuPrincipal.chargeRubriqueActuelle();   
  };
  
  
  
  
  function notificationMessage(message, callback, title, buttonName){
    navigator.notification.alert(message, callback, title, buttonName);
  }
  
  function goToStore(){
    //@TODO : envoyer vers le store correspondant pour mettre à jour
    console.log("envoyer vers le store correspondant pour mettre à jour");
  }
  
  this.getAppVersion = function(){
    return connexion.getAppVersion();
  };
  
  this.getDataVersion = function(){
    return connexion.getDataVersion();
  }; 
  
}


