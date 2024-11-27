//FICHIER REGROUPANT TOUTE LES FONCTIONS LIEES DIRECTEMENT A LEAFLET

class LeafletMap {
  #popupSelect;
  #disableClick = false;
  #tiles = null;
  #map;
  constructor() {
    this.#map = L.map('map').setView([0, 0], 13).setZoom(2);
    this.#map.on('moveend', actualiseMap.bind(this));
    //
    // Exécuter cette fonction chaque fois que la variable est mise à jour
    this.#map.on('mousemove', (e) => {
      const texte = document.getElementById('texteCurseur');
      mousePos.y = e.latlng.lat; // valeur du textue
      mousePos.x = e.latlng.lng; 
      //maj du texte
      texte.innerHTML = `${mousePos.x.toFixed(3)} : ${mousePos.y.toFixed(3)}`;
      //
      texte.style.color = 'white';
      texte.style.left = e.originalEvent.pageX + 20 + 'px';//position du texte
      texte.style.top = e.originalEvent.pageY - 10 + 'px';
      //
      //getOverlayRotatedParams();
    });
    this.#map.on('click', async (e) => {//click sur la carte
      try{
        if(!this.#disableClick && mush.isActif()){
          await mush.reset();
          var layerFin = await this.findObjFocus(await new V2F(e.latlng.lng, e.latlng.lat));//rang obj focus si objet a focus detecte au niveau de la souris
          if(layerFin != null) {
            await mush.insertObjetFocus(layerFin);
            await mush.action();
          }
        }
        else this.#disableClick = false;
      }
      catch (error) {throw error;}
    });
    this.#map.on('mousedown', async (e) => {//appui bas sur la carte
      if(mush.isActif()){
        var layerFin = await this.findObjFocus(await new V2F(e.latlng.lng, e.latlng.lat));//rang obj focus si objet a focus detecte au niveau de la souris
        if(layerFin != null) {//si objet trouv" a l'appui
          await mush.insertObjetFocus(layerFin);
          await mush.action();
          mush.MouseAppui();
        }
      }
    });
    this.#map.on('mouseup', (e) => {//appui relaché sur la carte
      if(mush.isActif()){
        mush.mouseRelache();
      }
    });
  }
  /**affiche une fenetre de texte html aux coordonnés précisés*/
  popup(data, content){
    this.#popupSelect = L.popup()
    .setLatLng(L.latLng(data.vPos.yAbs(),data.vPos.xAbs()))
    .setContent(content)
    .openOn(this.#map);
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
  async closePopup(){
    await this.#map.closePopup();
  }
  /**test si un objet similaire éxiste dans la liste leaflet, prend un objet en parametre*/
  async ifObjExist(obj){
    try{
      var retour = false;
      this.#map.eachLayer((layer) => {
        if(layer == obj) retour = true;
      });
      return  retour;
    } catch(error) {
      console.error("Erreur dans l'insertion d'objet leaflet");
      throw error;
    }
  }
  /**retourne la position sur l'écran en pixels d'une position sur la carte */
  toAbsoluteValue(v2f){
    return new V2F(this.#map.latLngToContainerPoint(toLLCoords(v2f)).x, this.#map.latLngToContainerPoint(toLLCoords(v2f)).y);
  }
  toGPSValue(v2f){
    return new V2F(this.#map.containerPointToLatLng(toLLPoint(v2f)).lng, this.#map.containerPointToLatLng(toLLPoint(v2f)).lat);
  }
  /*retourne la clé de l'objet a la position, null si non trouvé */
  async findObjFocus(p){
    var retour = null;
    var plan = -1;
    for (const [key, points] of mapListLeaflet) {
      if(points.type == MARKER){
        if(await pointDansCarre(p,points.objetCarre[0].vPos.pAbs(),points.objetCarre[3].vPos.pAbs(),points.objetCarre[2].vPos.pAbs(),points.objetCarre[1].vPos.pAbs())) {
          if(plan < points.plan) {
            plan = points.plan;
            retour = key;
          }
        }
      }
      else if(points.type == TEXTE){
        //si l'objet n'est pas trop grand et que la pos d'y trouve: //peut en select plusieurs en un click, le rang du dernier sera gardé
        if(!await leaflet.isBig(points) && await pointDansCarre(p,points.vPos1,points.vPos2,points.vPos3,points.vPos4)) {
          if(plan < points.plan) {
            plan = points.plan;
            retour = key;
          }
        }
      }
      else if(points.type == IMAGE){
        //si l'objet n'est pas trop grand, n'est pas un mipmap, et que la pos s'y trouve: peut en select plusieurs en un click, le rang du dernier sera gardé
        if(!await leaflet.isBig(points) && !points.isMipmap && await pointDansCarre(p,points.vPos1.pAbs(),points.vPos2.pAbs(),points.vPos3.pAbs(),points.vPos4.pAbs())) {
          if(plan < points.plan) {
            plan = points.plan;
            retour = key;
          }
        }
      }
    }
    return retour;
  }
  /**Ajoute un objet à leaflet depuis la liste des commandes complète si celui ci n'est pas déja éxistant */
  async addObj(data){
    try{
      if(data == null) throw new Error("l'objet a rajouter est nul");
      if(data.objet == null) throw new Error("l'objet a rajouter est nul2 " + data.type);
      //si l'objet doit etre affiché et l'objet n'éxiste pas déja
      else if(data.actif && !(await this.ifObjExist(data.objet))) {
        //insertion sur la map...
        if(data.type == POLYLIGNE) await data.objet[0].addTo(this.#map);
        else await data.objet.addTo(this.#map);
        if(data.objetVecteur != null && vecteurVisu) {
          data.objetVecteur.objet[0].addTo(this.#map);
        }
        if(data.objetCarre != null && vecteurVisu){
          data.objetCarre[0].objet[0].addTo(this.#map);
          data.objetCarre[1].objet[0].addTo(this.#map);
          data.objetCarre[2].objet[0].addTo(this.#map);
          data.objetCarre[3].objet[0].addTo(this.#map);
        }
      }
    } catch(error) {
      throw new Error("Erreur dans l'insertion d'objet leaflet:" + error);
    }
  }
  /**Supprime tout les éléments enregistrés dans leaflet, sauf les popups globaux et la tilemap globale*/
  async removeAllObj(removetotal){
    try{
      if(removetotal){
        this.#map.eachLayer((layer) => {
          if(!(layer instanceof L.Popup)) this.#map.removeLayer(layer);
        });
      }
      else {
        this.#map.eachLayer((layer) => {
          if(!(layer instanceof L.Popup) && !(layer instanceof L.TileLayer)) this.#map.removeLayer(layer);
        });
      }
    } catch(error) {
      console.error("Erreur dans la suppression d'objet leaflet");
      throw error;
    }
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
    if(data.actif && await !ifObjExist(data.obj)) await data.obj.addTo(this.#map);
    else if(!data.actif && await !ifObjExist(data.obj)) await map.removeLayer(data.obj);
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
        break;
        case IMAGE:
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
        break;
        case MARKER:
          var greenIcon = L.icon({
            iconUrl:      data.url,
            iconSize:     [data.vTaille.x, data.vTaille.y], // size of the icon, 38;95 pour la feuille
            iconAnchor:   [data.vTaille.x /2, data.vTaille.y /2], // point of the icon which will correspond to marker's location, 22;94 pour la feuille
            popupAnchor:  [0, -data.vTaille.x / 2] // point from which the popup should open relative to the iconAnchor, -3;-76 pour la feuille
          });
          objEvent = L.marker(toLLTabl(data.vPos), {icon: greenIcon,});
          break;
        case TEXTE:
          objEvent = L.imageOverlay.rotated(data.url, toLLCoords(data.vPos4), toLLCoords(data.vPos3), toLLCoords(data.vPos1), { 
            zIndex: data.plan,
          });
        break;
        case MARKER_STATIC_MS:
          var greenIcon = L.icon({
          iconUrl:       data.url,
          iconSize:     [data.vTaille.y, data.vTaille.x], //size of the icon, 38;95 pour la feuille
          iconAnchor:   [data.vTaille.y / 2, data.vTaille.x / 2], //point of the icon which will correspond to marker's location, 22;94 pour la feuille
          });
          objEvent = L.marker(toLLTabl(data.vPos), {icon: greenIcon, interactive: false});
        break;
        case POLYLIGNE:
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
        break;
        default:
        throw new Error("etat non compris:" + data.type);
      }
      if(objEvent == null) {
        console.error("Erreur dans la génération de l'image " + data.titre);
        resolve(null);
      }
      else {
        data.objet = objEvent;
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
    if(!data.isMipmap) console.error("ne doit pas changer la taille d'une image sans requete de mipmap");
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
  if(data.type == IMAGE){
    //
    /*const p1 = new V2F(- data.vTaille.x /2, - data.vTaille.y /2);
    p1.po = data.vPos;
    if(data.vAngle != null) p1.applyRotationDecalage(data.vAngle);
    const p2 = new V2F(+ data.vTaille.x /2, - data.vTaille.y /2);
    p2.po = data.vPos;
    if(data.vAngle != null) p2.applyRotationDecalage(data.vAngle);
    const p3 = new V2F(+ data.vTaille.x /2, + data.vTaille.y /2);
    p3.po = data.vPos;
    if(data.vAngle != null) p3.applyRotationDecalage(data.vAngle);
    const p4 = new V2F(- data.vTaille.x /2, + data.vTaille.y /2);
    p4.po = data.vPos;
    if(data.vAngle != null) p4.applyRotationDecalage(data.vAngle);
    //
    data.vPos1 = p1;
    data.vPos2 = p2;
    data.vPos3 = p3;
    data.vPos4 = p4;*/
    //si image fixe
    if(data.vAngle == null) await data.objet.setBounds([[data.vPos1.yAbs(), data.vPos1.xAbs()], [data.vPos3.yAbs(), data.vPos3.xAbs()]]);//image select
    else await data.objet.reposition(toLLCoords(data.vPos4),toLLCoords(data.vPos3),toLLCoords(data.vPos1));
    if(data.objetVecteur != null) await data.objetVecteur.objet[0].setLatLngs([toLLTabl(data.objetVecteur.vPos),toLLTabl(data.objetVecteur.vPos2)]);
    if(data.objetCarre != null) {
      await data.objetCarre[0].objet[0].setLatLngs([toLLTabl(data.objetCarre[0].vPos),toLLTabl(data.objetCarre[0].vPos2)]);
      await data.objetCarre[1].objet[0].setLatLngs([toLLTabl(data.objetCarre[1].vPos),toLLTabl(data.objetCarre[1].vPos2)]);
      await data.objetCarre[2].objet[0].setLatLngs([toLLTabl(data.objetCarre[2].vPos),toLLTabl(data.objetCarre[2].vPos2)]);
      await data.objetCarre[3].objet[0].setLatLngs([toLLTabl(data.objetCarre[3].vPos),toLLTabl(data.objetCarre[3].vPos2)]);
    } 
  }
  else if(data.type == TEXTE) {
    await data.objet.reposition(toLLCoords(data.vPos4),toLLCoords(data.vPos3),toLLCoords(data.vPos1));
    if(data.objetVecteur != null) await data.objetVecteur.objet[0].setLatLngs([toLLTabl(data.objetVecteur.vPos),toLLTabl(data.objetVecteur.vPos2)]);
    if(data.objetCarre != null) {
      await data.objetCarre[0].objet[0].setLatLngs([toLLTabl(data.objetCarre[0].vPos),toLLTabl(data.objetCarre[0].vPos2)]);
      await data.objetCarre[1].objet[0].setLatLngs([toLLTabl(data.objetCarre[1].vPos),toLLTabl(data.objetCarre[1].vPos2)]);
      await data.objetCarre[2].objet[0].setLatLngs([toLLTabl(data.objetCarre[2].vPos),toLLTabl(data.objetCarre[2].vPos2)]);
      await data.objetCarre[3].objet[0].setLatLngs([toLLTabl(data.objetCarre[3].vPos),toLLTabl(data.objetCarre[3].vPos2)]);
    }
  }
  else if(data.type == POLYLIGNE) await data.objet[0].setLatLngs([toLLTabl(data.vPos),toLLTabl(data.vPos2)]);
  else if(data.type == MARKER) {
    await data.objet.setLatLng([data.vPos.yAbs(), data.vPos.xAbs()]);
    if(data.objetVecteur != null) await data.objetVecteur.objet[0].setLatLngs([toLLTabl(data.objetVecteur.vPos),toLLTabl(data.objetVecteur.vPos2)]);
    if(data.objetCarre != null) {
      const ps = leaflet.toAbsoluteValue(data.vPos);
      data.objetCarre[0].vPos = leaflet.toGPSValue(new V2F(ps.x - (data.vTaille.x / 2 + 2), ps.y - (data.vTaille.y / 2 + 2)));
      data.objetCarre[1].vPos = leaflet.toGPSValue(new V2F(ps.x + (data.vTaille.x / 2 + 2), ps.y - (data.vTaille.y / 2 + 2)));
      data.objetCarre[2].vPos = leaflet.toGPSValue(new V2F(ps.x + (data.vTaille.x / 2 + 2), ps.y + (data.vTaille.y / 2 + 2)));
      data.objetCarre[3].vPos = leaflet.toGPSValue(new V2F(ps.x - (data.vTaille.x / 2 + 2), ps.y + (data.vTaille.y / 2 + 2)));
      data.objetCarre[0].vPos2 = data.objetCarre[1].vPos;
      data.objetCarre[1].vPos2 = data.objetCarre[2].vPos;
      data.objetCarre[2].vPos2 = data.objetCarre[3].vPos;
      data.objetCarre[3].vPos2 = data.objetCarre[0].vPos;
      await data.objetCarre[0].objet[0].setLatLngs([toLLTabl(data.objetCarre[0].vPos),toLLTabl(data.objetCarre[0].vPos2)]);
      await data.objetCarre[1].objet[0].setLatLngs([toLLTabl(data.objetCarre[1].vPos),toLLTabl(data.objetCarre[1].vPos2)]);
      await data.objetCarre[2].objet[0].setLatLngs([toLLTabl(data.objetCarre[2].vPos),toLLTabl(data.objetCarre[2].vPos2)]);
      await data.objetCarre[3].objet[0].setLatLngs([toLLTabl(data.objetCarre[3].vPos),toLLTabl(data.objetCarre[3].vPos2)]);
    } 
  }
}
/**vérifie si un objet similaire éxiste dans l'écran*/
async function objectPosInScreen(data) {
     if(data.type == TILEMAP_DEFAULT)   return true;
else if(data.type == IMAGE)             {
  return (await leaflet.getMapBounds()).intersects([[toLLTabl(data.vPos3.pAbs())], [toLLTabl(data.vPos1.pAbs())]]);
}
else if(data.type == MARKER)            return (await leaflet.getMapBounds()).contains(toLLTabl(data.vPos));
else if(data.type == MARKER_STATIC_MS)  return (await leaflet.getMapBounds()).contains([selectorPos.y, selectorPos.x])
else if(data.type == POLYLIGNE)         return true;
return false;
}

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
function toLLPoint(v2f){
  return L.point(v2f.x, v2f.y)
}
