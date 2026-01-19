class LeafletMapBase {
    #llMap;
    llZoomlvl = 2;
    mousePos = new V2F(0,0);//position de la souris en temps réel
    mousePosOE = new V2F(0,0);//position de la souris en temps réel
    #disablePopups = false;
    clickOnLLObject = false;
    grilleActive = false;
    #calqueGrille = null;
    constructor() {
      this.#llMap = L.map('map', {preferCanvas: true}).setView([0, 0], 13).setZoom(this.llZoomlvl);
      this.#calqueGrille = L.layerGroup().addTo(this.#llMap);
      this.#llMap.createPane('vecteurs');
      this.#llMap.createPane('objets');
      this.#llMap.getPane('vecteurs').style.zIndex = 400;
      this.#llMap.getPane('vecteurs').style.pointerEvents = 'none';
      this.#llMap.getPane('objets').style.zIndex = 380;
      this.#llMap.on("moveend zoomend", () => this.updateGrille());
      this.#llMap.on('mousemove', (e) => {
        this.mousePos.y = e.latlng.lat; // valeur du textue
        this.mousePos.x = e.latlng.lng; 
        this.mousePosOE.y = e.originalEvent.pageY;
        this.mousePosOE.x = e.originalEvent.pageX;
        mouseMoveIO();
      });
      this.#llMap.on('moveend', ()      => {
        this.llZoomlvl = this.#llMap.getZoom();
        mapMoveEndIO()
      });
      this.#llMap.on('mousedown', (e)   => {
        mouseDownDetectedIO();
          if (this.clickOnObject) this.clickOnObject = false;
          else mouseDownDetectedOutsideObj();
      });
      this.#llMap.on('mouseup', (e)     => {mouseUpDetectedIO();});
      this.#llMap.on('popupclose', (e)  => {popupClosedIO();});
    }
    /**affiche une fenetre de texte html aux coordonnés précisés*/
    popup(vPos, content){
      try{
        if(this.#disablePopups == true) return;
        if(vPos == null) throw new Error("position non comprise");
        var vPosData = null;
        if(vPos != null) vPosData = L.latLng(vPos.yAbs(),vPos.xAbs());
        else vPosData = L.latLng(0,0);
        this.closePopup();//Supprimer les anciens popups avant d'en ajouter un nouveau
        (L.popup({closeOnClick: false, autoClose: false, keepInView: true, zIndex: 9999 }).setLatLng(vPosData).setContent(content)).openOn(this.#llMap);//Créer un nouveau popup aux coordonnées de l'événement
        if (!this.#llMap.getBounds().contains(vPosData))  this.#llMap.flyTo(vPosData, this.#llMap.getZoom());
        this.#llMap.invalidateSize();
      } catch (error) {console.error("Erreur lors de la création du popup :", error);}
    }
    disablePopup(){this.#disablePopups = true;}
    enablePopup(){this.#disablePopups = false;}
    /**ferme les fenetres leaflet si ouvertes*/
    closePopup(){this.#llMap.closePopup();}
    getZoomLvl(){return this.llZoomlvl;}
    setZoomLvl(zoom){this.llZoomlvl = zoom; this.#llMap.setZoom(this.llZoomlvl);}
    /**récupère la position long lat de la souris*/
    getMousePos(){return this.mousePos;}
    getLLMap(){return this.#llMap;}
    getLLMapSize(){return Object.keys(this.#llMap._layers).length;}
    /**actualise leaflet (réel intéret ?)*/
    actualiseMapLL(){this.#llMap.invalidateSize();}
    /**active le déplacement*/
    enableDragging(){this.#llMap.dragging.enable();}
    /**désactive le déplacement*/
    disableDragging(){this.#llMap.dragging.disable();}
    /**verifie que le déplacement est désactivé*/
    isDraggingDisabled(){return !this.#llMap.dragging;}
    /**désactive toute les interactions possibles de leaflet*/
    disableInteractions(){
      this.#llMap.dragging.disable();
      this.#llMap.scrollWheelZoom.disable();
      this.#llMap.doubleClickZoom.disable();
      this.#llMap.boxZoom.disable();
      this.#llMap.keyboard.disable();
      this.#llMap.touchZoom.disable();
      this.#llMap.zoomControl.remove();
      this.#llMap.getContainer().style.pointerEvents = 'none';
    }
    /**active toute les interactions possibles de leaflet*/
    enableInteractions(){
      this.#llMap.dragging.enable();
      this.#llMap.scrollWheelZoom.enable();
      this.#llMap.doubleClickZoom.enable();
      this.#llMap.boxZoom.enable();
      this.#llMap.keyboard.enable();
      this.#llMap.touchZoom.enable();
      this.#llMap.zoomControl.addTo(this.#llMap);
      this.#llMap.getContainer().style.pointerEvents = 'auto'; //✅
    }
    /**retourne les coordonnés des bords de la carte leaflet (long lat coords)*/
    getMapBounds(){
      return this.#llMap.getBounds();
    }
    /**Supprime tout les éléments enregistrés dans leaflet, sauf les popups globaux et la tilemap globale dans le cas d'une suppression partielle*/
    clear(){
      this.#llMap.eachLayer((layer) => {this.#llMap.removeLayer(layer);});
    }
    /**test si un objet similaire éxiste dans la map, prend un objet en parametre*/
    ifObjExist(obj){
    try {
        return this.#llMap.hasLayer(obj);
      } catch (error) {console.error("Erreur dans la vérification d'existence de l'objet Leaflet:", error);throw error;}
    }
    /**génère un nouveau calque leaflet. false = layerGroup, true = featureGroup (layerGroup avec interactions)*/
    generateCalque(isFeature){
      if(isFeature) return L.featureGroup().addTo(this.#llMap);
      else return L.layerGroup().addTo(this.#llMap);
    }
    /**ajoute un calque à la map leaflet*/
    addCalque(calque){
      this.#llMap.addLayer(calque);
    }
    /**enlève un calque de la map leaflet*/
    removeCalque(calque){
      this.#llMap.removeLayer(calque);
    }
    /**renvoie true si calque présent*/
    contientCalque(calque){
      return this.ifObjExist(calque);
    }
    /**retourne la position sur l'écran en pixels d'une position sur la carte */
    toCartesianValue(v2f){return new V2F(this.#llMap.latLngToContainerPoint(toLLCoords(v2f)).x, this.#llMap.latLngToContainerPoint(toLLCoords(v2f)).y);}
    /**transforme un vecteur en valeur GPS */
    toGPSValue(v2f){return new V2F(this.#llMap.containerPointToLatLng(toLLPoint(v2f)).lng, this.#llMap.containerPointToLatLng(toLLPoint(v2f)).lat);}
    /**génère une polyligne a la volée pour le débug*/
    async generatePolyligneDebug(vPos, color){
      var dataObj = createDataObjet(POLYLIGNE);
      dataObj.vPos.set(vPos.getPo2().pAbs());
      dataObj.vPos2.set(vPos.pAbs());
      dataObj.color = color;
      var obj = await generateObject(dataObj);
      console.log("tracage polyligne debug: ");
      console.log(dataObj);
      leaflet.addCalque(obj);
    }
    /**test si la data d'une image serait trop petite a l'écran */
    isShort(obj){
      var retour = false;
      //retour = true si taille de l'objet > tailleMini
      //if(data.type == IMAGE) retour = ((((getMapBounds()).getNorthEast().lng - (getMapBounds()).getSouthWest().lng) / 20) > (data.vTaille.x < data.vTaille.y ? data.vTaille.x : data.vTaille.y));
      var bounds = this.getMapBounds();
      var largeur = (bounds.getNorthEast().lng - bounds.getSouthWest().lng) / 10;
      var tailleMax = Math.max(obj._data.vTaille.x, obj._data.vTaille.y);
      retour = largeur > tailleMax;
      return retour;
    }
    /**test si l'objet serait trop grande a l'écran */
    isBig(obj){
      try{
        var retour = false;
        //retour = true si taille de l'objet < tailleMaxi
        if(obj._data.type == IMAGE) retour = ((((this.getMapBounds()).getNorthEast().lng - (this.getMapBounds()).getSouthWest().lng)) < (obj._data.vTaille.x > obj._data.vTaille.y ? obj._data.vTaille.x : obj._data.vTaille.y));
        return retour;
      } catch(error) {new Error("Erreur " + error)};
    }
    //
  updateGrille(){
    if(this.grilleActive){
      this.#calqueGrille.clearLayers();
      if(this.#llMap.getZoom() < 11) return;
      const bounds = this.#llMap.getBounds();
      let ecranHautGaucheLL = bounds.getNorthWest();
      let ecranBasDroitLL = bounds.getSouthEast();
      const ecranHautGaucheXY = this.#llMap.project(ecranHautGaucheLL, this.#llMap.getZoom()); 
      const ecranBasDroitXY = this.#llMap.project(ecranBasDroitLL, this.#llMap.getZoom());
      //const origine = L.latLng(48.8584, 2.2945);
      //
      var originePointXY = ecranHautGaucheXY;
      // Taille du rectangle en mètres
      const lng  = 500; // largeur en px
      const lngZoom  = lng * 2 ** (this.#llMap.getZoom()) / 2**16; // largeur en px appliqué au zoom
      //
      const carreHautGaucheXY = L.point(originePointXY.x - originePointXY.x % lngZoom,    originePointXY.y - originePointXY.y % lngZoom,);
      //
      var cpt = 0;
      var ptrXY = L.point(carreHautGaucheXY.x,carreHautGaucheXY.y)
      while(ptrXY.y < ecranBasDroitXY.y){
          while(ptrXY.x < ecranBasDroitXY.x){
              this.traceCase(ptrXY, lngZoom);
              ptrXY.x += lngZoom;
              cpt++;
          }
          ptrXY.y += lngZoom;
          ptrXY.x = carreHautGaucheXY.x;
      }
    }
  }
  traceCase(carreHautGaucheXY, lngZoom){
    const carreBasDroitXY = L.point(carreHautGaucheXY.x + lngZoom,carreHautGaucheXY.y + lngZoom);
    // On convertit les points projetés en LatLng pour Leaflet
    const carreHautGaucheLL = this.#llMap.unproject(carreHautGaucheXY, this.#llMap.getZoom());
    const carreBasDroitLL = this.#llMap.unproject(carreBasDroitXY, this.#llMap.getZoom());
    // On trace le rectangle
    L.rectangle([carreHautGaucheLL, carreBasDroitLL], {
        color: 'red',
        weight: 1,
        opacity: 0.75,
        fillOpacity: 0,
        interactive: false,
        pane: 'vecteurs'
    }).addTo(this.#calqueGrille);
  }
}
/**convertis un vecteur en point leaflet */
function toLLPoint(v2f){return L.point(v2f.x, v2f.y)}
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
/**generation d'objet, retourne l'objet correspondant*/
async function generateObject(data){
  //Génère une image réduite depuis une image classique, retourne l'objet existant modifié
  //if(data.type == IMAGE) if(data.isMipmap) await resizeImage(data, new V2F(10, 10));
  //if(data.type == MARKER) await resizeImage(data, new V2F(100, 100));
  //data.url = unfound_img;
  //
  return new Promise(async (resolve) => {
    try{
      //data.url = unfound_img;
      var objFin = [null,null];
      switch(data.type){
        case TILEMAP_DEFAULT:
          objFin = [L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          })
        ,null]
        break; case IMAGE:
            data.urlmm = await resizeImage(data.url, new V2F(10, 10), data);
          if(data.vPos.getTransfo() == null){//image sans angle
            //[[y1, x1], [y2, x2]] : p1y,p1x,p3y,p3x
            var imageBounds3 = [toLLTabl(data.vPos1), toLLTabl(data.vPos3)];
            objFin = [
              L.imageOverlay(data.url, imageBounds3, {//url
              interactive: true,
              zIndex: data.plan,
              pane: 'objets'}), 
              L.imageOverlay(data.urlmm, imageBounds3, {//url
              interactive: true,
              zIndex: data.plan,
              pane: 'objets'})
            ];
            data.objmm = objFin[1];
          }
          else{//image avec angle
            //point2,point1,point4: p4y, p4x, p3y, p3x, p1y, p1x
            objFin = [
              L.imageOverlay.rotated(data.url, toLLCoords(data.vPos4), toLLCoords(data.vPos3), toLLCoords(data.vPos1), { 
              opacity: 1,
              interactive: true,
              zIndex: data.plan,
              pane: 'objets'}),
              L.imageOverlay.rotated(data.urlmm, toLLCoords(data.vPos4), toLLCoords(data.vPos3), toLLCoords(data.vPos1), { 
              opacity: 1,
              interactive: true,
              zIndex: data.plan,
              pane: 'objets'})
            ];
            data.objmm = objFin[1];
          }
        break; case MARKER:
          //data.urlmm = await resizeImage(data.url, new V2F(40, 40), data);
          //data.url = data.urlmm;
          var greenIcon = L.icon({
            iconUrl:      data.url,
            iconSize:     [data.vTaille.x, data.vTaille.y], // size of the icon, 38;95 pour la feuille
            iconAnchor:   [data.vTaille.x /2, data.vTaille.y /2], // point of the icon which will correspond to marker's location, 22;94 pour la feuille
            popupAnchor:  [0, -data.vTaille.x / 2], // point from which the popup should open relative to the iconAnchor, -3;-76 pour la feuille
          });
          objFin = [L.marker(toLLTabl(data.vPos), {
            icon: greenIcon,
            zIndexOffset: data.plan,
            pane: 'objets',
          }),null];
        break; case TEXTE:
            objFin = [L.imageOverlay.rotated(data.url, toLLCoords(data.vPos4), toLLCoords(data.vPos3), toLLCoords(data.vPos1), { 
            zIndex: data.plan,
            pane: 'objets',
          }),null];
        break; case MARKER_STATIC_MS:
          var greenIcon = L.icon({
          iconUrl:       data.url,
          iconSize:     [data.vTaille.y, data.vTaille.x], //size of the icon, 38;95 pour la feuille
          iconAnchor:   [data.vTaille.y / 2, data.vTaille.x / 2], //point of the icon which will correspond to marker's location, 22;94 pour la feuille
          pane: 'objets',
          });
          objFin = [L.marker(toLLTabl(data.vPos), {
            icon: greenIcon,
            interactive: false,
            zIndexOffset: data.plan,
          }),null];
        break; case POLYLIGNE:
          var obj1 = L.polyline([
            [data.vPos.yAbs(), data.vPos.xAbs()],
            [data.vPos2.yAbs(), data.vPos2.xAbs()]
          ], {
            color: data.color,
            weight: 1,
            interactive: false,
            pane: 'vecteurs',
          });
          var obj2 = L.polylineDecorator(obj1,
            {
              patterns: [
                {
                  //Motif pour les tirets
                  offset: '0%',       //Commence au début
                  repeat: '15px',     //Espacement entre les tirets
                  symbol: L.Symbol.dash({
                    pixelSize: 15,  //Taille du tiret
                    pathOptions: { color: data.color, weight: 1 }
                  })
                },
                {
                  //Motif pour les flèches
                  offset: '100%',     //Place les flèches à la fin de chaque segment
                  repeat: '20%',      //Espacement des flèches
                  symbol: L.Symbol.arrowHead({
                    pixelSize: 8,   //Taille des flèches
                    headAngle: 45,  //Angle de la flèche
                    pathOptions: { color: data.color, fillOpacity: 1 }
                  })
                }
              ]
            }
          );
          objFin = [obj1,obj2];
        break; default:
        throw new Error("etat non compris:" + data.type);
      }
      if(objFin == null) {
        console.error("Erreur dans la génération de l'image " + data.titre);
        resolve(null);
      }
      else {
        data.objet = objFin;
        resolve(objFin[0]);
      }
    } catch (error) {
      console.error("Erreur dans la génération de l'objet ", error);//throw error;
      resolve(null);
    }
  });
}
/**vérifie si un objet similaire éxiste dans l'écran*/
async function objectPosInScreen(data) {
        if(data.type == TILEMAP_DEFAULT)   return true;
  else  if(data.type == IMAGE)             return (await leaflet.getMapBounds()).intersects([[toLLTabl(data.vPos3.pAbs())], [toLLTabl(data.vPos1.pAbs())]]);
  else  if(data.type == MARKER)            return (await leaflet.getMapBounds()).contains(toLLTabl(data.vPos));
  else  if(data.type == POLYLIGNE)         return true;
  return false;
}
