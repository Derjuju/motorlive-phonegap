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
  
  this.initialise = function(_parent, _indice, _id) {
    self.parent = _parent;
    self.indiceElement = parseInt(_indice);
    self.idFiche = parseInt(_id);
    
    self.detailSelector = $(self.parent).children( 'div.th-inner' );
    self.detailSelector.load('js/tpl/detail_v2.html', function(){
      // récuperation de la fiche de l'élément
      chargeFiche();
      $(this).find('.partage a').bind('click', function(event){
        event.preventDefault();
        partageVideo();
      });
    });
  };
  
  function chargeFiche(){
    // animation navigation principale
    //TweenMax.to($("#wrapperAllContent"),0.5, {left:-window.innerWidth, ease:Quart.easeInOut});
    
    $.ajax({
        type: 'GET',
        url: webservice_detail+"/"+self.idFiche,
        data: {},
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
     
     var dimensionLoader = 40;
     if(IS_IPAD) { dimensionLoader = 80; }
     
     if(self.detailSelector.find('.visuel').html() != '<img src="img/ui/loader2b.gif" class="loaderVideo">')
        self.detailSelector.find('.visuel').html('<img src="img/ui/loader2b.gif" class="loaderVideo">');
     
     setTimeout(function(){ajouteVideo();}, 100);
      
      var descriptif = self.objetFiche["descriptif"];
      self.detailSelector.find('.descriptif').html("<p>"+descriptif+"</p>");
      
      
      self.detailSelector.addClass('affiche');
      
      // verifie si on affiche une pub ou pas      
      myApp.affichagePub();
  }
  
  function ajouteVideo(){
      // modification dimension en fonction du téléphone
      var hauteurElementsUI = 131;
      var hauteurPossible = self.detailSelector.find('.detailHaut').height()-10;
      var largeurPossible = self.detailSelector.find('.detailHaut .visuel').width();
      
      self.largeurImposee = 140; //300;
      self.hauteurImposee = 70; //170;
      
      /*if(largeurPossible > 560){
        if(hauteurPossible > 315){
          self.largeurImposee = 260;
          self.hauteurImposee = 130;
        }
      }*/
      var ratioA = (hauteurPossible/largeurPossible);
      var ratioB = (largeurPossible/hauteurPossible);
      
      if(ratioA >= ratioB){
        self.largeurImposee = largeurPossible;
        self.hauteurImposee = largeurPossible*ratioA;
      }else{
        self.largeurImposee = hauteurPossible*ratioB;
        self.hauteurImposee = hauteurPossible;
      }
      
      
      var titre = self.objetFiche["titre"].split('<br>')[0];
      
      var codeVideo = self.objetFiche["idvideo"];
      var playerVideo = '';
      var urlSrcVideo = '';
      if(self.objetFiche["videosrc"] == "youtube")
      {
        //playerVideo = '<iframe width="'+largeurImposee+'" height="'+hauteurImposee+'" src="http://www.youtube.com/embed/'+codeVideo+'" frameborder="0" allowfullscreen></iframe> ';
        
        //urlSrcVideo = 'http://www.youtube.com/v/'+codeVideo;
        //playerVideo = '<object width="'+self.largeurImposee+'" height="'+self.hauteurImposee+'"><param name="movie" value="'+urlSrcVideo+'?fs=1&amp;hl=fr_FR"><param name="allowFullScreen" value="true"><param name="allowscriptaccess" value="always"><param name="bgcolor" value="#000000"><embed src="'+urlSrcVideo+'?fs=1&amp;hl=fr_FR" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" bgcolor="#000000" width="'+self.largeurImposee+'" height="'+self.hauteurImposee+'"/></object>';
        
        // cette ligne en dessous ne marche pas
        //playerVideo += '<iframe title="'+titre+'" width="'+self.largeurImposee+'" height="'+self.hauteurImposee+'" src="'+urlSrcVideo+'?fs=1&amp;hl=fr_FR" frameborder="0" allowfullscreen></iframe>"';
        
        if(IS_ANDROID) {
          urlSrcVideo = 'http://www.youtube.com/v/'+codeVideo;
          playerVideo = '<object width="'+self.largeurImposee+'" height="'+self.hauteurImposee+'"><param name="movie" value="'+urlSrcVideo+'?fs=1&amp;hl=fr_FR"><param name="allowFullScreen" value="true"><param name="allowscriptaccess" value="always"><param name="bgcolor" value="#000000"><embed src="'+urlSrcVideo+'?fs=1&amp;hl=fr_FR" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" bgcolor="#000000" width="'+self.largeurImposee+'" height="'+self.hauteurImposee+'"/></object>';        
        }else{
          urlSrcVideo = 'http://www.youtube.com/embed/'+codeVideo+"?autoplay=1&controls=0&showinfo=0&rel=0";
          playerVideo = '<iframe title="'+titre+'" width="'+self.largeurImposee+'" height="'+self.hauteurImposee+'" src="'+urlSrcVideo+'" frameborder="0" allowfullscreen></iframe>';
        }
      }
      
      setTimeout(function(){ 
        self.detailSelector.find('.visuel').css('display','none');
        self.detailSelector.find('.visuel').html(playerVideo);
        self.detailSelector.find('.visuel').css('display','block');
      }, 500);
  };

  
  this.libereFicheDetail = function(){
    self.detailSelector.removeClass('affiche');
    //self.detailSelector.find('.fermer a').unbind('click');
    //vide detail
    self.detailSelector.html('');
    //self.parent.ficheDetailOuverte = false;
  };
  
  
  function partageVideo() {    
        var socialShare = window.plugins.socialsharing;
        socialShare.available(function(isAvailable) {
          if (isAvailable) {
            
            var imageToShare = cdn_visuel+self.objetFiche["id"]+'/'+self.objetFiche["preview"];
            //var permalien = website_app+"/tv/"+self.objetFiche["id"];
            var permalien = website_app+"/"+self.objetFiche["id"];
            var messagePerso = "Découvrez la vidéo sur motorlive.tv";
            
            //share('message', 'sujet', 'image', 'site web');
            window.plugins.socialsharing.share(messagePerso, self.objetFiche["titre"], imageToShare, permalien);
          }
        });
    
  }
  
  
  function initialiseNouvelleFiche(){
    self.idFiche = self.parent.donneesJsonListing[self.indiceElement]["id"];
    self.detailSelector.load('js/tpl/detail.html', function(){
      // récuperation de la fiche de l'élément
      chargeFiche();
    });
  }
  
}