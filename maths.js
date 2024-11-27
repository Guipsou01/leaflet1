//FICHIER QUI REGROUPE LES FONCTIONS DE CONVERSIONS MATHEMATIQUES ET DE TYPE GENERIQUE JAVASCRIPT
/**convertis les degrés en radians */
function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}
/**calcul la moyenne de a, b, c et d */
function average(a, b, c, d){
    return ((a + b + c + d) / 4);
};
/**Fonction pour créer une image texte à partir d'un string (utilise un canvas), retourne l'url du canvas*/
function textToImage(text, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    // Options de style pour le texte
    context.fillStyle = 'red';
    context.font = '40px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    // Dessiner le texte
    context.fillText(text, width / 2, height / 2);
    // Retourner l'URL de l'image (base64)
    return canvas.toDataURL();
}
/**genere une valeur clé UUID unique en string*/
function generateCleUnique(){
    const uniqueKey = crypto.randomUUID();
    return uniqueKey;
}
/**trace un objet de type map Javascript*/
async function traceMap(map){
    for (const [key, value] of map) console.log("trace objet de map: ", value);
}
/**retourne true si le tableau contient l'élément donné*/
function isTablContainElem(tabl, elem){
    for(i = 0; i < tabl.length; i++) if(tabl[i] == elem) return true;
    return false;
}
/**convertis une donnée de string en float, retourne null si pas convertible*/
function convertToFloat(nb){
    nb = String(nb);
    nb = nb.replace(',','.');
    if(isNaN(nb)) return null;
    return parseFloat(nb);
};
//hitbox de détection
/**detecte la présence d'un point dans un carré */
function pointDansCarre(p,p1,p2,p3,p4){
    return (pointDansTriangle(p, p1, p2, p3) || pointDansTriangle(p, p1, p3, p4));
}
  /**détecte la présence d'un point dans un triangle */
function pointDansTriangle(p, p1, p2, p3){
    if(dot(false, p, p1, p2)
    && dot(false, p, p2, p3)
    && dot(false, p, p3, p1)) return true;
    return false;
  }
  /**fonction math dot */
function dot(gauche, p, p1, p2){
    if(gauche) return ((p2.x - p1.x) * (p.y - p1.y) - (p.x - p1.x) * (p2.y - p1.y) < 0);
    else return ((p2.x - p1.x) * (p.y - p1.y) - (p.x - p1.x) * (p2.y - p1.y) > 0);
}
