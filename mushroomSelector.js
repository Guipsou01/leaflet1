//FICHIER REGROUPANT LES FONCTIONS LIEES AU MUSHROOMSELECTOR
var isHolding2 = false;
var selectorPos = new V2F();
const ACTNULL = 0;
const ACTDEPLACEMENT = 1;   
const ACTROTATION = 2;
const ACTECHELLE = 3;
const ACTLINK = 4;
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
      const setup1 = createDataObjet(MARKER_STATIC_MS);   setup1.l = new V2F(10,10);  setup1.url = shroom;
      const setup2 = createDataObjet(MARKER_STATIC_MS);   setup2.l = new V2F(15,15);  setup2.url = goldenShroom;
      for(var i = 0; i < this.#allmarkersdata.length; i++)                                  this.#allmarkersdata[i] = createDataObjet(MARKER_STATIC_MS); 
      for(var i = 0; i < (this.#allmarkersdata.length / 2); i++)                            this.#copyValues(this.#allmarkersdata[i], setup1);
      for(var i = (this.#allmarkersdata.length / 2); i < this.#allmarkersdata.length; i++)  this.#copyValues(this.#allmarkersdata[i], setup2);
      for(var i = 0; i < this.#allmarkersdata.length; i++){
        this.#allmarkersdata[i] = await generateObject(this.#allmarkersdata[i]); 
        this.#allmarkersdata[i].titre = ("msms" + i);
        this.#allmarkersdata[i].actif = false;
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
    //for(var i = 0; i < 10; i++) await this.#allmarkersdata[i].objet[0].setLatLng(toLLCoords(tabl[i % 5]));
  }
  async imageFocus(){
    return (this.#cleImageFocus != null && this.#isActif);
  }
  /**réinitialise la position et la visibilité des icones, l'affichage du popup, défocus l'image select*/
  async reset(){
    if(this.#isActif){
      this.#cleImageFocus = null;
      await this.changePos([new V2F(0,0),new V2F(0,0),new V2F(0,0),new V2F(0,0),new V2F(0,0)]);
      await this.calculTracabiliteMarkers();
      leaflet.closePopup();
    }
  }
  /**desactive et réactive l'affichage des markers en fonction du mode*/
  calculTracabiliteMarkers(){
    try{
      if(this.#cleImageFocus != null){
        this.#isActif = true;
        if(mode != MODE_LECTURE) for(var i = 0; i < (this.#allmarkersdata.length / 2); i++) {
          this.#allmarkersdata[i].actif = false;
          this.#allmarkersdata[i + this.#allmarkersdata.length / 2].actif = true;
        }
        else for(var i = 0; i < (this.#allmarkersdata.length / 2); i++) {
          this.#allmarkersdata[i].actif = true;
          this.#allmarkersdata[i + this.#allmarkersdata.length / 2].actif = false;
        }
      }
      else for(var i = 0; i < this.#allmarkersdata.length; i++) this.#allmarkersdata[i].actif = false; 
    }
    catch (error) {console.error("Error:", error);}
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
  async updateObj(){
    //console.log("updateobj");
    //for(var i = 0; i < this.#allmarkersdata.length; i++) this.#allmarkersdata[i].isActif = true;
    for(var i = 0; i < this.#allmarkersdata.length; i++) leaflet.updateObj(this.#allmarkersdata[i]);
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
      var texte = "";
      await this.changePos([points.vPos,points.vPos1,points.vPos2,points.vPos3,points.vPos4]);
      if((mode == MODE_DEPLACEMENT || mode == MODE_ROTATION || mode == MODE_ECHELLE || mode == MODE_INSERTION || mode == MODE_LINK) && this.#cleImageFocus != null && actionEnCours == ACTNULL){
        await leaflet.disableDragging();
             if(mode == MODE_DEPLACEMENT) actionEnCours = ACTDEPLACEMENT;
        else if(mode == MODE_ROTATION)    actionEnCours = ACTROTATION;
        else if(mode == MODE_ECHELLE)     actionEnCours = ACTECHELLE;
        else if(mode == MODE_LINK)        actionEnCours = ACTLINK;
        mouseLngLastState = mousePos.x;
      }
      else if((mode == MODE_LECTURE) && this.#cleImageFocus != null && actionEnCours == ACTNULL) {
        await leaflet.closePopup();
        texte += "<h3>" + points.titre + "</h3>";
        if(type == IMAGE) texte += "Author:  " + points.auteur + "<br>Website link: <a href=" + points.site + ">[Click here]</a><br><br>";
        if(type == IMAGE || type == TEXTE) texte += "Image size: " + points.vImgTaille.toTxtSimpleAbs(0) + "<br>Image scale:" + points.vTaille.toTxtSimpleAbs(3) + "<br>";
        if(points.vPos != null) texte += "GCS rel. position: " + points.vPos.toTxtSimple(3) + "<br>GCS abs. position: " + points.vPos.toTxtSimpleAbs(3) + "<br>";
        if(points.vAngle != null) texte += "Angle: " + points.vAngle.getAngle() + "<br>";
        if(points.vOrigine != null && points.vOrigine != "null") texte += "Child of: " + points.vOrigine + "<br>";
        leaflet.popup(points, texte);
        await actualiseMap(leaflet.getMap(), false);
        //else await this.reset();
      }
    }
    else await this.reset();
    //await actualiseMap(leaflet.getMap(), true);
    //mapListLeaflet
  }
}
