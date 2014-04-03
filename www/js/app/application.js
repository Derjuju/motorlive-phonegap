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
//APP_PROD = false;


//---------------------------------
// GLOBAL
//---------------------------------
var myApp;
// les listes
var configJson;
var menuJson;
var donneesJson;
var donneesJsonRecherche;
var pubsJson;

var permanentStorage = window.localStorage;

var rubriqueActuelle = 0;

//var myScroll, myScrollMenu, myScrollRecherche;
var myScrollers, myScrollMenu;
var useTransition3D = true;

var IS_ANDROID = navigator.userAgent.match( /android/gi ),
    IS_IPHONE = navigator.userAgent.match( /iphone/gi ),
    IS_IPAD = navigator.userAgent.match( /iPad/gi ),
    IS_IOS = navigator.userAgent.match( /(iPad|iPhone|iPod)/i );
    
// url des services

var website_app = "http://www.motorlive.tv";
var webservice_version = website_app+"/services/checkVersion";
var webservice_update = website_app+"/services/update";
var webservice_detail = website_app+"/services/detail";
var webservice_recherche = website_app+"/services/recherche";
var webservice_stats = website_app+"/services/stats";
var webservice_subscribe = website_app+"/services/subscribe";

var cdn_visuel_menu = website_app+"/bundles/motoservicesmotorlive/motorlive_menu_icons/";
var cdn_visuel = "http://media.motoservices.com/media/cache/motorlive_big_thumbnail/media/video/";
var cdn_visuel_small = "http://media.motoservices.com/media/cache/motorlive_playlist_thumbnail/media/video/";

