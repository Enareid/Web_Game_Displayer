import PlacementHandler from "../../node_modules/@raphael-levecque/placement-handler-railroad/placementHandler.js";
import { sendCommand, getBoard, socket, id } from "./ioClient.js";

class PlacementManager {
    constructor() {
        this.ph = new PlacementHandler();
        this.selectedImage = null;
        this.currentRotation = 0;
        this.currentFlip = 1;
        this.PossiblePlacement = [];
        this.diceThrows = [];
        this.special = true;
        this.validated = false;
        this.clikeHandler = this.click.bind(this);
        this.placeHandler = this.place.bind(this);
    }

    init() {
        document.addEventListener("DOMContentLoaded", () => {
            this.setupEventListeners();
        });
        document.getElementById("rotateButton").addEventListener("click", () => this.rotateImage());
        document.getElementById("flipButton").addEventListener("click", () => this.flipImage());
        document.getElementById("validate").addEventListener("click", () => this.validate());
    }

    setupEventListeners() {
        const diceImages = document.querySelectorAll("#DiceRoll img,#SpecialRoad img");
        diceImages.forEach(img => {
            img.addEventListener("click", this.clikeHandler);
        });
        this.updateThrows();
    }

    getIdFromSrc(image) {
        let source = image.src;
        let name = source.substring(source.lastIndexOf("/") + 1, source.lastIndexOf("."));
        return name.split('-').join('');
    }

    getRotationNomenclature(rotation, flip) {
        if (flip == 1) {
            if(rotation == 0){
                return 'S';
            }
            else if(rotation == 90){
                return 'R';
            }
            else if(rotation == 180){
                return 'U';"click"
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

    rotateImage() {
        if (this.selectedImage) {
            this.currentRotation = (this.currentRotation + 90) % 360;
            this.updateImageTransform();
            this.updatePlacement();
        }
    }

    flipImage() {
        if (this.selectedImage) {
            this.currentFlip = this.currentFlip == -1 ? 1 : -1;
            this.updateImageTransform();
            this.updatePlacement();
        }
    }

    updateImageTransform() {
        console.log(this.currentFlip);
        console.log(this.currentRotation);
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
        tileElement.addEventListener("click", this.placeHandler);
    }

    updateStyle() {
        document.querySelectorAll(".possiblePlacement").forEach(tile => {
            tile.style.backgroundColor = "";
            tile.classList.remove("possiblePlacement");
            tile.removeEventListener("click", this.placeHandler);
        });
    }

    place(event) {
        console.log(event.target);
        const tileElement = event.target;
        if (this.selectedImage) {
            if (this.ph.isSpecialTile(this.getIdFromSrc(this.selectedImage))) {
                if (!this.special){
                    return;
                }
                else {
                    this.special = false;
                }
            }
            tileElement.innerHTML = "";
            tileElement.appendChild(this.selectedImage);
            sendCommand('PLACES '+this.getIdFromSrc(this.selectedImage)+' '+this.getRotationNomenclature(this.currentRotation, this.currentFlip)+' '+ tileElement.id)
            this.selectedImage.classList.remove("selected");
            this.updateStyle();
            this.ph.placeTile(
                tileElement.id,
                this.getIdFromSrc(this.selectedImage),
                this.getRotationNomenclature(this.currentRotation, this.currentFlip)
            );
            socket.emit('update board',getBoard(),id);
            this.selectedImage.removeEventListener("click", this.clikeHandler);
            if (this.ph.isSpecialTile(this.getIdFromSrc(this.selectedImage))) {
                const diceImages = document.querySelectorAll("#SpecialRoad img");
                diceImages.forEach((img) => {
                    img.removeEventListener("click", this.clikeHandler);
                })
            }
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

    validate() {
        console.log("validate est envoyer")
        let possible = this.ph.possiblePlacementsRemain()
        if (! possible) {
            const boardsDisplay = document.getElementById('boards-display');
            boardsDisplay.innerHTML = "";
            socket.emit("view board",socket.id);
            if(!this.validated){
                sendCommand('YIELDS');
                this.validated = true;
            }
            this.special = true;
        }
    }

    updateThrows(){
        this.diceThrows = [];
        this.ph.validate();
        const diceImages = document.querySelectorAll("#DiceRoll img");
        diceImages.forEach(img => {
            this.diceThrows.push(this.getIdFromSrc(img));
        });
        this.ph.addThrow(this.diceThrows);
        this.special = true;
        this.validated = false;
    }
}

export default PlacementManager;
