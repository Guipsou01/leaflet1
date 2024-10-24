
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
const shroom = "https://mario.wiki.gallery/images/8/8b/SuperMushroom_-_2D_art.svg";
const goldenShroom = "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/ed991cf4-7c8c-4530-b6ba-a3abf3ab2eae/dd36ts2-3a51d2ff-7f4d-41a4-8e60-2cbaa0ae1bc8.png/v1/fill/w_900,h_900/super_mario__golden_mushroom_2d_by_joshuat1306_dd36ts2-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9OTAwIiwicGF0aCI6IlwvZlwvZWQ5OTFjZjQtN2M4Yy00NTMwLWI2YmEtYTNhYmYzYWIyZWFlXC9kZDM2dHMyLTNhNTFkMmZmLTdmNGQtNDFhNC04ZTYwLTJjYmFhMGFlMWJjOC5wbmciLCJ3aWR0aCI6Ijw9OTAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.eLm9NIiTXusG0laKtKWmLiqZNSK1PcWbEJY039obNhY";
//var imageFocus;

  async function initSelector(){
    selector1 = markerStatic(0,0,10,10,shroom);//PR
    selector2 = markerStatic(0,0,10,10,shroom);//BG
    selector3 = markerStatic(0,0,10,10,shroom);//BD
    selector4 = markerStatic(0,0,10,10,shroom);//HD
    selector5 = markerStatic(0,0,10,10,shroom);//HG
    selector1Edit = markerStatic(0,0,15,15,goldenShroom);
    selector2Edit = markerStatic(0,0,15,15,goldenShroom);
    selector3Edit = markerStatic(0,0,15,15,goldenShroom);
    selector4Edit = markerStatic(0,0,15,15,goldenShroom);
    selector5Edit = markerStatic(0,0,15,15,goldenShroom);
    resetMarkers();
  }
  function mushroomSelectorMouseHold(){
    if(selector1Edit != null){
      selector1Edit.on('mousedown', function(e) {
        isHolding2 = true;
      });
      if(isHolding2 == true){
        console.log("Appui champignon");
        //imageFocus.setCorners(newCorner1, newCorner2, newCorner3);
        changePosImage3P(mouseLng,mouseLat,imageFocus);
        map.dragging.disable();
      }
    }
  }
  function updateSelector(){
    if(imageFocus != null){
      map.closePopup();
      resetMarkers();
      if(editMode){
        map.addLayer(selector1Edit);
        map.addLayer(selector2Edit);
        map.addLayer(selector3Edit);
        map.addLayer(selector4Edit);
        map.addLayer(selector5Edit);
      }
      else{
        map.addLayer(selector1);
        map.addLayer(selector2);
        map.addLayer(selector3);
        map.addLayer(selector4);
        map.addLayer(selector5);
      }
    }
  }
  function resetMarkers(){
    map.removeLayer(selector1);
    map.removeLayer(selector2);
    map.removeLayer(selector3);
    map.removeLayer(selector4);
    map.removeLayer(selector5);
    map.removeLayer(selector1Edit);
    map.removeLayer(selector2Edit);
    map.removeLayer(selector3Edit);
    map.removeLayer(selector4Edit);
    map.removeLayer(selector5Edit);
  }
  function resetSelector(){
    changeSelectorPos(0,0,0,0,0,0,0,0,0,0);
    resetMarkers();
    imageFocus = null;
  }
  function actionImageFocus(imgfoc){
    imageFocus = imgfoc;
    if(imageFocus != null){
      updateSelector();
      //console.log("ok pour " + imageFocus.options.data[8] + ":" + imageFocus.options.data[9] + "?");
      var points = imageFocus.options.data;
      changeSelectorPos(points[8],points[9],points[0],points[1],points[2],points[3],points[4],points[5],points[6],points[7]);
      popup(convertToFloat(points[8]),convertToFloat(points[5]),"<h3>" + points[10] + "</h3><br>Author:  " + points[11] + "<br><br>Website link:<br><a href=" + points[12] + ">" + points[12] + "</a><br><br> GPS position: " + convertToFloat(points[8]).toFixed(1) + ":" + convertToFloat(points[9]).toFixed(1) + "<br>Image size: " + convertToFloat(points[13]) + ":" + convertToFloat(points[14]));
    }
  }
  function changeSelectorPos(px,py,x1,y1,x2,y2,x3,y3,x4,y4){
    selector1.setLatLng(L.latLng(py,px));
    selector2.setLatLng(L.latLng(y1,x1));
    selector3.setLatLng(L.latLng(y2,x2));
    selector4.setLatLng(L.latLng(y3,x3));
    selector5.setLatLng(L.latLng(y4,x4));
    selector1Edit.setLatLng(L.latLng(py,px));
    selector2Edit.setLatLng(L.latLng(y1,x1));
    selector3Edit.setLatLng(L.latLng(y2,x2));
    selector4Edit.setLatLng(L.latLng(y3,x3));
    selector5Edit.setLatLng(L.latLng(y4,x4));
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
