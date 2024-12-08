//FICHIER REGROUPANT LES FONCTIONS LIEES AU MUSHROOMSELECTOR
var cleImageFocus = null;
var isHolding2 = false;
var selectorPos = new V2F();
const ACTNULL = 0;
const ACTDEPLACEMENT = 1;
const ACTROTATION = 2;
const ACTECHELLE = 3;
const shroom = "https://mario.wiki.gallery/images/8/8b/SuperMushroom_-_2D_art.svg";
const goldenShroom = "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/ed991cf4-7c8c-4530-b6ba-a3abf3ab2eae/dd36ts2-3a51d2ff-7f4d-41a4-8e60-2cbaa0ae1bc8.png/v1/fill/w_900,h_900/super_mario__golden_mushroom_2d_by_joshuat1306_dd36ts2-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9OTAwIiwicGF0aCI6IlwvZlwvZWQ5OTFjZjQtN2M4Yy00NTMwLWI2YmEtYTNhYmYzYWIyZWFlXC9kZDM2dHMyLTNhNTFkMmZmLTdmNGQtNDFhNC04ZTYwLTJjYmFhMGFlMWJjOC5wbmciLCJ3aWR0aCI6Ijw9OTAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.eLm9NIiTXusG0laKtKWmLiqZNSK1PcWbEJY039obNhY";
var actionEnCours = ACTNULL;
class MushroomSelector {
  #isActif = false;
  #selector1 = null;
  #selector2 = null;
  #selector3 = null;
  #selector4 = null;
  #selector5 = null;
  #selector1Edit = null;
  #selector2Edit = null;
  #selector3Edit = null;
  #selector4Edit = null;
  #selector5Edit = null;
  #cleSetup1  = generateCleUnique();
  #cleSetup2  = generateCleUnique();
  #cleSetup3  = generateCleUnique();
  #cleSetup4  = generateCleUnique();
  #cleSetup5  = generateCleUnique();
  #cleSetup6  = generateCleUnique();
  #cleSetup7  = generateCleUnique();
  #cleSetup8  = generateCleUnique();
  #cleSetup9  = generateCleUnique();
  #cleSetup10 = generateCleUnique();
  constructor() {}
  /**initialisation des données du Mushroom selector */
  async init(){
    const setup1 = createDataObjet(MARKER_STATIC_MS);
    const setup2 = createDataObjet(MARKER_STATIC_MS);
    setup1.l = new V2F(10,10);
    setup1.url = shroom;
    setup2.l = new V2F(15,15);
    setup2.url = goldenShroom;
    var setupN1  = createDataObjet(MARKER_STATIC_MS); 
    var setupN2  = createDataObjet(MARKER_STATIC_MS); 
    var setupN3  = createDataObjet(MARKER_STATIC_MS); 
    var setupN4  = createDataObjet(MARKER_STATIC_MS); 
    var setupN5  = createDataObjet(MARKER_STATIC_MS); 
    var setupN6  = createDataObjet(MARKER_STATIC_MS); 
    var setupN7  = createDataObjet(MARKER_STATIC_MS); 
    var setupN8  = createDataObjet(MARKER_STATIC_MS); 
    var setupN9  = createDataObjet(MARKER_STATIC_MS); 
    var setupN10 = createDataObjet(MARKER_STATIC_MS); 
    this.#copyValues(setupN1, setup1);
    this.#copyValues(setupN2, setup1);
    this.#copyValues(setupN3, setup1);
    this.#copyValues(setupN4, setup1);
    this.#copyValues(setupN5, setup1);
    this.#copyValues(setupN6, setup2);
    this.#copyValues(setupN7, setup2);
    this.#copyValues(setupN8, setup2);
    this.#copyValues(setupN9, setup2);
    this.#copyValues(setupN10, setup2);
    setupN1 = await generateObject(setupN1);//PR
    this.#selector1 = setupN1.objet;
    setupN2 = await generateObject(setupN2);//BG
    this.#selector2 = setupN2.objet;
    setupN3 = await generateObject(setupN3);//BD
    this.#selector3 = setupN3.objet;
    setupN4 = await generateObject(setupN4);//HD
    this.#selector4 = setupN4.objet;
    setupN5 = await generateObject(setupN5);//HG
    this.#selector5 = setupN5.objet;
    setupN6 = await generateObject(setupN6);
    this.#selector1Edit = setupN6.objet;
    setupN7 = await generateObject(setupN7);
    this.#selector2Edit = setupN7.objet;
    setupN8 = await generateObject(setupN8);
    this.#selector3Edit = setupN8.objet;
    setupN9 = await generateObject(setupN9);
    this.#selector4Edit = setupN9.objet;
    setupN10 = await generateObject(setupN10);
    this.#selector5Edit = setupN10.objet;
    setupN1.titre  = "msms1";
    setupN2.titre  = "msms2";
    setupN3.titre  = "msms3";
    setupN4.titre  = "msms4";
    setupN5.titre  = "msms5";
    setupN6.titre  = "msms6";
    setupN7.titre  = "msms7";
    setupN8.titre  = "msms8";
    setupN9.titre  = "msms9";
    setupN10.titre = "msms10";
    setupN1.key = this.#cleSetup1;
    setupN2.key = this.#cleSetup2;
    setupN3.key = this.#cleSetup3;
    setupN4.key = this.#cleSetup4;
    setupN5.key = this.#cleSetup5;
    setupN6.key = this.#cleSetup6;
    setupN7.key = this.#cleSetup7;
    setupN8.key = this.#cleSetup8;
    setupN9.key = this.#cleSetup9;
    setupN10.key = this.#cleSetup10;
    mapListLeaflet.set(this.#cleSetup1, setupN1 );
    mapListLeaflet.set(this.#cleSetup2, setupN2 );
    mapListLeaflet.set(this.#cleSetup3, setupN3 );
    mapListLeaflet.set(this.#cleSetup4, setupN4 );
    mapListLeaflet.set(this.#cleSetup5, setupN5 );
    mapListLeaflet.set(this.#cleSetup6, setupN6 );
    mapListLeaflet.set(this.#cleSetup7, setupN7 );
    mapListLeaflet.set(this.#cleSetup8, setupN8 );
    mapListLeaflet.set(this.#cleSetup9, setupN9 );
    mapListLeaflet.set(this.#cleSetup10,setupN10);
  }
  isActif(){
    return this.#isActif == true;
  }
  active(){
    this.#isActif = true;
  }
  disable(){
    this.#isActif = false;
  }
  /**change la position globale du sélecteur ainsi que celui de ces markers*/
  async changePos(p,p1,p2,p3,p4){
    selectorPos.set(p);
    await     this.#selector1.setLatLng(toLLCoords( p));
    await     this.#selector2.setLatLng(toLLCoords(p1));
    await     this.#selector3.setLatLng(toLLCoords(p2));
    await     this.#selector4.setLatLng(toLLCoords(p3));
    await     this.#selector5.setLatLng(toLLCoords(p4));
    await this.#selector1Edit.setLatLng(toLLCoords( p));
    await this.#selector2Edit.setLatLng(toLLCoords(p1));
    await this.#selector3Edit.setLatLng(toLLCoords(p2));
    await this.#selector4Edit.setLatLng(toLLCoords(p3));
    await this.#selector5Edit.setLatLng(toLLCoords(p4));
  }
  /**réinitialise la position et la visibilité des icones, l'affichage du popup, défocus l'image select*/
  async reset(){
    cleImageFocus = null;
    await this.changePos(new V2F(0,0),new V2F(0,0),new V2F(0,0),new V2F(0,0),new V2F(0,0));
    await this.disableMarkers();
  }
  /**lance l'affichage adéquat du sélecteur: maj des positions, active les bon markers, ouverture de popups*/
  async action(){
    if(cleImageFocus != null){
      if(this.#isActif){
        var points = await mapListLeaflet.get(cleImageFocus);
        //console.log(points.titre);
        //console.log(points, cleImageFocus);
        var type = points.type;
        //console.log(points.type, " ", points.titre);
        //await actualiseMap();
        //await leaflet.removeAllObj(false);
        //await leaflet.actualiseMap();
        //for (const [key, value] of mapListLeaflet) {}
        this.activeMarkers();
        this.changePos(points.vPos,points.vPos1,points.vPos2,points.vPos3,points.vPos4);
        if(mode != MODE_LECTURE) leaflet.closePopup();
        if(type == IMAGE || type == TEXTE){
          //image sans angle
          if(points.vAngle == null && mode == MODE_LECTURE) leaflet.popup(points,"<h3>" + points.titre + "</h3><br>Author:  " + points.auteur + "<br><br>Website link:<br><a href=" + points.site + ">" + points.site + "</a><br><br> GPS position: " + convertToFloat(points.vPos.xAbs()).toFixed(1) + ":" + convertToFloat(points.vPos.yAbs()).toFixed(1) + "<br>Image size: " + convertToFloat(points.vImgTaille.xAbs()) + ":" + convertToFloat(points.vImgTaille.yAbs()) + "<br>Image scale:" + convertToFloat(points.vTaille.xAbs()).toFixed(3) + ":" + convertToFloat(points.vTaille.yAbs()).toFixed(3));
          //image avec angle
          if(points.vAngle != null && mode == MODE_LECTURE) leaflet.popup(points,"<h3>" + points.titre + "</h3><br>Author:  " + points.auteur + "<br><br>Website link:<br><a href=" + points.site + ">" + points.site + "</a><br> GPS position (abs.): " + convertToFloat(points.vPos.xAbs()).toFixed(1) + ":" + convertToFloat(points.vPos.yAbs()).toFixed(1) + "</a><br> GPS position (rel.): " + convertToFloat(points.vPos.x).toFixed(1) + ":" + convertToFloat(points.vPos.y).toFixed(1) + "<br>Image size: " + convertToFloat(points.vImgTaille.xAbs()) + ":" + convertToFloat(points.vImgTaille.yAbs()) + "<br>Image scale:" + convertToFloat(points.vTaille.xAbs()).toFixed(3) + ":" + convertToFloat(points.vTaille.yAbs()).toFixed(3) + "<br>Angle: " + points.vAngle.getAngle());
        }
        else if(type == MARKER){
          //
          this.reset();
          leaflet.popup(points,points.titre);
        }
        else leaflet.closePopup();
      }
    }
  }
  /**active l'affichage des markers si image focus existante et mode lecture*/
  activeMarkers(){
    if(cleImageFocus != null){
      if(mode != MODE_LECTURE){
        mapListLeaflet.get(this.#cleSetup6 ).actif = true;
        mapListLeaflet.get(this.#cleSetup7 ).actif = true;
        mapListLeaflet.get(this.#cleSetup8 ).actif = true;
        mapListLeaflet.get(this.#cleSetup9 ).actif = true;
        mapListLeaflet.get(this.#cleSetup10).actif = true;
      }
      else{
        //console.log("activation affichage mushrooms");
        mapListLeaflet.get(this.#cleSetup1).actif = true;
        mapListLeaflet.get(this.#cleSetup2).actif = true;
        mapListLeaflet.get(this.#cleSetup3).actif = true;
        mapListLeaflet.get(this.#cleSetup4).actif = true;
        mapListLeaflet.get(this.#cleSetup5).actif = true;
      }
    }
  }
  /**copy colle certains parametres de marker static ms */
  #copyValues(data1, data2){
    data1.l = data2.l;
    data1.url = data2.url;
  }
  /**desactive l'affichage des markers */
  disableMarkers(){
    mapListLeaflet.get(this.#cleSetup1 ).actif = false;
    mapListLeaflet.get(this.#cleSetup2 ).actif = false;
    mapListLeaflet.get(this.#cleSetup3 ).actif = false;
    mapListLeaflet.get(this.#cleSetup4 ).actif = false;
    mapListLeaflet.get(this.#cleSetup5 ).actif = false;
    mapListLeaflet.get(this.#cleSetup6 ).actif = false;
    mapListLeaflet.get(this.#cleSetup7 ).actif = false;
    mapListLeaflet.get(this.#cleSetup8 ).actif = false;
    mapListLeaflet.get(this.#cleSetup9 ).actif = false;
    mapListLeaflet.get(this.#cleSetup10).actif = false;
  }
  /**actions de relachement de souris */
  mouseRelache(){
    if(this.#isActif){
      if(leaflet.isDraggingDisabled()) {
        leaflet.enableDragging();
        actionEnCours = ACTNULL;
      }
    };
  }
  /**actions d'appui de transformation de souris*/
  async MouseAppui(e){
    //console.log("appui!");
    leaflet.closePopup();
    var layerFin = await leaflet.findObjFocus(new V2F(e.latlng.lng, e.latlng.lat));//rang obj focus si objet a focus detecte au niveau de la souris
    if(layerFin != null) {//si objet trouvé a l'appui...
      await mush.insertObjetFocus(layerFin);
      if(this.#isActif && this.#selector1Edit != null && (mode == MODE_DEPLACEMENT || mode == MODE_ROTATION || mode == MODE_ECHELLE || mode == MODE_INSERTION) && cleImageFocus != null && actionEnCours == ACTNULL){
        leaflet.disableDragging();
             if(mode == MODE_DEPLACEMENT) actionEnCours = ACTDEPLACEMENT;
        else if(mode == MODE_ROTATION)    actionEnCours = ACTROTATION;
        else if(mode == MODE_ECHELLE)     actionEnCours = ACTECHELLE;
        mouseLngLastState = mousePos.x;
        //imageFocus.setCorners(newCorner1, newCorner2, newCorner3);
      }
      else if(this.#isActif && this.#selector1Edit != null && (mode == MODE_LECTURE) && cleImageFocus != null && actionEnCours == ACTNULL) await this.action();
    }
    else await this.reset();
  }
  /**prend la clé de la liste et la retiens en objet focus*/
  async insertObjetFocus(imgfoc){
    cleImageFocus = imgfoc;
  }
}
