//INTERFACE, PARTIE PROTOTYPE COMMUNE
class hudList {
  #btn = null;//bouton principal
  #listContent = null;//liste d'objets html
  #colonneAAfficher = 0;
  #fctOnClickBtn = null;
  #fctOnClickLst = null;
  #fctOnClickExt = null;
  #fctOnRenderForEachSlot = null;
  #listetotale = null;//liste complete d'origine
  #slotLy = 30;//hauteur de chaque élément
  #virtualList = null;//objet virtuallist
  #viewportLy = 300;//hauteur visible de la liste en mode vl
  #vlOn = false;
  //
  constructor(_btn, _btnlist, _vlOn){
    this.#vlOn = _vlOn;
    this.#btn = _btn; //objet html bouton
    this.#btn.disabled = true; //desactivation par defaut
    this.#virtualList = _btnlist; //objet html vl
    //this.#virtualList.style.overflow = "auto";
    this.#virtualList.style.position = "absolute";
    this.#virtualList.style.height = `${this.#viewportLy}px`;
    //
    this.#btn.onclick = () => {
      this.#changeEtatListe();//affiche ou marque la liste lors de l'appui
      if(this.#fctOnClickBtn != null) this.#fctOnClickBtn();
    };
    //Fermer la liste déroulante quand on clique en dehors
    window.onclick = (event) => {
      if(!this.#btn.contains(event.target) && !this.#virtualList.contains(event.target)) {
        this.fermerListe();
        if(this.#fctOnClickExt != null) this.#fctOnClickExt();
      }
    };
  }
  //erreurSiNotFunction(fct){}
  fermerListe(){//Masquer la liste après sélection
    this.#virtualList.style.display = 'none';
  }
  #changeEtatListe(){//alterne entre état caché et affiché en fonction de l'etat
    const listeAffichee = (this.#virtualList.style.display || 'none') === 'none';
    this.#virtualList.style.display = listeAffichee ? 'block' : 'none';//affichage
    if(listeAffichee) this.#renderItems();
  };
  /**Applique un texte au bouton de sélecteur */
  setText(txt){
    this.#btn.textContent = txt;
  }
  active(){
    this.#btn.disabled = false;
  }
  disable(){
    this.#btn.disabled = true;
    this.fermerListe();
  }
  getElemByRg(rg){
    return this.#listetotale[rg];
  }
  //
  #renderItems = () => {
    if (!this.#listetotale || !this.#listContent) return;
    //this.#btnLocationsContent.textContent = "Locations List (" + compareMapListLocations() + " / " + mapListLocations.length + ")";
    var startIndex = 0;
    var endIndex = this.#listetotale.length;
    if(this.#vlOn){
      //Crée un conteneur interne pour la liste
      const scrollTop = this.#virtualList.scrollTop;
      startIndex = Math.floor(scrollTop / this.#slotLy);
      endIndex = Math.min(startIndex + Math.ceil(this.#viewportLy / this.#slotLy) + 1, this.#listetotale.length);//nb elements + 1 pour débord
    }
    //
    this.#listContent.innerHTML = '';//Nettoie les anciens éléments
    for(let i = startIndex; i < endIndex; i++) {
      //const slot = document.createElement('a');
      //slot.href = "#";
      const slot = document.createElement('button');
      slot.className = 'item';
      slot.style.top = `${i * this.#slotLy}px`;
      slot.style.height = `${this.#slotLy}px`;
      //slot.disabled = true;
      slot.textContent = Array.isArray(this.#listetotale[i]) ? this.#listetotale[i][this.#colonneAAfficher] : this.#listetotale[i];
      if(this.#fctOnRenderForEachSlot != null) this.#fctOnRenderForEachSlot(this.#listetotale[i], slot);
      slot.onclick = () => {
        if(this.#fctOnClickLst != null) this.#fctOnClickLst(this.#listetotale[i], i, slot);
        this.fermerListe();
      };
      this.#listContent.appendChild(slot); //Ajouter le lien à la liste
    };
  }
  /**applique une liste au format tableau classique, si compote plusieurs colonnes (tableau 2d), choisis la colonne correspondante a afficher, 0 si une seule colonne*/
  setListe(liste, col){
    if(!Array.isArray(liste)) throw new Error("Erreur : 'liste' doit être un tableau.");
    this.#colonneAAfficher = col;
    this.#listetotale = liste;
    if(this.#listContent) this.#listContent.remove();
    //
    this.#listContent = document.createElement('div');
    this.#listContent.style.height = `${(this.#listetotale.length * this.#slotLy)}px`;
    this.#listContent.style.position = 'relative';
    //
    this.#virtualList.appendChild(this.#listContent);
    //Ajoute un écouteur pour détecter les scrolls
    if(this.#vlOn) this.#virtualList.removeEventListener('scroll', this.#renderItems);
    if(this.#vlOn) this.#virtualList.addEventListener('scroll', this.#renderItems);
    this.#renderItems();
  }
  setFunctionOnClickBtn(fct){
    //erreurSiNotFunction(fct);
    this.#fctOnClickBtn = fct;
  }
  setFunctionOnClickListe(fct) {
    //erreurSiNotFunction(fct);
    this.#fctOnClickLst = fct;
  }
  setFunctionOnRenderForEachSlot(fct) {
    //erreurSiNotFunction(fct);
    this.#fctOnRenderForEachSlot = fct;
  }
  setFunctionOnClickExtFenetreWhenAffichee(fct){
    //erreurSiNotFunction(fct);
    this.#fctOnClickExt = fct;
  }
}
//INTERFACE BOUTON SIMPLE
class hudButton1{
  #btn = null; //bouton principal
  #fctOnClick = null; //Fonction de gestion des clics
  constructor(var1, varcontent){
    this.#btn = var1; //objet html bouton
    this.#btn.disabled = true;
  }
  //erreurSiNotFunction(fct){}
  /**Applique un texte au bouton de sélecteur */
  setText(txt)  {this.#btn.textContent = txt;}
  active()      {this.#btn.disabled = false;}
  disable()     {this.#btn.disabled = true;}
  /**prend une fonction en paramètre et l'éxécute lors de l'appui sur le bouton. Fonction sans paramètre uniquement*/
  setFunctionOnClick(fct) {
    //erreurSiNotFunction(fct); 
    this.#fctOnClick = fct;
    if(this.#fctOnClick != null && this.#btn != null) this.#btn.onclick = () => {this.#fctOnClick();}
  }
}
