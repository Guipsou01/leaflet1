const LONG_PRESS_THRESHOLD = 100; // Durée en ms pour définir un appui long
var isHolding = false;
var holdIntervalLL;
var isHandlingClickOrHold = false; //Empêche la double détection
var clickTimer = null; // Timer pour différencier clic et appui long
var isMouseDown = false; // État de la souris

function mouseMoveIO(){
  mouseMove();
}
function mapMoveEndIO(){
  mapMoveEnd();
}
function popupClosedIO(){
  popupClosed();
}
function mouseUpDetectedIO(){
    isHolding = false;
    clearInterval(holdIntervalLL);//stop le spam
    isMouseDown = false; //Marque l'état comme relâché
    //Si le timer est encore actif, c'est un clic rapide
    if(clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
      //Si un appui long n'a pas été détecté
      if(!isHandlingClickOrHold) {mouseClick();}
    }
    mouseUp();//console.log("relachement");
    isHandlingClickOrHold = false; //Réinitialise l'état*/
}
function mouseDownDetectedIO(){
    mouseDown();
    if(!isHandlingClickOrHold) {
      isMouseDown = true; //Marque l'état comme appuyé
      //Lance un timer pour détecter un appui long
      clickTimer = setTimeout(async () => {
        if(isMouseDown) { //Si l'utilisateur maintient l'appui
          holdIntervalLL = setInterval(() => {spamDuringMouseHold();}, 10);//verifie toute les 100ms
          isHandlingClickOrHold = true; //Indique qu'on gère un appui long
          mouseDownConfirmee();
        }
      }, LONG_PRESS_THRESHOLD);
    }
}
/**actif a chaque frame de déplacement de souris*/
function mouseMove(){}
/**execution à l'enfoncement du clique*/
function mouseDown(){}
/**detecte un appui long, ne s'execute qu'une fois par appui*/
function mouseDownConfirmee(){}
/**execution au relachement du clique*/
function mouseUp(){}
/**spam pendant l'appui*/
function spamDuringMouseHold(){}
/**click détecté sur la carte*/
function mouseClick(){}
/**action éxécuté une fois si changement de zoom ou fin de déplacement*/
function mapMoveEnd(){}
/**action éxécuter a la fermeture d'un popup*/
function popupClosed(){};
