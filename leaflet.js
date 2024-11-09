//FICHIER REGROUPANT TOUTE LES FONCTIONS LIEES DIRECTEMENT A LEAFLET
var tiles = null;
var popupSelect;
var isHolding = false;
var disableClick = false;


class LeafletMap {
  #map;
  constructor() {
    this.#map = L.map('map').setView([0, 0], 13).setZoom(2);
    this.#map.on('moveend', this.actualiseMap.bind(this));
    // Exécuter cette fonction chaque fois que la variable est mise à jour
    this.#map.on('mousemove', function(e) {
      const texte = document.getElementById('texteCurseur');
      mouseLat = e.latlng.lat; // valeur du textue
      mouseLng = e.latlng.lng; 
      //maj du texte
      texte.innerHTML = `${mouseLng.toFixed(3)} : ${mouseLat.toFixed(3)}`;
      //
      texte.style.color = 'white';
      texte.style.left = e.originalEvent.pageX + 20 + 'px';//position du texte
      texte.style.top = e.originalEvent.pageY - 10 + 'px';
      //
      //getOverlayRotatedParams();
    });
    this.#map.on('click', async function(e) {
      try{
        //console.log("click");
        if(disableClick == false){
          var layerFin = null;
          await resetSelector();
          for(var i = 0; i < objListLeaflet.length; i++){
            var points = objListLeaflet[i][0];
            if(points[0] == 'IMG-LX-CENTER' || points[0] == 'IMG-LX-CENTER-R'){
              if(await pointDansCarre(e.latlng.lng,e.latlng.lat,points[1],points[2],points[3],points[4],points[5],points[6],points[7],points[8])){
                layerFin = objListLeaflet[i];//peut en select plusieurs en un click, le rang du dernier sera gardé
              }
            }
          }
          if(layerFin != null) {await actionImageFocus(layerFin);}
        }
        else disableClick = false;
      }
      catch (error) {
        //console.log("Erreur resizeImage catched: " + imageInfos[12] + "===" + imageInfos[11]);
        throw error;
      }
    });
    this.#map.on('mousedown', function(e){
      isHolding = true; // Fin de l'appui
      //holdInterval = setInterval(function() {
        //console.log("Bah!");
      //  mushroomSelectorMouseHold();
      //}, 100); // Vérifie toutes les 100 ms
    });
    this.#map.on('mouseup', function(e) {
      isHolding = false; // Fin de l'appui
      //if(isHolding2) disableClick = true;
      //isHolding2 = false;
      //console.log("Relache");
      //map.dragging.enable();
      //clearInterval(holdInterval); // Stopper l'intervalle
    });
  }
  /**--*/
  popup(x, y, content){
    //console.log("affiche popup");
    popupSelect = L.popup()
    .setLatLng(L.latLng(y,x))  // Positionner le pop-up à l'endroit du clic
    .setContent(content)  // Contenu du pop-up
    .openOn(this.#map);  // Ouvrir le pop-up sur la carte
  }
  /**--*/
  async disableDragging(){
    await this.#map.dragging.disable();
  }
  /**--*/
  async closePopup(){
    await this.#map.closePopup();
  }
  /**--*/
  async ifObjExist(data){
    var retour = false;
    this.#map.eachLayer(function(layer) {
      if(layer == getLayerObjByData(data)) {
        retour = true;
      }
    });
    return  retour;
  }
  /**Ajoute un objet à leaflet depuis la liste des commandes complète */
  async addObj(rg){
    if(objListLeaflet[rg][3] == true && await this.ifObjExist(objListLeaflet[rg][0]) == false) await objListLeaflet[rg][1].addTo(this.#map);
  }
  /**Supprime tout les éléments enregistrés dans leaflet, sauf les popups globaux */
  async removeAllObj(){
    try{

      this.#map.eachLayer((layer) => {
        if (!(layer instanceof L.Popup)) {
          this.#map.removeLayer(layer);
        }
      });
    } catch(error) {
      console.error("Erreur dans la suppression d'objet leaflet");
      throw error;
    }
  }
  /**supprime tout les éléments d'une carte, vérifie le tracage de nouveaux éléments et les insère dans la carte*/
  async actualiseMap(){
    try{
      await this.removeAllObj();
      for (var i = 0; i < objListLeaflet.length; i++) {
        await calculTracabilite(i);
        //await actualiseObjOnLLMap(i);//tracage au cas par cas
        await this.addObj(i);
      }
      //stats();
    } catch(error) {
      console.error("Erreur dans la suppression d'objet leaflet");
      throw error;
    }
  }
  /**-*/
  async getMapBounds(){
    return await this.#map.getBounds();
  }
  /**Fonction qui actualise l'état de l'objet sur la map*/
  async actualiseObj(rg){
    if(objListLeaflet[rg][3] == true && await ifObjExist(objListLeaflet[rg][0]) == false) await objListLeaflet[rg][1].addTo(this.#map);
    else if(objListLeaflet[rg][3] == false && await ifObjExist(objListLeaflet[rg][0]) == true) await map.removeLayer(objListLeaflet[rg][1]);
  }
  /**affiche le nb d'éléments présents dans la map leaflet */
  stats(){
    var i = 0;
    this.#map.eachLayer(function(element) {
      i++;
      //console.log(element.options.data);
    });
    console.log("nb élements sur la carte: " + i);
    console.log("nb élements sur la liste leaflet: " + objListLeaflet.length);
  }
}





