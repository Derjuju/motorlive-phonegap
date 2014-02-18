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
  
  
  
  // constructeur
  this.initialise = function(_parent) {
    self.parent = _parent;
    self.nbreClic = 0;
    self.pubActuelle = 0;    
    self.totalClic = 0;
    self.totalPubs = 0;
    
  };
  
  this.parametrage = function() {
    
    self.totalClic = parseInt(pubsJson["config"]["frequence"]);
    self.totalPubs = parseInt(pubsJson["pubs"].length);
    
    console.log("self.totalClic : "+self.totalClic+" et self.totalPubs : "+self.totalPubs);
    
  };
  
  this.testAffichage = function(){
    self.nbreClic++;
    
    console.log("self.nbreClic : "+self.nbreClic);
    
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
    
    console.log("pub à afficher : "+self.pubActuelle);
    /*$("#ZonePub").html('<iframe id="pub"></iframe>');
    $("#ZonePub #pub").load('http://lebiscuit.free.fr/MT/', function(){
        console.log("pub chargée");
        $("#ZonePub").css('left','0%');
        $("#ZonePub").css('top','0%');
    });
    */
   window.plugins.childBrowser.showWebPage('http://lebiscuit.free.fr/MT/',
                                        { showLocationBar: true });
   
   
   
  };
  
}