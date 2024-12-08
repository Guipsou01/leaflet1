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
    getSpreadsheetId(ssid){
        this.#spreadsheetId = ssid;
    }
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
    async #traitementLigneGoogle(lignes, rg, nbtot){
        try{
            var data = null;
            texteCharg.innerHTML = `Remplissage du contenu des liste Google: ${rg} / ${nbtot - 1}`;
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
                                data.vAngle = new V2F();
                                data.vAngle.setAngle(0);
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
                            var a = null;
                            //imagePtee.crossOrigin = "anonymous";
                            //execute en tant que coin BG par defaut
                            var angle = null;
                            if(isFloatable(lignes[COL_ANGLE])) angle = convertToFloat(lignes[COL_ANGLE]);
                            if(angle != null){
                                a = new V2F(0,0);
                                a.setAngle(angle);//angle degré en normale
                            }
                            imagePtee.src = lignes[COL_URL];
                            imagePtee.onload = async function() {
                                const imgL = new V2F(imagePtee.width,imagePtee.height);
                                l.y = imgL.y / imgL.x * l.x;
                                //var tabl = await getPosApresRotation(p,l,a);
                                //var tabl = await getPosApresRotation(p,l,a.getAngle());
                                const p1 = new V2F(-l.x/2, -l.y/2);
                                p1.po = p;
                                if(a != null) p1.applyRotationDecalage(a);
                                const p2 = new V2F(+l.x/2, -l.y/2);
                                p2.po = p;
                                if(a != null) p2.applyRotationDecalage(a);
                                const p3 = new V2F(+l.x/2, +l.y/2);
                                p3.po = p;
                                if(a != null) p3.applyRotationDecalage(a);
                                const p4 = new V2F(-l.x/2, +l.y/2);
                                p4.po = p;
                                if(a != null) p4.applyRotationDecalage(a);
                                data = createDataObjet(IMAGE);
                                data.plan = _plan;
                                if(lignes[COL_PARENT] != "-") data.vOrigine = lignes[COL_PARENT];
                                if(a != null) data.vAngle = a;
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
                            const p = new V2F(0,0);
                            const l = new V2F(lignes[COL_LX], lignes[COL_LX] / lignes[COL_TITLE].length * 2);
                            //Convertir le texte en image
                            var textImageUrl = textToImage(lignes[COL_TITLE], 40 * lignes[COL_TITLE].length / 2, 40);//pas ici
                            //Définir les coordonnées pour l'image sur la carte
                            p.x = convertToFloat(lignes[COL_X]);
                            p.y = convertToFloat(lignes[COL_Y]);
                            data = createDataObjet(IMAGE);
                            data.type = TEXTE;
                            data.plan = _plan;
                            data.vPos = p;
                            data.vAngle = new V2F(0,0);
                            data.vAngle.setAngle(convertToFloat(lignes[COL_ANGLE]));
                            //
                            const p1 = new V2F(-l.x/2, -l.y/2);
                            p1.po = p;
                            p1.applyRotationDecalage(data.vAngle);
                            const p2 = new V2F(+l.x/2, -l.y/2);
                            p2.po = p;
                            p2.applyRotationDecalage(data.vAngle);
                            const p3 = new V2F(+l.x/2, +l.y/2);
                            p3.po = p;
                            p3.applyRotationDecalage(data.vAngle);
                            const p4 = new V2F(-l.x/2, +l.y/2);
                            p4.po = p;
                            p4.applyRotationDecalage(data.vAngle);
                            //
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
    /**traitement des commandes simplifiées et remplissage de la liste Leaflet */
    async #traitementLigneGoogleSimplifiee(map){
        try{
            const promesses = Array.from(map.entries()).map(async ([key, data], rang) => {//traiter toute les lignes en meme temps...
                var objet = null;
                var objet2 = null;
                var dataMipmap = null;
                texteCharg.innerHTML = `Remplissage du contenu des listes Leaflet`;
                dataMipmap = await structuredClone(data);
                objet = await generateObject(data);
                if(objet != null && (data.type == IMAGE || data.type == MARKER || data.type == TEXTE)){
                    data.objetVecteur = await generateObject(createDataObjet(POLYLIGNE));//ligne vecteur
                    data.objetCarre = [await generateObject(createDataObjet(POLYLIGNE)),await generateObject(createDataObjet(POLYLIGNE)),await generateObject(createDataObjet(POLYLIGNE)),await generateObject(createDataObjet(POLYLIGNE))];
                    data.objetVecteur.titre += "[V]";
                    data.objetCarre[0].titre += "[VC1]";
                    data.objetCarre[1].titre += "[VC2]";
                    data.objetCarre[2].titre += "[VC3]";
                    data.objetCarre[3].titre += "[VC4]";
                }
                if(objet != null && data.type == IMAGE) {
                    //dataMipmap.vPos = data.vPos;//reappliquer les V2F non possible en clonage
                    dataMipmap.vPos = new V2F(0,0);
                    dataMipmap.vAngle = data.vAngle;
                    dataMipmap.vPos1 = data.vPos1;
                    dataMipmap.vPos2 = data.vPos2;
                    dataMipmap.vPos3 = data.vPos3;
                    dataMipmap.vPos4 = data.vPos4;
                    dataMipmap.vImgTaille = data.vImgTaille;
                    dataMipmap.vTaille = data.vTaille;
                    dataMipmap.isMipmap = true;
                    dataMipmap.titre += "[MM]";
                    await generateObject(dataMipmap);//creer obj mipmap
                    var mipmapKey = generateCleUnique();//creer cle
                    //lien
                    data.coupleMapLink = mipmapKey;
                    dataMipmap.coupleMapLink = key;
                    dataMipmap.objetVecteur = data.objetVecteur;
                    dataMipmap.objetCarre = data.objetCarre;
                }
                if(objet  == null)  {
                    //await objListLeaflet.push([[MARKER,null,false,1],0,["",new V2F(0,0)],[new V2F(10,10)],[unfound_img,"Image " + ligneptee[0][1] + " not found, check URL"]]);
                }
                if(objet  != null)  {
                    var objKey = generateCleUnique();
                    data.key = objKey;
                    await mapListLeaflet.set(objKey, data);//image normale
                }
                if(dataMipmap.objet != null)  {
                    dataMipmap.key = mipmapKey;
                    await mapListLeaflet.set(mipmapKey, dataMipmap);//gestion mipmap
                }
                return Promise.resolve();
            });
            await Promise.all(promesses);//Attendre que toutes les promesses soient terminées pour éxécuter la suite
        } catch (error) {console.error("Error:", error);}
    }
    /**lis le contenu de l'onglet visé et remplis la liste d'actions leaflet*/
    async lecture(){
        var donneesGoogleUnOnglet = await this.getContenuTableau(sheetNameFocus);
        var mapListGoogle = new Map();//liste de tous les objets de la liste google (comprend les fonctions dans leur état le plus simple)
        const promesses = donneesGoogleUnOnglet.map(async (donnee, i) => {
            const data = await this.#traitementLigneGoogle(donnee, i, donneesGoogleUnOnglet.length);
            if(data != null) mapListGoogle.set(generateCleUnique(), data);
        });
        await Promise.all(promesses);
        //await checkDoublon();
        texteCharg.innerHTML = "Remplissage du contenu des listes Leaflet...";
        await this.#traitementLigneGoogleSimplifiee(mapListGoogle);
        mapListGoogle.clear();
    }
    async ecriture(){
        //await this.generateOnglet("OUTPUT");
        return await this.generateList();
    }
    async generateOnglet(titre){
        if(this.#spreadsheetId == null || this.#apiKey == null) throw new Error("identification incomplete: " + this.#spreadsheetId + " , " + this.#apiKey);
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.#spreadsheetId}:batchUpdate?key=${this.#apiKey}`;
        const requestBody = {
            requests: [
                {
                    addSheet: {
                        properties: {
                            title: titre, // Nom du nouvel onglet
                        },
                    },
                },
            ],
        };
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
    
            if (!response.ok) {
                throw new Error(`Erreur: ${response.status} ${response.statusText}`);
            }
    
            const result = await response.json();
            return result;
        } catch (error) {
            if (error.message.includes("401")) console.error("Erreur 401 : Assurez-vous que votre fichier Google Sheets est public ou utilisez OAuth pour l'authentification.");
            else console.error("Erreur lors de la création de l'onglet:", error.message || error);
        }
    }
    async generateList(){
        var cs = "</td><td>";//saut de case
        var ln = "<br>";//saut de ligne
        var text = `<p style="font-size: 4px;"><table><tbody>-<br>`;
        mapListLeaflet.forEach((value, key) => {
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
                    s[COL_TYPE] = "TEXTE";
                }
                else if(value.type == POLYLIGNE) {
                    s[COL_TYPE] = "POLYLIGNE";
                }
                if(value.type == TEXTE || value.type == MARKER || value.type == IMAGE){
                    s[COL_X] = value.vPos.x;
                    s[COL_Y] = value.vPos.y;
                    s[COL_LX] = value.vTaille.x;
                    s[COL_PARENT] = value.vOrigine;
                    if(value.vAngle != null) s[COL_ANGLE] = value.vAngle.getAngle();
                    if(value.type != TEXTE) s[COL_URL] = value.url;
                    s[COL_TITLE] = value.titre;
                }
                s[COL_PLAN] = value.plan;
                text += ("<tr><td>" + s[0] + cs + s[1] + cs + s[2] + cs + s[3] + cs + s[4] + cs + s[5] + cs + s[6] + cs + s[7] + cs + s[8] + cs + s[9] + cs + s[10] + cs + s[11] + "</td></tr>");
            }
        });
        text += "</tbody></table><br>-</p>";
        return text;
    }
}
