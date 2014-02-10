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
// Class FicheDetail
function FicheDetail() {
  var self = this; 
  var detailSelector = null;
  var indiceElement = null;
  var idFiche = null;
  var objetFiche = null;
  
  var champsActif = null;
  
  var largeurImposee = 240;
  var hauteurImposee = 320;
  
  
  // constructeur
  this.initialise = function(_parent, element, _indice, _id) {
    self.parent = _parent;
    //var vignette = $(element);
    self.indiceElement = _indice;//vignette.attr('data-id');
    self.idFiche = _id;
    self.detailSelector = $('#detailManager');
    
    self.detailSelector.load('js/tpl/detail.html', function(){
      // récuperation de la fiche de l'élément
      chargeFiche();
    });
  };
  
  function chargeFiche(){
    $.ajax({
        type: 'GET',
        url: webservice_detail,
        data: {id:self.idFiche},
        dataType: "json",
        async:true
      }).done(function(data){        
            // data already JSON
            self.objetFiche = data['fiche'][0];
            creationFiche();
      });
  }
  
  function creationFiche(){
      var idShare = self.objetFiche["id"];      
      self.idFiche = self.objetFiche["id"];
            
      var titre = self.objetFiche["titre"].split('<br>')[0];
      var reg=new RegExp("(<br>)", "g");
      
      // customisation de la fiche detail
      self.detailSelector.find('.titre').html('<h1>'+titre+'...</h1>');
      
      // modification dimension en fonction du téléphone
      var hauteurElementsUI = 131;
      var hauteurPossible = window.innerHeight - hauteurElementsUI;
      var largeurPossible = window.innerWidth;
      
      self.largeurImposee = 300;
      self.hauteurImposee = 170;
      
      if(largeurPossible > 560){
        if(hauteurPossible > 315){
          self.largeurImposee = 560;
          self.hauteurImposee = 315;
        }
      }
      
      
      var codeVideo = self.objetFiche["idvideo"];
      var playerVideo = '';
      var urlSrcVideo = '';
      if(self.objetFiche["videosrc"] == "youtube")
      {
        //playerVideo = '<iframe width="'+largeurImposee+'" height="'+hauteurImposee+'" src="http://www.youtube.com/embed/'+codeVideo+'" frameborder="0" allowfullscreen></iframe> ';
        urlSrcVideo = 'http://www.youtube.com/v/'+codeVideo;
        playerVideo = '<object width="'+self.largeurImposee+'" height="'+self.hauteurImposee+'"><param name="movie" value="'+urlSrcVideo+'?fs=1&amp;hl=fr_FR"><param name="allowFullScreen" value="true"><param name="allowscriptaccess" value="always"><embed src="'+urlSrcVideo+'?fs=1&amp;hl=fr_FR" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="'+self.largeurImposee+'" height="'+self.hauteurImposee+'"/></object>';
        
        // cette ligne en dessous ne marche pas
        //playerVideo += '<iframe title="'+titre+'" width="'+self.largeurImposee+'" height="'+self.hauteurImposee+'" src="'+urlSrcVideo+'?fs=1&amp;hl=fr_FR" frameborder="0" allowfullscreen></iframe>"';
        
      }
      self.detailSelector.find('.visuel').html(playerVideo);
      
      
      var descriptif = self.objetFiche["descriptif"];
      self.detailSelector.find('.descriptif').html("<p>"+descriptif+"</p>");
      
      
      // liaison des boutons
      /*self.detailSelector.find('.fermer a').bind('click', function(event){
        event.preventDefault();
        fermerDetail(element);
      });*/
      
      self.detailSelector.addClass('affiche');
      self.detailSelector.height(window.innerHeight);
      self.detailSelector.width(window.innerWidth);
      self.parent.ficheDetailOuverte = true;
      
      
      //self.detailSelector.animate({'opacity':1, 'left':'0%'},500);
      
      
      //TweenMax.to(self.detailSelector,1, {left:"0%", opacity:1, ease:Quart.easeInOut});
      
      TweenMax.to($("#wrapperAllContent"),1, {left:-window.innerWidth, ease:Quart.easeInOut});
      
      $('#retourMenu').css('visibility','hidden');
      $('#retourArriere').css('visibility','visible');
      $('#suivante').css('visibility','visible');
      $('#precedente').css('visibility','visible');
      $('#partage').css('visibility','visible');
  }
  
  
  
  /*function fermerDetail(element){
    // désactive navigation
    self.parent.parent.menuNav.activeMenu();
    
    var vignette = $(element);
    vignette.removeClass('selected');
    
    TweenMax.to(self.detailSelector,1, {left:"100%", opacity:0, ease:Quart.easeInOut, onComplete:libereFicheDetail});
    //self.detailSelector.animate({'opacity':0, 'left':'100%'},500, function(){
    //  libereFicheDetail();
    //});
  }*/
  
  this.libereFicheDetail = function(){
    self.detailSelector.removeClass('affiche');
    //self.detailSelector.find('.fermer a').unbind('click');
    //vide detail
    self.detailSelector.html('');
    self.parent.ficheDetailOuverte = false;
  };
  
  
  
}