class hudVirtualList {
    #btnLocations = null;
    #btnLocationsContent = null;
    #virtualList = null;
    #itemLy = 30; //hauteur de chaque élément
    #viewportLy = 300; //hauteur visible de la liste
    #listetotale = null;
    #listContent = null;
    constructor(input1, input3, input4){
        this.#btnLocations = input1;
        this.#btnLocations.disabled = true;
        this.#btnLocationsContent = input3;
        this.#virtualList = input4;
        this.#virtualList.style.overflow = "auto";
        this.#virtualList.style.position = "absolute";
        this.#virtualList.style.height = `${this.#viewportLy}px`;
    }
    setName(name){
        console.log("update name");
        this.#btnLocationsContent.textContent = name;
    }
    update(){
        if(this.#virtualList == null) throw new Error("virtual list non défini");
        if(this.#listetotale == null) throw new Error("liste non enregistrée");
        this.renderItems();
    }
    //
    renderItems = () => {
        if (!this.#listetotale || !this.#listContent) return;
        //this.#btnLocationsContent.textContent = "Locations List (" + compareMapListLocations() + " / " + mapListLocations.length + ")";
        // Crée un conteneur interne pour la liste
          const scrollTop = this.#virtualList.scrollTop;
          const startIndex = Math.floor(scrollTop / this.#itemLy);
          const endIndex = Math.min(startIndex + Math.ceil(this.#viewportLy / this.#itemLy) + 1, this.#listetotale.length);
      
          //Nettoie les anciens éléments
          this.#listContent.innerHTML = '';
      
          for (let i = startIndex; i < endIndex; i++) {
            const item = document.createElement('button');
            item.className = 'item';
            item.style.top = `${i * this.#itemLy}px`;
            item.style.height = `${this.#itemLy}px`;
            //item.style.width = '100%'; //Largeur 100% pour s'adapter au conteneur
            item.textContent = this.#listetotale[i][0];
            if(findKeyWithChampValide("titre",this.#listetotale[i][0]) != null) item.disabled = true;
            //ss
            item.onclick = () => {
              //
              item.disabled = true;
              mode = MODE_INSERTION;
              btnEditorContent.textContent = "Insertion";
              btnEditor.disabled = true;
              //creation objet
              createMarker(this.#listetotale[i][0], this.#listetotale[i][1]);
              actionEnCours = ACTDEPLACEMENT;
              //lancement boucle d'insertion
              holdInterval = setInterval(() => {mush.modeDeplacementSpam();}, 10);//verifie toute les 100ms
              //mush.active();
            };
            this.#listContent.appendChild(item);
        };
    }
    //applique une liste au format tableau classique
    setListe(liste){
        this.#listetotale = liste;
        if (this.#listContent) this.#listContent.remove();
        this.#listContent = document.createElement('div');
        this.#listContent.style.height = `${(this.#listetotale.length * this.#itemLy)}px`;
        this.#listContent.style.position = 'relative';
        this.#virtualList.appendChild(this.#listContent);
        // Ajoute un écouteur pour détecter les scrolls
        this.#virtualList.removeEventListener('scroll', this.renderItems);
        this.#virtualList.addEventListener('scroll', this.renderItems);
        //
        this.update();
    }

    createSelector(){
        /*mapListLocations.forEach(option => {
          const link = document.createElement('a');
          link.href = "#";
          //btnLocationsList.appendChild(link); //Ajouter le lien à la liste
        });*/
        this.#btnLocations.onclick = () => {
          //var donneesLocations = await google.getContenuTableau(sheetNameFocus);
          //btnLocationsList.style.display = btnLocationsList.style.display === 'none' ? 'block' : 'none';//affichage
          mush.reset();
          mush.disable();
          this.#virtualList.style.display = this.#virtualList.style.display === 'none' ? 'block' : 'none';//affichage
          // Rendu initial
          this.update();
        };
        //Fermer la liste déroulante quand on clique en dehors
        window.onclick = (event) => {
          if(!event.target.matches(`#${this.#btnLocations.id}`)) {
            this.#virtualList.style.display = 'none';
            if(mode != MODE_INSERTION) mush.active();
          }
        };
      }
      active(){
        this.#btnLocations.disabled = false;
      }
      disable(){
        this.#btnLocations.disabled = true;
      }
}
