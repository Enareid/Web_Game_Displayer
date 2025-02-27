import PlacementHandler from "../../node_modules/@raphael-levecque/placement-handler-railroad/placementHandler.js";

const ph = new PlacementHandler();
ph.addThrow(["S","R"]);

let PossiblePlacement = [];


document.addEventListener("DOMContentLoaded", () => {
    let selectedImage = null; // Variable pour stocker l'image sélectionnée
    let currentRotation = 0; // Variable pour suivre l'angle de rotation
    let currentFlip = 1;

    // Gérer le clic sur les images dans les divs de DiceRoll
    const diceImages = document.querySelectorAll("#DiceRoll img,#SpecialRoad img");
    diceImages.forEach(img => {
        img.addEventListener("click", click);
    });

    function getIdFromSrc(image) {
        let source = image.src;
        let name = source.substring(source.lastIndexOf("/")+1,source.lastIndexOf("."));
        return name.split('-').join('');;
    }

    function getRotationNomenclature(rotation, flip){
        if (flip == 1) {
            if(rotation == 0){
                return 'S';
            }
            else if(rotation == 90){
                return 'R';
            }
            else if(rotation == 180){
                return 'U';
            }
            else{
                return 'L';
            }
        }
        else {
            if(rotation == 0){
                return 'F';
            }
            else if(rotation == 90){
                return 'FR';
            }
            else if(rotation == 180){
                return 'FU';
            }
            else{
                return 'FL';
            }
        }
    }


    // Gérer le clic sur le bouton "Rotate"
    const rotateButton = document.getElementById("rotateButton");

    rotateButton.addEventListener("click", () => {
        rotateImage();
    });

    // Gérer le clic sur le bouton "Flip"
    const flipButton = document.getElementById("flipButton");

    flipButton.addEventListener("click", () => {
        flipImage();
    });

    function rotateImage() {
        if (selectedImage) {
            // Augmente l'angle de rotation de 90° (modulo 360°)
            currentRotation = (currentRotation + 90) % 360;

            // Applique la transformation CSS pour pivoter l'image
            selectedImage.style.transform = `rotate(${currentRotation}deg) scaleX(${currentFlip})`;
            PossiblePlacement = ph.possiblePlacements(getIdFromSrc(selectedImage), getRotationNomenclature(currentRotation, currentFlip))
            updateStyle();
            PossiblePlacement.forEach(tile => {
                modifStyle(tile);
            });
        }
    }

    function flipImage() {
        if (selectedImage) {
            // Effet miroir de l'image
            currentFlip = currentFlip == -1 ? 1 : -1;

            // Applique la tranformation CSS pour pivoter l'image
            selectedImage.style.transform = `rotate(${currentRotation}deg) scaleX(${currentFlip})`;
            console.log(getIdFromSrc(selectedImage));
            console.log(getRotationNomenclature(currentRotation, currentFlip));
            PossiblePlacement = ph.possiblePlacements(getIdFromSrc(selectedImage), getRotationNomenclature(currentRotation, currentFlip))
            console.log(PossiblePlacement);
            updateStyle();
            PossiblePlacement.forEach(tile => {
                modifStyle(tile);
            });
        }
    }

    function modifStyle(tile) {
        const tileElement = document.getElementById(tile);
        tileElement.style.backgroundColor = "lightgreen";
        tileElement.classList.add("possiblePlacement");
        // Gérer le clic sur les balises td de la table
        tileElement.addEventListener("click", place);
    }

    function updateStyle() {
        const allPossiblePlacement = document.querySelectorAll(".possiblePlacement");
        allPossiblePlacement.forEach(tile => {
            tile.style.backgroundColor = "white";
            tile.classList.remove("possiblePlacement");
            tile.removeEventListener("click", place);
        });
    }
    
    function place() {
        // Vérifie si une image est sélectionnée
        if (selectedImage) {
        // Ajoute l'image sélectionnée dans la cellule cliquée
            this.innerHTML = ""; // Supprime tout contenu existant dans la cellule
            this.appendChild(selectedImage);
            sendCommand('PLACES '+getIdFromSrc(selectedImage)+' '+getRotationNomenclature(currentRotation, currentFlip)+' '+ this.id)

            // Retire la sélection de l'image après son placement
            selectedImage.classList.remove("selected");
            socket.emit('update board',getBoard(),id);
            selectedImage.removeEventListener("click", click); 
        }
        ph.placeTile(this.id, getIdFromSrc(selectedImage), getRotationNomenclature(currentRotation, currentFlip)); 
        selectedImage = null;
    }

    function click() {
        // Si une image est déjà sélectionnée, désélectionne-la
        if (selectedImage) {
            selectedImage.classList.remove("selected");
        }
        // Remets à 0 si l'image est null
        if (selectedImage == null) {
            currentRotation = 0;
            currentFlip = 1;
        }
        
        // Réinitialise la rotation de l'image précédemment sélectionnée
        while(currentRotation != 0) {
            rotateImage();
        }
        while(currentFlip != 1) {
            flipImage();
        }
        // Marque l'image cliquée comme sélectionnée
        selectedImage = event.target;
        selectedImage.classList.add("selected");
        PossiblePlacement = ph.possiblePlacements(getIdFromSrc(selectedImage), getRotationNomenclature(currentRotation, currentFlip));
        console.log(PossiblePlacement);
        updateStyle();
        PossiblePlacement.forEach(tile => {
            modifStyle(tile);
        });

    }

});