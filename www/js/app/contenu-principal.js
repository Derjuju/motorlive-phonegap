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
  
  var premierChargement;
  
  var messagePerso;
  
  var largeurEcran;
  var largeurVignette;
  var hauteurVignette;
  
  // constructeur
  this.initialise = function(_parent) {
    self.parent = _parent;
    self.contenuSelector = $('.mainContent');
    self.zoneContenuSelector = self.contenuSelector.find('.zoneContenu');
    self.detailSelector = $('#detailManager');
    
    self.premierChargement = true;
    
    self.largeurEcran = Math.floor(window.innerWidth * 0.9);
    self.largeurVignette = Math.floor(self.largeurEcran * 0.5);
    self.hauteurVignette = Math.floor(400 * self.largeurVignette / 300);
    
    //updateHeightInner();
    
    //charge affichage de la rubrique Actuelle;
    //this.chargeRubriqueActuelle();
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
    
      templateAAfficher = entriesTpl[itemIndice]+'.html';
      typeContenu = entriesTpl[itemIndice];
      

      self.zoneContenuSelector.load('js/tpl/'+templateAAfficher, function(){
        //navigator.notification.loadingStop();
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
      //zoneTitre.find('h1').html(entriesTitle[itemIndice]);
    }
    else if(typeContenu == "a-propos")
    {
      self.zoneContenuSelector.find('.appVersion').html(self.parent.getAppVersion());
      self.zoneContenuSelector.find('.dataVersion').html(self.parent.getDataVersion());
      var etatUI = "";
      if(useTransition3D) { etatUI +="3d"; } else { etatUI +="2d"; }
      self.zoneContenuSelector.find('.transformVersion').html(etatUI);
    }
    
    /*if(typeContenu == "mes-infos")
    {
      self.zoneContenuSelector.find('.envoyer a').bind('click', function(event){
        event.preventDefault();
        if($(this).hasClass('sms'))
        {
          envoiChoixParSMS();
        }else{
          ouvreChoixPartage(element,idElement);
        }
      });
    }*/
    
    
    var zoneCible = self.zoneContenuSelector.find('.visuels');
    //zoneCible.addClass('small');
    var html = "";
    var position = 0;
    for(var i = 0; i<donneesJson.length; i++)
    {
      var cat = donneesJson[i]['cat'];
      if($.inArray(rubriqueCherchee, cat) > -1)
      {
        html += insereVignette(donneesJson[i],i,position);
        position++;
      }
    }
    
    zoneCible.html(html);
    
    zoneCible.find('img').bind('click', function(){ /*clickSurVignette(this);*/ });
    
    var zoneRetourMenu;
    if(typeContenu == "accueil") {
      zoneRetourMenu = self.zoneContenuSelector.find('#retourMenuAccueil a');
    }else{
      zoneRetourMenu = self.zoneContenuSelector.find('#retourMenu a');
    }
    zoneRetourMenu.bind('click', function(event){ 
      event.preventDefault();
      self.parent.menuNav.ouvreMenu();
    });
    
    
    contenuPret();
  }
  
  function insereVignette(elementVignette,indice,position){
    var html = "";    
    //html+='<img data-id="'+indice+'" data-position="'+position+'" src="'+cdn_visuel+'images/preview/'+elementVignette["preview"]+'">';    
    html+='<img data-id="'+indice+'" data-position="'+position+'" src="img/vignette-vide.png" height="'+self.hauteurVignette+'" width="'+self.largeurVignette+'">';    
    return html;
  }
  
  function lanceSubstitution(){
    
    var zoneCible = self.zoneContenuSelector.find('.visuels');
    zoneCible.find('img').each(function(){      
      $(this).attr('src', cdn_visuel+donneesJson[$(this).attr('data-id')]["id"]+'/'+donneesJson[$(this).attr('data-id')]["preview"]) ;     
    });
    
  }
  
  function contenuPret(){ 
    //console.log("contenuPret");
    //self.zoneContenuSelector.scrollTop(0);  
    
    if(self.premierChargement){
      self.premierChargement = false;
      
      // ajout de l'element iScroll pour gérer le contenu
      setTimeout(function () { 
        myScroll = new iScroll('wrapper',{ zoom:true, bounce:false, hScrollbar:false, hScroll:false}); 
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
    
    lanceSubstitution();
    
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
    self.parent.menuNav.desactiveMenu();
    
    var vignette = $(element);
    vignette.addClass('selected');
    self.detailSelector.load('js/tpl/detail.html', function(){
      // récuperation de la fiche de l'élément
      var idElement = vignette.attr('data-id');
      var elementVignette = donneesJson[idElement];
      
      var idShare = elementVignette["id"];
            
      var titre = elementVignette["texte"].split('<br>')[0];
      var reg=new RegExp("(<br>)", "g")
      self.messagePerso = "";//elementVignette["texte"].replace(reg, ' ');
      
      var imagePreview = cdn_visuel+'images/preview/'+elementVignette["preview"];
      var imageVierge = cdn_visuel+'images/image/'+elementVignette["preview"];
      
      // customisation de la fiche detail
      //self.detailSelector.find('.titre').html('<h1>'+titre+'...</h1>');
      //self.detailSelector.find('.titre').html('<h1>&nbsp;</h1>');
      
      // modification dimension en fonction du téléphone
      var hauteurElementsUI = 131;
      var hauteurPossible = window.innerHeight - hauteurElementsUI;
      var largeurPossible = window.innerWidth;
      
      var largeurImposee = 240;
      var hauteurImposee = 320;
      
      if(largeurPossible > 300){
        if(hauteurPossible > 400){
          largeurImposee = 300;
          hauteurImposee = 400;
        }
      }
      
      self.detailSelector.find('.visuel').html('<img src="'+imagePreview+'" width="'+largeurImposee+'" height="'+hauteurImposee+'">');
      
      // liaison des boutons
      self.detailSelector.find('.fermer a').bind('click', function(event){
        event.preventDefault();
        fermerDetail(element);
      });
      
      self.detailSelector.find('.envoyer a').bind('click', function(event){
        event.preventDefault();
        if($(this).hasClass('share'))
        {
          ouvreChoixPartage(element,idElement);
        }else if($(this).hasClass('share-sms'))
        {
          ouvreChoixPartage(element,idElement);
        }else if($(this).hasClass('share-mail'))
        {
          envoiChoixParMail(element,idElement);
        }else if($(this).hasClass('share-fb'))
        {
          ouvreChoixPartage(element,idElement);
        }else if($(this).hasClass('share-tw'))
        {
          ouvreChoixPartage(element,idElement);
        }
        
        $.ajax({
                  type: 'POST',
                  url: webservice_stats,
                  data: {id:idShare},
                  async:true
                })
        
      });
      
      self.detailSelector.addClass('affiche');
      self.detailSelector.height(window.innerHeight);
      self.detailSelector.animate({'opacity':1},500);
    });
  }
  
  function fermerDetail(element){
    // désactive navigation
    self.parent.menuNav.activeMenu();
    
    var vignette = $(element);
    vignette.removeClass('selected');
    
    self.detailSelector.animate({'opacity':0},500, function(){
      self.detailSelector.removeClass('affiche');
      
      self.detailSelector.find('.fermer a').unbind('click');
      
      //vide detail
      self.detailSelector.html('');
    });
  }
  
  function ouvreChoixPartage(element,idElement){
    var vignette = $(element);
    var elementVignette = donneesJson[idElement];
    
    var imageToShare = cdn_visuel+elementVignette["id"]+'/'+elementVignette["preview"];
        
        //window.plugins.socialsharing.share(null, null, imageToShare);
        var socialShare = window.plugins.socialsharing;
        socialShare.available(function(isAvailable) {
          if (isAvailable) {
            
            var imageToShare = cdn_visuel+elementVignette["id"]+'/'+elementVignette["preview"];
            
            //self.messagePerso = '<br><img src="'+imageToShare+'"><br>Offrez, vous aussi, une bonne (ou mauvaise) r&eacute;solution : <a href="http://wishit.freetouch.fr">wishit.freetouch.fr</a>';
            self.messagePerso = "Offrez, vous aussi, une bonne (ou mauvaise) résolution";
            
            //share('message', 'sujet', 'image', 'site web');
            window.plugins.socialsharing.share(self.messagePerso, 'Bonne année et...', imageToShare, website_app);
          }
        });
    
  }
  
  function envoiChoixParSMS(){ //element,idElement){
    //var vignette = $(element);
    //var elementVignette = donneesJson[idElement];
    
    //var imageToShare = cdn_visuel+'images/preview/'+elementVignette["preview"];
    //var imageToShare = cdn_visuel+'images/preview/requin.jpg';
    //self.messagePerso, 'Meilleurs voeux 2014', imageToShare, website_app);
    //window.location.href = "sms:contactno?body=Meilleurs voeux 2014";
  }
  
  
  function envoiChoixParMail(element,idElement){
    var vignette = $(element);
    var elementVignette = donneesJson[idElement];
    
    var imageToShare = cdn_visuel+elementVignette["id"]+'/'+elementVignette["preview"];
    
    var mailShare = plugin.email;
    mailShare.isServiceAvailable(function(isAvailable) {
      if (isAvailable) {
        mailShare.open({
            to:      [],
            cc:      [],
            bcc:     [],
            subject: 'Bonne année et...',
            body:    '<br><img src="'+imageToShare+'"><br>Offrez, vous aussi, une bonne (ou mauvaise) r&eacute;solution : <a href="http://wishit.freetouch.fr">wishit.freetouch.fr</a>',
            isHtml:  true
        });
      }
    });
    
    
  }
  
  // à déplacer dans la partie gestion de contenu
  function updateHeightInner() {
    self.contenuSelector.height(window.innerHeight);
    if(useTransition3D)
    {
      self.contenuSelector.width((window.innerWidth - 10));
      self.contenuSelector.css('margin-left','10px');
    }
    //self.zoneContenuSelector.height(window.innerHeight);
    
    $("#wrapper").height(window.innerHeight);
	
    myScroll.refresh();
    // remonte le scroll en 0, 0 en 0 ms
    myScroll.scrollTo(0, 0, 0);
    
    
  }
}

/*
  
 <iframe width="560" height="315" src="//www.youtube.com/embed/wcOMV0nywds" frameborder="0" allowfullscreen></iframe> 
  
 
 */