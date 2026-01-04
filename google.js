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
    /**renseigne l'id du document google sheet visé*/
    setSpreadsheetId(ssid){this.#spreadsheetId = ssid;}
    /**renseigne la valeur de la clé api*/
    setApiKey(apik){this.#apiKey = apik;}
    /**récupere le contenu complet de l'onglet Google focus (rentrer le nom de l'onglet en parametre)*/
    async getContenuTableau(sheetName) {
        try {
            if (!this.#spreadsheetId || !this.#apiKey) throw new Error("SpreadsheetId ou apiKey manquant");
            const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${this.#spreadsheetId}/values/${sheetName}?key=${this.#apiKey}&valueRenderOption=UNFORMATTED_VALUE`);//fetch: récuperation de ressource depuis un serveur
            if (!response.ok) throw new Error(`Response status: ${response.status}, ${sheetName}`);
            return (await response.json()).values;
        } catch (error) {throw new Error("Erreur dans la lecture d'une feuille google, vérifier nom");}
    }
    /**stocke localement et retourne uniquement le nom des onglets google en format json*/
    async loadNomFeuilles() {
        try {
            if(this.#spreadsheetId == null || this.#apiKey == null) throw new Error("SpreadsheetId manquant, apiKey manquant");
            const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${this.#spreadsheetId}?key=${this.#apiKey}&fields=sheets(properties(title))`);
            if(!response.ok) throw new Error(`Erreur de requête Google sheets, réponse: ${response.status}`);
            this.#sheetNames = (await response.json()).sheets.map(s => s.properties.title);
            return this.#sheetNames;
        } catch (error) { console.error("Erreur dans le chargement google sheets, vérifier id de feuille");}
    }
    /**filtre et retourne la liste locale des onglets google*/
    async filterWithPrefixe(prefixe){
        try {
            if(this.#sheetNames == null) throw new Error("liste des onglets nul");
            this.#sheetNames = this.#sheetNames.filter(item => item.startsWith(prefixe));
            return this.#sheetNames;
        } catch (error) { console.error("Erreur");}
    }
    /**retourne le nom des feuilles stocké en mémoire, nécessite d'avoir déja fait une requete, /!\ peut retourner une liste nulle ou vide /!\*/
    async getNomFeuillesSansRequette(){return this.#sheetNames;}
    /**verifie si la liste des feuilles est ni nul, ni vide */
    async isListeFeuillesOk(){
        if(this.#sheetNames == null) return false;
        if(this.#sheetNames.length <= 0) return false;
        return true;
    }
    generateLigneFromData(data){
        const cs = "</td><td>";//saut de case
        const ln = "<br>";//saut de ligne
        var s = ["-","-","-","-","-","-","-","-","-","-","-","-"];
        var next = false;
        if(data.type == IMAGE) if(data.isMipmap == true) next = true;
        if(data.type == MARKER_STATIC_MS) next = true;
        if(!next){
            if(data.type == TILEMAP_DEFAULT) {
                s[COL_TYPE] = "TILEMAP_DEFAULT";
            }
            else if(data.type == MARKER) {
                s[COL_TYPE] = "MARKER";
            }
            else if(data.type == IMAGE) {
                s[COL_TYPE] = "IMG-LX-CENTER";
                s[COL_AUTHOR] = data.auteur;
                s[COL_SITE] = data.site;
            }
            else if(data.type == TEXTE) {
                s[COL_TYPE] = "TEXT";
            }
            else if(data.type == POLYLIGNE) {
                s[COL_TYPE] = "POLYLIGNE";
            }
            if(data.type == TEXTE || data.type == MARKER || data.type == IMAGE){
                s[COL_X] = data.vPos.x.toFixed(4);
                s[COL_Y] = data.vPos.y.toFixed(4);
                s[COL_LX] = convertToFloat(data.vTaille.x).toFixed(3);
                if(data.txtOrigine == null || data.txtOrigine == "null") s[COL_PARENT] = "-";
                else s[COL_PARENT] = data.txtOrigine;
                s[COL_TITLE] = data.titre;
                if(data.vPos.getTransfo() != null) s[COL_ANGLE] = data.vPos.getTransfo().getAngle().toFixed(2);
                if(data.type != TEXTE) s[COL_URL] = "[url]";
                //if(data.type != TEXTE) s[COL_URL] = data.url;
            }
            s[COL_PLAN] = data.plan;
            return ("<tr><td>" + s[0] + cs + s[1] + cs + s[2] + cs + s[3] + cs + s[4] + cs + s[5] + cs + s[6] + cs + s[7] + cs + s[8] + cs + s[9] + cs + s[10] + cs + s[11] + "</td></tr>");
        }
        return null;
    }
    /**récupère les onglets google stocké en local, erreur si onglets google non chargés*/
    async getNomFeuilles(){
        try {
            if(this.#sheetNames == null) throw new Error("Onglets non chargés, initialisation nécessaire");
            return this.#sheetNames;
        } catch (error) {throw new Error("erreur: " + error.message);}
    }
}
async function asyncPool(poolLimit, tasks, iterator) {
    const executing = [];

    for (const task of tasks) {
        const p = Promise.resolve().then(() => iterator(task));
        executing.push(p);

        if (executing.length >= poolLimit) {
            await Promise.race(executing);
            executing.splice(executing.findIndex(e => e === p), 1);
        }
    }

    await Promise.all(executing);
}
