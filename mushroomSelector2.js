 //FICHIER REGROUPANT LES FONCTIONS LIEES AU MUSHROOMSELECTOR
const shroom = "https://mario.wiki.gallery/images/8/8b/SuperMushroom_-_2D_art.svg";
const goldenShroom = "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/ed991cf4-7c8c-4530-b6ba-a3abf3ab2eae/dd36ts2-3a51d2ff-7f4d-41a4-8e60-2cbaa0ae1bc8.png/v1/fill/w_900,h_900/super_mario__golden_mushroom_2d_by_joshuat1306_dd36ts2-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9OTAwIiwicGF0aCI6IlwvZlwvZWQ5OTFjZjQtN2M4Yy00NTMwLWI2YmEtYTNhYmYzYWIyZWFlXC9kZDM2dHMyLTNhNTFkMmZmLTdmNGQtNDFhNC04ZTYwLTJjYmFhMGFlMWJjOC5wbmciLCJ3aWR0aCI6Ijw9OTAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.eLm9NIiTXusG0laKtKWmLiqZNSK1PcWbEJY039obNhY";
const setup1 = createDataObjet(MARKER_STATIC_MS);   setup1.l = new V2F(10,10);  setup1.url = shroom;
const setup2 = createDataObjet(MARKER_STATIC_MS);   setup2.l = new V2F(15,15);  setup2.url = goldenShroom;
class MushroomSelector {
  #calqueMush;
  #calqueMushGolden;
  #objFocus = null;
  #actionEnCours = null;
  constructor() {this.init();}
  async init(){
    try{
      this.#calqueMush = leaflet.generateCalque(false);
      this.#calqueMushGolden = leaflet.generateCalque(false);
      for(var i = 0; i < 5; i++){
        var data1 = createDataObjet(MARKER_STATIC_MS); data1.vTaille = new V2F(10,10); data1.url = shroom; data1.vPos = new V2F(2,2 + i); data1.plan = 9999;
        (await generateObject(data1)).addTo(this.#calqueMush);
        var data2 = createDataObjet(MARKER_STATIC_MS); data2.vTaille = new V2F(15,15); data2.url = goldenShroom; data2.vPos = new V2F(3,3 + i); data2.plan = 9999;
        (await generateObject(data2)).addTo(this.#calqueMushGolden);
      }
      leaflet.removeCalque(this.#calqueMush);
      leaflet.removeCalque(this.#calqueMushGolden);
    } catch (error) {console.error("Error:", error);}
  }
  async affichePopupOnFocusedObj(){
    if(this.#objFocus != null) await leaflet.popup(this.#objFocus._data.vPos, await affichepopupobjet(this.#objFocus._data));
  }
  async getObjFocus(){
    return this.#objFocus;
  }
  hasDataFocus(){return (this.#objFocus != null);}
  async updatePosIconsOnFocusedData(){
    try{
      if(this.#objFocus == null) throw new Error("data non select " + this.#objFocus);
      (this.#calqueMush.getLayers()[0]).setLatLng(toLLCoords(this.#objFocus._data.vPos1));
      (this.#calqueMush.getLayers()[1]).setLatLng(toLLCoords(this.#objFocus._data.vPos2));
      (this.#calqueMush.getLayers()[2]).setLatLng(toLLCoords(this.#objFocus._data.vPos3));
      (this.#calqueMush.getLayers()[3]).setLatLng(toLLCoords(this.#objFocus._data.vPos4));
      (this.#calqueMush.getLayers()[4]).setLatLng(toLLCoords(this.#objFocus._data.vPos));
      (this.#calqueMushGolden.getLayers()[0]).setLatLng(toLLCoords(this.#objFocus._data.vPos1));
      (this.#calqueMushGolden.getLayers()[1]).setLatLng(toLLCoords(this.#objFocus._data.vPos2));
      (this.#calqueMushGolden.getLayers()[2]).setLatLng(toLLCoords(this.#objFocus._data.vPos3));
      (this.#calqueMushGolden.getLayers()[3]).setLatLng(toLLCoords(this.#objFocus._data.vPos4));
      (this.#calqueMushGolden.getLayers()[4]).setLatLng(toLLCoords(this.#objFocus._data.vPos));
    } catch (error) {console.error("Error:", error);}
  }
  disable(){
    this.#objFocus = null;
    leaflet.removeCalque(this.#calqueMush);
    leaflet.removeCalque(this.#calqueMushGolden);
  }
  async mouseDownSurObjet(obj){this.setObjFocus(obj);}
  async mouseMove(){
    try{
      if(this.#actionEnCours == MODE_DEPLACEMENT || this.#actionEnCours == MODE_ECHELLE || this.#actionEnCours == MODE_ROTATION) dynamicTransform(this.#objFocus._data, this.#objFocus, this.#actionEnCours);
    } catch (error) {console.error("Error:", error);}
  }
  async mouseDown(){
    try{
      if(this.#objFocus != null){
        if((mode == MODE_DEPLACEMENT || mode == MODE_ECHELLE || mode == MODE_ROTATION || mode == MODE_LINK) && this.curseurSurObjSelect()) {
          leaflet.removeCalque(this.#calqueMush);
          leaflet.addCalque(this.#calqueMushGolden);
          leaflet.disableDragging();
          this.#actionEnCours = mode;
          mainTxt(modetotxt(this.#actionEnCours));
        }
      }
    } catch (error) {console.error("Error:", error);}
  }
  async mouseUp(){
    if(mode == MODE_DEPLACEMENT || mode == MODE_ECHELLE || mode == MODE_ROTATION || mode == MODE_LINK) {
      mainTxt("");
      leaflet.removeCalque(this.#calqueMushGolden);
      leaflet.addCalque(this.#calqueMush);
      leaflet.enableDragging();
      this.#actionEnCours = null;
    }
  }
  curseurSurObjSelect(){
    if(this.#objFocus == null) return false;
    if(this.#objFocus._data.type == MARKER) return pointDansCarre(leaflet.getMousePos(), this.#objFocus._data.vPos1.pAbs(), this.#objFocus._data.vPos4.pAbs(), this.#objFocus._data.vPos3.pAbs(), this.#objFocus._data.vPos2.pAbs());
    else if(this.#objFocus._data.type == IMAGE || this.#objFocus._data.type == TEXTE) return pointDansCarre(leaflet.getMousePos(), this.#objFocus._data.vPos1.pAbs(), this.#objFocus._data.vPos2.pAbs(), this.#objFocus._data.vPos3.pAbs(), this.#objFocus._data.vPos4.pAbs());
  }
  async setObjFocus(obj){
    try{
      if(obj == null) throw new Error("erreur");
      this.#objFocus = obj;
      if(mode == MODE_LECTURE || mode == MODE_ECHELLE || mode == MODE_ROTATION || mode == MODE_DEPLACEMENT || mode == MODE_LINK) leaflet.addCalque(this.#calqueMush);
      //leaflet.addCalque(this.#calqueMushGolden);
      this.updatePosIconsOnFocusedData();
    } catch (error) {console.error("Error:", error);}
  }
}
