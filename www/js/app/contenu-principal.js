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
  var utiliseListingRecherche;
  
  var donneesJsonListing;
  var donneesJsonRecherche;
  
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
  var indiceDebutGlobal, indiceDebut = 0;
  var resetScroll;
  
  // constructeur
  this.initialise = function(_parent) {
    self.parent = _parent;
    self.contenuSelector = $('.mainContent');
    self.zoneContenuSelector = self.contenuSelector.find('.zoneContenu');   
    
    self.premierChargement = true;
    
    self.rechercheOuverte = false;   
    self.utiliseListingRecherche = false;    
    
    self.largeurEcran = window.innerWidth-20;//Math.floor(window.innerWidth * 0.9);
    self.largeurVignette = self.largeurEcran;//Math.floor(self.largeurEcran * 0.5);
    //self.hauteurVignette = Math.floor(170 * self.largeurVignette / 300);
    self.hauteurVignette = Math.floor(170 * self.largeurVignette / 300);
    
    //alert(window.innerWidth+" et "+self.largeurVignette+" et "+self.hauteurVignette);    
    
    self.etatPanneaux = 0;
    
    self.lastNews = LAST_NEWS;
    
    self.indiceDebut = self.indiceDebutGlobal = 0;
    self.resetScroll = true;
    
    //updateHeightInner();
    
    //charge affichage de la rubrique Actuelle;
    //this.chargeRubriqueActuelle();
    
    
    var zoneRetourMenu;
    zoneRetourMenu = $('#retourMenu a');
    zoneRetourMenu.bind('click', function(event){ 
      event.preventDefault();
      self.parent.menuNav.ouvreMenu();
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
    
      // on referme la zone de recherche
      if(self.rechercheOuverte){
        fermeRecherche();
      }
      self.rechercheOuverte = false;
      self.utiliseListingRecherche = false;

      self.zoneContenuSelector.load('js/tpl/'+templateAAfficher, function(){

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
    
    //construitContenuListing(donneesTemp, "rubrique");
    self.indiceDebut = 0;
    self.indiceDebutGlobal = 0;
    self.donneesJsonListing = new Array();
    self.resetScroll = true;
    infiniteScrollUpdate("rubrique", rubriqueCherchee, catIndice);
    
  }
  
  
  
  function infiniteScrollUpdate(_containerListe, rubriqueCherchee, catIndice){  
    var compteurNouveau = 0;
    
    if(self.utiliseListingRecherche)
    {
      for(var i = self.indiceDebutGlobal; i<self.donneesJsonRecherche.length; i++)
      {
          self.indiceDebutGlobal++;
          // tant qu'on a pas notre quota, on prend
          if(compteurNouveau < self.lastNews)
          {
            self.donneesJsonListing.push(self.donneesJsonRecherche[i]);
            compteurNouveau++
          }else{
            break;
          }
      }
    }else{
    
      for(var i = self.indiceDebutGlobal; i<donneesJson.length; i++)
      {
        self.indiceDebutGlobal++;
        // rubrique de la home ? alors on prend les X plus récentes
        if(rubriqueCherchee == 0)
        {
          // tant qu'on a pas notre quota, on prend
          if(compteurNouveau < self.lastNews)
          {
            self.donneesJsonListing.push(donneesJson[i]);
            compteurNouveau++
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
            // tant qu'on a pas notre quota, on prend
            if(compteurNouveau < self.lastNews)
            {
              self.donneesJsonListing.push(donneesJson[i]);
              compteurNouveau++
            }else{
              break;
            }
          }
        }
      }
    }
    if(compteurNouveau>0) construitContenuListing(_containerListe, rubriqueCherchee, catIndice);
    
  }
  
  function construitContenuListing(_containerListe, rubriqueCherchee, catIndice){
    var zoneCible;
    if(_containerListe == "rubrique")
    {
      zoneCible = self.zoneContenuSelector.find('.visuels');
    }
    //zoneCible.addClass('small');
    var html = "";
    var position = self.indiceDebut;
    for(var i = self.indiceDebut; i<self.donneesJsonListing.length; i++)
    {
      var inViewClass = (i == self.donneesJsonListing.length-1)? true : false;
      html += insereVignette(self.donneesJsonListing[i],i,position, inViewClass);
      position++;
      self.indiceDebut++;
    }
    var htmlExistant = zoneCible.html();
    htmlExistant += html;
    zoneCible.html(htmlExistant);
    
    //zoneCible.find('img').bind('click', function(){ clickSurVignette(this); });
    zoneCible.find('img.th-face').bind('click', function(){ toggleView(this); });
    
    // ajout de l'écouteur de fin de liste
    //if(!self.rechercheOuverte) 
    activeDetectionFinDeListe(_containerListe, rubriqueCherchee, catIndice);
    
    contenuPret(_containerListe);
    
  }
  
  function insereVignette(elementVignette,indice,position, inViewClass){
    var html = "";    
    //html+='<img data-id="'+indice+'" data-position="'+position+'" src="'+cdn_visuel+'images/preview/'+elementVignette["preview"]+'">';    
    //html+='<img data-id="'+indice+'" data-position="'+position+'" src="img/vignette-vide.png" height="'+self.hauteurVignette+'" width="'+self.largeurVignette+'">';    
    
    var classInView = (inViewClass)? 'inViewDetect':'';
    
    html+='<div class="th-wrap '+classInView+'" data-id="'+indice+'" data-view="face" style="height:'+self.hauteurVignette+'px;width:100%;"><img class="th-face nouveau" data-id="'+indice+'" data-position="'+position+'" src="img/vignette-vide.png" height="'+self.hauteurVignette+'" width="'+self.largeurVignette+'"><div class="th-inner" style="display: none;"></div></div>';    
    return html;
  }
  
  function lanceSubstitution(_containerListe){
    
    var zoneCible;
    var cdn_visuel_substitution = cdn_visuel;
    
    if(_containerListe == "rubrique")
    {
      zoneCible = self.zoneContenuSelector.find('.visuels');
    }
    
    /*var delai = 0;
    var delaiPas = 250;
    
    zoneCible.find('img.nouveau').each(function(){  
      $(this).css('opacity',0);
      $(this).attr('src', cdn_visuel_substitution+self.donneesJsonListing[$(this).attr('data-id')]["id"]+'/'+self.donneesJsonListing[$(this).attr('data-id')]["preview"]) ;     
      $(this).removeClass('nouveau');
      //setTimeout(function(){TweenMax.to($(this), 0.5, {opacity:'1', ease:Quart.easeInOut});}, delai);
      //setTimeout(function(){ TweenMax.to($(this), 0.5, {opacity:'1', ease:Quart.easeInOut, delay:(delai/1000)});}, 100);
      
      setTimeout(joueEffetAffichage($(this), delai),100);
      //delai+=delaiPas;
    });
    */
   zoneCible.find('img.nouveau').each(function(){  
      $(this).attr('src', cdn_visuel_substitution+self.donneesJsonListing[$(this).attr('data-id')]["id"]+'/'+self.donneesJsonListing[$(this).attr('data-id')]["preview"]) ;     
      $(this).removeClass('nouveau');      
    });
  }
  
  function joueEffetAffichage(cible, delai){
    TweenMax.to($(cible), 0.5, {opacity:'1', ease:Quart.easeInOut, delay:(delai/1000)});
  }
  
  function activeDetectionFinDeListe(_containerListe, rubriqueCherchee, catIndice){
    var zoneCible;
    if(_containerListe == "rubrique")
    {
      zoneCible = self.zoneContenuSelector.find('.visuels').find('.inViewDetect');
    }
    zoneCible.bind('inview', function(event, isInView, visiblePartX, visiblePartY) {
      if (isInView) {
          zoneCible.removeClass('inViewDetect');
          // on retire l'écouteur d'événement
          zoneCible.unbind('inview');
          
          // et on demande de charger la suite si disponible.
          self.resetScroll = false;
          setTimeout(function(){infiniteScrollUpdate(_containerListe, rubriqueCherchee, catIndice);},100); 
      } 
      else {
      // element has gone out of viewport
          }
      });
  }
  
  function contenuPret(_containerListe){ 
    //self.zoneContenuSelector.scrollTop(0);  
    isAnimating = false;    
    if(self.premierChargement){
      self.premierChargement = false;
      
      
      myScrollers = new Array();
      setTimeout(function () { 
        myScrollers[0] = new iScroll('wrapper',{ zoom:true, bounce:false, hScrollbar:false, hScroll:false});         
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
              fermeRecherche();
              myApp.menuNav.deselectionneElementMenu();
              //$("#wrapperRecherche .zoneContenu").load('js/tpl/resultat.html', function(){
              self.zoneContenuSelector.load('js/tpl/liste.html', function(){
                self.donneesJsonRecherche = objJSon["contenu"];
                objJSon = null;
                
                self.indiceDebut = 0;
                self.indiceDebutGlobal = 0;
                self.donneesJsonListing = new Array();
                self.resetScroll = true;
                
                self.utiliseListingRecherche = true;

                infiniteScrollUpdate("rubrique", 0, 0);
                
              });
            }else{
              self.zoneContenuSelector.load('js/tpl/liste.html', function(){
                // vide la zone
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
    //$('#wrapperAllContent').width((window.innerWidth*3)+30);
    $('#wrapperAllContent').width((window.innerWidth));
    //$('.fondHeader').width(window.innerWidth);
    
    
    self.contenuSelector.height(window.innerHeight);
    if(useTransition3D)
    {
      self.contenuSelector.width((window.innerWidth - 20));
      self.contenuSelector.css('margin-left','20px');
    }else{
      self.contenuSelector.width(window.innerWidth);
    }
    
    $("#wrapper").height(window.innerHeight);
    
    if(self.resetScroll) myScrollers[0].scrollTo(0, 0, 0);
    myScrollers[0].refresh();
  }
 
  function toggleView(cible){ 
    if( !isAnimating ) {
      $newwrapper = $(cible).parent();   
      /*if(self.rechercheOuverte)
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
      }*/
      if(($wrapper != null)&&($wrapper.attr("data-id") != $newwrapper.attr("data-id"))){        
        var cibleOld = $wrapper.find('img.th-face');
        lanceToggleView(cibleOld);
      }else{
        $newwrapper = $(cible).parent();
        lanceToggleView(cible);
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
                  /*if(self.rechercheOuverte)
                  {
                    $wrapperRecherche = $temp_wrapper;
                  }else{
                    $wrapper = $temp_wrapper;
                  }*/
                  $wrapper = $temp_wrapper;
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
                  /*if(self.rechercheOuverte)
                  {
                    $wrapperRecherche = $temp_wrapper;
                  }else{
                    $wrapper = $temp_wrapper;
                  }*/
                  $wrapper = $temp_wrapper;
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
            /*if(self.rechercheOuverte)
            {
              $wrapperRecherche = $temp_wrapper;
            }else{
              $wrapper = $temp_wrapper;
            }*/
            $wrapper = $temp_wrapper;
            if($temp_wrapper.attr("data-id") != $newwrapper.attr("data-id")){           
              var cible = $newwrapper.find('img.th-face');
              lanceToggleView(cible);
            }
    }
  
}