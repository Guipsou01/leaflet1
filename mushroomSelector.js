//FICHIER REGROUPANT LES FONCTIONS LIEES AU MUSHROOMSELECTOR
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
  #cleImageFocus = null;
  #isActif = false;
  #allmarkersdata = [null,null,null,null,null,null,null,null,null,null];
  constructor() {}
  /**initialisation des données du Mushroom selector */
  async init(){
    try{
      const setup1 = createDataObjet(MARKER_STATIC_MS);
      const setup2 = createDataObjet(MARKER_STATIC_MS);
      setup1.l = new V2F(10,10);
      setup1.url = shroom;
      setup2.l = new V2F(15,15);
      setup2.url = goldenShroom;
      for(var i = 0; i < this.#allmarkersdata.length; i++)                                  this.#allmarkersdata[i] = createDataObjet(MARKER_STATIC_MS); 
      for(var i = 0; i < (this.#allmarkersdata.length / 2); i++)                            this.#copyValues(this.#allmarkersdata[i], setup1);
      for(var i = (this.#allmarkersdata.length / 2); i < this.#allmarkersdata.length; i++)  this.#copyValues(this.#allmarkersdata[i], setup2);
      for(var i = 0; i < this.#allmarkersdata.length; i++){
        this.#allmarkersdata[i] = await generateObject(this.#allmarkersdata[i]); 
        this.#allmarkersdata[i].titre = ("msms" + i);
        this.#allmarkersdata[i].actif = false;
        mapListLeaflet.set(this.#allmarkersdata[i].key, this.#allmarkersdata[i]);
        //PR,BG,BD,HD,HG
      }
    } catch (error) {console.error("Error:", error);}
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
  async changePos(tabl){
    if(tabl.length != 5) throw new Error("tableau non egal a 5: " + tabl.length);
    selectorPos.set(tabl[0]);
    for(var i = 0; i < 10; i++) await this.#allmarkersdata[i].objet.setLatLng(toLLCoords(tabl[i % 5]));
  }
  async imageFocus(){
    return (this.#cleImageFocus != null && this.#isActif);
  }
  /**réinitialise la position et la visibilité des icones, l'affichage du popup, défocus l'image select*/
  async reset(){
    if(this.#isActif){
      this.#cleImageFocus = null;
      await this.changePos([new V2F(0,0),new V2F(0,0),new V2F(0,0),new V2F(0,0),new V2F(0,0)]);
      await this.updateTracageMarkers();
      leaflet.closePopup();
    }
  }
  /**desactive et réactive l'affichage des markers si image focus existante et mode lecture*/
  updateTracageMarkers(){
    if(this.#isActif) for(var i = 0; i < this.#allmarkersdata.length; i++) this.#allmarkersdata[i].actif = false; 
    if(this.#cleImageFocus != null){
      if(mode != MODE_LECTURE)  for(var i = (this.#allmarkersdata.length / 2); i < this.#allmarkersdata.length; i++)  this.#allmarkersdata[i].actif = true;
      else                      for(var i = 0; i < (this.#allmarkersdata.length / 2); i++)                            this.#allmarkersdata[i].actif = true;
    }
  }
  /**copy colle certains parametres de marker static ms */
  #copyValues(data1, data2){
    data1.l = data2.l;
    data1.url = data2.url;
  }
  /**actions de relachement de souris */
  mouseRelache(){
    if(this.#isActif) if(leaflet.isDraggingDisabled()) {
      leaflet.enableDragging();
      actionEnCours = ACTNULL;
    }
  }
  /**met a jour la position des icones sur l'objet focus */
  async updatePos(){
    if(this.#cleImageFocus != null){
      var points = await mapListLeaflet.get(await mush.getCleImageFocus());
      if(points != null)  mush.changePos([points.vPos,points.vPos1,points.vPos2,points.vPos3,points.vPos4]);
    }
  }
  /**retourne la clé de l'image focus par le ms, retourne null si aucun objet focus*/
  async getCleImageFocus(){
    return this.#cleImageFocus;
  }
  /**prend la clé de la liste et la retiens en objet focus*/
  async insertObjetFocus(imgfoc){
    this.#cleImageFocus = imgfoc;
  }
  /**actions d'appui de transformation de souris*/
  async MouseAppui(e){
    if(!this.#isActif) return;
    var layerFin = await leaflet.findObjFocus(new V2F(e.latlng.lng, e.latlng.lat));//rang obj focus si objet a focus detecte au niveau de la souris
    if(layerFin != null) {//si objet trouvé a l'appui...
      this.#cleImageFocus = layerFin;
      var points = await mapListLeaflet.get(this.#cleImageFocus);
      var type = points.type;
      await this.changePos([points.vPos,points.vPos1,points.vPos2,points.vPos3,points.vPos4]);
      await this.updateTracageMarkers();
      if((mode == MODE_DEPLACEMENT || mode == MODE_ROTATION || mode == MODE_ECHELLE || mode == MODE_INSERTION) && this.#cleImageFocus != null && actionEnCours == ACTNULL){
        await leaflet.disableDragging();
             if(mode == MODE_DEPLACEMENT) actionEnCours = ACTDEPLACEMENT;
        else if(mode == MODE_ROTATION)    actionEnCours = ACTROTATION;
        else if(mode == MODE_ECHELLE)     actionEnCours = ACTECHELLE;
        mouseLngLastState = mousePos.x;
      }
      else if((mode == MODE_LECTURE) && this.#cleImageFocus != null && actionEnCours == ACTNULL) {
        if(type == IMAGE || type == TEXTE){
          //image sans angle
          if(points.vAngle == null && mode == MODE_LECTURE) await leaflet.popup(points,"<h3>" + points.titre + "</h3><br>Author:  " + points.auteur + "<br><br>Website link:<br><a href=" + points.site + ">" + points.site + "</a><br><br> GPS position: " + convertToFloat(points.vPos.xAbs()).toFixed(3) + ":" + convertToFloat(points.vPos.yAbs()).toFixed(3) + "<br>Image size: " + convertToFloat(points.vImgTaille.xAbs()) + ":" + convertToFloat(points.vImgTaille.yAbs()) + "<br>Image scale:" + convertToFloat(points.vTaille.xAbs()).toFixed(3) + ":" + convertToFloat(points.vTaille.yAbs()).toFixed(3));
          //image avec angle
          if(points.vAngle != null && mode == MODE_LECTURE) await leaflet.popup(points,"<h3>" + points.titre + "</h3><br>Author:  " + points.auteur + "<br><br>Website link:<br><a href=" + points.site + ">" + points.site + "</a><br> GPS position (abs.): " + convertToFloat(points.vPos.xAbs()).toFixed(3) + ":" + convertToFloat(points.vPos.yAbs()).toFixed(3) + "</a><br> GPS position (rel.): " + convertToFloat(points.vPos.x).toFixed(3) + ":" + convertToFloat(points.vPos.y).toFixed(3) + "<br>Image size: " + convertToFloat(points.vImgTaille.xAbs()) + ":" + convertToFloat(points.vImgTaille.yAbs()) + "<br>Image scale:" + convertToFloat(points.vTaille.xAbs()).toFixed(3) + ":" + convertToFloat(points.vTaille.yAbs()).toFixed(3) + "<br>Angle: " + points.vAngle.getAngle());
          await actualiseMap(leaflet.getMap(), false);
        }
        else if(type == MARKER){
          await leaflet.closePopup();
          if(points.vAngle == null) await leaflet.popup(points,points.titre);
          else await leaflet.popup(points,points.titre + "<h3>" + points.vAngle.getAngle());
          await actualiseMap(leaflet.getMap(), false);
        }
        else await this.reset();
      }
    }
    else await this.reset();
    //await actualiseMap(leaflet.getMap(), true);
    //mapListLeaflet
  }
}
