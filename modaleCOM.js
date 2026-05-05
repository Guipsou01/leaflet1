
class FenetreModale {
    #popupContent = null;
    #croixModale = null;
    #fenetreModale = null;
    #isActif = false;
    constructor(modaleContent, croixModale, fenetreModaleID){
        try{
            if(!modaleContent) throw new Error("modaleContent non initialisé");
            if(!fenetreModaleID) throw new Error("fenetreModaleID non initialisé");
            this.#popupContent = modaleContent;
            this.#croixModale = croixModale;
            this.#fenetreModale = fenetreModaleID;
            /**appui sur la croix de la fenetre modale */
            if(croixModale) this.#croixModale.onclick = () => {this.close();}
            /**appui sur la fenetre */
            window.onclick = (event) => {if(event.target === this.#fenetreModale) this.close();}
        }
        catch (error) {console.error("Error:", error);}
    }
    openWithContent(texte){
        if(this.#popupContent == null) throw new Error("fenetre modale non init");
        this.#popupContent.innerHTML = texte;
        this.open();
    }
    open(){
        this.#fenetreModale.style.display = "flex";
        disableAllbuttons();
    }
    close(){
        this.#fenetreModale.style.display = "none";
        activeAllButtons();
    }
}
