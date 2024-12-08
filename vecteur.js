//FICHIER DE CLASSE VECTEUR 2 FLOAT
class V2F{
    #x = 0;
    #y = 0;
    #po = null;//another V2F reference as origin
    #data = null;//objet de référence lié au vecteur, facultatif, sert pour retrouver un objet depuis le réseau de vecteur
    #pe = [];//V2F enfants
    constructor(x = 0,y = 0){
        this.#x = x,
        this.#y = y;
    }
    set x(x) {
        if (typeof x !== "number") throw new Error("La coordonnée x doit être un nombre.");
        this.#x = x;
    }
    set y(y) {
        if (typeof y !== "number") throw new Error("La coordonnée x doit être un nombre.");
        this.#y = y;
    }
    /**récupère l'adresse du point d'origine. Si inexistant, retourne 0 [Pt]*/
    get po(){
        return this.getPo();
    }
    get pe(){
        return this.#pe;
    }
    /**récupère l'adresse du point d'origine. Si inexistant, retourne une erreur [Pt]*/
    getPo(){
        if(this.#po == null) throw new Error("po est nul");
        return this.#po;
    }
    /**récupère l'adresse du point d'origine. Si inexistant, retourne un nouveau vecteur 0 [Pt]*/
    getPo2(){
        return this.#po || new V2F(0,0);
    }
        /**récupère l'adresse du point d'origine. Si inexistant, retourne null [Pt]*/
    getPo3(){
        return this.#po || null;
    }
    /**applique un v2f en tant qu'origine de ce point [Pt]*/
    set po(v2f) {
        return this.setPo(v2f);
    }
    /**applique un v2f en tant qu'origine de ce point [Pt]*/
    setPo(v2f){
        if (v2f !== null && !(v2f instanceof V2F)) throw new Error("L'origine doit être une instance de V2F ou null.");
        this.#detectCircularite(v2f);
        this.#po = v2f;
        v2f.pe.push(this);
    }
    setXY(x,y){
        this.setX(x);
        this.setY(y);
    }
    setX(x){
        this.x = x;
        return this; //chainage
    }
    setY(y){
        this.y = y;
        return this; //chainage
    }
    get x()  {
        return this.#x;
    }
    get y()  {
        return this.#y;
    }
    /*retourne la valeur relative du vecteur [noPt]*/
    p() {
        return new V2F(this.#x,this.#y);
    }
    /**ajoute la valeur d'un autre vecteur. erreur si v2f externe null. [noPt]*/
    addV(v2f){
        if (!(v2f instanceof V2F)) throw new Error("Le paramètre doit être une instance de V2F.");
        this.x += v2f.x;
        this.y += v2f.y;
        return this;//chainage
    }
    addXY(x,y){
        if (typeof x !== "number" || typeof y !== "number") throw new Error("Les coordonnées x et y doivent être des nombres.");
        this.x += x;
        this.y += y;
        return this;//chainage
    };
    /**retourne le point absolu du vecteur [noPt]*/
    pAbs() {
        if(this.#po == null) return new V2F(this.#x,this.#y);
        else {
            const originAbs = this.#po.pAbs(); 
            return originAbs.addXY(this.#x, this.#y);
        }
    }
    /**retourne la position absolue de x*/
    xAbs() {
        return this.pAbs().x;
    }
    /**retourne la position absolue de y*/
    yAbs() {
        return this.pAbs().y;
    }
    /**applique les valeurs d'un vecteur sur celui-ci [noPt] */
    set(v2f){
        if (!(v2f instanceof V2F)) throw new Error("Le paramètre doit être une instance de V2F.");
        this.x = v2f.x;
        this.y = v2f.y;
        return this;//chainage
    }
    //empeiche les actions circulaires
    #detectCircularite(p1){
        while (p1 !== null) {
            if (p1 === this) throw new Error("Une origine circulaire a été détectée.");
            p1 = p1.getPo3(); //Remonte les origines
        }
    }
    toTxt(){
        var txt = "[" + this.#x + ":" + this.#y + "_REF=" + this.getPo2().x + ":" + this.getPo2().y +"]";
        return txt
    }
    /**convertis un angle en degré en vecteur normale */
    setAngle(a){
        this.x = Math.cos(degToRad(a));
        this.y = Math.sin(degToRad(a));
    }
    /**retourne l'angle du vecteur en degrés, retourne 0 si vecteur nul*/
    getAngle(){
        if (this.x == 0 && this.y == 0)  return 0;
        return (Math.atan2(this.y, this.x) * 180 / Math.PI + 360) % 360;
    }
    /**applique une rotation depuis un vecteur éxistant en gardant la distance originale*/
    applyRotation(v2f){
        //enregistre la distance actuelle
        const dist = Math.sqrt(this.x ** 2 + this.y ** 2);
        const angleRad = Math.atan2(v2f.y, v2f.x);
        this.x = Math.cos(angleRad) * dist;
        this.y = Math.sin(angleRad) * dist;
        //applique la nouvelle valeur
    }
    /**applique un décalage de rotation depuis un vecteur éxistant en gardant la distance originale*/
    applyRotationDecalage(v2f){
        if(v2f == null) throw new Error("v2f nul");
        if (!(v2f instanceof V2F)) throw new Error("Le paramètre doit être une instance de V2F.");
        //enregistre la distance actuelle
        const dist = Math.sqrt(this.x ** 2 + this.y ** 2);
        const angle = this.getAngle();
        const angleExterne = v2f.getAngle();
        const newAngle = (angle + angleExterne) % 360;
        this.x = Math.cos(degToRad(newAngle)) * dist;
        this.y = Math.sin(degToRad(newAngle)) * dist;
    }
    /**applique un décalage de rotation uniquement sur parents*/
    applyRotationDecalageOnEnfants(v2f){
        for(var i = 0; i < this.#pe.length; i++){
            this.#pe[i].applyRotationDecalage(v2f);
            this.#pe[i].applyRotationDecalageOnEnfants(v2f);
        }
    }
    /**applique un décalage de rotation uniquement sur parents
     * val: valeur strictement positive avec équilibre a 1
    */
    applyScaleDecalageOnEnfants(val){
        for(var i = 0; i < this.#pe.length; i++){
            this.#pe[i].applyScaleDecalage(val);
            this.#pe[i].applyScaleDecalageOnEnfants(val);
        }
    }
    /**applique un décalage de rotation depuis un vecteur éxistant en gardant la distance originale
     * val: valeur strictement positive avec équilibre a 1
    */
    applyScaleDecalage(val){
        if(val == null) throw new Error("v2f nul");
        if (isNaN(val)) throw new Error("Le paramètre doit être une instance de V2F.");
        //enregistre la distance actuelle
        if(val <= 0) new ErreurIO("la valeur doit etre strictement positive avec comme centre d'équilibre 1: " + val);
        //
        this.x *= val;
        this.y *= val;
    }
    nbParents(){
        return this.#pe.length;
    }
    setData(val){
        this.#data = val;
    }
    /*retourne les objets de chaque vecteur sous forme de liste*/
    getData(){
        var liste = [];
        liste.push(this.#data);
        for(var i = 0; i < this.#pe.length; i++){
            if(liste.length > 1000000) throw new Error("impossible de lire une famille de plus de 1000000 éléments");
            if(this.#pe[i] != null) {
                liste.push(...this.#pe[i].getData());
            }
        }
        if(liste.length == 0){
            console.log("liste vide");
            return null;
        }
        else return liste;
    }
}
