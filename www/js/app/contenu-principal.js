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
      if(rechercheOuverte){
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
      if(rechercheOuverte){
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
        if(self.ficheDetailOuverte){
          ficheDetail.libereFicheDetail();
        }
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
    
    zoneCible.find('img').bind('click', function(){ clickSurVignette(this); });
    
    
    contenuPret(_containerListe);
    
  }
  
  function insereVignette(elementVignette,indice,position){
    var html = "";    
    //html+='<img data-id="'+indice+'" data-position="'+position+'" src="'+cdn_visuel+'images/preview/'+elementVignette["preview"]+'">';    
    html+='<img data-id="'+indice+'" data-position="'+position+'" src="img/vignette-vide.png" height="'+self.hauteurVignette+'" width="'+self.largeurVignette+'">';    
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
      cdn_visuel_substitution = cdn_visuel_small;
    }
    
    zoneCible.find('img').each(function(){      
      $(this).attr('src', cdn_visuel_substitution+self.donneesJsonListing[$(this).attr('data-id')]["id"]+'/'+self.donneesJsonListing[$(this).attr('data-id')]["preview"]) ;     
    });
    
  }
  
  function contenuPret(_containerListe){ 
    //console.log("contenuPret");
    //self.zoneContenuSelector.scrollTop(0);  
    
    if(self.premierChargement){
      self.premierChargement = false;
      
      // ajout de l'element iScroll pour gérer le contenu
      setTimeout(function () { 
        myScroll = new iScroll('wrapper',{ zoom:true, bounce:false, hScrollbar:false, hScroll:false}); 
        myScrollRecherche = new iScroll('wrapperRecherche',{ zoom:true, bounce:false, hScrollbar:false, hScroll:false}); 
        updateHeightInner();
      }, 100);
      
      setTimeout(function () { 
        // lance fermeture menu
        self.parent.menuNav.fermeMenu();
      }, 2000);  
      
    }else{
      // mise à jour des dimensions + appel au iscroll refresh  
      updateHeightInner();
      // lance fermeture menu
      self.parent.menuNav.fermeMenu();  
    }  
    
    lanceSubstitution(_containerListe);
    
  }
  
  function clickSurVignette(element){
    // à tester pour prévenir d'un click pendant le scroll
    //if (myScroll.moved) return;
    
    var vignette = $(element);
    /*if(!vignette.parent().hasClass('small'))
    {
      modePersonnalisation(element);
    }else{
      // click sur petite on agrandit
      vignette.parent().removeClass('small');
      deplaceScrollbar(element);
    } */   
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
    rechercheOuverte = true;
    /*
    $("#formRecherche").animate({'right':'0%'},500, function(){  
        $("#motcle").focus();
        $("#motcle").setSelectionRange && $("#motcle").setSelectionRange(0, 0);    
    });*/
    
    //TweenMax.to($("#formRecherche"),1, {right:"0%", ease:Quart.easeInOut, onComplete:activeFocusRecherche});    
    TweenMax.to($("#fondHeaderRecherche"),0.5, {width:"240px", delay:0.5, ease:Quart.easeInOut, onComplete:activeFocusRecherche});    
    TweenMax.to($("#motcle"), 0.5, {opacity:'1'});
    
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
    rechercheOuverte = false;
    //TweenMax.to($("#formRecherche"), 0.5, {right:'-60%'});
    TweenMax.to($("#fondHeaderRecherche"), 0.5, {width:'60px'});
    TweenMax.to($("#motcle"), 0.5, {opacity:'0'});
  }
  
  function lanceRecherche(){
    //console.log("motcle : "+$("#motcle").val());
    
    /*
     self.zoneContenuSelector.load('js/tpl/'+templateAAfficher, function(){
        //navigator.notification.loadingStop();
        contenuRempli(typeContenu);
      });
     */
    
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
	
    myScroll.refresh();
    myScrollRecherche.refresh();
    // remonte le scroll en 0, 0 en 0 ms
    myScroll.scrollTo(0, 0, 0);
    myScrollRecherche.scrollTo(0, 0, 0);
    
    
  }
}

/*
  
 <iframe width="560" height="315" src="//www.youtube.com/embed/wcOMV0nywds" frameborder="0" allowfullscreen></iframe> 
  
 
 */