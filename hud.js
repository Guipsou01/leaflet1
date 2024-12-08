class hudButton1{
    #btn = null;
    #btnContent = null;
    constructor(var1, varcontent){
        this.#btn = var1;
        this.#btnContent = varcontent;
        //
        /**appui sur le bouton editeur*/
        this.#btn.onclick = () => {
            if(mode == MODE_LECTURE) {
            mode = MODE_DEPLACEMENT;
            this.#btnContent.textContent = "Editor (move)";
            }
            else if(mode == MODE_DEPLACEMENT) {
            mode = MODE_ROTATION;
            this.#btnContent.textContent = "Editor (rotation)";
            }
            else if(mode == MODE_ROTATION) {
            mode = MODE_ECHELLE;
            this.#btnContent.textContent = "Editor (scale)";
            }
            else if(mode == MODE_ECHELLE) {
            mode = MODE_LECTURE;
            this.#btnContent.textContent = "Editor (off)";
            }
            mush.action();
        }
    }
    setText(txt){
        this.#btnContent.textContent = txt;
    }
    active(){
        this.#btn.disabled = false;
    }
    disable(){
        this.#btn.disabled = true;
    }
}
//
class hudButton2{
    #btn = null;
    #btnContent = null;
    constructor(var1, varcontent){
        this.#btn = var1;
        this.#btnContent = varcontent;
        //
        /**appui sur le bouton vecteur */
        this.#btn.onclick = () => {
            if(vecteurVisu == false) {
            vecteurVisu = true;
            this.#btnContent.textContent = "Parent (on)";
            }
            else if(vecteurVisu == true){
            vecteurVisu = false;
            this.#btnContent.textContent = "Parent (off)";
            }
            leaflet.actualiseMapTracee();
        }
    }
    setText(txt){
        this.#btnContent.textContent = txt;
    }
    active(){
        this.#btn.disabled = false;
    }
    disable(){
        this.#btn.disabled = true;
    }
}
//
class hudList{
    #btnMaps = null;
    #btnMapsList = null;
    constructor(_btnmaps, _btnmapslist){
        this.#btnMaps = _btnmaps;
        this.#btnMapsList = _btnmapslist;
        //
        this.#btnMaps.disabled = true;//desactivation par defaut
        this.#btnMapsList.innerHTML = '';//nettoyage liste
        //
        this.#btnMaps.addEventListener('click', () => {
            const isHidden = this.#btnMapsList.style.display === 'none';
            this.#btnMapsList.style.display = isHidden ? 'block' : 'none';
        });
        //Fermer la liste déroulante quand on clique en dehors
        window.addEventListener('click', (event) => {
            if (event.target !== this.#btnMaps) {
                this.#btnMapsList.style.display = 'none';
            }
        });
    }
    setText(txt){
        this.#btnMaps.textContent = txt;
    }
    disable(){
        this.#btnMaps.disabled = true;
    }
    active(){
        this.#btnMaps.disabled = false;//activation bouton reset
    }
    setListe(liste){
        if (!Array.isArray(liste)) {
            console.error("Erreur : 'liste' doit être un tableau.");
            return;
        }
        this.#btnMapsList.innerHTML = '';//Nettoie les anciennes options
        
        liste.forEach(option => {
            const link = document.createElement('a');
            link.href = "#";
            link.textContent = option;
            //
            link.addEventListener('click', (event) => {
              event.preventDefault(); //Empêche le comportement par défaut du lien
              this.setText(option);
              this.#btnMapsList.style.display = 'none'; //Masquer la liste après sélection
              //
              if (typeof sheetNameFocus !== 'undefined') sheetNameFocus = option;
              resetAllMapContent();
            });
            this.#btnMapsList.appendChild(link); //Ajouter le lien à la liste
        });
    }
}
