
var selector1 = null;
var selector2 = null;
var selector3 = null;
var selector4 = null;
var selector5 = null;
var imageFocus = null;
//var imageFocus;

  function initSelector(){

    selector1 = markerStatic(0,0,10,10,"https://mario.wiki.gallery/images/8/8b/SuperMushroom_-_2D_art.svg");
    selector2 = markerStatic(0,0,10,10,"https://mario.wiki.gallery/images/8/8b/SuperMushroom_-_2D_art.svg");
    selector3 = markerStatic(0,0,10,10,"https://mario.wiki.gallery/images/8/8b/SuperMushroom_-_2D_art.svg");
    selector4 = markerStatic(0,0,10,10,"https://mario.wiki.gallery/images/8/8b/SuperMushroom_-_2D_art.svg");
    selector5 = markerStatic(0,0,10,10,"https://mario.wiki.gallery/images/8/8b/SuperMushroom_-_2D_art.svg");
  }
  function resetSelector(){
    changeSelectorPos(0,0,0,0,0,0,0,0,0,0);
    map.removeLayer(selector1);
    map.removeLayer(selector2);
    map.removeLayer(selector3);
    map.removeLayer(selector4);
    map.removeLayer(selector5);
    imageFocus = null;
  }
  function actionImageFocus(){
    if(imageFocus != null){
      map.addLayer(selector1);
      map.addLayer(selector2);
      map.addLayer(selector3);
      map.addLayer(selector4);
      map.addLayer(selector5);
      //console.log("ok pour " + imageFocus.options.data[8] + ":" + imageFocus.options.data[9] + "?");
      var points = imageFocus.options.data;
      changeSelectorPos(points[8],points[9],points[0],points[1],points[2],points[3],points[4],points[5],points[6],points[7]);
      popup(convertToFloat(points[3]),convertToFloat(points[8]),"<h3>" + points[10] + "</h3><br>Author:  " + points[11] + "<br><br>Website link:<br><a href=" + points[12] + ">" + points[12] + "</a><br><br> GPS position: " + convertToFloat(points[8]).toFixed(1) + ":" + convertToFloat(points[9]).toFixed(1));
    }
  }
  function updateImageFocus(imgfoc){
    imageFocus = imgfoc;
  }
  function changeSelectorPos(px,py,x1,y1,x2,y2,x3,y3,x4,y4){
    selector1.setLatLng(L.latLng(py,px));
    selector2.setLatLng(L.latLng(y1,x1));
    selector3.setLatLng(L.latLng(y2,x2));
    selector4.setLatLng(L.latLng(y3,x3));
    selector5.setLatLng(L.latLng(y4,x4));
  }
  //hitbox de détection
  function pointDansCarre(px,py,x1,y1,x2,y2,x3,y3,x4,y4){
    return (pointDansTriangle(px, py, x1, y1, x2, y2, x3, y3) || pointDansTriangle(px, py, x1, y1, x3, y3, x4, y4));
  }
  function pointDansTriangle(px, py, x1, y1, x2, y2, x3, y3){
		  if(dot(true, px, py, x1, y1, x2, y2)
      && dot(true, px, py, x2, y2, x3, y3)
      && dot(true, px, py, x3, y3, x1, y1)) return true;
      return false;
  }
  function dot(gauche, px, py, x1, y1, x2, y2){
    if(gauche) return ((x2 - x1) * (py - y1) - (px - x1) * (y2 - y1) < 0);
    else return ((x2 - x1) * (py - y1) - (px - x1) * (y2 - y1) > 0);
}
