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
var imageFocus = null;
var isHolding2 = false;
var selectorPosX = 0;
var selectorPosY = 0;
const shroom = "https://mario.wiki.gallery/images/8/8b/SuperMushroom_-_2D_art.svg";
const goldenShroom = "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/ed991cf4-7c8c-4530-b6ba-a3abf3ab2eae/dd36ts2-3a51d2ff-7f4d-41a4-8e60-2cbaa0ae1bc8.png/v1/fill/w_900,h_900/super_mario__golden_mushroom_2d_by_joshuat1306_dd36ts2-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9OTAwIiwicGF0aCI6IlwvZlwvZWQ5OTFjZjQtN2M4Yy00NTMwLWI2YmEtYTNhYmYzYWIyZWFlXC9kZDM2dHMyLTNhNTFkMmZmLTdmNGQtNDFhNC04ZTYwLTJjYmFhMGFlMWJjOC5wbmciLCJ3aWR0aCI6Ijw9OTAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.eLm9NIiTXusG0laKtKWmLiqZNSK1PcWbEJY039obNhY";
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
    await objListLeaflet.push([['MARKER-STATIC-MS',"1"],selector1,0,false]);
    await objListLeaflet.push([['MARKER-STATIC-MS',"2"],selector2,0,false]);
    await objListLeaflet.push([['MARKER-STATIC-MS',"3"],selector3,0,false]);
    await objListLeaflet.push([['MARKER-STATIC-MS',"4"],selector4,0,false]);
    await objListLeaflet.push([['MARKER-STATIC-MS',"5"],selector5,0,false]);
    await objListLeaflet.push([['MARKER-STATIC-MS',"6"],selector1Edit,0,false]);
    await objListLeaflet.push([['MARKER-STATIC-MS',"7"],selector2Edit,0,false]);
    await objListLeaflet.push([['MARKER-STATIC-MS',"8"],selector3Edit,0,false]);
    await objListLeaflet.push([['MARKER-STATIC-MS',"9"],selector4Edit,0,false]);
    await objListLeaflet.push([['MARKER-STATIC-MS',"10"],selector5Edit,0,false]);
  }
  function mushroomSelectorMouseHold(){
    if(selector1Edit != null){
      selector1Edit.on('mousedown', function(e) {
        isHolding2 = true;
      });
      if(isHolding2 == true){
        //console.log("Appui champignon");
        //imageFocus.setCorners(newCorner1, newCorner2, newCorner3);
        //changePosImage3P(mouseLng,mouseLat,imageFocus);
        disableDragging();
      }
    }
  }
  async function setSelector(){
    if(imageFocus != null){
      if(editMode){
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
  async function resetSelector(){
    leaflet.closePopup();
    imageFocus = null;
    await changeSelectorPos(0,0,0,0,0,0,0,0,0,0);
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
  //map.getBounds().contains([selectorPosX, selectorPosY])
  async function actionImageFocus(imgfoc){
    imageFocus = imgfoc;
    if(imageFocus != null){
      //console.log("ok pour " + imageFocus.options.data[8] + ":" + imageFocus.options.data[9] + "?");
      var points = imageFocus[0];
      await changeSelectorPos(points[9],points[10],points[1],points[2],points[3],points[4],points[5],points[6],points[7],points[8]);
      await setSelector();
      await leaflet.actualiseMap();
      if(points[0] == 'IMG-LX-CENTER-R'){
        popup(convertToFloat(points[9]),convertToFloat(points[6]),"<h3>" + points[12] + "</h3><br>Author:  " + points[13] + "<br><br>Website link:<br><a href=" + points[14] + ">" + points[14] + "</a><br><br> GPS position: " + convertToFloat(points[9]).toFixed(1) + ":" + convertToFloat(points[10]).toFixed(1) + "<br>Image size: " + convertToFloat(points[15]) + ":" + convertToFloat(points[16]) + "<br>Image scale:" + convertToFloat(points[17]).toFixed(3) + ":" + convertToFloat(points[18]).toFixed(3) + "<br>Angle: " + points[20]);
      }
      else leaflet.popup(convertToFloat(points[9]),convertToFloat(points[6]),"<h3>" + points[12] + "</h3><br>Author:  " + points[13] + "<br><br>Website link:<br><a href=" + points[14] + ">" + points[14] + "</a><br><br> GPS position: " + convertToFloat(points[9]).toFixed(1) + ":" + convertToFloat(points[10]).toFixed(1) + "<br>Image size: " + convertToFloat(points[15]) + ":" + convertToFloat(points[16]) + "<br>Image scale:" + convertToFloat(points[17]).toFixed(3) + ":" + convertToFloat(points[18]).toFixed(3));
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
