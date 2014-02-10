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
// Class MenuNavigation
function MenuNavigation() {
  var self = this;
  var menu = null;
  var menuSelector = null;
  var menuElements = null;
  var largeurDevice;
  var parent = null;
  
  var pullDownEl, pullDownOffset;
  
  // constructeur
  this.initialise = function() {
    // largeur = 36% window or max = 228px
    if(useTransition3D)
    {
      largeurDevice = Math.ceil(window.innerWidth*0.36);
    }else{
      largeurDevice = Math.ceil(window.innerWidth*0.34);
    }
    if(largeurDevice > 228) largeurDevice = 228;
    if(largeurDevice < 114) largeurDevice = 114;
  	
    self.pullDownEl = document.getElementById('pullDown');
    self.pullDownOffset = self.pullDownEl.offsetHeight;
    
    self.menuSelector = $('.navigation');
    
    if(useTransition3D)
    {
      self.menu = Meny.create({
        // The element that will be animated in from off screen
        menuElement: document.querySelector( '.navigation'), 

        //The contents that gets pushed aside while Meny is active
        contentsElement: document.querySelector( '.contents' ),

        // [optional] The alignment of the menu (top/right/bottom/left)
        position: Meny.getQuery().p || 'left',

        // [optional] The height of the menu (when using top/bottom position)
        //height: 200,

        // [optional] The width of the menu (when using left/right position)
        width: largeurDevice,

        // [optional] Distance from mouse (in pixels) when menu should open
        threshold: window.innerWidth / 4,

        // [optional] Distance that appear from the border (in pixels) when menu is closed
        overlap: 10
      });
    }else{
      self.menuSelector.addClass('no3D');
      self.menuSelector.bind('click', function(){ self.fermeMenu();});
    }
    
    // activation des listeners si jamais on les avait enlevés
    if(useTransition3D)
    {
      self.menu.bindEvents();
    }
    
    // ajout des listeners sur les actions du menu
    //Meny.dispatchEvent( dom.menu, 'open' );
    self.menuSelector.on('open', function(event) {
      synchroniseOuverture();
    });
    self.menuSelector.on('close', function(event) {
      synchroniseFermeture();
    }); 
    
    // gestion non retour menu
    self.menuSelector.on('reculeContenu', function(event) {
      self.parent.contenuPrincipal.reculeContenuGlobal();
    });
    
  }; 
  
  // construction automatique
  self.initialise();
    
  this.fabricationListeMenu = function(_parent, demarrageApplication) {
    self.parent = _parent;
    
    self.menuElements = $('.menu-list');
    
    var html = '';
    
    /*for( var i = 0, len = entries.length; i < len; i++ ) {    
      var attributes = IS_ANDROID ? 'cache' : '';	
      attributes += ' vignette';
      
      html += '<li class="' + attributes + '">';
      //if(entries[i] != "") { html +='<a href="'+entriesLink[i]+'" data-tpl="'+entriesTpl[i]+'" data-title="'+entriesTitle[i]+'" data-id="'+entriesLink[i]+'" data-indice="'+i+'">'+insereBigVignette(entries[i], entriesLabel[i])+'</a>'; }
      if(entries[i] != "") { html +='<a href="'+entriesLink[i]+'" data-indice="'+i+'">'+insereBigVignette(entries[i], entriesLabel[i])+'</a>'; }
      else { html +='<a href="'+entriesLink[i]+'">'+entriesLabel[i]+'</a>'; } 
      html +='</li>';
      
    }*/
    for(var i= 0, len = menuJson.length; i < len; i++) {
      var attributes = IS_ANDROID ? 'cache' : '';	
      attributes += ' vignette';
      html += '<li class="' + attributes + '">';
      if(menuJson[i]["icon"] != "") { html +='<a href="'+menuJson[i]["id"]+'" data-indice="'+i+'">'+insereBigVignette(menuJson[i]["icon"], menuJson[i]["label"])+'</a>'; }
      else { html +='<a href="'+menuJson[i]["id"]+'">'+menuJson[i]["label"]+'</a>'; } 
      html +='</li>';
    }
    
    self.menuElements.html(html);
    
    if( IS_ANDROID ) {
      $('body').addClass('android');
    }
    self.menuElements.find('li').each(function(){
      $(this).removeClass('cache' );
      $(this).css('width',largeurDevice+'px');
      $(this).css('height',largeurDevice+'px');
    });    
    
    // Set the default effect
    self.menuElements.addClass('wave');
    
    this.updateHeight(demarrageApplication);
    
    // ajoute un click sur les éléments
    self.menuElements.find(".vignette a").each(function(){
      $(this).click(function(event){
        event.preventDefault();  
        // retire ancienne rubrique active
        desactiveElementMenu();
        // si nouveau possède un état actif on l'active
        if(menuJson[$(this).attr('data-indice')]["iconOn"] != undefined)
        {
          activeElementMenu($(this))
        }
        // appel le chargement du contenu
        requeteAjaxMenuNav(this);          
      });
    });
    
    // annonce que le menu est prêt
    $("#eventManager").trigger('menuNavigationReady');
  }
  
  function desactiveElementMenu(){    
    // retire ancienne rubrique active
    var ancienneRubriqueActive = self.menuElements.find(".vignette a.actif");
    // si existante
    if(ancienneRubriqueActive.length > 0)
    {
      if(menuJson[ancienneRubriqueActive.attr('data-indice')]["icon"] != undefined)
      {
        ancienneRubriqueActive.find('img').attr('src',cdn_visuel_menu+'images/icon/'+ menuJson[ancienneRubriqueActive.attr('data-indice')]["icon"]);
      }
      ancienneRubriqueActive.removeClass('actif');
    }
  }
  
  function activeElementMenu(target){
    var indice = $(target).attr('data-indice');
    $(target).addClass('actif');
    $(target).find('img').attr('src',cdn_visuel_menu+'images/icon/'+ menuJson[indice]["iconOn"]);
  }
   
  this.ouvreMenu = function(){
    if(useTransition3D)
    {
      self.menu.open();
    }else{
      self.menuSelector.addClass('ouverture');
      self.menuSelector.trigger('open');
    }
  }
  
  this.fermeMenu = function(){
    if(useTransition3D)
    {
      self.menu.close();
    }else{
      self.menuSelector.removeClass('ouverture');
      self.menuSelector.trigger('close');
    }
  }
  
  /**
  * Updates the list height to match the window height for 
  * the demo. Also re-binds the list with stroll.js.
  */
  this.updateHeight = function(demarrageApplication) {
    //self.menuElements.css('height',window.innerHeight + 'px');
    //stroll.bind($(self.menuElements));
    
    //$(".fondListe").height(window.innerHeight);
    $(".mainContent").height(window.innerHeight);
    
    $("#wrapperMenu").height(window.innerHeight);
    
    if(!demarrageApplication){
      myScrollMenu.refresh();
    }else{    
      myScrollMenu = new iScroll('wrapperMenu', { 
        //zoom:true, 
        vScrollbar:false, hScrollbar:false, hScroll:false,
        //useTransition: true,
        topOffset: self.pullDownOffset,
        onRefresh: function () {
			if (self.pullDownEl.className.match('loading')) {
				self.pullDownEl.className = '';
                                $(".fondListe").removeClass("loading");
				self.pullDownEl.querySelector('.pullDownLabel').innerHTML = 'actualiser';
			}
		},
        onScrollMove: function () {
			if (this.y > 35 && !self.pullDownEl.className.match('flip')) {
				self.pullDownEl.className = 'flip';
				self.pullDownEl.querySelector('.pullDownLabel').innerHTML = 'actualiser';
				this.minScrollY = 0;                                  
			} else if (this.y < 35 && self.pullDownEl.className.match('flip')) {
				self.pullDownEl.className = '';
				self.pullDownEl.querySelector('.pullDownLabel').innerHTML = 'actualiser';
				this.minScrollY = -self.pullDownOffset; 
			}
		},
        onBeforeScrollEnd: function () {
			if (self.pullDownEl.className.match('flip')) {
				$(".fondListe").addClass("loading")				
			}
		},
        onScrollEnd: function () {
			if (self.pullDownEl.className.match('flip')) {
				self.pullDownEl.className = 'loading'; 
				self.pullDownEl.querySelector('.pullDownLabel').innerHTML = 'chargement';				
				pullDownAction();	// Execute custom function (ajax call?)
			}else{
                          if((this.y+$(".fondListe").height()-$("#pullDown").height()) < window.innerHeight)
                          {                            
                            var recaleScrollMenu = window.innerHeight - $(".fondListe").height() + $("#pullDown").outerHeight();
                            myScrollMenu.scrollTo(0,recaleScrollMenu,50);
                          }
                        }
		}
      });
    }
    
  }
  
  function pullDownAction(){
    // test si du nouveau contenu existe
    //self.parent.verifieDonneesServeur();
    self.parent.reVerifieDonneesServeur();
    
    // simulation latence internet
    /*
    setTimeout(function () {
        self.parent.verifieDonneesServeur();
        //self.parent.reVerifieDonneesServeur();
        //myScrollMenu.refresh();
    },1000);
    */
  }
  
  this.finMiseAJour = function(){
    if (self.pullDownEl.className.match('loading')) {
            self.pullDownEl.className = '';
            $(".fondListe").removeClass("loading");
            self.pullDownEl.querySelector('.pullDownLabel').innerHTML = 'actualiser';
    }
  }
  
  
  this.getItemMenu = function(indice) {
    var itemMenu = self.menuElements.find('li').eq(indice).find('a');
    
    return itemMenu;
  }
  
  function requeteAjaxMenuNav(itemMenu){
    rubriqueActuelle = $(itemMenu).attr("data-indice");
    self.parent.miseAjourContenu();
  }
  
  
  /**
  * Insere une image
  * 
  * @param {String} type source de l'image
  */
  function insereBigVignette( srcImage, lblImage ) {
    //return '<img src="img/menu/'+ srcImage +'"><div class="labelImage">'+lblImage+'</div>';
    return '<img src="'+cdn_visuel_menu+'images/icon/'+ srcImage +'"><div class="labelImage">'+lblImage+'</div>';
  }
  
  function synchroniseOuverture(){
    swipeBindtoMeny();
    $('body').addClass("menuOuvert");
    if(!useTransition3D)
    {
      self.menuSelector.bind('click', function(){ self.fermeMenu();});
    }
  }

  function synchroniseFermeture(){
    swipeBindtoContent();
    $('body').removeClass("menuOuvert");
    if(!useTransition3D)
    {
      self.menuSelector.unbind('click');
    }
  }
  
  function swipeBindtoContent(){
    //self.menu.unbindEvents();
  }

  function swipeBindtoMeny(){
    //console.log("swipeBindtoMeny");
    //self.menu.bindEvents();
  }
  
  function onSwipeLeftContent( event ) {
    //alert("onSwipeLeftContent");
    if(useTransition3D)
    {
      if(!self.menu.isOpen())
      {
        self.menu.open();
      }
    }
  }
  function onSwipeRightContent( event ) {
    //alert("onSwipeRightContent");
  }
  
  
  this.desactiveMenu = function(){
    if(useTransition3D)
    {
      self.menu.unbindEvents();
    }
  }
  this.activeMenu = function(){
    if(useTransition3D)
    {
      self.menu.bindEvents();
    }
  }
  
  this.simuleClickNavigation = function(indice){
    self.menuElements.find('li').eq(indice).find('a').trigger('click');
    self.ouvreMenu();
  }
  
}