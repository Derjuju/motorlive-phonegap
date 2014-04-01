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
// Class Connexion
function Connexion() {
  var self = this;
  
  self.etatApplication = null;
  var lastDataVersion;
  
  this.verifieVersion = function(){
    var etatApplication = false;
    if(this.testConnectivite())
    {
      etatApplication = true;
      
        $.ajax({
                  type: 'POST',
                  url: webservice_version,
                  data: {},
                  dataType: "json",
                  async:true
                }).done(function(data){        
                      var appVersion = "";
                      var dataVersion = "";
                      //var resultat = JSON.parse(data); // convert to JSON from string
                      var resultat = data; // data already JSON

                      if(resultat["app-version"] != undefined)
                      {
                        appVersion = resultat["app-version"];
                      }
                      if(resultat["data-version"] != undefined)
                      {
                        dataVersion = resultat["data-version"];
                      }
                          
                      compareVersionAppEtData(appVersion,dataVersion);

                    }
                );
      
    }else{
      // pas de connexion tourne en local
      etatApplication = false;
    }    
    return etatApplication;
  };
  
  function compareVersionAppEtData(appVersion,dataVersion){
    // test si différence de version de l'application
    if(appVersion != self.getAppVersion())
    {
      self.etatApplication = -1; // il faut mettre à jour l'application
    }else{
      // test si différence de version des données
      if(dataVersion != self.getDataVersion())
      {
        self.etatApplication = 0; // il faut mettre à jour les données
        self.lastDataVersion = dataVersion;
      }else{
        // OK, application et données à jour
        self.etatApplication = 1;
        self.lastDataVersion = dataVersion;
      }
    } 
    
    // annonce que la vérificaiton est terminée
    $("#eventManager").trigger('versionVerifiee');
  }
  
  this.getEtatApplication = function(){
    return self.etatApplication;
  };
  
  
  
  
  
  
  
  
  
  
  
  
  function gotFSforCheckUpdate(fileSystem) {
    //console.log(fileSystem.name);
    //console.log(fileSystem.root);   
    fileSystem.root.getFile("check-update.json", {create: true, exclusive: false}, gotFileEntryforCheckUpdate, failFile);    
  }
  function gotFileEntryforCheckUpdate(fileEntry) {
    //console.log(fileEntry);
    //console.log(fileEntry.name);
    fileEntry.file(gotFileforCheckUpdate, fail);
  }
  function gotFileforCheckUpdate(file){
    //readDataUrl(file);
    readAsTextforCheckUpdate(file);
  }
  function readAsTextforCheckUpdate(file) {
    var reader = new FileReader();
    reader.onloadend = function(evt) {
      //console.log("Read as text");
      //console.log(evt.target.result);
    };
    reader.readAsText(file);
  }
  function fail(error) {
    //console.log(error);
    //console.log(error.code);
  }
  function failFile(error) {
    //console.log(error);
    //console.log(error.code);
    //console.log("error getting file");
  }
  
  
  // ---------------------------
  this.testConnectivite = function() {
    var networkState = navigator.connection.type;
    //console.log("testConnectivite : "+networkState);
    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';
    if((networkState === Connection.UNKNOWN)||(networkState === Connection.NONE))
    {
      return false;
    }else{
      return true;
    }
  };
  
  // initalisation des tableaux de données
  this.initialiseDonnees = function() {
    var etatApplication = false;
    if(this.testConnectivite())
    {
      etatApplication = true;
      
        $.ajax({
                  type: 'POST',
                  url: webservice_update,
                  data: {},
                  dataType: "json",
                  async:true
                }).done(function(data){        
                      // data already JSON
                      analyseDonnees(data);
                    }
                );
      
    }else{
      // pas de connexion tourne en local
      etatApplication = false;
    }    
    return etatApplication;
  };
  
  function analyseDonnees(objJSon) {
    
    configJson = objJSon["config"];
  
    donneesJson = objJSon["contenu"];
    
    menuJson = objJSon["menu"];
    
    pubsJson = objJSon["pub"];
    
    updateConfig();
        
    // annonce que nos données sont à jour à cette version
    setDataVersion();
    
    // libère mémoire
    objJSon = null;
    
    // annonce que la données sont chargées
    $("#eventManager").trigger('initialiseDonneesReady');
  };
  
  function updateConfig(){
    cdn_visuel_menu = configJson['cdn_visuel_menu'];
    cdn_visuel = configJson['cdn_visuel'];
    cdn_visuel_small = configJson['cdn_visuel_small'];
  }
  
  
  this.getAppVersion = function(){
    var appVersion = "1.0.0";
    
    return appVersion;
  };
  
  this.getDataVersion = function(){
    //var dataVersion = "20131208.150000";
    var dataVersion = "";
    
    if(permanentStorage.getItem("data-version")!= null)
    {
      dataVersion = permanentStorage.getItem("data-version");
    }
    
    
    return dataVersion;
  };  
  
  function setDataVersion(){    
    permanentStorage.setItem("data-version",self.lastDataVersion);
    //console.log("place en stockage permanent : "+self.lastDataVersion);
    //console.log("permanentStorage.getItem( data-version ) : "+permanentStorage.getItem("data-version"));
  }
  
  
  this.subscribeToNotification = function(_platform, _token){
    var etatApplication = false;
    
    _platform = _platform.toLowerCase();
    
    if(this.testConnectivite())
    {
      etatApplication = true;
       
        $.ajax({
                  type: 'POST',
                  url: webservice_subscribe,
                  data: {platform:_platform, token:_token},
                  dataType: "json",
                  async:true
                }).done(function(data){   
                      // envoi du token pour notification terminé    
                      //navigator.notification.alert(data, null, 'DEBUG : data', 'OK');    
                    }
                );
      
    }else{
      // pas de connexion tourne en local
      etatApplication = false;
    }    
    return etatApplication;
  }
  
  
}