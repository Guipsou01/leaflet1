
class FenetreModale {
    #popupContent = null;
    #croixCredits = null;
    #fenetreCredits = null;
    #isActif = false;
    constructor(modaleContent, croixCredits, fenetreCreditsID){
        this.#popupContent = modaleContent;
        this.#croixCredits = croixCredits;
        this.#fenetreCredits = fenetreCreditsID;
        /**appui sur la croix de la fenetre modale */
        this.#croixCredits.onclick = () => {
            this.close();
        }
        /**appui sur la fenetre */
        window.onclick = (event) => {
            if(event.target === this.#fenetreCredits) this.close();
        }
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
