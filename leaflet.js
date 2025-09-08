//FICHIER REGROUPANT TOUTE LES FONCTIONS LIEES DIRECTEMENT A LEAFLET
let clickTimer = null; // Timer pour différencier clic et appui long
var isHolding = false;
var holdIntervalLL;
const LONG_PRESS_THRESHOLD = 100; // Durée en ms pour définir un appui long
let isMouseDown = false; // État de la souris
let isHandlingClickOrHold = false; //Empêche la double détection
//
class LeafletMap {
  #disableClick = false;
  #tiles = null;
  #mapObjetOnLLData = new Map();
  #map;
  constructor() {
    this.#map = L.map('map').setView([0, 0], 13).setZoom(2);
    this.#map.on('moveend', () => actualiseMap(mapListLeaflet, true));
    //
    // Exécuter cette fonction chaque fois que la variable est mise à jour
    this.#map.on('mousemove', (e) => {
      const texte = document.getElementById('texteCurseur');
      mousePos.y = e.latlng.lat; // valeur du textue
      mousePos.x = e.latlng.lng; 
      //maj du texte
      texte.innerHTML = `${mousePos.x.toFixed(3)} : ${mousePos.y.toFixed(3)}`;
      texte.style.color = 'white';
      texte.style.left = e.originalEvent.pageX + 20 + 'px';//position du texte
      texte.style.top = e.originalEvent.pageY - 10 + 'px';
      //
      //getOverlayRotatedParams();
    });
    this.#map.on('mousedown', async (e) => {
      //isHolding = true;
      down(e);
      if(!isHandlingClickOrHold) {
        isMouseDown = true; //Marque l'état comme appuyé
        //Lance un timer pour détecter un appui long
        clickTimer = setTimeout(async () => {
          if(isMouseDown) { //Si l'utilisateur maintient l'appui
            holdIntervalLL = setInterval(() => {spam();}, 10);//verifie toute les 100ms
            isHandlingClickOrHold = true; //Indique qu'on gère un appui long
            downConfirmee(e);
          }
        }, LONG_PRESS_THRESHOLD);
      }
    });
    //this.#map.on('popupopen', (e) => {console.log("Popup affiché avec succès !");});
    this.#map.on('mouseup', async(e) => {//Lors du relâchement
      isHolding = false;
      clearInterval(holdIntervalLL);//stop le spam
      isMouseDown = false; //Marque l'état comme relâché
      //Si le timer est encore actif, c'est un clic rapide
      if(clickTimer) {
        clearTimeout(clickTimer);
        clickTimer = null;
        //Si un appui long n'a pas été détecté
        if(!isHandlingClickOrHold) {click(e);}
        else{up(e);}//console.log("relachement");
      }
      isHandlingClickOrHold = false; //Réinitialise l'état*/
    });
  }
  /*retourne la liste des objets actuellement affichés sur la map*/
  getMap(){
    return this.#mapObjetOnLLData;
  }
  /**affiche une fenetre de texte html aux coordonnés précisés*/
  popup(data, content){
    try{
      //if (!data || !data.vPos || typeof data.vPos.yAbs !== "function" || typeof data.vPos.xAbs !== "function") {
      //  console.error("Invalid data.vPos provided for popup");
      //  return;
      //}
      if(data.vPos == null) throw new Error("position non comprise");
      var vPosData = null;
      if(data != null) vPosData = L.latLng(data.vPos.yAbs(),data.vPos.xAbs());
      else vPosData = L.latLng(0,0);
      //console.log("popup!");
      this.#map.closePopup();//Supprimer les anciens popups avant d'en ajouter un nouveau
      const popup = L.popup({ closeOnClick: false, autoClose: false, keepInView: true, zIndex: 9999 })//Créer un nouveau popup aux coordonnées de l'événement
      //.setLatLng(L.latLng(data.vPos.yAbs(),data.vPos.xAbs()))
      .setLatLng(vPosData)
      .setContent(content);
      popup.openOn(this.#map);
      if (!this.#map.getBounds().contains(vPosData))  this.#map.flyTo(vPosData, this.#map.getZoom());
      //detection
      const popupLatLng = popup.getLatLng();//Vérification de l'attachement du popup
      if(!popupLatLng) console.warn("Le popup n'a pas été correctement attaché.");
      //else console.log("Popup attaché à :", popupLatLng);
      this.#map.invalidateSize();
    } catch (error) {console.error("Erreur lors de la création du popup :", error);}
  }
  async actualiseMapLL(){
    await this.#map.invalidateSize();
  }
  /**active le déplacement*/
  async enableDragging(){
    await this.#map.dragging.enable();
  }
  /**désactive le déplacement*/
  async disableDragging(){
    await this.#map.dragging.disable();
  }
  /**verifie que le déplacement est désactivé*/
  async isDraggingDisabled(){
    return !this.#map.dragging;
  }
  /**ferme les fenetres leaflet si ouvertes*/
  closePopup(){
    this.#map.closePopup();
  }
  /**retourne la position sur l'écran en pixels d'une position sur la carte */
  toAbsoluteValue(v2f){
    return new V2F(this.#map.latLngToContainerPoint(toLLCoords(v2f)).x, this.#map.latLngToContainerPoint(toLLCoords(v2f)).y);
  }
  /**transforme un vecteur en valeur GPS */
  toGPSValue(v2f){
    return new V2F(this.#map.containerPointToLatLng(toLLPoint(v2f)).lng, this.#map.containerPointToLatLng(toLLPoint(v2f)).lat);
  }
  /**actualise les dépendances des objets et leur vecteurs pour tout les objets de la liste*/
  async actualiseMapTracee(){
    await actualiseMap(this.getMap(), true);
  }
  /**retourne la clé de l'objet a la position, null si non trouvé (vérifie uniquement les objets chargés)*/
  async findObjFocus(p){
    var retour = null;
    var plan = -1;
    var objDetecte = false;
    //console.log("balayage de " + this.#mapObjetOnLLData.size + " éléments...");
    //si l'objet n'est pas trop grand et que la pos d'y trouve: //peut en select plusieurs en un click, le rang du dernier sera gardé
    for (const [key, points] of this.#mapObjetOnLLData) {
      objDetecte = false;
           if(points.type == MARKER)  {if(await pointDansCarre(p,points.objetCarre[0].vPos.pAbs(),points.objetCarre[3].vPos.pAbs(),points.objetCarre[2].vPos.pAbs(),points.objetCarre[1].vPos.pAbs())  && plan < points.plan) objDetecte = true}
      else if(points.type == TEXTE)   {if(!await leaflet.isBig(points) && await pointDansCarre(p,points.vPos1.pAbs(),points.vPos2.pAbs(),points.vPos3.pAbs(),points.vPos4.pAbs())                      && plan < points.plan) objDetecte = true}
      else if(points.type == IMAGE)   {if(!await leaflet.isBig(points) && !points.isMipmap && await pointDansCarre(p,points.vPos1.pAbs(),points.vPos2.pAbs(),points.vPos3.pAbs(),points.vPos4.pAbs())  && plan < points.plan) objDetecte = true};
      if(objDetecte == true) {
        plan = points.plan;
        retour = points.key;
      }
    }
    //if(retour != null) console.log("objet trouvé !");
    return retour;
  }
  /**Ajoute ou supprime un objet à leaflet depuis la liste des commandes complète en fonction de son état actif ou non et de ces sous-objets*/
  async updateObj(data){
    try{
      if(!data && !data.objet) throw new Error(`L'objet à traiter est invalide ou manquant (${data?.type || "inconnu"})`);
      if(data.type != POLYLIGNE){
        //insertion sur la map...
        if(data.actif){
          if(data.objetVecteur != null) if(data.objetVecteur.actif) this.#addObjReal(data.objetVecteur);
          if(data.objetCarre != null) for(var i = 0; i < data.objetCarre.length; i++) if(data.objetCarre[i].actif) this.#addObjReal(data.objetCarre[i]);
          //
          if(data.objetVecteur != null) if(!data.objetVecteur.actif) this.#removeObj(data.objetVecteur);
          if(data.objetCarre != null) for(var i = 0; i < data.objetCarre.length; i++) if(!data.objetCarre[i].actif) this.#removeObj(data.objetCarre[i]);
        }
        else if(!data.actif){
          if(data.objetVecteur != null) if(!data.objetVecteur.actif) this.#removeObj(data.objetVecteur);
          if(data.objetCarre != null) for(var i = 0; i < data.objetCarre.length; i++) if(!data.objetCarre[i].actif) this.#removeObj(data.objetCarre[i]);
        }
        //traitement objet principal
        if(data.actif)  this.#addObjReal(data);
        else            this.#removeObj(data);
        //traceMap(this.#mapObjetOnLLData);
      }
    } catch(error) {throw new Error("Erreur dans l'insertion d'objet leaflet:" + error);}
  }
  /**insert un objet dans les 2 listes (liste leaflet et liste de donnée) si l'objet n'est pas déja existant*/
  async #addObjReal(data){
    if (!data || !data.objet || !data.type) throw new Error("Données invalides : 'data' doit contenir 'objet' et 'type'.");
    if(!(await this.ifObjExist(this.#map, dataToObject(data)))) {
      this.#mapObjetOnLLData.set(data.key, data);
      dataToObject(data).addTo(this.#map);
    }
  }
  /**test si un objet similaire éxiste dans la map, prend un objet en parametre*/
  /*async ifObjExist(map, obj){
    try{
      var retour = false;
      map.eachLayer((layer) => {
        if(layer == obj) retour = true;
      });
      return  retour;
    } catch(error) {
      console.error("Erreur dans l'insertion d'objet leaflet");
      throw error;
    }
  }*/
  /**test si un objet similaire éxiste dans la map, prend un objet en parametre*/
  async ifObjExist(map, obj){
    try {
      return map.hasLayer(obj);
    } catch (error) {
      console.error("Erreur dans la vérification d'existence de l'objet Leaflet:", error);
      throw error;
    }
  }
  /**supprime un élément de la liste, ne fait rien si non trouvé*/
  async #removeObj(data){
    if (!data || !data.objet || !data.type) throw new Error("Données invalides : 'data' doit contenir 'objet' et 'type':", data);
    if((await this.ifObjExist(this.#map, dataToObject(data)))) {
      this.#map.removeLayer(dataToObject(data));
      this.#mapObjetOnLLData.delete(data.key);
    }
    //traceMap(this.#mapObjetOnLLData);
  }
  /**Supprime tout les éléments enregistrés dans leaflet, sauf les popups globaux et la tilemap globale dans le cas d'une suppression partielle*/
  async removeAllObj(removetotal){
    try{
      if(removetotal){
        this.#map.eachLayer((layer) => {this.#map.removeLayer(layer);});
        this.#mapObjetOnLLData.clear();
      }
      else {
        //content.objet instanceof L.Layer <- ne marche pas pour les polylignes (content.objet[0] instanceof L.Layer)
        for(const [key, content] of this.#mapObjetOnLLData) if(!(content.objet instanceof L.Popup) && !(content.objet instanceof L.TileLayer)) this.#removeObj(content);
      }
    } catch(error) {throw new Error("Erreur dans la suppression d'objet leaflet: " + error)};
  }
  /**retourne le nombre d'objets détecté dans la carte leaflet */
  async getNbObjets(){
    var nb = 0;
    this.#map.eachLayer(function(layer) {nb++;});
    return nb;
  }
  /**retourne les coordonnés des bords de la carte leaflet (long lat coords)*/
  async getMapBounds(){
    return await this.#map.getBounds();
  }
  /**Fonction qui actualise l'état de l'objet sur la map*/
  async actualiseObj(data){
    if(data.actif && await !ifObjExist(this.#map, data.obj)) await this.#addObjReal(data);
    else if(!data.actif && await !ifObjExist(this.#map, data.obj)) await this.#removeObj(data);
  }
  /**affiche le nb d'éléments présents dans la map leaflet */
  async stats(){
    var i = 0;
    this.#map.eachLayer(function(element) {i++;});
    console.log("nb élements sur la carte: " + i);
    console.log("nb élements sur la liste leaflet: " + objListLeaflet.length);
  }
  /**test si la data d'une image serait trop petite a l'écran */
  async isShort(data){
    var retour = false;
    //retour = true si taille de l'objet > tailleMini
    if(data.type == IMAGE) retour = ((((await this.getMapBounds()).getNorthEast().lng - (await this.getMapBounds()).getSouthWest().lng) / 20) > (data.vTaille.x < data.vTaille.y ? data.vTaille.x : data.vTaille.y));
    return retour;
  }
  /**test si la data d'une image l'image serait trop grande a l'écran */
  async isBig(data){
    var retour = false;
    //retour = true si taille de l'objet < tailleMaxi
    if(data.type == IMAGE) retour = ((((await this.getMapBounds()).getNorthEast().lng - (await this.getMapBounds()).getSouthWest().lng)) < (data.vTaille.x > data.vTaille.y ? data.vTaille.x : data.vTaille.y));
    return retour;
  }
  getZoomLvl(){
    return this.#map.getZoom();
  }
}
/**generation d'objet, retourne la data comprenant l'objet correspondant*/
async function generateObject(data){
  //Génère une image réduite depuis une image classique, retourne l'objet existant modifié
  if(data.type == IMAGE) if(data.isMipmap) await resizeImage(data, new V2F(10, 10));
  if(data.type == MARKER) await resizeImage(data, new V2F(100, 100));
  //
  return new Promise(async (resolve) => {
    try{
      var objEvent = null;
      switch(data.type){
        case TILEMAP_DEFAULT:
          objEvent = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          });
        break; case IMAGE:
          if(data.vAngle == null){//image sans angle
            //[[y1, x1], [y2, x2]] : p1y,p1x,p3y,p3x
            var imageBounds3 = [toLLTabl(data.vPos1), toLLTabl(data.vPos3)];
            objEvent = L.imageOverlay(data.url, imageBounds3, {//url
              interactive: true,
              zIndex: data.plan,
            });
          }
          else{//image avec angle
            //point2,point1,point4: p4y, p4x, p3y, p3x, p1y, p1x
            objEvent = L.imageOverlay.rotated(data.url, toLLCoords(data.vPos4), toLLCoords(data.vPos3), toLLCoords(data.vPos1), { 
              opacity: 1,
              interactive: true,
              vAngle: data.vAngle,
              zIndex: data.plan,
            });
          }
        break; case MARKER:
          var greenIcon = L.icon({
            iconUrl:      data.url,
            iconSize:     [data.vTaille.x, data.vTaille.y], // size of the icon, 38;95 pour la feuille
            iconAnchor:   [data.vTaille.x /2, data.vTaille.y /2], // point of the icon which will correspond to marker's location, 22;94 pour la feuille
            popupAnchor:  [0, -data.vTaille.x / 2] // point from which the popup should open relative to the iconAnchor, -3;-76 pour la feuille
          });
          objEvent = L.marker(toLLTabl(data.vPos), {icon: greenIcon,});
        break; case TEXTE:
          objEvent = L.imageOverlay.rotated(data.url, toLLCoords(data.vPos4), toLLCoords(data.vPos3), toLLCoords(data.vPos1), { 
            zIndex: data.plan,
          });
        break; case MARKER_STATIC_MS:
          var greenIcon = L.icon({
          iconUrl:       data.url,
          iconSize:     [data.vTaille.y, data.vTaille.x], //size of the icon, 38;95 pour la feuille
          iconAnchor:   [data.vTaille.y / 2, data.vTaille.x / 2], //point of the icon which will correspond to marker's location, 22;94 pour la feuille
          });
          objEvent = L.marker(toLLTabl(data.vPos), {icon: greenIcon, interactive: false});
        break; case POLYLIGNE:
          var obj1 = L.polyline([
            [data.vPos.yAbs(), data.vPos.xAbs()],
            [data.vPos2.yAbs(), data.vPos2.xAbs()]
          ], { color: 'red', weight: 1 });
          var obj2 = L.polylineDecorator(obj1,
            {
              patterns: [
                {
                  //Motif pour les tirets
                  offset: '0%',       //Commence au début
                  repeat: '15px',     //Espacement entre les tirets
                  symbol: L.Symbol.dash({
                    pixelSize: 15,  //Taille du tiret
                    pathOptions: { color: 'red', weight: 1 }
                  })
                },
                {
                  //Motif pour les flèches
                  offset: '100%',     //Place les flèches à la fin de chaque segment
                  repeat: '20%',      //Espacement des flèches
                  symbol: L.Symbol.arrowHead({
                    pixelSize: 8,   //Taille des flèches
                    headAngle: 45,  //Angle de la flèche
                    pathOptions: { color: 'red', fillOpacity: 1 }
                  })
                }
              ]
            }
          );
          objEvent = [obj1,obj2];
        break; default:
        throw new Error("etat non compris:" + data.type);
      }
      if(objEvent == null) {
        console.error("Erreur dans la génération de l'image " + data.titre);
        resolve(null);
      }
      else {
        data.objet = objEvent;
        data.vPos.setData(data);
        data.key = generateCleUnique();//creer cle
        resolve(data);
      }
    } catch (error) {
      console.error("Erreur dans la génération de l'objet ", error);//throw error;
      resolve(null);
    }
  });
}
/**redimensionne l'image focus, retourne le data éxistant avec unfound_img si redimensionnement impossible */
async function resizeImage(data, l) {
  return new Promise((resolve) => {
    //if(!data.isMipmap) console.error("ne doit pas changer la taille d'une image sans requete de mipmap");
    try{
      const image2 = new Image();
      image2.crossOrigin = "anonymous";
      image2.src = data.url;
      image2.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = l.x;
        canvas.height = l.y;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image2, 0, 0, l.x, l.y); //Dessiner l'image redimensionnée sur le Canvas
        try {
          const dataURL = canvas.toDataURL('image/png');//Convertir le Canvas en une URL de données
          data.url = dataURL;
          canvas.width = canvas.height = 0;//Libérer la mémoire utilisée par le Canvas
          resolve(data);
        } catch (error) {
          //console.error(imageInfos2[12]);
          data.url = unfound_img;
          canvas.width = canvas.height = 0;
          resolve(data);
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
async function updatePosOnLLObj(data){
  if(data.type == IMAGE || data.type == TEXTE){
    if(data.vAngle == null) await data.objet.setBounds([[data.vPos1.yAbs(), data.vPos1.xAbs()], [data.vPos3.yAbs(), data.vPos3.xAbs()]]);//image select
    else await data.objet.reposition(toLLCoords(data.vPos4),toLLCoords(data.vPos3),toLLCoords(data.vPos1));
  }
  else if(data.type == POLYLIGNE) await data.objet[0].setLatLngs([toLLTabl(data.vPos),toLLTabl(data.vPos2)]);
  else if(data.type == MARKER) {
    await data.objet.setLatLng([data.vPos.yAbs(), data.vPos.xAbs()]);
    const ps = leaflet.toAbsoluteValue(data.vPos);
    data.vPos1 = leaflet.toGPSValue(new V2F(ps.x - (data.vTaille.x / 2 + 2), ps.y - (data.vTaille.y / 2 + 2)));
    data.vPos2 = leaflet.toGPSValue(new V2F(ps.x + (data.vTaille.x / 2 + 2), ps.y - (data.vTaille.y / 2 + 2)));
    data.vPos3 = leaflet.toGPSValue(new V2F(ps.x + (data.vTaille.x / 2 + 2), ps.y + (data.vTaille.y / 2 + 2)));
    data.vPos4 = leaflet.toGPSValue(new V2F(ps.x - (data.vTaille.x / 2 + 2), ps.y + (data.vTaille.y / 2 + 2)));
  }
  if(data.type == IMAGE || data.type == TEXTE || data.type == MARKER){
    if(data.objetVecteur != null) await data.objetVecteur.objet[0].setLatLngs([toLLTabl(data.objetVecteur.vPos),toLLTabl(data.objetVecteur.vPos2)]);
    if(data.objetCarre != null) {
      data.objetCarre[0].vPos = data.vPos1;
      data.objetCarre[1].vPos = data.vPos2;
      data.objetCarre[2].vPos = data.vPos3;
      data.objetCarre[3].vPos = data.vPos4;
      data.objetCarre[0].vPos2 = data.objetCarre[1].vPos;
      data.objetCarre[1].vPos2 = data.objetCarre[2].vPos;
      data.objetCarre[2].vPos2 = data.objetCarre[3].vPos;
      data.objetCarre[3].vPos2 = data.objetCarre[0].vPos;
      data.objetCarre[0].objet[0].setLatLngs([toLLTabl(data.objetCarre[0].vPos),toLLTabl(data.objetCarre[0].vPos2)]);
      data.objetCarre[1].objet[0].setLatLngs([toLLTabl(data.objetCarre[1].vPos),toLLTabl(data.objetCarre[1].vPos2)]);
      data.objetCarre[2].objet[0].setLatLngs([toLLTabl(data.objetCarre[2].vPos),toLLTabl(data.objetCarre[2].vPos2)]);
      data.objetCarre[3].objet[0].setLatLngs([toLLTabl(data.objetCarre[3].vPos),toLLTabl(data.objetCarre[3].vPos2)]);
    } 
  }
}
/**vérifie si un objet similaire éxiste dans l'écran*/
async function objectPosInScreen(data) {
        if(data.type == TILEMAP_DEFAULT)   return true;
  else  if(data.type == IMAGE)             return (await leaflet.getMapBounds()).intersects([[toLLTabl(data.vPos3.pAbs())], [toLLTabl(data.vPos1.pAbs())]]);
  else  if(data.type == MARKER)            return (await leaflet.getMapBounds()).contains(toLLTabl(data.vPos));
  else  if(data.type == MARKER_STATIC_MS)  return (await leaflet.getMapBounds()).contains([selectorPos.y, selectorPos.x])
  else  if(data.type == POLYLIGNE)         return true;
  return false;
}
/**convertis un vecteur en coordonnés leaflet */
function toLLCoords(v2f){
  if(v2f == null) throw new Error("v2f nul");
  if (!(v2f instanceof V2F)) throw new Error("L'objet n'est pas une instance de V2F");
  return L.latLng(v2f.yAbs(),v2f.xAbs());
}
/**retourne un tableau de format [yAbs,xAbs] */
function toLLTabl(v2f){
  if(v2f == null) throw new Error("v2f nul");
  if (!(v2f instanceof V2F)) throw new Error("L'objet n'est pas une instance de V2F");
  return [v2f.yAbs(), v2f.xAbs()];
}
/**convertis un vecteur en point leaflet */
function toLLPoint(v2f){
  return L.point(v2f.x, v2f.y)
}
/**prend en parametre une data et traite l'objet, si detection de polyligne, renvoie l'objet 0 de la chaine, sinon son objet*/
function dataToObject(data){
  if(data == null) throw new Error("objet nul");
  if(data.type == POLYLIGNE) return data.objet[0];
  else return data.objet;
}
