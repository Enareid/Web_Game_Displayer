import PlacementHandler from "../../node_modules/@raphael-levecque/placement-handler-railroad/placementHandler.js";
import { sendCommand } from "./ioClient.js";

class PlacementManager {
    constructor() {
        this.ph = new PlacementHandler();
        this.selectedImage = null;
        this.currentRotation = 0;
        this.currentFlip = 1;
        this.PossiblePlacement = [];
    }

    init() {
        document.addEventListener("DOMContentLoaded", () => {
            this.setupEventListeners();
        });
    }

    setupEventListeners() {
        const diceImages = document.querySelectorAll("#DiceRoll img,#SpecialRoad img");
        diceImages.forEach(img => {
            img.addEventListener("click", (event) => this.click(event));
        });

        document.getElementById("rotateButton").addEventListener("click", () => this.rotateImage());
        document.getElementById("flipButton").addEventListener("click", () => this.flipImage());
    }

    getIdFromSrc(image) {
        let source = image.src;
        let name = source.substring(source.lastIndexOf("/") + 1, source.lastIndexOf("."));
        return name.split('-').join('');
    }

    getRotationNomenclature(rotation, flip) {
        const nomenclature = {
            1: { 0: 'S', 90: 'R', 180: 'U', 270: 'L' },
            '-1': { 0: 'F', 90: 'FR', 180: 'FU', 270: 'FL' }
        };
        return nomenclature[flip][rotation];
    }

    rotateImage() {
        if (this.selectedImage) {
            this.currentRotation = (this.currentRotation + 90) % 360;
            this.updateImageTransform();
            this.updatePlacement();
        }
    }

    flipImage() {
        if (this.selectedImage) {
            this.currentFlip = this.currentFlip === -1 ? 1 : -1;
            this.updateImageTransform();
            this.updatePlacement();
        }
    }

    updateImageTransform() {
        this.selectedImage.style.transform = `rotate(${this.currentRotation}deg) scaleX(${this.currentFlip})`;
    }

    updatePlacement() {
        this.PossiblePlacement = this.ph.possiblePlacements(
            this.getIdFromSrc(this.selectedImage),
            this.getRotationNomenclature(this.currentRotation, this.currentFlip)
        );
        this.updateStyle();
        this.PossiblePlacement.forEach(tile => this.modifStyle(tile));
    }

    modifStyle(tile) {
        const tileElement = document.getElementById(tile);
        tileElement.style.backgroundColor = "lightgreen";
        tileElement.classList.add("possiblePlacement");
        tileElement.addEventListener("click", () => this.place(tileElement));
    }

    updateStyle() {
        document.querySelectorAll(".possiblePlacement").forEach(tile => {
            tile.style.backgroundColor = "";
            tile.classList.remove("possiblePlacement");
            tile.removeEventListener("click", () => this.place(tile));
        });
    }

    place(tileElement) {
        if (this.selectedImage) {
            tileElement.innerHTML = "";
            tileElement.appendChild(this.selectedImage);
            sendCommand('PLACES '+this.getIdFromSrc(this.selectedImage)+' '+this.getRotationNomenclature(this.currentRotation, this.currentFlip)+' '+ event.target.id)
            this.selectedImage.classList.remove("selected");
            this.updateStyle();
            this.ph.placeTile(
                tileElement.id,
                this.getIdFromSrc(this.selectedImage),
                this.getRotationNomenclature(this.currentRotation, this.currentFlip)
            );
            this.selectedImage.removeEventListener("click", (event) => this.click(event));
            this.selectedImage = null;
        }
    }

    click(event) {
        if (this.selectedImage) {
            this.selectedImage.classList.remove("selected");
        }
        
        this.selectedImage = event.target;
        this.selectedImage.classList.add("selected");
        this.currentRotation = 0;
        this.currentFlip = 1;
        this.updateImageTransform();
        this.updatePlacement();
    }
}

export default PlacementManager;
