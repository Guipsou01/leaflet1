//NULL:             donnees = null
//TILEMAP_DEFAULT:  donnees = null
//MARKER:           donnees = [cmd,obj,isActif,plan],"",[vOrigine,vPos,vAngle],[l],[url,desc]
//IMAGE:            donnees = [cmd,obj,isActif,plan],"",[vOrigine,vPos,vAngle],[p1,p2,p3,p4],[url,title,author,website,imageSize,imageL,isMipmap]
//TEXT:             donnees = [cmd,obj,isActif,plan],"",[vOrigine,vPos,vAngle],[p1,p2,p3,p4],[url-canva,size,text,lOnLeaflet,angle]
//MARKERSTATIC:     donnees = [cmd,obj,isActif,plan],"",[vOrigine,vPos,vAngle],[l],[url]
//FONCTIONS GENERALES COMMUNES:
var ssId = '1m_iRhOs_1ii_1ECTX-Zuv9I0f6kMAE97ErYTy1ScP24'; //Mario Games / Maps / Locations
//var ssId = '1ZAvRc7k-sphLJzj01WYmweG17yX49qNy542Kzkr01So'; //MARIO MAP TEST
var apik = 'AIzaSyCTYinHSnmthpQKkNeRcNMnyk1a8lTyzaA';
var lienTxt = "https://docs.google.com/spreadsheets/d/" + ssId;
//<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet.polylinedecorator/1.8.1/leaflet.polylineDecorator.min.js"></script>
var sheetNameFocus;
var mouseLngLastState = 0;
var rgImgSelect = 0;
var customButton;
var lienObj = document.getElementById("lienDynamique");
var mapListLocations = [];//liste des lieux de l'onglet "locations"
var vecteurVisu = false;
var limiteMarkercpt = 0;
var firstAction = true;
var holdInterval = null;
var parentSelectOne = null;
var parentSelectTwo = null;
const MODE_LECTURE = 0;
const MODE_DEPLACEMENT = 1;
const MODE_ROTATION = 2;
const MODE_ECHELLE = 3;
const MODE_INSERTION = 4;
const MODE_LINK = 5;
const NULL = 0;
const TILEMAP_DEFAULT = 1;
const MARKER = 2;
const IMAGE = 3;
const MARKER_STATIC_MS = 4;
const TEXTE = 5;
const POLYLIGNE = 6;
//data:type, objet, objetVecteur, objetVecteurMipmap, objetCarre, actif, key, keymm, vOrigine, vPos, vAngle, titre, url, urlmm, vPos1, vPos2, vPos3, vPos4, objetParent, auteur, lod, site, coupleMapLink, mipmapActif, vImgTaille,plan*/
var mode = MODE_LECTURE;
/**formate l'objet en une liste de paramètres (dépend du type)*/
function createDataObjet(type){
  if(type == null) return null;
  var data = {//toute les data possibles
    type: type,
    objet: null,
    objetVecteur: null,
    objetVecteurMipmap: null,
    objetCarre1: null,
    objetCarre2: null,
    objetCarre3: null,
    objetCarre4: null,
    actif: true,
    key: generateCleUnique(),
    keymm: generateCleUnique(),
    txtOrigine: "",
    vOrigine: null,
    vPos: new V2F(0,0),
    vAngle: null,
    titre: null,
    objmm: null,
    url: null,
    urlmm: null,
    vPos1: new V2F(0,0),
    vPos2: new V2F(0,0),
    vPos3: new V2F(0,0),
    vPos4: new V2F(0,0),
    objetParent: null,
    auteur: null,
    lod: null,
    site: null,
    coupleMapLink: null,
    mipmapActif: false,
    vImgTaille: null,
    plan: 0,
    color: 'red'
  }
  switch (type) {
    case IMAGE:
      data.titre = "[image]";
      data.plan = 0;
      data.vTaille = new V2F(0,0);
      data.vImgTaille = new V2F(0,0);
    break; case TILEMAP_DEFAULT:
      data.titre = "[tilemap]";
    break; case MARKER:
      data.titre = "[marker]";
      data.plan = 10;
      data.vTaille = new V2F(50,50);
    break; case POLYLIGNE:
      data.titre = "[polyligne]";
      data.plan = 0;
      data.vPos2 = new V2F(1,1);
    break; case MARKER_STATIC_MS:
      data.titre = "[markerstaticms]";
      data.plan = 0;
      data.url = shroom;
      data.vTaille = new V2F(10,10);
    break; case TEXTE:
      data.titre = "[image]";
      data.plan = 0;
      data.vTaille = new V2F(0,0);
      data.vImgTaille = new V2F(0,0);
    break; default:
    throw new Error("type non reconnu: ", type);
  }
  return data;
}
/**fonction de debug tracage map*/
async function traceMap(map){
  console.log("[tracage map]");
  console.log(map);
  for(const [key, dataaModif] of map) {
    console.log(dataaModif);
    console.log(dataaModif.objet[0])
  }
  console.log("[fin tracage]");
}
async function actionWhenBtnEditorChange(){
  if(mode == MODE_DEPLACEMENT) {
    var objfocus = await mush.getObjFocus();
    leaflet.closePopup();//ferme les popups, désactive l'objet focus en cascade, effet non désiré dans ce cas précis. Stock temporairement objfocus et le réaffecte ensuite
    leaflet.disablePopup();
    if(objfocus != null) mush.setObjFocus(objfocus);
  }
  if(mode == MODE_LECTURE) {
    leaflet.enablePopup();
    mush.affichePopupOnFocusedObj();
    resetParentMode();
  }
}
/**libère le thread principal pour permettre d'autre actions, notamment l'actualisation de l'affichage*/
async function refreshEcran(){
  await new Promise(resolve => setTimeout(resolve, 0));
};
/**
 * vérifie si deux objet sont similaires (vérifie le type, desc pour les markers et titre pour les images)
 * absoluteTest on = verifie si meme etat pour image (normal ou mipmaped)
 *  */
