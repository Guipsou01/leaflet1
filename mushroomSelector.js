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
var holdInterval;
var isHolding = false;
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
    leaflet.closePopup();
    cleImageFocus = null;
    await this.changePos(new V2F(0,0),new V2F(0,0),new V2F(0,0),new V2F(0,0),new V2F(0,0));
    this.disableMarkers();
  }
  /**lance l'affichage adéquat du sélecteur: maj des positions, active les bon markers, ouverture de popups*/
  async action(){
    if(cleImageFocus != null){
      if(this.#isActif){
        var points = mapListLeaflet.get(cleImageFocus);
        var type = points.type;
        if(type == IMAGE || type == TEXTE){
          await this.changePos(points.vPos,points.vPos1,points.vPos2,points.vPos3,points.vPos4);
          await this.disableMarkers();
          if(mode != MODE_LECTURE) leaflet.closePopup();
          await this.activeMarkers();
          await actualiseMap();
          //image sans angle
          if(points.vAngle == null && mode == MODE_LECTURE) leaflet.popup(points,"<h3>" + points.titre + "</h3><br>Author:  " + points.auteur + "<br><br>Website link:<br><a href=" + points.site + ">" + points.site + "</a><br><br> GPS position: " + convertToFloat(points.vPos.xAbs()).toFixed(1) + ":" + convertToFloat(points.vPos.yAbs()).toFixed(1) + "<br>Image size: " + convertToFloat(points.vImgTaille.xAbs()) + ":" + convertToFloat(points.vImgTaille.yAbs()) + "<br>Image scale:" + convertToFloat(points.vTaille.xAbs()).toFixed(3) + ":" + convertToFloat(points.vTaille.yAbs()).toFixed(3));
          //image avec angle
          if(points.vAngle != null && mode == MODE_LECTURE) leaflet.popup(points,"<h3>" + points.titre + "</h3><br>Author:  " + points.auteur + "<br><br>Website link:<br><a href=" + points.site + ">" + points.site + "</a><br><br> GPS position: " + convertToFloat(points.vPos.xAbs()).toFixed(1) + ":" + convertToFloat(points.vPos.yAbs()).toFixed(1) + "<br>Image size: " + convertToFloat(points.vImgTaille.xAbs()) + ":" + convertToFloat(points.vImgTaille.yAbs()) + "<br>Image scale:" + convertToFloat(points.vTaille.xAbs()).toFixed(3) + ":" + convertToFloat(points.vTaille.yAbs()).toFixed(3) + "<br>Angle: " + points.vAngle.getAngle());
        }
        else if(type == MARKER){
          leaflet.popup(points,points.desc);
        }
        else leaflet.closePopup();
      }
    }
  }
  /**active l'affichage des markers si image focus existante et mode lecture*/
  async activeMarkers(){
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
  async disableMarkers(){
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
  async mouseRelache(){
    if(this.#isActif){
      clearInterval(holdInterval);//stop le spam
      isHolding = false;
      if(leaflet.isDraggingDisabled()) {
        leaflet.enableDragging();
        actionEnCours = ACTNULL;
      }
    };
  }
  /**action de souris enfoncé, s'éxécute en boucle */
  async modeDeplacementSpam(){
    changePosObj();//cette fonction pose elle un probleme si selecteur 1 nul ?
    for (const [key, data] of mapListLeaflet) await updatePosOnLLObj(data);
  }
  /**actions d'appui de souris */
  async MouseAppui(){
    //console.log("appui!");
    if(this.#isActif && this.#selector1Edit != null && (mode == MODE_DEPLACEMENT || mode == MODE_ROTATION || mode == MODE_ECHELLE || mode == MODE_INSERTION) && cleImageFocus != null && actionEnCours == ACTNULL){
      isHolding = true;
      //console.log("Appui champignon golden");
      leaflet.disableDragging();
           if(mode == MODE_DEPLACEMENT) actionEnCours = ACTDEPLACEMENT;
      else if(mode == MODE_ROTATION)    actionEnCours = ACTROTATION;
      else if(mode == MODE_ECHELLE)     actionEnCours = ACTECHELLE;
      mouseLngLastState = mousePos.x;
      //imageFocus.setCorners(newCorner1, newCorner2, newCorner3);
      holdInterval = setInterval(() => {this.modeDeplacementSpam();}, 10);//verifie toute les 100ms
    }
  }
  /**prend un numéro de rang dans la liste et le retiens en objet focus*/
  async insertObjetFocus(imgfoc){
    cleImageFocus = imgfoc;
  }
}
