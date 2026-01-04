
class FenetreModale {
    #popupContent = null;
    #croixCredits = null;
    #fenetreCredits = null;
    #isActif = false;
    constructor(modaleContent, croixCredits, fenetreCreditsID){
        try{
            if(!modaleContent) throw new Error("modaleContent non initialisé");
            if(!croixCredits) throw new Error("croixCredits non initialisé");
            if(!fenetreCreditsID) throw new Error("fenetreCreditsID non initialisé");
            this.#popupContent = modaleContent;
            this.#croixCredits = croixCredits;
            this.#fenetreCredits = fenetreCreditsID;
            /**appui sur la croix de la fenetre modale */
            this.#croixCredits.onclick = () => {this.close();}
            /**appui sur la fenetre */
            window.onclick = (event) => {if(event.target === this.#fenetreCredits) this.close();}
        }
        catch (error) {console.error("Error:", error);}
    }
    openWithContent(texte){
        if(this.#popupContent == null) throw new Error("fenetre modale non init");
        this.#popupContent.innerHTML = texte;
        this.open();
    }
    open(){
        this.#fenetreCredits.style.display = "block";
        disableAllbuttons();
    }
    close(){
        this.#fenetreCredits.style.display = "none";
        activeAllButtons();
    }
}
