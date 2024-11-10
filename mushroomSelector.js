//FICHIER REGROUPANT LES FONCTIONS LIEES AU MUSHROOMSELECTOR
var selector1 = null;
var selector2 = null;
var selector3 = null;
var selector4 = null;
var selector5 = null;
var selector1Edit = null;
var selector2Edit = null;
var selector3Edit = null;
var selector4Edit = null;
var selector5Edit = null;
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
//var imageFocus;
/**initialisation des données du Mushroom selector */
  async function initSelector(){
    selector1 = await generateMarkerStatic(0,0,10,10,shroom);//PR
    selector2 = await generateMarkerStatic(0,0,10,10,shroom);//BG
    selector3 = await generateMarkerStatic(0,0,10,10,shroom);//BD
    selector4 = await generateMarkerStatic(0,0,10,10,shroom);//HD
    selector5 = await generateMarkerStatic(0,0,10,10,shroom);//HG
    selector1Edit = await generateMarkerStatic(0,0,15,15,goldenShroom);
    selector2Edit = await generateMarkerStatic(0,0,15,15,goldenShroom);
    selector3Edit = await generateMarkerStatic(0,0,15,15,goldenShroom);
    selector4Edit = await generateMarkerStatic(0,0,15,15,goldenShroom);
    selector5Edit = await generateMarkerStatic(0,0,15,15,goldenShroom);
    await objListLeaflet.push([[MARKER_STATIC_MS,"1"],selector1,0,false]);
    await objListLeaflet.push([[MARKER_STATIC_MS,"2"],selector2,0,false]);
    await objListLeaflet.push([[MARKER_STATIC_MS,"3"],selector3,0,false]);
    await objListLeaflet.push([[MARKER_STATIC_MS,"4"],selector4,0,false]);
    await objListLeaflet.push([[MARKER_STATIC_MS,"5"],selector5,0,false]);
    await objListLeaflet.push([[MARKER_STATIC_MS,"6"],selector1Edit,0,false]);
    await objListLeaflet.push([[MARKER_STATIC_MS,"7"],selector2Edit,0,false]);
    await objListLeaflet.push([[MARKER_STATIC_MS,"8"],selector3Edit,0,false]);
    await objListLeaflet.push([[MARKER_STATIC_MS,"9"],selector4Edit,0,false]);
    await objListLeaflet.push([[MARKER_STATIC_MS,"10"],selector5Edit,0,false]);
  }
  /**active les markers */
  async function setSelector(){
    if(rgImageFocus >= 0){
      if(mode != MODE_LECTURE){
        objListLeaflet[await objectRGByObj(selector1Edit)][3] = true;
        objListLeaflet[await objectRGByObj(selector2Edit)][3] = true;
        objListLeaflet[await objectRGByObj(selector3Edit)][3] = true;
        objListLeaflet[await objectRGByObj(selector4Edit)][3] = true;
        objListLeaflet[await objectRGByObj(selector5Edit)][3] = true;
      }
      else{
        //console.log("activation affichage mushrooms");
        objListLeaflet[await objectRGByObj(selector1)][3] = true;
        objListLeaflet[await objectRGByObj(selector2)][3] = true;
        objListLeaflet[await objectRGByObj(selector3)][3] = true;
        objListLeaflet[await objectRGByObj(selector4)][3] = true;
        objListLeaflet[await objectRGByObj(selector5)][3] = true;
      }
    }
  }
  async function resetIcons(){
    objListLeaflet[await objectRGByObj(selector1Edit)][3] = false;
    objListLeaflet[await objectRGByObj(selector2Edit)][3] = false;
    objListLeaflet[await objectRGByObj(selector3Edit)][3] = false;
    objListLeaflet[await objectRGByObj(selector4Edit)][3] = false;
    objListLeaflet[await objectRGByObj(selector5Edit)][3] = false;
    objListLeaflet[await objectRGByObj(selector1)][3] = false;
    objListLeaflet[await objectRGByObj(selector2)][3] = false;
    objListLeaflet[await objectRGByObj(selector3)][3] = false;
    objListLeaflet[await objectRGByObj(selector4)][3] = false;
    objListLeaflet[await objectRGByObj(selector5)][3] = false;
  }
  async function resetSelector(){
    leaflet.closePopup();
    rgImageFocus = -1;
    await changeSelectorPos(0,0,0,0,0,0,0,0,0,0);
    resetIcons();
  }
  //map.getBounds().contains([selectorPosX, selectorPosY])
  async function insertImageFocus(imgfoc){//prend un numéro de rang dans la liste
    rgImageFocus = imgfoc;
  }
  /**lance l'affichage adéquat du sélecteur */
  async function actionImageFocus(){
    if(rgImageFocus >= 0){
      //console.log("ok pour " + imageFocus.options.data[8] + ":" + imageFocus.options.data[9] + "?");
      var points = objListLeaflet[rgImageFocus][0];
      await changeSelectorPos(points[9],points[10],points[1],points[2],points[3],points[4],points[5],points[6],points[7],points[8]);
      await resetIcons();
      if(mode != MODE_LECTURE) leaflet.closePopup();
      await setSelector();
      await leaflet.actualiseMap();
      if(points[20] == null && mode == MODE_LECTURE){//image sans angle
        leaflet.popup(convertToFloat(points[9]),convertToFloat(points[6]),"<h3>" + points[12] + "</h3><br>Author:  " + points[13] + "<br><br>Website link:<br><a href=" + points[14] + ">" + points[14] + "</a><br><br> GPS position: " + convertToFloat(points[9]).toFixed(1) + ":" + convertToFloat(points[10]).toFixed(1) + "<br>Image size: " + convertToFloat(points[15]) + ":" + convertToFloat(points[16]) + "<br>Image scale:" + convertToFloat(points[17]).toFixed(3) + ":" + convertToFloat(points[18]).toFixed(3));
      }
      else if (points[20] != null && mode == MODE_LECTURE){//image avec angle
        leaflet.popup(convertToFloat(points[9]),convertToFloat(points[6]),"<h3>" + points[12] + "</h3><br>Author:  " + points[13] + "<br><br>Website link:<br><a href=" + points[14] + ">" + points[14] + "</a><br><br> GPS position: " + convertToFloat(points[9]).toFixed(1) + ":" + convertToFloat(points[10]).toFixed(1) + "<br>Image size: " + convertToFloat(points[15]) + ":" + convertToFloat(points[16]) + "<br>Image scale:" + convertToFloat(points[17]).toFixed(3) + ":" + convertToFloat(points[18]).toFixed(3) + "<br>Angle: " + points[20]);
      }
    }
  }
  async function changeSelectorPos(px,py,x1,y1,x2,y2,x3,y3,x4,y4){
    selectorPosX = px;
    selectorPosY = py;
    await selector1.setLatLng(L.latLng(py,px));
    await selector2.setLatLng(L.latLng(y1,x1));
    await selector3.setLatLng(L.latLng(y2,x2));
    await selector4.setLatLng(L.latLng(y3,x3));
    await selector5.setLatLng(L.latLng(y4,x4));
    await selector1Edit.setLatLng(L.latLng(py,px));
    await selector2Edit.setLatLng(L.latLng(y1,x1));
    await selector3Edit.setLatLng(L.latLng(y2,x2));
    await selector4Edit.setLatLng(L.latLng(y3,x3));
    await selector5Edit.setLatLng(L.latLng(y4,x4));
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

async function changePosImage(){
  if(selector1Edit != null && rgImageFocus >= 0 && mode != MODE_LECTURE){
    var points = objListLeaflet[rgImageFocus][0];
    if(actionEnCours == ACTDEPLACEMENT){
      var moveX = mouseLng - points[9];
      var moveY = mouseLat - points[10];
      points[1 ] += moveX;
      points[2 ] += moveY;
      points[3 ] += moveX;
      points[4 ] += moveY;
      points[5 ] += moveX;
      points[6 ] += moveY;
      points[7 ] += moveX;
      points[8 ] += moveY;
      points[9 ] += moveX;
      points[10] += moveY;
    }
    else if(actionEnCours == ACTROTATION){
      var moveX = (mouseLng - mouseLngLastState) * 5;
      mouseLngLastState = mouseLng;
      points[20] += moveX;
      var tabl = await getPosApresRotation(points[9],points[10],points[17],points[18],points[20]);
      points[9] = tabl[8];
      points[10] = tabl[9];
      points[1] = tabl[0];
      points[2] = tabl[1];
      points[3] = tabl[2];
      points[4] = tabl[3];
      points[5] = tabl[4];
      points[6] = tabl[5];
      points[7] = tabl[6];
      points[8] = tabl[7];
    }
    else if(actionEnCours == ACTECHELLE){
      var moveX = (mouseLng - mouseLngLastState) * 3;
      mouseLngLastState = mouseLng;
      points[17] += moveX
      //ly = sy / sx * lx
      points[18] = points[16] / points[15] * points[17];
      var tabl = await getPosApresRotation(points[9],points[10],points[17],points[18],points[20]);
      points[9] = tabl[8];
      points[10] = tabl[9];
      points[1] = tabl[0];
      points[2] = tabl[1];
      points[3] = tabl[2];
      points[4] = tabl[3];
      points[5] = tabl[4];
      points[6] = tabl[5];
      points[7] = tabl[6];
      points[8] = tabl[7];
    }
    await updatePosOnLLObj(objListLeaflet[rgImageFocus]);
    changeSelectorPos(points[9],points[10],points[1],points[2],points[3],points[4],points[5],points[6],points[7],points[8]);
    //
  }
}
/**met a jour les positions de l'objet dans leaflet de la ligne correspondante (mettre la ligne complète en parametre, après modifications de positions)*/
async function updatePosOnLLObj(rangDeListe){
  var points = objListLeaflet[rgImageFocus][0];
  if(points[20] == null){//si image fixe
    await objListLeaflet[rgImageFocus][1].setBounds([[points[2], points[1]], [points[6], points[5]]]);//image select
    await objListLeaflet[rgImageFocus + 1][1].setBounds([[points[2], points[1]], [points[6], points[5]]]);//equivalent mipmap
  }
  else{
    await objListLeaflet[rgImageFocus][1].reposition(L.latLng(points[8],points[7]),L.latLng(points[6],points[5]),L.latLng(points[2],points[1]));
    await objListLeaflet[rgImageFocus + 1][1].reposition(L.latLng(points[8],points[7]),L.latLng(points[6],points[5]),L.latLng(points[2],points[1]));
  }
}
function mushroomSelectorMouseHold(){
  console.log("hold!");
  changePosImage();
}
function mushroomSelectorMouseAppui(){
  //console.log("appui!");
  if(selector1Edit != null && mode != MODE_LECTURE && rgImageFocus >= 0 && actionEnCours == ACTNULL){
    selector1Edit.off('mousedown');//Supprime tous les gestionnaires 'mousedown' précédents
    selector1Edit.on('mousedown', (e) => {//Ajoute un seul gestionnaire 'mousedown'
      //console.log("Appui champignon golden");
      leaflet.disableDragging();
      if(mode == MODE_DEPLACEMENT) actionEnCours = ACTDEPLACEMENT;
      else if(mode == MODE_ROTATION) actionEnCours = ACTROTATION;
      else if(mode == MODE_ECHELLE) actionEnCours = ACTECHELLE;
      mouseLngLastState = mouseLng;
      //imageFocus.setCorners(newCorner1, newCorner2, newCorner3);
    });
  }
}
function mushroomSelectorMouseRelache(){
  //console.log("relache!");
  if(leaflet.isDraggingDisabled()) {
    leaflet.enableDragging();
    actionEnCours = ACTNULL;
  }
}
