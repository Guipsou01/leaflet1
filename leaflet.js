//FICHIER REGROUPANT TOUTE LES FONCTIONS LIEES DIRECTEMENT A LEAFLET
var tiles = null;
var popupSelect;
var disableClick = false;


class LeafletMap {
  #map;
  constructor() {
    this.#map = L.map('map').setView([0, 0], 13).setZoom(2);
    this.#map.on('moveend', this.actualiseMap.bind(this));
    //
    // Exécuter cette fonction chaque fois que la variable est mise à jour
    this.#map.on('mousemove', (e) => {
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
    this.#map.on('click', async (e) => {
      try{
        //console.log("click");
        if(disableClick == false){
          await mush.reset();
          var layerFin = await this.findObjFocus(e.latlng.lng, e.latlng.lat);//rang obj focus si objet a focus detecte au niveau de la souris
          if(layerFin != -1) {
            await mush.insertObjetFocus(layerFin);
            await mush.action();
          }
        }
        else disableClick = false;
      }
      catch (error) {throw error;}
    });
    this.#map.on('mousedown', async (e) => {
      var layerFin = await this.findObjFocus(e.latlng.lng, e.latlng.lat);//rang obj focus si objet a focus detecte au niveau de la souris
      if(layerFin != -1) {
        await mush.insertObjetFocus(layerFin);
        await mush.action();
        mush.MouseAppui();
      }
    });
    this.#map.on('mouseup', (e) => {mush.mouseRelache();});
  }
  /**--*/
  popup(x, y, content){
    //console.log("affiche popup");
    popupSelect = L.popup()
    .setLatLng(L.latLng(y,x))
    .setContent(content)
    .openOn(this.#map);
  }
  /**--*/
  async enableDragging(){
    await this.#map.dragging.enable();
  }
  /**--*/
  async disableDragging(){
    await this.#map.dragging.disable();
  }
  /**--*/
  async isDraggingDisabled(){
    return this.#map.dragging == false;
  }
  /**--*/
  async closePopup(){
    await this.#map.closePopup();
  }
  /**test si un objet similaire éxiste dans la liste leaflet, prend un objet en parametre*/
  async ifObjExist(obj){
    try{
      var retour = false;
      this.#map.eachLayer((layer) => {
        if(layer == obj) {retour = true;}
      });
      return  retour;
    } catch(error) {
      console.error("Erreur dans l'insertion d'objet leaflet");
      throw error;
    }
  }
  async findObjFocus(long, lat){
    var retour = -1;
    for(var i = 0; i < objListLeaflet.length; i++){
      var points = objListLeaflet[i][0];
      if(points[0] == IMAGE){
        //si l'objet n'est pas trop grand, n'est pas un mipmap, et que la pos s'y trouve: peut en select plusieurs en un click, le rang du dernier sera gardé
        if(!await isBig(points) && points[12] == false && await pointDansCarre(long,lat,points[3][2],points[3][3],points[3][4],points[3][5],points[3][6],points[3][7],points[3][8],points[3][9])) retour = i;
      }
      else if(points[0] == TEXT){
        //si l'objet n'est pas trop grand et que la pos d'y trouve: //peut en select plusieurs en un click, le rang du dernier sera gardé
        if(!await isBig(points) && await pointDansCarre(long,lat,points[3][2],points[3][3],points[3][4],points[3][5],points[3][6],points[3][7],points[3][8],points[3][9])) retour = i;
      }
    }
    return retour;
  }
  /**Ajoute un objet à leaflet depuis la liste des commandes complète si celui ci n'est pas déja éxistant */
  async addObj(rg){
    try{
      if(rg >= objListLeaflet.length || rg < 0) console.error("Le rang a rajouter ne correspond a aucun élément de la liste des objets: " + rg + " taille liste: " + objListLeaflet.length);
      //si l'objet doit etre affiché et l'objet n'éxiste pas déja
      else if(objListLeaflet[rg][3] == true && (await this.ifObjExist(objListLeaflet[rg][1])) == false) await objListLeaflet[rg][1].addTo(this.#map);
    } catch(error) {
      console.error("Erreur dans l'insertion d'objet leaflet");
      throw error;
    }
  }
  /**Supprime tout les éléments enregistrés dans leaflet, sauf les popups globaux et la tilemap globale*/
  async removeAllObj(removetotal){
    try{
      if(removetotal == true){
        this.#map.eachLayer((layer) => {
          if (!(layer instanceof L.Popup)) this.#map.removeLayer(layer);
        });
      }
      else {
        this.#map.eachLayer((layer) => {
          if (!(layer instanceof L.Popup) && !(layer instanceof L.TileLayer)) this.#map.removeLayer(layer);
        });
      }
    } catch(error) {
      console.error("Erreur dans la suppression d'objet leaflet");
      throw error;
    }
  }
  /**supprime tout les éléments d'une carte, vérifie le tracage de nouveaux éléments et les insère dans la carte*/
  async actualiseMap(){
    try{
      await this.removeAllObj(false);
      for (var i = 0; i < objListLeaflet.length; i++) {
        await calculTracabilite(i);
        this.addObj(i);
      }
      //stats();
    } catch(error) {
      console.error("Erreur dans la suppression d'objet leaflet");
      throw error;
    }
  }
  async getNbObjets(){
    var nb = 0;
    this.#map.eachLayer(function(layer) {nb++;});
    return nb;
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
  async stats(){
    var i = 0;
    this.#map.eachLayer(function(element) {i++;});
    console.log("nb élements sur la carte: " + i);
    console.log("nb élements sur la liste leaflet: " + objListLeaflet.length);
  }
}
/**configure l'objet pour générer une version mipmapée */
function toMipMap(data){
  const data2 = [...data];
  data2[12] = true;
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
  if(dataa[12] == true){//si mipmap
    dataaModif = await resizeImage(dataa, 10, 10);
    if(dataaModif == null) {
      dataaModif = [...dataa]; //format d'image non scalable
      dataaModif[4] = unfound_img;
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
/*generation d'image */
async function generateImage(dataa){
  var dataaModif = await generateMipMapIfNecessary(dataa);
  return new Promise((resolve) => {
    try{
      //console.log(dataa);
      if(dataa[13] == null) dataa[13] = 0;
      if(dataa[13] == null){//image sans angle
        //[[y1, x1], [y2, x2]] : p1y,p1x,p3y,p3x
        var imageBounds3 = [[convertToFloat(dataaModif[3][3]), convertToFloat(dataaModif[3][2])], [convertToFloat(dataaModif[3][7]), convertToFloat(dataaModif[3][6])]];
        const imageEvent = L.imageOverlay(dataaModif[4], imageBounds3, {//url
          interactive: true,
          zIndex: dataa[1],
        });
        if(imageEvent == null) {
          console.error("Erreur dans la génération de l'image " + dataaModif[5]);
          resolve(null);
        }
        resolve(imageEvent);
      }
      else{//image avec angle
        //point2,point1,point4: p4y, p4x, p3y, p3x, p1y, p1x
        const imageEvent = L.imageOverlay.rotated(dataaModif[4], L.latLng(dataaModif[3][9], dataaModif[3][8]), L.latLng(dataaModif[3][7], dataaModif[3][6]), L.latLng(dataaModif[3][3], dataaModif[3][2]), { 
          opacity: 1,
          interactive: true,
          angle: dataaModif[13],
          zIndex: dataa[1],
        });
        if(imageEvent == null) {
          console.error("Erreur dans la génération de l'image " + dataaModif[5]);
          resolve(null);
        }
        resolve(imageEvent);
      }
    } catch (error) {
      console.error("Erreur dans la génération de l'image ", error);
      //throw error;
      resolve(null);
    }
  });
}
async function generateMarker(dataa){
  return new Promise((resolve) => {
    try{
      //console.log("insertion marker "+ description + "...");
      var greenIcon = L.icon({
        iconUrl: dataa[4],
        //shadowUrl:    'https://cdn.pixilart.com/photos/large/d26d92d3649555f.png',
        iconSize:     [dataa[3][3], dataa[3][2]], // size of the icon, 38;95 pour la feuille
        iconAnchor:   [dataa[3][3] /2, dataa[3][2] /2], // point of the icon which will correspond to marker's location, 22;94 pour la feuille
        popupAnchor:  [0, -dataa[3][2] / 2] // point from which the popup should open relative to the iconAnchor, -3;-76 pour la feuille
      });
      var markerRetour = L.marker([dataa[3][1], dataa[3][0]], {icon: greenIcon,}).bindPopup(dataa[5]);
      if(markerRetour == null) {
        console.error('Erreur lors du chargement du marker ' + dataa[5]);
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
async function generateText(dataa){
  return new Promise((resolve) => {
    try{
      const bounds = [[dataa[3][1], dataa[3][0]], [dataa[3][1] + 1, dataa[3][0] + 4]];//Définir les coordonnées pour l'image sur la carte
      const textEvent = L.imageOverlay(dataa[6], bounds, {//Utiliser imageOverlay pour ajouter l'image sur la carte
        zIndex: dataa[1],
      });
      if(textEvent == null) {
        console.error("Erreur dans la génération de l'image " + dataaModif[5]);
        resolve(null);
      }
      resolve(textEvent);
    }
    catch (error) {
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
        console.error('Erreur lors du chargement du marker ' + dataa[5]);
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
/**redimensionne une image, retourne un nouveau data avec unfound_img si redimentionnement impossible */
async function resizeImage(imageInfos, width, height) {
  return new Promise((resolve) => {
    if(imageInfos[12] == false) console.error("ne doit pas changer la taille d'une image sans requete de mipmap");
    try{
      const image2 = new Image();
      image2.crossOrigin = "anonymous";
      image2.src = imageInfos[4];
      image2.onload = () => {
        const imageInfos2 = [...imageInfos];
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image2, 0, 0, width, height); //Dessiner l'image redimensionnée sur le Canvas
        try {
          const dataURL = canvas.toDataURL('image/png');//Convertir le Canvas en une URL de données
          imageInfos2[4] = dataURL;
          canvas.width = canvas.height = 0;//Libérer la mémoire utilisée par le Canvas
          resolve(imageInfos2);
        } catch (error) {
          //console.error(imageInfos2[12]);
          imageInfos2[4] = unfound_img;
          canvas.width = canvas.height = 0;
          resolve(imageInfos2);
        }
      };
      image2.onerror = () => {resolve(null);};
    }
    catch (error) {
      resolve(null);
      throw error;
    }
  });
}
/**met a jour les positions de l'objet dans leaflet de la ligne correspondante (mettre la ligne complète en parametre, après modifications de positions)*/
async function updatePosOnLLObj(rangDeListe){
  var points = objListLeaflet[rgImageFocus][0];
  if(points[0] == IMAGE){
    if(points[13] == null){//si image fixe
      await objListLeaflet[rgImageFocus][1].setBounds([[points[3][3], points[3][2]], [points[3][7], points[3][6]]]);//image select
      await objListLeaflet[rgImageFocus + 1][1].setBounds([[points[3][3], points[3][2]], [points[3][7], points[3][6]]]);//equivalent mipmap
    }
    else{
      await objListLeaflet[rgImageFocus][1].reposition(L.latLng(points[3][9],points[3][8]),L.latLng(points[3][7],points[3][6]),L.latLng(points[3][3],points[3][2]));
      await objListLeaflet[rgImageFocus + 1][1].reposition(L.latLng(points[3][9],points[3][8]),L.latLng(points[3][7],points[3][6]),L.latLng(points[3][3],points[3][2]));
    }
  }
  else if(points[0] == TEXT){
    await objListLeaflet[rgImageFocus][1].setBounds([[points[3][3], points[3][2]], [points[3][7], points[3][6]]]);//image select
  }
}
