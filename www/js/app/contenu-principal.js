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

//******************************
// Class ContenuPrincipal
function ContenuPrincipal() {
  var self = this;  
  var contenuSelector = null;
  var zoneContenuSelector = null;
  var detailSelector = null;
  var parent = null;
  
  var ficheDetail = null;
  var ficheDetailOuverte = false;
  var etatPanneaux = 0;
  
  var premierChargement;
  
  var messagePerso;
  
  var largeurEcran;
  var largeurVignette;
  var hauteurVignette;
  
  var rechercheOuverte;
  
  var donneesJsonListing;
  
  // gestion effet origami
  var $wrapper, $newwrapper;
  var $wrapperRecherche;
  var $temp_wrapper;
  
  var isAnimating,
      // https://github.com/twitter/bootstrap/issues/2870
      transEndEventNames = {
              'WebkitTransition'	: 'webkitTransitionEnd',
              'MozTransition'		: 'transitionend',
              'OTransition'		: 'oTransitionEnd',
              'msTransition'		: 'MSTransitionEnd',
              'transition'		: 'transitionend'
      },
      transEndEventName	= transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
      endCount = 0,
      notsupported = !Modernizr.csstransforms || !Modernizr.csstransforms3d || !Modernizr.csstransitions;
  
  LAST_NEWS = 10;
  
  // constructeur
  this.initialise = function(_parent) {
    self.parent = _parent;
    self.contenuSelector = $('.mainContent');
    self.zoneContenuSelector = self.contenuSelector.find('.zoneContenu');
    self.detailSelector = $('#detailManager');
    
    self.premierChargement = true;
    
    self.rechercheOuverte = false;
    
    self.largeurEcran = Math.floor(window.innerWidth * 0.9);
    self.largeurVignette = self.largeurEcran;//Math.floor(self.largeurEcran * 0.5);
    self.hauteurVignette = Math.floor(170 * self.largeurVignette / 300);
    
    self.etatPanneaux = 0;
    
    self.lastNews = LAST_NEWS;
    
    //updateHeightInner();
    
    //charge affichage de la rubrique Actuelle;
    //this.chargeRubriqueActuelle();
    
    
    var zoneRetourMenu;
    zoneRetourMenu = $('#retourMenu a');
    zoneRetourMenu.bind('click', function(event){ 
      event.preventDefault();
      self.parent.menuNav.ouvreMenu();
    });
    
    var zoneRetourArriere;
    zoneRetourArriere = $('#retourArriere a');
    zoneRetourArriere.bind('click', function(event){ 
      event.preventDefault();
      reculeContenu();
    });
    zoneRetourArriere = $('#retourArriereRecherche a');
    zoneRetourArriere.bind('click', function(event){ 
      event.preventDefault();
      reculeContenu();
    });
    
    var zoneRechercheMenu;
    zoneRechercheMenu = $('#rechercheMenu a');
    zoneRechercheMenu.bind('click', function(event){ 
      event.preventDefault();
      if(self.rechercheOuverte){
        lanceRecherche();
      }else{
        ouvreRecherche();
      }
    });
    
    // attache l'action de soumission de la recherche
    $("form.recherche").submit(function() {
        //alert($("[name=input]").val());
        lanceRecherche();
        return false;
    });
  };
  
  this.chargeRubriqueActuelle = function(){
    //self.parent.menuNav.fermeMenu();
    //navigator.notification.loadingStart();
    
      // libére l'ancienne animation si pas attendu la fin de l'ancienne animation 
      isAnimating = false;

      $wrapper = null;
      
      self.zoneContenuSelector.find('img.th-face').unbind('click');
    
      //href data-tpl data-id
      var itemMenu = self.parent.menuNav.getItemMenu(rubriqueActuelle);
      
      var itemIndice = itemMenu.attr('data-indice');

      var templateAAfficher = "";
      var typeContenu = "";

      /*if((itemMenu.attr('data-tpl') == 'new')||(itemMenu.attr('data-tpl') == 'mes-infos')){
        templateAAfficher = itemMenu.attr('data-tpl')+'.html';
        typeContenu = itemMenu.attr('data-tpl');
      }else{
        templateAAfficher = 'liste.html';
        typeContenu = "liste";
      }*/
    
      if(itemIndice == -1){
        templateAAfficher = 'new.html';
        typeContenu = 'new';
      }else if(itemIndice == -2){
        templateAAfficher = 'a-propos.html';
        typeContenu = 'a-propos';
      }else{
        templateAAfficher = 'liste.html';
        typeContenu = 'liste';
      }
    
      //templateAAfficher = menuJson[itemIndice]["tpl"]+'.html';
      //typeContenu = menuJson[itemIndice]["tpl"];
      
      // on referme la zone de recherche
      if(self.rechercheOuverte){
        fermeRecherche();
      }

      self.zoneContenuSelector.load('js/tpl/'+templateAAfficher, function(){
        //navigator.notification.loadingStop();
        TweenMax.to($("#wrapperAllContent"),1, {left:0, ease:Quart.easeInOut});
        /*$('#retourMenu').css('visibility','visible');
        $('#retourArriere').css('visibility','hidden');
        $('#suivante').css('visibility','hidden');
        $('#precedente').css('visibility','hidden');
        $('#partage').css('visibility','hidden');*/
        
        /*if(self.ficheDetailOuverte){
          ficheDetail.libereFicheDetail();
        }*/
        contenuRempli(typeContenu);
      });
    
  };
  
  function contenuRempli(typeContenu){ 
    var rubriqueCherchee = ""+rubriqueActuelle;
    var itemMenu = self.parent.menuNav.getItemMenu(rubriqueActuelle);
    var itemIndice = itemMenu.attr('data-indice');
        
    var zoneTitre = "";
    if((typeContenu == "new")||(typeContenu == "liste"))
    {
      zoneTitre = self.zoneContenuSelector.find('.infoRubrique');
    }
    else if(typeContenu == "a-propos")
    {
      self.zoneContenuSelector.find('.appVersion').html(self.parent.getAppVersion());
      self.zoneContenuSelector.find('.dataVersion').html(self.parent.getDataVersion());
      var etatUI = "";
      if(useTransition3D) { etatUI +="3d"; } else { etatUI +="2d"; }
      self.zoneContenuSelector.find('.transformVersion').html(etatUI);
    }
    
    var zoneCible = self.zoneContenuSelector.find('.visuels');
    
    //self.donneesJsonListing = donneesJson;
    // on prend un indice de recherche uniquement si on est sur un element de donneesJson
    var catIndice = 0;
    if(itemIndice >= 0)
    {
      catIndice = menuJson[itemIndice]["id"];
    }
    
    var donneesTemp = new Array();
    for(var i = 0; i<donneesJson.length; i++)
    {
      // rubrique de la home ? alors on prend les X plus récentes
      if(rubriqueCherchee == 0)
      {
        // tant qu'on a pas notre quota de lastNews, on prend
        if(donneesTemp.length < self.lastNews)
        {
          donneesTemp.push(donneesJson[i]);
        }else{
          break;
        }
      }else{
        // conversion en tableau de nombre et non de string
        // sinon on a le bug : 1 est dans 1 et dans 10 aussi
        var cat = donneesJson[i]['cat'].split(',').map(Number);         
        //if($.inArray(rubriqueCherchee, cat) > -1)
        if($.inArray(catIndice, cat) > -1)
        {
          donneesTemp.push(donneesJson[i]);
        }
      }
    }
    
    construitContenuListing(donneesTemp, "rubrique");
  }
  
  function construitContenuListing(_donneesJson, _containerListe){
    self.donneesJsonListing = _donneesJson;
    var zoneCible;
    if(_containerListe == "rubrique")
    {
      zoneCible = self.zoneContenuSelector.find('.visuels');
    }else{
      zoneCible = $("#wrapperRecherche .zoneContenu").find('.visuels');
    }
    //zoneCible.addClass('small');
    var html = "";
    var position = 0;
    for(var i = 0; i<self.donneesJsonListing.length; i++)
    {
      html += insereVignette(self.donneesJsonListing[i],i,position);
      position++;
    }
    
    zoneCible.html(html);
    
    //zoneCible.find('img').bind('click', function(){ clickSurVignette(this); });
    zoneCible.find('img.th-face').bind('click', function(){ toggleView(this); });
    
    
    contenuPret(_containerListe);
    
  }
  
  function insereVignette(elementVignette,indice,position){
    var html = "";    
    //html+='<img data-id="'+indice+'" data-position="'+position+'" src="'+cdn_visuel+'images/preview/'+elementVignette["preview"]+'">';    
    //html+='<img data-id="'+indice+'" data-position="'+position+'" src="img/vignette-vide.png" height="'+self.hauteurVignette+'" width="'+self.largeurVignette+'">';    
    html+='<div class="th-wrap" data-id="'+indice+'" data-view="face" style="height:'+self.hauteurVignette+'px;width:100%;"><img class="th-face" data-id="'+indice+'" data-position="'+position+'" src="img/vignette-vide.png" height="'+self.hauteurVignette+'" width="'+self.largeurVignette+'"><div class="th-inner" style="display: none;"></div></div>';    
    return html;
  }
  
  function lanceSubstitution(_containerListe){
    
    var zoneCible;
    var cdn_visuel_substitution = cdn_visuel;
    
    if(_containerListe == "rubrique")
    {
      zoneCible = self.zoneContenuSelector.find('.visuels');
    }else{
      zoneCible = $("#wrapperRecherche .zoneContenu").find('.visuels');
      //cdn_visuel_substitution = cdn_visuel_small;
    }
    
    zoneCible.find('img').each(function(){      
      $(this).attr('src', cdn_visuel_substitution+self.donneesJsonListing[$(this).attr('data-id')]["id"]+'/'+self.donneesJsonListing[$(this).attr('data-id')]["preview"]) ;     
    });
    
  }
  
  function contenuPret(_containerListe){ 
    //self.zoneContenuSelector.scrollTop(0);  
    isAnimating = false;    
    if(self.premierChargement){
      self.premierChargement = false;
      
      
      /*
      // ajout de l'element iScroll pour gérer le contenu
      setTimeout(function () { 
        myScroll = new iScroll('wrapper',{ zoom:true, bounce:false, hScrollbar:false, hScroll:false}); 
        myScrollRecherche = new iScroll('wrapperRecherche',{ zoom:true, bounce:false, hScrollbar:false, hScroll:false}); 
        updateHeightInner();
      }, 100);
      */
     
     myScrollers = new Array();
     setTimeout(function () { 
        myScrollers[0] = new iScroll('wrapper',{ zoom:true, bounce:false, hScrollbar:false, hScroll:false}); 
        myScrollers[1] = new iScroll('wrapperRecherche',{ zoom:true, bounce:false, hScrollbar:false, hScroll:false}); 
        updateHeightInner();
      },100);  
     
      setTimeout(function () { 
        // lance fermeture menu
        self.parent.menuNav.fermeMenu();
      }, 2000);  
      
    }else{
      // mise à jour des dimensions + appel au iscroll refresh  
      setTimeout(function () { 
        updateHeightInner();
      },100);  
      // lance fermeture menu
      self.parent.menuNav.fermeMenu();  
    }  
    
    lanceSubstitution(_containerListe);
    
  }
  
  function clickSurVignette(element){
    // à tester pour prévenir d'un click pendant le scroll
    //if (myScroll.moved) return;  
    modePersonnalisation(element);
  }
  
  function deplaceScrollbar(element)
  {
    var vignette = $(element);
    var decalage = 0;
    if(self.zoneContenuSelector.find('.messageWelcome').length > 0)
    {
      decalage = self.zoneContenuSelector.find('.messageWelcome').height();
    }
    var distance = (vignette.attr('data-position')*vignette.height()) + decalage;
    self.zoneContenuSelector.animate({'scrollTop':distance},500);
    
  }
  
  function creationFiche(element){   
    var vignette = $(element);
    vignette.addClass('selected');
    
    ficheDetail = new FicheDetail();
    ficheDetail.initialise(vignette, vignette.attr('data-id'), self.donneesJsonListing[vignette.attr('data-id')]["id"]);
    
    //return ficheDetail.getView();
  }
  
  
  function modePersonnalisation(element){
    // désactive navigation
    //self.parent.menuNav.desactiveMenu();
    
    self.etatPanneaux = 1;
    
    var vignette = $(element);
    vignette.addClass('selected');
    
    fermeRecherche();
    
    ficheDetail = new FicheDetail();
    ficheDetail.initialise(self, vignette, vignette.attr('data-id'), self.donneesJsonListing[vignette.attr('data-id')]["id"]);
  }
  
  
  function ouvreRecherche(){
    self.rechercheOuverte = true;
    /*
    $("#formRecherche").animate({'right':'0%'},500, function(){  
        $("#motcle").focus();
        $("#motcle").setSelectionRange && $("#motcle").setSelectionRange(0, 0);    
    });*/
    
    //TweenMax.to($("#formRecherche"),1, {right:"0%", ease:Quart.easeInOut, onComplete:activeFocusRecherche});    
    TweenMax.to($("#fondHeaderRecherche"),0.5, {width:"240px", delay:0.5, ease:Quart.easeInOut, onComplete:activeFocusRecherche});    
    TweenMax.to($("#motcle"), 0.5, {opacity:'1'});
    TweenMax.to($("#formRecherche"), 0.5, {opacity:'1'});
    
    var decaleVers = window.innerWidth;
    if(self.ficheDetailOuverte){
      self.etatPanneaux = 2;
      //decaleVers = decaleVers*2;
    }else{
      self.etatPanneaux = 1;
    }
    decaleVers = decaleVers*self.etatPanneaux;
    
    TweenMax.to($("#wrapperAllContent"),0.5, {left:-decaleVers, ease:Quart.easeInOut});
    
      /*$('#retourMenu').css('visibility','hidden');
      $('#retourArriere').css('visibility','visible');
      $('#suivante').css('visibility','visible');
      $('#precedente').css('visibility','visible');
      $('#partage').css('visibility','visible');*/
    
    // déplace tout l'ensemble des 3 zones
    //TweenMax.to($("#formRecherche"),1, {right:"0%", ease:Quart.easeInOut, onComplete:activeFocusRecherche});
    
  }
  
  function activeFocusRecherche(){
    $("#motcle").focus();
    $("#motcle").setSelectionRange && $("#motcle").setSelectionRange(0, 0);  
  }
  
  function fermeRecherche(){
    self.rechercheOuverte = false;
    //TweenMax.to($("#formRecherche"), 0.5, {right:'-60%'});
    TweenMax.to($("#fondHeaderRecherche"), 0.5, {width:'60px'});
    TweenMax.to($("#motcle"), 0.5, {opacity:'0'});
    TweenMax.to($("#formRecherche"), 0.5, {opacity:'0'});
  }
  
  function lanceRecherche(){    
    if($("#motcle").val() != "")
    {
      if($("#motcle").val().length > 1)
      {
        $("#motcle").focusout();
        $("#motcle").blur();
        $.ajax({
          type: 'POST',
          url: webservice_recherche,
          data: {motcle:$("#motcle").val()},
          dataType: "json",
          async:true
        }).done(function(objJSon){       
          
            if(objJSon["contenu"].length > 0)
            {
              $("#wrapperRecherche .zoneContenu").load('js/tpl/resultat.html', function(){
                construitContenuListing(objJSon["contenu"], "recherche");
                objJSon = null;
              });
            }
          
          
              
              
        });
      }
    }
    
  }
  
  function reculeContenu(){
    fermeRecherche();
    
    var decaleVers = window.innerWidth;
    self.etatPanneaux = self.etatPanneaux-1;
    if(self.etatPanneaux < 0) self.etatPanneaux = 0;
    
    decaleVers = decaleVers*self.etatPanneaux;
    
    TweenMax.to($("#wrapperAllContent"),0.5, {left:-decaleVers, ease:Quart.easeInOut});
    
    
    //var posActuelle = parseInt($("#wrapperAllContent").css('left'));
    
    //TweenMax.to($("#wrapperAllContent"),1, {left:(posActuelle+window.innerWidth), ease:Quart.easeInOut});
    
    /*if((posActuelle+window.innerWidth) == 0)
    {
      $('#retourMenu').css('visibility','visible');
      $('#retourArriere').css('visibility','hidden');
      $('#suivante').css('visibility','hidden');
      $('#precedente').css('visibility','hidden');
      $('#partage').css('visibility','hidden');
    } */   
  }
  
  this.reculeContenuGlobal = function(){
    reculeContenu();
  }
  
  
  // à déplacer dans la partie gestion de contenu
  function updateHeightInner() {
    //$('.contents').width((window.innerWidth*3)+30);
    $('.contents').width(window.innerWidth);
    $('#wrapperAllContent').width((window.innerWidth*3)+30);
    //$('.fondHeader').width(window.innerWidth);
    
    
    self.contenuSelector.height(window.innerHeight);
    if(useTransition3D)
    {
      self.contenuSelector.width((window.innerWidth - 10));
      self.contenuSelector.css('margin-left','10px');
    }else{
      self.contenuSelector.width(window.innerWidth);
    }
    
    if(self.ficheDetailOuverte){
      $('#detailManager').width(window.innerWidth);
    }else{
      $('#detailManager').width(0);
    }
    $('#detailManager').height(window.innerHeight);
    
    $('.mainContentRecherche').width(window.innerWidth);
    $('.mainContentRecherche').height(window.innerHeight);
    //self.zoneContenuSelector.height(window.innerHeight);
    
    $("#wrapper").height(window.innerHeight);
    $("#wrapperRecherche").height(window.innerHeight);
	
        
    /*
    myScroll.refresh();
    myScrollRecherche.refresh();
    // remonte le scroll en 0, 0 en 0 ms
    myScroll.scrollTo(0, 0, 0);
    myScrollRecherche.scrollTo(0, 0, 0);
    */
    if(self.rechercheOuverte)
    {
      myScrollers[1].refresh();
      myScrollers[1].scrollTo(0, 0, 0);
    }else{
      myScrollers[0].refresh();
      myScrollers[0].scrollTo(0, 0, 0);
    }
  }
  
  
  function toggleView(cible){ 
    if( !isAnimating ) {
      $newwrapper = $(cible).parent();   
      if(self.rechercheOuverte)
      {
        if(($wrapperRecherche != null)&&($wrapperRecherche.attr("data-id") != $newwrapper.attr("data-id"))){        
          var cibleOld = $wrapperRecherche.find('img.th-face');
          lanceToggleView(cibleOld);
        }else{
          $newwrapper = $(cible).parent();
          lanceToggleView(cible);
        }        
      }else {
        if(($wrapper != null)&&($wrapper.attr("data-id") != $newwrapper.attr("data-id"))){        
        var cibleOld = $wrapper.find('img.th-face');
        lanceToggleView(cibleOld);
        }else{
          $newwrapper = $(cible).parent();
          lanceToggleView(cible);
        }
      }
    }
  }
  
  function lanceToggleView(cible) {
      //var $btn = $( this );
      
      $temp_wrapper = $(cible).parent();
      
      var cibleImage = cible;
      
      if( !isAnimating ) {

              isAnimating = true;
              
              var view = $temp_wrapper.data( 'view' );
              
              if( view === 'detail' ) {
                $temp_wrapper.data( 'view', 'face' );
                if( notsupported ) {
                  $temp_wrapper.removeClass( 'th-active' ).children( 'div.th-inner' ).hide();
                  isAnimating = false;
                  if(self.rechercheOuverte)
                  {
                    $wrapperRecherche = $temp_wrapper;
                  }else{
                    $wrapper = $temp_wrapper;
                  }
                  return false;
                }
              }else{                
                $temp_wrapper.data( 'view', 'detail' );
                
                //on récupère la fiche si elle n'existait pas encore
                if($temp_wrapper.children( 'div.th-inner' ).html() == '')
                  creationFiche($temp_wrapper);
                
                if( notsupported ) {
                  $temp_wrapper.addClass( 'th-active' ).children( 'div.th-inner' ).show();
                  isAnimating = false;
                  if(self.rechercheOuverte)
                  {
                    $wrapperRecherche = $temp_wrapper;
                  }else{
                    $wrapper = $temp_wrapper;
                  }
                  return false;
                }
              }

              $temp_wrapper.children( 'img' )
                              .remove()
                              .end()
                              .children( 'div.th-inner' )
                              .show()
                              .wrap( $( '<div class="th-part"></div>' ) )
                              .append( '<div class="th-overlay"></div>' )
                              .parent()
                              .clone()
                              .appendTo( $temp_wrapper );
              $temp_wrapper.append( '<div class="th-part th-part-image th-part-image-basse"></div>' )
                              .prepend( $( '<div class="th-part th-part-image th-part-image-haute"></div>' ) )
                              .find('.th-part.th-part-image').css('background-image','url('+$(cibleImage).attr("src")+')');
                      
              $temp_wrapper.find( 'div.th-part' )
                              .on( transEndEventName, function( event ) {
                                      ++endCount;
                                      // 4 transitions
                                      if( endCount === 4 ) {

                                              $temp_wrapper.off( transEndEventName );
                                              endCount = 0;
                                              clear( view , cibleImage);

                                      }

                              } ) ;
        setTimeout( function() { ( view === 'detail' ) ? $temp_wrapper.removeClass( 'th-active' ) : $temp_wrapper.addClass( 'th-active' ); }, 0 );
      }
      return false;
    }
  
    function clear( view, cibleImage ) {
            $temp_wrapper.find( 'div.th-inner:first' ).unwrap().end().find( 'div.th-overlay' ).remove();
            var $img =  $(cibleImage);//$wrapper.children( 'img' );
            var $inner = $temp_wrapper.find( 'div.th-inner' );
            ( view !== 'face' ) ? $inner.hide() : $inner.show();
            $temp_wrapper.find( 'div.th-part' ).remove();
            $img.prependTo( $temp_wrapper );
            isAnimating = false;
            
            $(cibleImage).bind('click', function(){ toggleView(this); });
            
            // animation sur ancienne cible ?            
            if(self.rechercheOuverte)
            {
              $wrapperRecherche = $temp_wrapper;
            }else{
              $wrapper = $temp_wrapper;
            }
            if($temp_wrapper.attr("data-id") != $newwrapper.attr("data-id")){           
              var cible = $newwrapper.find('img.th-face');
              lanceToggleView(cible);
            }
    }
  
}