const COL_CMD = 0;
const COL_PLAN = 1;
const COL_X = 2;
const COL_Y = 3;
const COL_LX = 4;
const COL_ANGLE = 5;
const COL_PARENT = 6;
const COL_URL = 7;
const COL_TITLE = 8;
const COL_AUTHOR = 9;
const COL_LOD = 9;
const COL_SITE = 10;
const COL_TYPE = 0;
/**classe de lecture de fichier google*/
class GestionGoogle{
    //FICHIER REGROUPANT LES FONCTIONS GENERALES AU PROGRAMME
    #spreadsheetId = null;
    #apiKey = null;
    #sheetNames = null;//nom des onglets
    constructor(){};
    /**retourne l'id du document google sheet visé, retourne null si non renseigné*/
    getSpreadsheetId(ssid){
        this.#spreadsheetId = ssid;
    }
    /**retourne la valeur de la clé api stockée, retourne null si non renseigné*/
    getApiKey(apik){
        this.#apiKey = apik;
    }
    /**récupere le contenu complet de l'onglet Google focus (rentrer le nom de l'onglet en parametre)*/
    async getContenuTableau(sheetName) {
        try {
            if (!this.#spreadsheetId || !this.#apiKey) throw new Erreur("SpreadsheetId ou apiKey manquant");
            const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${this.#spreadsheetId}/values/${sheetName}?key=${this.#apiKey}`);//fetch: récuperation de ressource depuis un serveur
            if (!response.ok) throw new Error(`Response status: ${response.status}, ${sheetName}`);
            return (await response.json()).values;
        } catch (error) {throw new Error("Erreur dans la lecture d'une feuille google, vérifier nom");}
    }
    /**stock/modifie et retourne uniquement le nom des onglets google*/
    async getNomFeuilles() {
        try {
            if(this.#spreadsheetId == null || this.#apiKey == null) throw new Erreur("SpreadsheetId manquant, apiKey manquant");
            const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${this.#spreadsheetId}?key=${this.#apiKey}`);
            if(!response.ok) throw new Error(`Erreur de requête Google sheets, réponse: ${response.status}`);
            this.#sheetNames = (await response.json()).sheets.map(sheet => sheet.properties.title);
            return this.#sheetNames;
        } catch (error) { console.warn("Erreur dans le chargement google sheets, vérifier id de feuille");}
    }
    /**modifie  et retourne la liste des onglets google, update sheetNameFocus et sheetNames*/
    async filterWithPrefixe(prefixe){
        if(this.#sheetNames == null) new Erreur("liste des onglets nul");
        this.#sheetNames = this.#sheetNames.filter(item => item.startsWith(prefixe));
        return this.#sheetNames;
    }
    /**retourne le nom des feuilles stocké en mémoire, nécessite d'avoir déja fait une requete, /!\ peut retourner une liste nulle ou vide /!\*/
    async getNomFeuillesSansRequette(){
        return this.#sheetNames;
    }
    /**verifie si la liste des feuilles est ni nul, ni vide */
    async isListeFeuillesOk(){
        if(this.#sheetNames == null) return false;
        if(this.#sheetNames.length <= 0) return false;
        return true;
    }
    remplissageImage(lignes, width, height, _plan){
        const imgL = new V2F(width,height);
        const data = createDataObjet(IMAGE);
        data.plan = _plan;
        //
        const p = new V2F(convertToFloat(lignes[COL_X]),convertToFloat(lignes[COL_Y]));
        const l = new V2F(convertToFloat(lignes[COL_LX]),convertToFloat(0));
        
        var angle = null;
        if(isFloatable(lignes[COL_ANGLE])) angle = convertToFloat(lignes[COL_ANGLE]);
        if(angle != null) {
            data.vAngle = new V2F(0,0);
            data.vAngle.setAngle(angle);
        }
        if(lignes[COL_PARENT] != "-") data.vOrigine = lignes[COL_PARENT];//generer dependances
        
        data.vPos = p;
        l.y = imgL.y / imgL.x * l.x;//calcul automatique de rapport
        data.vTaille = l;
        data.url = lignes[COL_URL];
        data.titre = lignes[COL_TITLE];
        const p1 = new V2F(-l.x/2, -l.y/2);     p1.po = p;  data.vPos1 = p1;
        const p2 = new V2F(+l.x/2, -l.y/2);     p2.po = p;  data.vPos2 = p2;
        const p3 = new V2F(+l.x/2, +l.y/2);     p3.po = p;  data.vPos3 = p3;
        const p4 = new V2F(-l.x/2, +l.y/2);     p4.po = p;  data.vPos4 = p4;
        //
        data.auteur = lignes[COL_AUTHOR];
        data.site = lignes[COL_SITE];
        data.vImgTaille = imgL;
        data.mipmapActif = true;
        return data;
    }
    remplissageMarker(lignes){
        const p = new V2F(convertToFloat(lignes[COL_X]),convertToFloat(lignes[COL_Y]));
        const l = new V2F(convertToFloat(lignes[COL_LX]),convertToFloat(0));
        const data = createDataObjet(MARKER);
        data.plan = _plan;
        var angle = null;
        if(isFloatable(lignes[COL_ANGLE])) angle = convertToFloat(lignes[COL_ANGLE]);
        if(angle != null){
            data.vAngle = new V2F(0,0);
            data.vAngle.setAngle(angle);//angle degré en normale
        }
        if(lignes[COL_PARENT] != "-") data.vOrigine = lignes[COL_PARENT];//generer dependances
        data.vPos = p;
        l.y = imagePtee.height / imagePtee.width * l.x;//calcul automatique de rapport
        data.url = lignes[COL_URL];
        data.lod = lignes[COL_LOD];
        data.vTaille = l;
        data.titre = lignes[COL_TITLE];
        return data;
    }
    /**Lecture tableau google et retour de data*/
    async #traitementLigneGoogle(lignes){
        try{
            return await new Promise((resolve) => {
                var data = null;
                var _plan = -1;
                //rotation: execute en tant que coin BG par defaut
                if(isFloatable(lignes[COL_PLAN])) _plan = convertToFloat(lignes[COL_PLAN]);
                switch(lignes[COL_TYPE]){
                    case 'TILEMAP-DEFAULT':
                        resolve(createDataObjet(TILEMAP_DEFAULT));
                        return;
                    case 'MARKER':
                        (() => {
                            try{
                                const imagePtee = new Image();
                                imagePtee.crossOrigin = "anonymous";
                                imagePtee.src = lignes[COL_URL];
                                
                                imagePtee.onload = () => {
                                    //data = this.remplissageMarker(lignes);
                                            const p = new V2F(convertToFloat(lignes[COL_X]),convertToFloat(lignes[COL_Y]));
                                            const l = new V2F(convertToFloat(lignes[COL_LX]),convertToFloat(0));
                                            const data = createDataObjet(MARKER);
                                            data.plan = _plan;
                                            var angle = null;
                                            if(isFloatable(lignes[COL_ANGLE])) angle = convertToFloat(lignes[COL_ANGLE]);
                                            if(angle != null){
                                                data.vAngle = new V2F(0,0);
                                                data.vAngle.setAngle(angle);//angle degré en normale
                                            }
                                            if(lignes[COL_PARENT] != "-") data.vOrigine = lignes[COL_PARENT];//generer dependances
                                            data.vPos = p;
                                            l.y = imagePtee.height / imagePtee.width * l.x;//calcul automatique de rapport
                                            data.url = lignes[COL_URL];
                                            data.lod = lignes[COL_LOD];
                                            data.vTaille = l;
                                            data.titre = lignes[COL_TITLE];
                                    //
                                    resolve(data);
                                    return;
                                }
                                imagePtee.onerror = () => {
                                    console.log("image non chargée pour le marker " + lignes[COL_TITLE]);
                                    lignes[COL_URL] = unfound_img;
                                    //data = await this.remplissageMarker(lignes);
                                            const p = new V2F(convertToFloat(lignes[COL_X]),convertToFloat(lignes[COL_Y]));
                                            const l = new V2F(convertToFloat(lignes[COL_LX]),convertToFloat(0));
                                            const data = createDataObjet(MARKER);
                                            data.plan = _plan;
                                            var angle = null;
                                            if(isFloatable(lignes[COL_ANGLE])) angle = convertToFloat(lignes[COL_ANGLE]);
                                            if(angle != null){
                                                data.vAngle = new V2F(0,0);
                                                data.vAngle.setAngle(angle);//angle degré en normale
                                            }
                                            if(lignes[COL_PARENT] != "-") data.vOrigine = lignes[COL_PARENT];//generer dependances
                                            data.vPos = p;
                                            l.y = l.x;//calcul automatique de rapport
                                            data.url = lignes[COL_URL];
                                            data.lod = lignes[COL_LOD];
                                            data.vTaille = l;
                                            data.titre = lignes[COL_TITLE];
                                    //
                                    resolve(data);
                                    return;
                                };//si l'image n'est pas valide
                                }
                            catch (error) {
                            console.log("detection erreur " + lignes[COL_URL]);
                            data.url = unfound_img;
                            resolve(data);
                            throw error;
                            }
                        })();
                        break;
                    case 'IMG-LX-CENTER':
                        (() => {
                            const imagePtee = new Image();
                            imagePtee.src = lignes[COL_URL];

                            imagePtee.onload = () => {
                                data = this.remplissageImage(lignes, imagePtee.width, imagePtee.height, _plan);
                                resolve(data);//retour ok
                                return;
                            }
                            imagePtee.onerror = () => {
                                console.log("image non chargée pour la carte " + lignes[COL_TITLE]);
                                lignes[COL_URL] = unfound_img;
                                data = this.remplissageImage(lignes, 100, 100, _plan);
                                resolve(data);
                                return;
                            };//si l'image n'est pas valide
                        })();
                        return;
                    case 'IMG-LX':
                        resolve(null);
                        return;
                    case 'IMG-PLR':
                        resolve(null);
                        return;
                    case 'TEXT':
                        (() => {
                            //Convertir le texte en image
                            var textImageUrl = textToImage(lignes[COL_TITLE], 40 * lignes[COL_TITLE].length / 2, 40);//pas ici
                            //
                            const p = new V2F(convertToFloat(lignes[COL_X]),convertToFloat(lignes[COL_Y]));
                            const l = new V2F(lignes[COL_LX], 0);
                            data = createDataObjet(IMAGE);
                            data.plan = _plan;
                            var angle = null;
                            if(isFloatable(lignes[COL_ANGLE])) angle = convertToFloat(lignes[COL_ANGLE]);
                            if(angle != null) {
                                data.vAngle = new V2F(0,0);
                                data.vAngle.setAngle(angle);
                            }
                            if(lignes[COL_PARENT] != "-") data.vOrigine = lignes[COL_PARENT];
                            data.vPos = p;
                            l.y = lignes[COL_LX] / lignes[COL_TITLE].length * 2;//calcul automatique de rapport
                            //
                            data.url = textImageUrl;
                            data.vTaille = l;
                            data.titre = lignes[COL_TITLE];
                            const p1 = new V2F(-l.x/2, -l.y/2);     p1.po = p;      data.vPos1 = p1;
                            const p2 = new V2F(+l.x/2, -l.y/2);     p2.po = p;      data.vPos2 = p2;
                            const p3 = new V2F(+l.x/2, +l.y/2);     p3.po = p;      data.vPos3 = p3;
                            const p4 = new V2F(-l.x/2, +l.y/2);     p4.po = p;      data.vPos4 = p4;
                            //
                            data.type = TEXTE;
                            //
                            resolve(data);
                            return;
                        })();
                        return;
                    default:
                        resolve(null);
                        return;
                }
            });
        }
        catch (error) {
            console.error("Erreur dans le chargement de marqueur:", error);
            return null;
        }
    }
    /**lis le contenu de l'onglet visé et remplis la map en parametre*/
    async lecture(map){
        try{
            var cpt = 0;
            var donneesGoogleUnOnglet = await this.getContenuTableau(sheetNameFocus);
            var mapListGoogle = new Map();//liste de tous les objets de la liste google (comprend les fonctions dans leur état le plus simple)
            const promesses1 = donneesGoogleUnOnglet.map(async (donnee, i) => {
                const data = await this.#traitementLigneGoogle(donnee);
                if(data != null) {
                    mapListGoogle.set(generateCleUnique(), data);
                    cpt++;
                    await mainTxt(`Google lists content filling: ${cpt} / ${donneesGoogleUnOnglet.length - 1}`);
                }
            });
            await Promise.all(promesses1);
            await mainTxt("Leaflet lists content filling...");
            //await checkDoublon();
            //traitement des commandes simplifiées et remplissage de la liste Leaflet
            cpt = 0;
            const promesses2 = Array.from(mapListGoogle.entries()).map(async ([key, data], rang) => {//traiter toute les lignes en meme temps...
                var retour = await traitement2(data);
                if(retour != null){
                    if(retour.objet[0] != null)  map.set(retour.key, retour);//image normale
                    cpt++;
                    await mainTxt(`Leaflet lists content filling: ${cpt} / ${mapListGoogle.size - 1}`);
                }
            });
            await Promise.all(promesses2);//Attendre que toutes les promesses soient terminées pour éxécuter la suite
            await refreshEcran();
            await mapListGoogle.clear();
            await refreshEcran();
        } catch (error) {console.error("Error:", error);}
        //nettoyage
    }
    /*async ecriture(map){
        //await this.generateOnglet("OUTPUT");
        //return await this.generateList(map);
    }*/
    //async generateOnglet(titre){}
    /**retourne un string contenant la map en parametre en formatage google sheets*/
    async generateList(map){
        var cs = "</td><td>";//saut de case
        var ln = "<br>";//saut de ligne
        var text = `<p style="font-size: 4px;"><table><tbody>-<br>`;
        map.forEach((value, key) => {
            var s = ["-","-","-","-","-","-","-","-","-","-","-","-"];
            var next = false;
            if(value.type == IMAGE) if(value.isMipmap == true) next = true;
            if(value.type == MARKER_STATIC_MS) next = true;
            if(!next){
                if(value.type == TILEMAP_DEFAULT) {
                    s[COL_TYPE] = "TILEMAP_DEFAULT";
                }
                else if(value.type == MARKER) {
                    s[COL_TYPE] = "MARKER";
                }
                else if(value.type == IMAGE) {
                    s[COL_TYPE] = "IMG-LX-CENTER";
                    s[COL_AUTHOR] = value.auteur;
                    s[COL_SITE] = value.site;
                }
                else if(value.type == TEXTE) {
                    s[COL_TYPE] = "TEXT";
                }
                else if(value.type == POLYLIGNE) {
                    s[COL_TYPE] = "POLYLIGNE";
                }
                if(value.type == TEXTE || value.type == MARKER || value.type == IMAGE){
                    s[COL_X] = value.vPos.x.toFixed(4);
                    s[COL_Y] = value.vPos.y.toFixed(4);
                    s[COL_LX] = convertToFloat(value.vTaille.x).toFixed(3);
                    s[COL_PARENT] = value.vOrigine;
                    s[COL_TITLE] = value.titre;
                    if(value.vAngle != null) s[COL_ANGLE] = value.vAngle.getAngle().toFixed(2);
                    //if(value.type != TEXTE) s[COL_URL] = value.url;
                }
                s[COL_PLAN] = value.plan;
                text += ("<tr><td>" + s[0] + cs + s[1] + cs + s[2] + cs + s[3] + cs + s[4] + cs + s[5] + cs + s[6] + cs + s[7] + cs + s[8] + cs + s[9] + cs + s[10] + cs + s[11] + "</td></tr>");
            }
        });
        text += "</tbody></table><br>-</p>";
        return text;
    }
}