/* 
var webservice_version = "http://motorlive.derjuju.com/services/checkVersion/";
var webservice_update = "http://motorlive.derjuju.com/services/update/";
var webservice_detail = "http://motorlive.derjuju.com/services/detail/";
var webservice_recherche = "http://motorlive.derjuju.com/services/recherche/";
var webservice_stats = "http://motorlive.derjuju.com/services/stats/";

var cdn_visuel_menu = "http://motorlive.derjuju.com/";
var cdn_visuel = "http://media.motoservices.com/media/cache/motorlive_big_thumbnail/media/video/";
var cdn_visuel_small = "http://media.motoservices.com/media/cache/motorlive_playlist_thumbnail/media/video/";
*/

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
  var gestionnairePub;
  
  var demarrageApplication = false;
  
  var pushNotification;
  
  // constructeur
  this.initialise = function() {
    //navigator.splashscreen.show();
    
    self.menuNav = null;
    
    self.verifieUsage3D();
    debugAndroidKeyboardOnStart();
    
    connexion = new Connexion();   
    self.gestionnairePub = new GestionnairePubs();
    self.gestionnairePub.initialise(self);
    
    document.body.addEventListener('touchmove', function(event) {event.preventDefault();}, false);
    //$("#app").css('width',window.innerWidth+"px");
    //$("#app").css('height',window.innerHeight+"px");
    
    
    self.demarrageApplication = true;
    self.verifieDonneesServeur();
    
    //gestion des notifications
    self.initialiseNotifications();
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
      $("html").addClass("isAndroid");
    }
    if(IS_IPAD) {
      $("html").addClass("isiPad");
    }
    if(IS_IPHONE) {
      $("html").addClass("isiPhone");
    }
    
    
  }
  
  function debugAndroidKeyboardOnStart(){
    /*$.bind('showkeyboard', function(){alert("ouvert");
       $.unbind('showkeyboard');
    });*/
  }
  
  //--------------------------------------------------------------------
  // Gestion des Notifications : debut
  //--------------------------------------------------------------------
  this.initialiseNotifications = function(){
   pushNotification = window.plugins.pushNotification;
   if ( device.platform == 'android' || device.platform == 'Android' )
    {
        pushNotification.register(
            successHandlerNotification,
            errorHandlerNotification, {
                "senderID":"replace_with_sender_id",
                "ecb":"onNotificationGCM"
            });
    }
    else
    {
        pushNotification.register(
            tokenHandlerNotification,
            errorHandlerNotification, {
                "badge":"true",
                "sound":"true",
                "alert":"true",
                "ecb":"onNotificationAPN"
            });
    }
  }
  
  // result contains any message sent from the plugin call
  function successHandlerNotification (result) {
      //alert('result = ' + result);
      //notificationMessage(result, null, 'DEBUG : successHandlerNotification', 'OK');
  }
  // result contains any error description text returned from the plugin call
  function errorHandlerNotification (error) {
      //alert('error = ' + error);
      //notificationMessage(error, null, 'DEBUG : errorHandlerNotification', 'OK');
  }
  function tokenHandlerNotification (result) {
      // Your iOS push server needs to know the token before it can push to this device
      // here is where you might want to send it the token for later use.
      //alert('device token = ' + result);
      if(!connexion.subscribeToNotification(device.platform, result))
      {
        notificationMessage('Vous devez être connecté pour pouvoir utiliser cette application.', null, 'Absence de connectivité', 'OK');
      }
  }
  
  // iOS
  function onNotificationAPN (event) {
      if ( event.alert )
      {
          //navigator.notification.alert(event.alert);          
         notificationMessage(e.payload.message, null, 'Nouveauté', 'OK');
      }

      if ( event.sound )
      {
          var snd = new Media(event.sound);
          snd.play();
      }

      if ( event.badge )
      {
          pushNotification.setApplicationIconBadgeNumber(successHandlerNotification, errorHandlerNotification, event.badge);
      }
  }

  // Android
  function onNotificationGCM(e) {
      //$("#app-status-ul").append('<li>EVENT -> RECEIVED:' + e.event + '</li>');

      switch( e.event )
      {
      case 'registered':
          if ( e.regid.length > 0 )
          {
              //$("#app-status-ul").append('<li>REGISTERED -> REGID:' + e.regid + "</li>");
              // Your GCM push server needs to know the regID before it can push to this device
              // here is where you might want to send it the regID for later use.
              //console.log("regID = " + e.regid);
              if(!connexion.subscribeToNotification(device.platform, e.regid))
              {
                notificationMessage('Vous devez être connecté pour pouvoir utiliser cette application.', null, 'Absence de connectivité', 'OK');
              }
          }
      break;

      case 'message':
          // if this flag is set, this notification happened while we were in the foreground.
          // you might want to play a sound to get the user's attention, throw up a dialog, etc.
          if ( e.foreground )
          {
              //$("#app-status-ul").append('<li>--INLINE NOTIFICATION--' + '</li>');

              // if the notification contains a soundname, play it.
              var my_media = new Media("/sounds/"+e.soundname);
              my_media.play();
          }
          else
          {  // otherwise we were launched because the user touched a notification in the notification tray.
              if ( e.coldstart )
              {
                  //$("#app-status-ul").append('<li>--COLDSTART NOTIFICATION--' + '</li>');
              }
              else
              {
                  //$("#app-status-ul").append('<li>--BACKGROUND NOTIFICATION--' + '</li>');
              }
          }

         //navigator.notification.alert(e.payload.message);
         notificationMessage(e.payload.message, null, 'Nouveauté', 'OK');

          //$("#app-status-ul").append('<li>MESSAGE -> MSG: ' + e.payload.message + '</li>');
          //$("#app-status-ul").append('<li>MESSAGE -> MSGCNT: ' + e.payload.msgcnt + '</li>');
      break;

      case 'error':
          //$("#app-status-ul").append('<li>ERROR -> MSG:' + e.msg + '</li>');
      break;

      default:
          //$("#app-status-ul").append('<li>EVENT -> Unknown, an event was received and we do not know what it is</li>');
      break;
    }
  }
  //--------------------------------------------------------------------
  // Gestion des Notifications : fin
  //--------------------------------------------------------------------
  
  
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
    self.gestionnairePub.parametrage();
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
      $("#fondHeaderRecherche").css("display","block");
    
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
  
  
  this.affichagePub = function(){
    //console.log("test si on doit afficher les pubs");
    if(self.gestionnairePub.testAffichage()){
      self.gestionnairePub.affichePub();
    }
  }
  
  
  
  
  
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


