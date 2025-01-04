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
const COL_SITE = 10;
const COL_TYPE = 0;
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
            if (this.#spreadsheetId == null || this.#apiKey == null) throw new Erreur("SpreadsheetId manquant, apiKey manquant");
            const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${this.#spreadsheetId}?key=${this.#apiKey}`);
            if (!response.ok) throw new Error(`Erreur de requête Google sheets, réponse: ${response.status}`);
            this.#sheetNames = (await response.json()).sheets.map(sheet => sheet.properties.title);
            return this.#sheetNames;
        } catch (error) { console.log("Erreur dans le chargement google sheets, vérifier id de feuille");}
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
    /**Lecture tableau google et retour de data*/
    async #traitementLigneGoogle(lignes){
        try{
            var data = null;
            return new Promise((resolve) => {
                var _plan = -1;
                if(isFloatable(lignes[COL_PLAN])) _plan = convertToFloat(lignes[COL_PLAN]);
                switch(lignes[COL_TYPE]){
                    case 'TILEMAP-DEFAULT':
                        data = createDataObjet(TILEMAP_DEFAULT);
                        resolve(data);
                    break; case 'MARKER':
                        (function(){
                            const imagePtee = new Image();
                            const p = new V2F(convertToFloat(lignes[COL_X]),convertToFloat(lignes[COL_Y]));
                            const l = new V2F(convertToFloat(lignes[COL_LX]),convertToFloat(0));
                            var a = null;
                            var angle = null;
                            if(isFloatable(lignes[COL_ANGLE])) angle = convertToFloat(lignes[COL_ANGLE]);
                            if(angle != null){
                                a = new V2F(0,0);
                                a.setAngle(angle);//angle degré en normale
                            }
                            var imgDesc = lignes[COL_TITLE];
                            imagePtee.src = lignes[COL_URL];
                            imagePtee.onload = async function() {
                                l.y = imagePtee.height / imagePtee.width * l.x;
                                //generer dependances
                                data = createDataObjet(MARKER);
                                data.plan = _plan;
                                if(lignes[COL_PARENT] != "-") data.vOrigine = lignes[COL_PARENT];
                                data.vPos = p;
                                data.vTaille = l;
                                if(a != null) data.vAngle = a;
                                data.url = lignes[COL_URL];
                                data.titre = imgDesc;
                                resolve(data);
                            }
                        }());
                    break; case 'IMG-LX-CENTER':
                        (async function(){
                            const imagePtee = new Image();
                            const p = new V2F(convertToFloat(lignes[COL_X]),convertToFloat(lignes[COL_Y]));
                            const l = new V2F(convertToFloat(lignes[COL_LX]),convertToFloat(0));
                            var angle = null;
                            //imagePtee.crossOrigin = "anonymous";
                            //execute en tant que coin BG par defaut
                            if(isFloatable(lignes[COL_ANGLE])) angle = convertToFloat(lignes[COL_ANGLE]);
                            imagePtee.src = lignes[COL_URL];
                            imagePtee.onload = async function() {
                                const imgL = new V2F(imagePtee.width,imagePtee.height);
                                l.y = imgL.y / imgL.x * l.x;
                                //var tabl = await getPosApresRotation(p,l,a);
                                //var tabl = await getPosApresRotation(p,l,a.getAngle());
                                data = createDataObjet(IMAGE);
                                data.plan = _plan;
                                if(lignes[COL_PARENT] != "-") data.vOrigine = lignes[COL_PARENT];
                                if(angle != null) {
                                    data.vAngle = new V2F(0,0);
                                    data.vAngle.setAngle(angle);
                                }
                                //
                                const p1 = new V2F(-l.x/2, -l.y/2);
                                p1.po = p;
                                const p2 = new V2F(+l.x/2, -l.y/2);
                                p2.po = p;
                                const p3 = new V2F(+l.x/2, +l.y/2);
                                p3.po = p;
                                const p4 = new V2F(-l.x/2, +l.y/2);
                                p4.po = p;
                                //
                                data.vPos = p;
                                data.vPos1 = p1;
                                data.vPos2 = p2;
                                data.vPos3 = p3;
                                data.vPos4 = p4;
                                data.url = lignes[COL_URL];
                                data.titre = lignes[COL_TITLE];
                                data.auteur = lignes[COL_AUTHOR];
                                data.site = lignes[COL_SITE];
                                data.vImgTaille = imgL;
                                data.vTaille = l;
                                resolve(data);//retour ok
                            }
                            imagePtee.onerror = function() {//si l'image n'est pas valide
                                //objlistGoogle.push([[MARKER,null,false,plan],"",[lignes[5],p,null],[new V2F(10,10)],[unfound_img,"Image " + lignes[7] + " not found, check URL"]]);
                                resolve(null);
                            };
                        }());
                    break; case 'IMG-LX':
                        resolve(null);
                    break; case 'IMG-PLR':
                        resolve(null);
                    break; case 'TEXT':
                        (async function(){
                            const p = new V2F(convertToFloat(lignes[COL_X]),convertToFloat(lignes[COL_Y]));
                            const l = new V2F(lignes[COL_LX], lignes[COL_LX] / lignes[COL_TITLE].length * 2);
                            var angle = null;
                            if(isFloatable(lignes[COL_ANGLE])) angle = convertToFloat(lignes[COL_ANGLE]);
                            //Convertir le texte en image
                            var textImageUrl = textToImage(lignes[COL_TITLE], 40 * lignes[COL_TITLE].length / 2, 40);//pas ici
                            //Définir les coordonnées pour l'image sur la carte
                            data = createDataObjet(IMAGE);
                            data.type = TEXTE;
                            data.plan = _plan;
                            if(angle != null) {
                                data.vAngle = new V2F(0,0);
                                data.vAngle.setAngle(angle);
                            }
                            //
                            const p1 = new V2F(-l.x/2, -l.y/2);
                            p1.po = p;
                            const p2 = new V2F(+l.x/2, -l.y/2);
                            p2.po = p;
                            const p3 = new V2F(+l.x/2, +l.y/2);
                            p3.po = p;
                            const p4 = new V2F(-l.x/2, +l.y/2);
                            p4.po = p;
                            //
                            data.vPos = p;
                            data.vPos1 = p1;
                            data.vPos2 = p2;
                            data.vPos3 = p3;
                            data.vPos4 = p4;
                            data.url = textImageUrl;
                            data.titre = lignes[COL_TITLE];
                            data.vTaille = l;
                            //const bounds = [[dataa[2], dataa[1]], [dataa[2] + 1, dataa[1] + 4]];
                            //var tabl = await getPosApresRotation(p,l,convertToFloat(lignes[5]));
                            //objlistGoogle.push([[TEXT,null,false,plan],"",["",tabl[0]],[tabl[1],tabl[2],tabl[3],tabl[4]],[textImageUrl,sizeTxt,lignes[4],l,convertToFloat(lignes[5])]]);//ici?
                            resolve(data);
                        }());
                    break; default:
                        resolve(null);
                    break;
                }
            });
        }
        catch (error) {console.error("Erreur dans le chargement de marqueur:", error);resolve(null);}
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
                    await mainTxt(`Remplissage du contenu des liste Google: ${cpt} / ${donneesGoogleUnOnglet.length - 1}`);
                }
            });
            await Promise.all(promesses1);
            await mainTxt("Remplissage du contenu des listes Leaflet...");
            //await checkDoublon();
            //traitement des commandes simplifiées et remplissage de la liste Leaflet
            cpt = 0;
            const promesses2 = Array.from(mapListGoogle.entries()).map(async ([key, data], rang) => {//traiter toute les lignes en meme temps...
                var retour = await traitement2(data);
                if(retour != null){
                    if(retour[0] != null)  map.set(retour[0].key, retour[0]);//image normale
                    if(retour[1] != null)  map.set(retour[1].key, retour[1]);//gestion mipmap
                    cpt++;
                    await mainTxt(`Remplissage du contenu des listes Leaflet: ${cpt} / ${mapListGoogle.size - 1}`);
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
                    s[COL_X] = value.vPos.x;
                    s[COL_Y] = value.vPos.y;
                    s[COL_LX] = value.vTaille.x;
                    s[COL_PARENT] = value.vOrigine;
                    s[COL_TITLE] = value.titre;
                    if(value.vAngle != null) s[COL_ANGLE] = value.vAngle.getAngle();
                    if(value.type != TEXTE) s[COL_URL] = value.url;
                }
                s[COL_PLAN] = value.plan;
                text += ("<tr><td>" + s[0] + cs + s[1] + cs + s[2] + cs + s[3] + cs + s[4] + cs + s[5] + cs + s[6] + cs + s[7] + cs + s[8] + cs + s[9] + cs + s[10] + cs + s[11] + "</td></tr>");
            }
        });
        text += "</tbody></table><br>-</p>";
        return text;
    }
}
