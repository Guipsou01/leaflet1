var fenetreCredits = document.getElementById("fenetreCreditsId");
var popupContent = document.getElementById('fenetreCredits-content');
var croixCredits = document.getElementsByClassName("croixCreditsId")[0];
class FenetreModale {
    #isActif = false;
    constructor(){
    }
    openWithContent(texte){
        popupContent.innerHTML = texte;
        fenetreCredits.style.display = "block";
    }
    close(){
        fenetreCredits.style.display = "none";
    }
}
/**appui sur la fenetre */
window.onclick = function(event) {
    if(event.target == fenetreCredits) fenetreCredits.style.display = "none";
}
/**appui sur la croix de la fenetre modale */
croixCredits.onclick = function() {
    fenetreModale.close();
}
