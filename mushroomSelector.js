//FICHIER REGROUPANT LES FONCTIONS LIEES AU MUSHROOMSELECTOR
var rgImageFocus = -1;
var isHolding2 = false;
var selectorPosX = 0;
var selectorPosY = 0;
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
  constructor() {}
  /**initialisation des données du Mushroom selector */
  async init(){
    this.#selector1      = await generateMarkerStatic(0,0,10,10,shroom);//PR
    this.#selector2      = await generateMarkerStatic(0,0,10,10,shroom);//BG
    this.#selector3      = await generateMarkerStatic(0,0,10,10,shroom);//BD
    this.#selector4      = await generateMarkerStatic(0,0,10,10,shroom);//HD
    this.#selector5      = await generateMarkerStatic(0,0,10,10,shroom);//HG
    this.#selector1Edit  = await generateMarkerStatic(0,0,15,15,goldenShroom);
    this.#selector2Edit  = await generateMarkerStatic(0,0,15,15,goldenShroom);
    this.#selector3Edit  = await generateMarkerStatic(0,0,15,15,goldenShroom);
    this.#selector4Edit  = await generateMarkerStatic(0,0,15,15,goldenShroom);
    this.#selector5Edit  = await generateMarkerStatic(0,0,15,15,goldenShroom);
    await objListLeaflet.push([[MARKER_STATIC_MS, "1"],this.#selector1,0,false]);
    await objListLeaflet.push([[MARKER_STATIC_MS, "2"],this.#selector2,0,false]);
    await objListLeaflet.push([[MARKER_STATIC_MS, "3"],this.#selector3,0,false]);
    await objListLeaflet.push([[MARKER_STATIC_MS, "4"],this.#selector4,0,false]);
    await objListLeaflet.push([[MARKER_STATIC_MS, "5"],this.#selector5,0,false]);
    await objListLeaflet.push([[MARKER_STATIC_MS, "6"],this.#selector1Edit,0,false]);
    await objListLeaflet.push([[MARKER_STATIC_MS, "7"],this.#selector2Edit,0,false]);
    await objListLeaflet.push([[MARKER_STATIC_MS, "8"],this.#selector3Edit,0,false]);
    await objListLeaflet.push([[MARKER_STATIC_MS, "9"],this.#selector4Edit,0,false]);
    await objListLeaflet.push([[MARKER_STATIC_MS,"10"],this.#selector5Edit,0,false]);
  }
  /**change la position globale du sélecteur ainsi que celui de ces markers*/
  async changePos(px,py,x1,y1,x2,y2,x3,y3,x4,y4){
    selectorPosX = px;
    selectorPosY = py;
    await     this.#selector1.setLatLng(L.latLng(py,px));
    await     this.#selector2.setLatLng(L.latLng(y1,x1));
    await     this.#selector3.setLatLng(L.latLng(y2,x2));
    await     this.#selector4.setLatLng(L.latLng(y3,x3));
    await     this.#selector5.setLatLng(L.latLng(y4,x4));
    await this.#selector1Edit.setLatLng(L.latLng(py,px));
    await this.#selector2Edit.setLatLng(L.latLng(y1,x1));
    await this.#selector3Edit.setLatLng(L.latLng(y2,x2));
    await this.#selector4Edit.setLatLng(L.latLng(y3,x3));
    await this.#selector5Edit.setLatLng(L.latLng(y4,x4));
  }
  /**réinitialise la position et la visibilité des icones, l'affichage du popup, défocus l'image select*/
  async reset(){
    leaflet.closePopup();
    rgImageFocus = -1;
    await this.changePos(0,0,0,0,0,0,0,0,0,0);
    this.disableMarkers();
  }
  /**lance l'affichage adéquat du sélecteur: maj des positions, active les bon markers, ouverture de popups*/
  async action(){
    if(rgImageFocus >= 0){
      var points = objListLeaflet[rgImageFocus][0];
      if(points[0] == IMAGE || points[0] == TEXT){
        await this.changePos(points[3][0],points[3][1],points[3][2],points[3][3],points[3][4],points[3][5],points[3][6],points[3][7],points[3][8],points[3][9]);
        await this.disableMarkers();
        if(mode != MODE_LECTURE) leaflet.closePopup();
        await this.activeMarkers();
        await leaflet.actualiseMap();
        if(points[0] == IMAGE){
          //image sans angle
          if(points[13] == null && mode == MODE_LECTURE) leaflet.popup((points[3][0]),(points[3][1] + points[11] / 2),"<h3>" + points[5] + "</h3><br>Author:  " + points[6] + "<br><br>Website link:<br><a href=" + points[7] + ">" + points[7] + "</a><br><br> GPS position: " + convertToFloat(points[3][0]).toFixed(1) + ":" + convertToFloat(points[3][1]).toFixed(1) + "<br>Image size: " + convertToFloat(points[8]) + ":" + convertToFloat(points[9]) + "<br>Image scale:" + convertToFloat(points[10]).toFixed(3) + ":" + convertToFloat(points[11]).toFixed(3));
          //image avec angle
          else if (points[13] != null && mode == MODE_LECTURE) leaflet.popup((points[3][0]),(points[3][1] + points[11] / 2),"<h3>" + points[5] + "</h3><br>Author:  " + points[6] + "<br><br>Website link:<br><a href=" + points[7] + ">" + points[7] + "</a><br><br> GPS position: " + convertToFloat(points[3][0]).toFixed(1) + ":" + convertToFloat(points[3][1]).toFixed(1) + "<br>Image size: " + convertToFloat(points[8]) + ":" + convertToFloat(points[9]) + "<br>Image scale:" + convertToFloat(points[10]).toFixed(3) + ":" + convertToFloat(points[11]).toFixed(3) + "<br>Angle: " + points[13]);
        }
        else leaflet.closePopup();
      }
    }
  }
  /**active l'affichage des markers si image focus existante et mode lecture*/
  async activeMarkers(){
    if(rgImageFocus >= 0){
      if(mode != MODE_LECTURE){
        objListLeaflet[await objectRGByObj(this.#selector1Edit)][3] = true;
        objListLeaflet[await objectRGByObj(this.#selector2Edit)][3] = true;
        objListLeaflet[await objectRGByObj(this.#selector3Edit)][3] = true;
        objListLeaflet[await objectRGByObj(this.#selector4Edit)][3] = true;
        objListLeaflet[await objectRGByObj(this.#selector5Edit)][3] = true;
      }
      else{
        //console.log("activation affichage mushrooms");
        objListLeaflet[await objectRGByObj(this.#selector1)][3] = true;
        objListLeaflet[await objectRGByObj(this.#selector2)][3] = true;
        objListLeaflet[await objectRGByObj(this.#selector3)][3] = true;
        objListLeaflet[await objectRGByObj(this.#selector4)][3] = true;
        objListLeaflet[await objectRGByObj(this.#selector5)][3] = true;
      }
    }
  }
  /**desactive l'affichage des markers */
  async disableMarkers(){
    objListLeaflet[await objectRGByObj(this.#selector1Edit)][3] = false;
    objListLeaflet[await objectRGByObj(this.#selector2Edit)][3] = false;
    objListLeaflet[await objectRGByObj(this.#selector3Edit)][3] = false;
    objListLeaflet[await objectRGByObj(this.#selector4Edit)][3] = false;
    objListLeaflet[await objectRGByObj(this.#selector5Edit)][3] = false;
    objListLeaflet[await objectRGByObj(this.#selector1    )][3] = false;
    objListLeaflet[await objectRGByObj(this.#selector2    )][3] = false;
    objListLeaflet[await objectRGByObj(this.#selector3    )][3] = false;
    objListLeaflet[await objectRGByObj(this.#selector4    )][3] = false;
    objListLeaflet[await objectRGByObj(this.#selector5    )][3] = false;
  }
  async mouseRelache(){
    clearInterval(holdInterval);//stop le spam
    isHolding = false;
    if(leaflet.isDraggingDisabled()) {
      leaflet.enableDragging();
      actionEnCours = ACTNULL;
    }
  }
  async mouseHold(){
    changePosObj();//cette fonction pose elle un probleme si selecteur 1 nul ?
  }
  async MouseAppui(){
    //console.log("appui!");
    if(this.#selector1Edit != null && mode != MODE_LECTURE && rgImageFocus >= 0 && actionEnCours == ACTNULL){
      isHolding = true;
      //console.log("Appui champignon golden");
      leaflet.disableDragging();
           if(mode == MODE_DEPLACEMENT) actionEnCours = ACTDEPLACEMENT;
      else if(mode == MODE_ROTATION)    actionEnCours = ACTROTATION;
      else if(mode == MODE_ECHELLE)     actionEnCours = ACTECHELLE;
      mouseLngLastState = mouseLng;
      //imageFocus.setCorners(newCorner1, newCorner2, newCorner3);
      holdInterval = setInterval(() => {this.mouseHold();}, 10);//verifie toute les 100ms
    }
  }
  /**prend un numéro de rang dans la liste et le retiens en objet focus*/
  async insertObjetFocus(imgfoc){rgImageFocus = imgfoc;}
}
//hitbox de détection
function pointDansCarre(px,py,x1,y1,x2,y2,x3,y3,x4,y4){
  return (pointDansTriangle(px, py, x1, y1, x2, y2, x3, y3) || pointDansTriangle(px, py, x1, y1, x3, y3, x4, y4));
}
function pointDansTriangle(px, py, x1, y1, x2, y2, x3, y3){
	  if(dot(false, px, py, x1, y1, x2, y2)
    && dot(false, px, py, x2, y2, x3, y3)
    && dot(false, px, py, x3, y3, x1, y1)) return true;
    return false;
}
function dot(gauche, px, py, x1, y1, x2, y2){
  if(gauche) return ((x2 - x1) * (py - y1) - (px - x1) * (y2 - y1) < 0);
  else return ((x2 - x1) * (py - y1) - (px - x1) * (y2 - y1) > 0);
}