function isTwoLayerSimilarContent(layer1, layer2, isAbsoluteTest){
       if(layer1 == null      || layer2 == null)                          throw new Error("objet nul: [" + layer1 + " ===== " + layer2 + "]");
  else if(layer1.length == 0  || layer2.length == 0)                      throw new Error("objet vide: [" + layer1 + " ===== " + layer2 + "]");
  else if(layer1[0][0] == IMAGE && layer2[0][0] == IMAGE) {//test type, title, mipmapstyle
    if(isAbsoluteTest) return (layer1[0][0] == layer2[0][0] && layer1[4][1] == layer2[4][1] && layer1[4][6] == layer2[4][6]);
    else               return (layer1[0][0] == layer2[0][0] && layer1[4][1] == layer2[4][1]);
  }
  else if(layer1[0][0] == MARKER           && layer2[0][0] == MARKER)           return (layer1[0] == layer2[0] && layer1[4][1] == layer2[4][1]);
  else if(layer1[0][0] == MARKER_STATIC_MS && layer2[0][0] == MARKER_STATIC_MS) return true;
  else if(layer1[0][0] == POLYLIGNE        && layer2[0][0] == POLYLIGNE)        return (layer1[0] == layer2[0] && layer1[3] == layer2[3]);
  else return false;
}
/**redimensionne l'image focus et la stock dans urlmm, retourne le data éxistant avec unfound_img si redimensionnement impossible */
async function resizeImage(url, l, data) {
  var retour = null;
  return new Promise((resolve) => {
    //if(!data.isMipmap) console.error("ne doit pas changer la taille d'une image sans requete de mipmap");
    try{
      const image2 = new Image();
      image2.crossOrigin = "anonymous";
      image2.src = url;
      image2.onload = () => {
        //
        if (!image2.complete || image2.naturalWidth === 0) {
          console.warn("Image illisible ou incomplète :", url);
          retour = unfound_img;
        }
        //
        const canvas = document.createElement('canvas');
        canvas.width = l.x;
        canvas.height = l.y;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image2, 0, 0, l.x, l.y); //Dessiner l'image redimensionnée sur le Canvas
        try {
          const dataURL = canvas.toDataURL('image/png');//Convertir le Canvas en une URL de données
          retour = dataURL;
          canvas.width = canvas.height = 0;//Libérer la mémoire utilisée par le Canvas
          resolve(retour);
        } catch (error) {
          //console.error(imageInfos2[12]);
          console.log("image non trouvee");
          retour = unfound_img;
          canvas.width = canvas.height = 0;
          resolve(retour);
        }
      };
      image2.onerror = () => {
        console.log("transform erreur " + data.titre + ", " + url);
        retour = unfound_img;
        resolve(retour);
      };
    }
    catch (error) {
      console.log("transform erreur " + url);
      retour = unfound_img;
      resolve(retour);
      throw error;
    }
  });
}
/**retourne le texte du popup avec les infos de l'objet focus au clique en mode lecture */
function affichepopupobjet(data){
  try{
    const type = data.type;
    const url = data.url;
    const titre = data.titre;
    const auteur = data.auteur;
    const site = data.site;
    const vImgTaille = data.vImgTaille;
    const vTaille = data.vTaille;
    const vPos = data.vPos;
    const plan = data.plan;
    const vOrigine = data.vOrigine;
    const lod = data.lod;
    //
    var texte = "";
    if (url) texte += `
    <div style='max-width:none; text-align:center;'>
      <img src='${url}' alt='Image'
      style='width:300px; max-width:300px; height:auto; border-radius:8px;
      box-shadow:0 0 5px rgba(0,0,0,0.2);'>
    </div>
    `;
    texte += "<h3>" + titre + "</h3>";
    if(type == IMAGE) texte += "Author:  " + auteur + "<br>Website link: <a href=" + site + ">[Click here]</a><br><br>";
    if(type == IMAGE || type == TEXTE) texte += "Image size: " + vImgTaille.toTxtSimpleAbs(0) + "<br>Image scale:" + vTaille.toTxtSimpleAbs(3) + "<br>";
    if(vPos != null) texte += "GCS rel. position: " + vPos.toTxtSimple(3) + "<br>GCS abs. position: " + vPos.toTxtSimpleAbs(3) + "<br>";
    if(vPos.getTransfo() != null) texte += "Angle rel.: " + vPos.getTransfo().getAngle() + "<br>Angle abs.: " + vPos.ptAbs().getAngle() + "<br>";
    texte += "Layer: " + plan + "<br>";
    if(vOrigine != null) texte += "Child of: " + vOrigine.titre + "<br>";
    if(lod != null) texte += "Location type: " + lod + "<br>";
    return texte;
    //else await this.reset();
  }
  catch (error) {console.error("Error:", error);}
}
//
function typetotxt(id){
  switch(id){
    case 0:  return "NULL";
    case 1:  return "TILEMAP_DEFAULT";
    case 2:  return "MARKER";
    case 3:  return "IMAGE";
    case 4:  return "MARKER_STATIC_MS";
    case 5:  return "TEXTE";
    case 6:  return "POLYLIGNE";
    default: return "NULL";
  }
}
//
function modetotxt(id){
  switch(id){
    case MODE_LECTURE:      return "Lecture";
    case MODE_DEPLACEMENT:  return "Deplacement";
    case MODE_ROTATION:     return "Rotation";
    case MODE_ECHELLE:      return "Echelle";
    case MODE_LINK:         return "Liaison";
    case MODE_INSERTION:    return "Insertion";
    default:                return "Aucun";
  }
}
//
function textToType(txt){
  var retour = null;
  switch(txt){
    case 'TILEMAP-DEFAULT': retour = TILEMAP_DEFAULT; break;
    case 'MARKER':          retour = MARKER; break;
    case 'IMG-LX-CENTER':   retour = IMAGE; break;
    case 'TEXT':            retour = TEXTE; break;
    default:                retour = null; break;
  }
  return retour;
}
//
/**créé les dépendances pour la data sélectionné*/
async function linkDatas(data){
  try{
    if(data.txtOrigine != null) if(data.txtOrigine != '-' && data.txtOrigine != undefined && data.txtOrigine != "" && data.txtOrigine != "null") {
      var datafocus = findDataWithTitreValide(data.txtOrigine);
      if(datafocus == null) console.log("[Link warn] Objet focus non trouvé ou non renseigné pour: " + data.titre + " vers " + data.txtOrigine + ", application sans origine.");
      data.vOrigine = datafocus;
      if(data.vPos.getPo3() != null && datafocus.vPos != null) if(data.vPos.po === datafocus.vPos) throw new Error("L'objet ne peut pas se focus lui meme: " + data.vPos.po + " " + datafocus.vPos + ", objet: " + data.titre + ", objet: " + data.vPos.getData());
      try{
        if(datafocus == null) {
          console.log("Objet focus non défini pour " + data.titre + ", application sans origine.");
          data.vOrigine = null;
        }
        else data.vPos.setPo(datafocus.vPos);
      }
      catch(err) {console.error("Error: au niveau des objets ", data.titre, " et ", datafocus.titre, ": " + err);}
    }
  } catch (error) {console.error("Error:", error);}
}
async function sauvegarder(){
  await fenetreModale.close();
  //await google.ecriture()
  content = await generateList();
  fenetreModale.openWithContent(content);
}
/**detecte un appui à l'enfoncement*/
function mouseDown(){
  firstAction = true;
  mush.mouseDown();
  btnListMaps.fermerListe();
  btnListLocations.fermerListe();
}
function mouseUp(){
  mush.mouseUp();
}
/**actif a chaque frame de déplacement de souris*/
function mouseMove(){
  mouseMoveDetectedHud();
  mush.mouseMove();
}
/**cette fonction doit etre spam pour fonctionner */
async function dynamicTransform(data, objfocus, actionEnCours){
  try{
    if(actionEnCours == MODE_DEPLACEMENT){
      if(data.type == IMAGE || data.type == TEXTE || data.type == MARKER) {
        var nvVec = new V2F();//vecteur de transfo
        nvVec.setPo(data.vPos.getPo2());
        nvVec.setPabs(leaflet.getMousePos());
        data.vPos.setXY(nvVec.x, nvVec.y);
      }
    }
    else if(actionEnCours == MODE_ROTATION){
      if(data.type == IMAGE || data.type == TEXTE || data.type == MARKER){
        //creation d'un vecteur differentiel entre position souris et position objet
        var vFromMouseToObj = new V2F();
        vFromMouseToObj.setXY(leaflet.getMousePos().xAbs() - data.vPos.xAbs(), leaflet.getMousePos().yAbs() - data.vPos.yAbs());
        //obtient l'angle de rotation
        var angleActu = vFromMouseToObj.getAngle();
        //console.log(angleActu);
        if(firstAction){
          mouseLngLastState = angleActu;
          firstAction = false;
        }
        var anglediff = mouseLngLastState - angleActu;
        mouseLngLastState = angleActu;
        var angleDecal = new V2F(0,0);
        angleDecal.setAngle(- anglediff);
        var angle = data.vPos.getTransfo();
        if(angle != null) angle.applyRotationDecalage(angleDecal);
        data.vPos.setTransfo(angle);
      }
    }
    else if(actionEnCours == MODE_ECHELLE){
      if(data.type == IMAGE || data.type == TEXTE || data.type == MARKER){
        var moveX = (leaflet.getMousePos().x - mouseLngLastState);
        mouseLngLastState = leaflet.getMousePos().x;
        if(moveX > 0.5) moveX = 0.5;
        if(moveX < -0.5) moveX = -0.5;
        //moveX = -moveX; //changement de sens du curseur
        moveX = moveX / 3; //reduction de sensibilité
        moveX = 1 + moveX; // entre 0.5 et 1.5 de variation
        data.vPos.applyScaleDecalageOnEnfants(moveX);
      }
    }
    if(actionEnCours == MODE_DEPLACEMENT || actionEnCours == MODE_ECHELLE || actionEnCours == MODE_ROTATION) {
      updatePosOnLLObj(objfocus);
      mush.updatePosIconsOnFocusedData();
      var liste = data.vPos.getData();
      if(liste != null) for(var i = 0; i < liste.length; i++){
        if(liste[i] != null) {
          if(liste[i]._data.type == IMAGE && liste[i]._data.coupleMapLink != null) await updatePosOnLLObj(mapListLeaflet.get(liste[i]._data.coupleMapLink));
          await updatePosOnLLObj(liste[i]);
        }
      }
    }
  } catch (error) {console.error("Error:", error);}
}
/**Lecture tableau google et retour de data sans objet initialisé ni calcul d'image*/
async function traitementLigneGoogleBrut(lignes){
  try{
    //rotation: execute en tant que coin BG par defaut
    return await new Promise((resolve) => {
      var data = createDataObjet(textToType(lignes[COL_TYPE]));
      if(data == null) {
        resolve(null);
        return null;
      }
      if(data.type == TILEMAP_DEFAULT) {
        resolve(data);
        return data;
      }
      data.plan = -1;
      if(isFloatable(lignes[COL_PLAN])) data.plan = convertToFloat(lignes[COL_PLAN]);
      if(data.type == MARKER || data.type == IMAGE || data.type == TEXTE) {
        data.vPos = new V2F(convertToFloat(lignes[COL_X]), convertToFloat(lignes[COL_Y]));
        data.vTaille = new V2F(convertToFloat(lignes[COL_LX]),convertToFloat(0));
        data.titre = lignes[COL_TITLE];
        if(lignes[COL_PARENT] != "-") data.txtOrigine = lignes[COL_PARENT];//generer dependances
        var angle = null;
        if(isFloatable(lignes[COL_ANGLE])) angle = convertToFloat(lignes[COL_ANGLE]);
        if(angle != null) data.vPos.setTransfoAngle(angle);//angle degré en normale
        else data.vPos.setTransfoAngle(0);//angle degré en normale
      }
      if(data.type == IMAGE || data.type == TEXTE) {
        const p = data.vPos;
        if(data.type == TEXTE) data.vTaille.y = lignes[COL_LX] / lignes[COL_TITLE].length * 2;//calcul automatique de rapport
        if(data.type == IMAGE) data.vTaille.y = data.vTaille.x;
        const l = data.vTaille;
        const p1 = new V2F(-l.x/2, -l.y/2);     p1.po = p;      data.vPos1 = p1;
        const p2 = new V2F(+l.x/2, -l.y/2);     p2.po = p;      data.vPos2 = p2;
        const p3 = new V2F(+l.x/2, +l.y/2);     p3.po = p;      data.vPos3 = p3;
        const p4 = new V2F(-l.x/2, +l.y/2);     p4.po = p;      data.vPos4 = p4;
      }
      if(data.type == IMAGE || data.type == MARKER) data.url = lignes[COL_URL];
      if(data.type == MARKER) data.lod = lignes[COL_LOD];
      if(data.type == IMAGE){
        data.auteur = lignes[COL_AUTHOR];
        data.site = lignes[COL_SITE];
        data.vImgTaille = null;
        data.mipmapActif = false;
      }
      resolve(data);
      return data;
    });
  }
  catch (error) {
    console.error("Erreur dans le chargement de marqueur:", error);
    return null;
  }
}
/**Lecture tableau google et retour de data sans objet initialisé*/
async function traitementLigneGoogleA(lignes){
  try{
    //rotation: execute en tant que coin BG par defaut
    return await new Promise((resolve) => {
      var data = createDataObjet(textToType(lignes[COL_TYPE]));
      if(data == null) {
        resolve(null);
        return null;
      }
      data.plan = -1;
      if(isFloatable(lignes[COL_PLAN])) data.plan = convertToFloat(lignes[COL_PLAN]);
      switch(data.type){
        case TILEMAP_DEFAULT:
          (() => {
            resolve(data);
            return;
          })();
          break;
        case MARKER:
          (() => {
            try{
              data.vPos = new V2F(convertToFloat(lignes[COL_X]),convertToFloat(lignes[COL_Y]));
              var angle = null;
              if(isFloatable(lignes[COL_ANGLE])) angle = convertToFloat(lignes[COL_ANGLE]);
              if(angle != null) data.vPos.setTransfoAngle(angle);//angle degré en normale
              else data.vPos.setTransfoAngle(0);
              data.url = lignes[COL_URL];
              data.lod = lignes[COL_LOD];
              data.titre = lignes[COL_TITLE];
              if(lignes[COL_PARENT] != "-") data.txtOrigine = lignes[COL_PARENT];//generer dependances
              const imagePtee = new Image();
              imagePtee.crossOrigin = "anonymous";
              imagePtee.src = lignes[COL_URL];
              //calcul automatique de rapport
              const l = new V2F(convertToFloat(lignes[COL_LX]),convertToFloat(0));
              imagePtee.onload = () => {//image chargee avec succes";
                l.y = imagePtee.height / imagePtee.width * l.x;
                data.vTaille = l;
                resolve(data);
                return;
              }
              imagePtee.onerror = () => {//image non chargée pour la carte ";
                data.url = unfound_img;
                l.y = l.x;
                data.vTaille = l;
                resolve(data);
                return;
              };
            }
            catch (error) {
            console.log("detection erreur " + lignes[COL_URL]);
            data.url = unfound_img;
            resolve(data);
            throw error;
            }
          })();
          break;
        case IMAGE:
            (() => {
              var angle = null;
              if(isFloatable(lignes[COL_ANGLE])) angle = convertToFloat(lignes[COL_ANGLE]);
              data.vPos = new V2F(convertToFloat(lignes[COL_X]),convertToFloat(lignes[COL_Y]));
              if(angle != null) data.vPos.setTransfoAngle(angle);
              else data.vPos.setTransfoAngle(0);
              data.url = lignes[COL_URL];
              data.titre = lignes[COL_TITLE];
              data.auteur = lignes[COL_AUTHOR];
              data.site = lignes[COL_SITE];
              data.mipmapActif = false;
              data.vTaille = new V2F(convertToFloat(lignes[COL_LX]),convertToFloat(0));
              if(lignes[COL_PARENT] != "-") data.txtOrigine = lignes[COL_PARENT];//generer dependances
              //
              const imagePtee = new Image();
              imagePtee.src = data.url;
              //calcul automatique de rapport
              imagePtee.onload = () => {
                data.vImgTaille = new V2F(imagePtee.width,imagePtee.height);
                const l = data.vTaille;
                l.y = data.vImgTaille.y / data.vImgTaille.x * l.x;
                data.vTaille = l;
                const p1 = new V2F(-l.x/2, -l.y/2);     p1.po = data.vPos;  data.vPos1 = p1;
                const p2 = new V2F(+l.x/2, -l.y/2);     p2.po = data.vPos;  data.vPos2 = p2;
                const p3 = new V2F(+l.x/2, +l.y/2);     p3.po = data.vPos;  data.vPos3 = p3;
                const p4 = new V2F(-l.x/2, +l.y/2);     p4.po = data.vPos;  data.vPos4 = p4;
                resolve(data);
                return;
              }
              imagePtee.onerror = () => {
                console.log("image non chargée pour la carte " +  data.titre);
                data.url = unfound_img;
                data.vImgTaille = new V2F(100,100);
                const l = data.vTaille;
                l.y = data.vImgTaille.y / data.vImgTaille.x * l.x;
                data.vTaille = l;
                const p1 = new V2F(-l.x/2, -l.y/2);     p1.po = data.vPos;  data.vPos1 = p1;
                const p2 = new V2F(+l.x/2, -l.y/2);     p2.po = data.vPos;  data.vPos2 = p2;
                const p3 = new V2F(+l.x/2, +l.y/2);     p3.po = data.vPos;  data.vPos3 = p3;
                const p4 = new V2F(-l.x/2, +l.y/2);     p4.po = data.vPos;  data.vPos4 = p4;
                //
                resolve(data);
                return;
              };//si l'image n'est pas valide
            })();
            return;
        case TEXTE:
            (() => {
              //Convertir le texte en image
              var textImageUrl = textToImage(lignes[COL_TITLE], 40 * lignes[COL_TITLE].length / 2, 40, data.color);//pas ici
              const p = new V2F(convertToFloat(lignes[COL_X]),convertToFloat(lignes[COL_Y]));
              const l = new V2F(lignes[COL_LX], 0);
              var angle = null;
              if(isFloatable(lignes[COL_ANGLE])) angle = convertToFloat(lignes[COL_ANGLE]);
              if(angle != null) data.vPos.setTransfoAngle(angle);
              else data.vPos.setTransfoAngle(0);
              if(lignes[COL_PARENT] != "-") data.txtOrigine = lignes[COL_PARENT];
              data.vPos = p;
              data.url = textImageUrl;
              data.titre = lignes[COL_TITLE];
              //calcul automatique de rapport
              l.y = lignes[COL_LX] / lignes[COL_TITLE].length * 2;
              data.vTaille = l;
              const p1 = new V2F(-l.x/2, -l.y/2);     p1.po = data.vPos;      data.vPos1 = p1;
              const p2 = new V2F(+l.x/2, -l.y/2);     p2.po = data.vPos;      data.vPos2 = p2;
              const p3 = new V2F(+l.x/2, +l.y/2);     p3.po = data.vPos;      data.vPos3 = p3;
              const p4 = new V2F(-l.x/2, +l.y/2);     p4.po = data.vPos;      data.vPos4 = p4;
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
/**met a jour la taille de la data en question à l'aide de la fonction javascript image (fonction lente)*/
async function traitementLigneGoogleC(data) {
  try {
    if (!data) return null;
    //IMAGE
    return await new Promise((resolve) => {
      if(data.type === IMAGE) {
        (() => {
          const imagePtee = new Image();
          imagePtee.src = data.url;
          //calcul automatique de rapport
          imagePtee.onload = () => {
            data.vImgTaille = new V2F(imagePtee.width,imagePtee.height);
            const l = data.vTaille;
            l.y = data.vImgTaille.y / data.vImgTaille.x * l.x;
            data.vTaille = l;
            const p1 = new V2F(-l.x/2, -l.y/2);     p1.po = data.vPos;  data.vPos1 = p1;
            const p2 = new V2F(+l.x/2, -l.y/2);     p2.po = data.vPos;  data.vPos2 = p2;
            const p3 = new V2F(+l.x/2, +l.y/2);     p3.po = data.vPos;  data.vPos3 = p3;
            const p4 = new V2F(-l.x/2, +l.y/2);     p4.po = data.vPos;  data.vPos4 = p4;
            resolve(data);//retour ok
            return;
          }
          imagePtee.onerror = () => {
            console.log("image non chargée pour la carte " + data.titre);
            data.url = unfound_img;
            data.vImgTaille = new V2F(100,100);
            const l = data.vTaille;
            l.y = data.vImgTaille.y / data.vImgTaille.x * l.x;//calcul automatique de rapport
            data.vTaille = l;
            const p1 = new V2F(-l.x/2, -l.y/2);     p1.po = data.vPos;  data.vPos1 = p1;
            const p2 = new V2F(+l.x/2, -l.y/2);     p2.po = data.vPos;  data.vPos2 = p2;
            const p3 = new V2F(+l.x/2, +l.y/2);     p3.po = data.vPos;  data.vPos3 = p3;
            const p4 = new V2F(-l.x/2, +l.y/2);     p4.po = data.vPos;  data.vPos4 = p4;
            resolve(data);
            return;
          };//si l'image n'est pas valide
        })();
      }
      //MARKER
      if(data.type === MARKER) {
        (() => {
          const imagePtee = new Image();
          imagePtee.crossOrigin = "anonymous";
          imagePtee.src = data.url;
          //calcul automatique de rapport
          const l = data.vTaille;
          imagePtee.onload = () => {//image chargee avec succes";
            l.y = imagePtee.height / imagePtee.width * l.x;
            data.vTaille = l;
            resolve(data);
            return;
          };
          imagePtee.onerror = () => {//image non chargée pour la carte ";
            data.url = unfound_img;
            l.y = l.x;
            data.vTaille = l;
            console.log("marker non chargé");
            resolve(data);
            return;
          };
        })();
      }
      // === TEXTE ===
      if (data.type === TEXTE) {
        (() => {
          data.url = textToImage(data.titre,40 * data.titre.length / 2,40, data.color);
          resolve(data);
          return;
        })();
      }
    });
  } catch (error) {
    console.error("Erreur dans le chargement du marqueur :", error);
    return data;
  }
}
/**met a jour les positions de l'objet dans leaflet de la ligne correspondante (mettre la ligne complète en parametre, après modifications de positions), n'affecte pas les icones du ms*/
async function updatePosOnLLObj(obj){
    if(obj == null || obj == undefined) throw new Error("obj nulle ou undefined");
    var obj2 = obj._data.objmm;
    var data = obj._data;
    try{
    if(data.type == IMAGE || data.type == TEXTE){
      if(data.vPos.getTransfo() == null) await obj.setBounds([[data.vPos1.yAbs(), data.vPos1.xAbs()], [data.vPos3.yAbs(), data.vPos3.xAbs()]]);//image select
      else await obj.reposition(toLLCoords(data.vPos4),toLLCoords(data.vPos3),toLLCoords(data.vPos1));
      if(data.type == IMAGE && obj2 != null){//gestion de la mipmap
        if(data.vPos.getTransfo() == null) await obj2.setBounds([[data.vPos1.yAbs(), data.vPos1.xAbs()], [data.vPos3.yAbs(), data.vPos3.xAbs()]]);//image select
        else await obj2.reposition(toLLCoords(data.vPos4),toLLCoords(data.vPos3),toLLCoords(data.vPos1));
      }
    }
    else if(data.type == POLYLIGNE) await obj.setLatLngs([toLLTabl(data.vPos),toLLTabl(data.vPos2)]);
    else if(data.type == MARKER) {
      await obj.setLatLng([data.vPos.yAbs(), data.vPos.xAbs()]);
      const ps = leaflet.toCartesianValue(data.vPos);
      data.vPos1 = leaflet.toGPSValue(new V2F(ps.x - (data.vTaille.x / 2 + 2), ps.y - (data.vTaille.y / 2 + 2)));
      data.vPos2 = leaflet.toGPSValue(new V2F(ps.x + (data.vTaille.x / 2 + 2), ps.y - (data.vTaille.y / 2 + 2)));
      data.vPos3 = leaflet.toGPSValue(new V2F(ps.x + (data.vTaille.x / 2 + 2), ps.y + (data.vTaille.y / 2 + 2)));
      data.vPos4 = leaflet.toGPSValue(new V2F(ps.x - (data.vTaille.x / 2 + 2), ps.y + (data.vTaille.y / 2 + 2)));
    }
    if(data.type == IMAGE || data.type == TEXTE || data.type == MARKER) if(data.objetVecteur != null) await data.objetVecteur.setLatLngs([toLLTabl(data.objetVecteur._data.vPos),toLLTabl(data.objetVecteur._data.vPos2)]);
    if(data.type == IMAGE || data.type == TEXTE || data.type == MARKER){
      if(data.objetCarre1 != null) {
        data.objetCarre1._data.vPos = data.vPos1;
        data.objetCarre2._data.vPos = data.vPos2;
        data.objetCarre3._data.vPos = data.vPos3;
        data.objetCarre4._data.vPos = data.vPos4;
        data.objetCarre1._data.vPos2 = data.objetCarre2._data.vPos;
        data.objetCarre2._data.vPos2 = data.objetCarre3._data.vPos;
        data.objetCarre3._data.vPos2 = data.objetCarre4._data.vPos;
        data.objetCarre4._data.vPos2 = data.objetCarre1._data.vPos;
        data.objetCarre1.setLatLngs([toLLTabl(data.objetCarre1._data.vPos),toLLTabl(data.objetCarre1._data.vPos2)]);
        data.objetCarre2.setLatLngs([toLLTabl(data.objetCarre2._data.vPos),toLLTabl(data.objetCarre2._data.vPos2)]);
        data.objetCarre3.setLatLngs([toLLTabl(data.objetCarre3._data.vPos),toLLTabl(data.objetCarre3._data.vPos2)]);
        data.objetCarre4.setLatLngs([toLLTabl(data.objetCarre4._data.vPos),toLLTabl(data.objetCarre4._data.vPos2)]);
      } 
    }
  } catch(error) {
    console.error("Error:", error);
    throw error;
  }
}
//
async function actionChangementParente(){
  try{
    if(await mush.getObjFocus() != null && mode == MODE_LINK) {
      if(parentSelectOne == null) parentSelectOne = await mush.getObjFocus();
      else {
        if(parentSelectTwo != null) changeCarreColor(parentSelectTwo, 'red');
        parentSelectTwo = await mush.getObjFocus();
      }
      if(parentSelectTwo == parentSelectOne) {
        resetParentMode();
        return;
      }
      if(parentSelectOne != null){changeCarreColor(parentSelectOne, 'blue');}
      if(parentSelectTwo != null){
        var txt = parentSelectOne._data.titre + "<br><center>TO</center>" + parentSelectTwo._data.titre;
        if(parentSelectTwo._data.vPos.detectCirculariteBool(parentSelectOne._data.vPos)) txt += "<br><center>Circular detection</center>";
        else txt += `<br><center><a href="#" style="cursor: pointer; text-decoration: underline;" onclick="changeDependances()">[OK]</a></center>`;
          leaflet.enablePopup();
        leaflet.popup((await parentSelectTwo)._data.vPos, txt);
        changeCarreColor(parentSelectTwo, 'yellow');
      }
    }
  } catch (error) {
    console.error("Erreur dans le chargement du marqueur :", error);
    return data;
  }
}
/**change la couleur du cadre autour d'un objet à partir de sa clé*/
function changeCarreColor(obj, color){
    try{
      if(obj == null) return;
      if(obj._data.objetCarre1 == null) return;
      {
        obj._data.objetCarre1.setStyle({color: color});
        obj._data.objetCarre2.setStyle({color: color});
        obj._data.objetCarre3.setStyle({color: color});
        obj._data.objetCarre4.setStyle({color: color});
      }
    } catch (error) {
      console.error("Erreur dans le chargement du marqueur :", error);
    return data;
  }
}
async function changeDependances(){
  try{
    //change le po, la valeur et l'angle de transformation local pour que po change sans changer la valeur de pAbs avec transformations globales
    var pt1 = parentSelectOne._data.vPos;
    var pt2 = parentSelectTwo._data.vPos;
    await pt2.changePo(pt1);
    parentSelectTwo._data.objetVecteur._data.vPos = pt2;
    parentSelectTwo._data.objetVecteur._data.vPos2 = pt2.getPo2();
    parentSelectTwo._data.vOrigine = parentSelectOne;
    updatePosOnLLObj(parentSelectTwo);
    resetParentMode();
  } catch (error) {
      console.error("Erreur dans le chargement du marqueur :", error);
    return data;
  }
}
async function resetParentMode(){
  changeCarreColor(parentSelectOne, 'red');
  changeCarreColor(parentSelectTwo, 'red');
  parentSelectTwo = null;
  parentSelectOne = null;
  //console.log("resetparentmode");
  leaflet.closePopup();
}