function toMipMap(data){
  const data2 = [...data];
  data2[19] = true;
  return data2;
}
function convertToFloat(nb){
  nb = String(nb);
  nb = nb.replace(',','.');
  return parseFloat(nb);
};
/**Génère une image réduite depuis une image classique*/
async function generateMipMapIfNecessary(dataa){
  var dataaModif = null;
  if(dataa[19] == true){
    dataaModif = await resizeImage(dataa, 10, 10);
    if(dataaModif == null) {
      dataaModif = [...dataa]; //format d'image non scalable
      dataaModif[11] = unfound_img;
    }
  }
  else {dataaModif = [...dataa]};
  return dataaModif;
}
/*rajoute une tilemap retourne l'objet ou null si impossible */
function generateTile(dataa){
  const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });
  return tiles;
}
async function generateImage3p(dataa){
  var dataaModif = await generateMipMapIfNecessary(dataa);
  return new Promise((resolve) => {
  try{
        //point2,point1,point4
        const imageEvent = L.imageOverlay.rotated(dataaModif[11], L.latLng(convertToFloat(dataaModif[8]), convertToFloat(dataaModif[7])), L.latLng(convertToFloat(dataaModif[6]), convertToFloat(dataaModif[5])), L.latLng(convertToFloat(dataaModif[2]), convertToFloat(dataaModif[1])), { 
          opacity: 1,
          interactive: true,
          angle: dataaModif[17],
        });
        if(imageEvent == null) {
          console.error("Erreur dans la génération de l'image " + dataaModif[10]);
          resolve(null);
        }
        resolve(imageEvent);
    } catch (error) {
      console.error("Erreur dans la génération de l'image ", error);
      throw error;
      //throw erreur;
      resolve(null);
    }
  });
}
async function generateImage(dataa){
  try{
    var dataaModif = await generateMipMapIfNecessary(dataa);
    return new Promise((resolve) => {
      //console.log("insertion image "+dataa[10]+"...");
      //[[y1, x1], [y2, x2]]
      var imageBounds3 = [[convertToFloat(dataaModif[2]), convertToFloat(dataaModif[1])], [convertToFloat(dataaModif[6]), convertToFloat(dataaModif[5])]];
      const imageEvent = L.imageOverlay(dataaModif[11], imageBounds3, {
        interactive: true,
      });
      if(imageEvent == null) {
        console.error("Erreur dans la génération de l'image " + dataaModif[10]);
        resolve(null);
      }
      resolve(imageEvent);
    });
  } catch (error) {
    console.error("Erreur dans la génération de l'image:", error);
    //throw erreur;
    resolve(null);
  }
}
async function generateMarker(dataa){
  return new Promise((resolve) => {
    try{
      //console.log("insertion marker "+ description + "...");
      var greenIcon = L.icon({
        iconUrl: dataa[5],
        //shadowUrl:    'https://cdn.pixilart.com/photos/large/d26d92d3649555f.png',
        iconSize:     [dataa[3], dataa[4]], // size of the icon, 38;95 pour la feuille
        iconAnchor:   [dataa[3] / 2, dataa[4] / 2], // point of the icon which will correspond to marker's location, 22;94 pour la feuille
        popupAnchor:  [0, -dataa[4] / 2] // point from which the popup should open relative to the iconAnchor, -3;-76 pour la feuille
      });
      var markerRetour = L.marker([dataa[2], dataa[1]], {icon: greenIcon,}).bindPopup(dataa[6]);
      if(markerRetour == null) {
        console.error('Erreur lors du chargement du marker ' + dataa[6]);
        resolve(null);
      }
      else resolve(markerRetour);
    } catch (error) {
      console.error("Erreur dans le chargement de marqueur:", error);
      resolve(null);
      //throw erreur;
    }
  });
}
async function generateMarkerStatic(x,y,lx,ly,iconUrl){
  return new Promise((resolve) => {
    try{
      //console.log("insertion marker static "+iconUrl+"...");
      var greenIcon = L.icon({
      iconUrl,
      //shadowUrl:    'https://cdn.pixilart.com/photos/large/d26d92d3649555f.png',
      iconSize:     [lx, ly], // size of the icon, 38;95 pour la feuille
      iconAnchor:   [lx / 2, ly / 2], // point of the icon which will correspond to marker's location, 22;94 pour la feuille
      });
      var markerRetour = L.marker([convertToFloat(y), convertToFloat(x)], {icon: greenIcon, interactive: false});
      if(markerRetour == null) {
        console.error('Erreur lors du chargement du marker ' + dataa[6]);
        resolve(null);
      }
      else {
        resolve(markerRetour);
      }
    } catch (error) {
      console.error("Erreur dans le chargement de marqueur:", error);
      resolve(null);
      //throw erreur;
    }
  });
}
/**redimensionne une image, retourne un nouveau data avec unfound_img si redimentionnement impossible */
async function resizeImage(imageInfos, width, height) {
  return new Promise((resolve) => {
    if(imageInfos[19] == false) console.error("ne doit pas changer la taille d'une image sans requete de mipmap");
    try{
      const image2 = new Image();
      image2.crossOrigin = "anonymous";
      image2.src = imageInfos[11];
      image2.onload = () => {
        const imageInfos2 = [...imageInfos];
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
    
        ctx.drawImage(image2, 0, 0, width, height); //Dessiner l'image redimensionnée sur le Canvas
    
        try {
          const dataURL = canvas.toDataURL('image/png');//Convertir le Canvas en une URL de données
          imageInfos2[11] = dataURL;
          canvas.width = canvas.height = 0;//Libérer la mémoire utilisée par le Canvas
          resolve(imageInfos2);
        } catch (error) {
          //console.error(imageInfos2[12]);
          imageInfos2[11] = unfound_img;
          canvas.width = canvas.height = 0;
          resolve(imageInfos2);
        }
      };
      image2.onerror = () => {
        //console.log("Erreur resizeImage catched: " + imageInfos[12] + "===" + imageInfos[11]);
        resolve(null);
      };
    }
    catch (error) {
      //console.log("Erreur resizeImage catched: " + imageInfos[12] + "===" + imageInfos[11]);
      resolve(null);
      throw error;
    }
  });
}
function changePosImage3P(imageOverlay){
  var points = imageFocus.options.data;
  var moveX = mouseLng - points[8];
  var moveY = mouseLat - points[9];
  //console.log("move!");
  imageFocus.options.data[0] = points[0] + moveX;
  var px1 = imageFocus.options.data[0];
  imageFocus.options.data[1] = points[1] + moveY;
  var py1 = imageFocus.options.data[1];
  imageFocus.options.data[2] = points[2] + moveX;
  imageFocus.options.data[3] = points[3] + moveY;
  imageFocus.options.data[4] = points[4] + moveX;
  var px2 = imageFocus.options.data[4];
  imageFocus.options.data[5] = points[5] + moveY;
  var py2 = imageFocus.options.data[5];
  imageFocus.options.data[6] = points[6] + moveX;
  imageFocus.options.data[7] = points[7] + moveY;
  imageFocus.options.data[8] = points[8] + moveX;
  imageFocus.options.data[9] = points[9] + moveY;
  imageOverlay.setBounds([[py1, px1], [py2, px2]]);
  //changeSelectorPos();
  changeSelectorPos(points[8],points[9],points[0],points[1],points[2],points[3],points[4],points[5],points[6],points[7]);
}
