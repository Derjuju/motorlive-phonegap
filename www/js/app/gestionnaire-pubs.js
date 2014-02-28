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
// Class GestionnairePubs
function GestionnairePubs() {
  var self = this; 
  
  var nbreClic, totalClic;
  var pubActuelle, totalPubs;
  
  var refInApp;
  
  
  
  // constructeur
  this.initialise = function(_parent) {
    self.parent = _parent;
    self.nbreClic = 0;
    self.pubActuelle = 0;    
    self.totalClic = 0;
    self.totalPubs = 0;
    self.refInApp = null;
    
  };
  
  this.parametrage = function() {
    
    self.totalClic = parseInt(pubsJson["config"]["frequence"]);
    self.totalPubs = parseInt(pubsJson["pubs"].length);
    
    //console.log("self.totalClic : "+self.totalClic+" et self.totalPubs : "+self.totalPubs);
    
  };
  
  this.testAffichage = function(){
    self.nbreClic++;
    
    //console.log("self.nbreClic : "+self.nbreClic);
    
    if(self.nbreClic >= self.totalClic){
      self.nbreClic = 0;
      return true;
    }else{
      return false;
    }
  };
  
  this.affichePub = function(){
    self.pubActuelle++;        
        
    if(self.pubActuelle >= self.totalPubs){
      self.pubActuelle = 0;
    }
    
    //console.log("pub à afficher : "+self.pubActuelle);
   
   //window.plugins.childBrowser.showWebPage(pubsJson["pubs"][self.pubActuelle]['url'],{ showLocationBar: false });
   
   // infos sur les possibilités, evénements, paramètres
   // http://docs.phonegap.com/en/3.0.0rc1/cordova_inappbrowser_inappbrowser.md.html
   //self.refInApp = window.open(pubsJson["pubs"][self.pubActuelle]['url'], '_blank', 'location=no,toolbar=no,enableViewportScale=yes,');
   
   self.refInApp = window.open('http://motorlive.derjuju.com/pub/test.html', '_blank', 'location=no,toolbar=no,enableViewportScale=yes,');
   
   // on attend que l'url soit chargée pour lancer la fermeture auto
   self.refInApp.addEventListener('loadstop', checkPourFermetureAuto);
    
   
   self.nbreClic = 0;
   
  };
  
  function checkPourFermetureAuto(){
    self.refInApp.removeEventListener('loadstop', checkPourFermetureAuto);
    
    // close InAppBrowser after X seconds if available
    if(pubsJson["pubs"][self.pubActuelle]['duration'] != 0)
    {
      setTimeout(function() {
          self.refInApp.close();
      }, pubsJson["pubs"][self.pubActuelle]['duration']);
    }
  }
  
}