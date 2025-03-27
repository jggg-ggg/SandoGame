let bg;
let character;
let badCharacter;
let titleFont;
let characterX, characterY;
let characterSpeed = 10;
let moveLeft = false;
let moveRight = false;
let goodIngredients = [];
let badIngredient;
let ingredients = [];
let stackedIngredients = [];
let characterWidth = 120;
let characterHeight = 150;
let plateYOffset;
let spawnRate = 60;
let gameOver = false;
let gameStarted = false;
let score = 0;
let stackHeight;
let points = 0;

function preload() {
  bg = loadImage("Background.png");
  character = loadImage("Ciggy.png");
  badCharacter = loadImage("BadCiggy.png");
  titleFont = loadFont("EIGH3___.TTF");
  for (let i = 0; i < 6; i++) {
    goodIngredients[i] = loadImage(`I${i + 1}.png`);
  }
  badIngredient = loadImage("I7.png");
}

function setup() {
  // Create canvas to match window width, maintaining aspect ratio
  let canvasWidth = windowWidth;
  let canvasHeight = canvasWidth / 0.562; // 375:667 aspect ratio
  createCanvas(canvasWidth, canvasHeight);
  pixelDensity(1); // Force 1x density for consistency

  textAlign(CENTER, TOP);
  textFont(titleFont);
  fill(223, 41, 53);

  // Resize characters
  let charWidth = canvasWidth / 5;
  character.resize(charWidth, 0);
  badCharacter.resize(charWidth, 0); // Ensure same size as Ciggy.png

  characterX = canvasWidth / 2 - character.width / 2;
  characterY = canvasHeight - character.height - canvasHeight / 30;
  
  

  // Resize good ingredients
  for (let i = 0; i < goodIngredients.length; i++) {
    goodIngredients[i].resize(canvasWidth * 0.213, canvasHeight * 0.045); // Scaled from 80/375, 30/667
  }
  badIngredient.resize(canvasWidth * 0.16, 0); // Scaled from 60/375

  plateYOffset = character.height / 2;
  stackHeight = characterY + plateYOffset;
}

function draw() {
  background(255); // White background for margins

  // Fit background with 80px top and bottom margins
  let margin = 80; // Fixed 80px margins
  let bgHeight = height - 2 * margin; // Height between margins
  let bgWidth = bgHeight * (bg.width / bg.height); // Maintain aspect ratio
  let bgX = (width - bgWidth) / 2; // Center horizontally
  let bgY = margin; // Start at top margin
  image(bg, bgX, bgY, bgWidth, bgHeight);

  if (!gameStarted) {
    fill(223, 41, 53);
    textSize(width * 0.133); // Scaled from 50/375
    textAlign(CENTER, TOP);
    text("lil' ciggy's sando", width / 2, height * 0.03);

    stroke(0);
    strokeWeight(3);
    noFill();
    rect(width / 2 - width * 0.267, height / 2 - height * 0.052, width * 0.533, height * 0.105, 10);

    noStroke();
    fill(223, 41, 53);
    rect(width / 2 - width * 0.253, height / 2 - height * 0.045, width * 0.507, height * 0.09, 10);

    fill(255);
    textSize(width * 0.08); // Scaled from 30/375
    text("play game", width / 2, height / 2 - height * 0.03);

    return;
  }

  if (!gameOver) {
    image(character, characterX, characterY);

    let stackY = characterY + plateYOffset;
    for (let img of stackedIngredients) {
      stackY -= img.height / 2;
      image(img, characterX + (character.width - img.width) / 2, stackY);
    }

    if (moveLeft) {
      characterX -= characterSpeed;
    }
    if (moveRight) {
      characterX += characterSpeed;
    }
    characterX = constrain(characterX, 0, width - character.width);

    if (score % 3 === 0 && score > 0) {
      spawnRate = max(20, spawnRate - 3);
      for (let ing of ingredients) {
        ing.speed += 0.2;
      }
    }

    if (frameCount % spawnRate === 0) {
      spawnIngredient();
    }

    for (let i = ingredients.length - 1; i >= 0; i--) {
      let ing = ingredients[i];
      ing.update();
      ing.display();

      if (ing.caughtByPlate(characterX, stackHeight)) {
        if (ing.isBad) {
          gameOver = true; // Game ends here, characterX/Y are locked at this moment
        } else {
          stackedIngredients.push(ing.img);
          stackHeight -= ing.img.height / 2;
          score++;
          points += 20;
        }
        ingredients.splice(i, 1);
      } else if (ing.y > height) {
        points -= 10;
        ingredients.splice(i, 1);
      }
    }

    fill(0);
    textSize(width * 0.080); // Scaled from 20/375
    textAlign(LEFT, TOP);
    text("Level: " + score, width * 0.027, height * 0.015);

    textAlign(RIGHT, TOP);
    text("Points: " + points, width - width * 0.027, height * 0.015);
  } else {
    
         image(badCharacter, characterX, characterY+100); // Use exact last position of Ciggy.png
    
    //THE RECTANGLE WITH OPACITY
       fill(0, 0, 0, 220); // Black with 150/255 opacity
rect(0, 0, width, height);
    
    
    fill(223, 41, 53);
    textSize(width * 0.187); // Scaled from 70/375
    textAlign(CENTER, CENTER);
    text("game over", width / 2, height / 2 - height * 0.400);


    
        textSize(width * 0.08); // Scaled from 30/375
    text("Final Points: " + points, width / 2, height / 2 - height * 0.300);
    text("Tap to Restart", width / 2, height / 2);
    text("Level: " + score, width / 2, height / 2 - height * 0.250);
    

    
    
  
  }
}

function mousePressed() {
  if (!gameStarted) {
    if (
      mouseX > width / 2 - width * 0.253 &&
      mouseX < width / 2 + width * 0.253 &&
      mouseY > height / 2 - height * 0.045 &&
      mouseY < height / 2 + height * 0.045
    ) {
      gameStarted = true;
    }
    return;
  }

  if (gameOver) {
    resetGame();
  } else {
    if (mouseX < width / 2) {
      moveLeft = true;
    } else {
      moveRight = true;
    }
  }
}

function mouseReleased() {
  moveLeft = false;
  moveRight = false;
}

function spawnIngredient() {
  let badIngredientChance = 0.2 + score / 50.0;
  let isBad = random(1) < badIngredientChance;

  let img = isBad ? badIngredient : goodIngredients[floor(random(6))];
  let startX = random(width * 0.08, width - width * 0.08);

  let newIngredient = new Ingredient(startX, img, isBad);
  newIngredient.speed += score * 0.1;
  ingredients.push(newIngredient);
}

function touchStarted() {
  if (!gameStarted) {
    if (
      touches[0].x > width / 2 - width * 0.253 &&
      touches[0].x < width / 2 + width * 0.253 &&
      touches[0].y > height / 2 - height * 0.045 &&
      touches[0].y < height / 2 + height * 0.045
    ) {
      gameStarted = true;
    }
    return false;
  }

  if (gameOver) {
    resetGame();
    return false;
  }

  if (touches.length > 0) {
    if (touches[0].x < width / 2) {
      moveLeft = true;
    } else {
      moveRight = true;
    }
  }
  return false;
}

function touchEnded() {
  moveLeft = false;
  moveRight = false;
}



class Ingredient {
  constructor(startX, ingredientImage, bad) {
    this.x = startX;
    this.y = -50;
    this.speed = random(4, 7);
    this.img = ingredientImage;
    this.isBad = bad;
    this.img.resize(width * 0.133, 0); // Scaled from 50/375
  }

  update() {
    this.y += this.speed;
  }

  display() {
    image(this.img, this.x, this.y);
  }

  caughtByPlate(plateX, stackHeight) {
    let catchMargin = this.isBad ? max(5, 20 - score / 5) : 5;

    let ingredientCenterX = this.x + this.img.width / 2;
    let plateCenterX = plateX + character.width / 2;

    let withinCatchZone = abs(ingredientCenterX - plateCenterX) < character.width / (this.isBad ? 2.5 : 4);

    return (
      this.y + this.img.height >= stackHeight - catchMargin &&
      this.y + this.img.height <= stackHeight + catchMargin &&
      withinCatchZone
    );
  }
}

function resetGame() {
  gameOver = false;
  gameStarted = false;
  score = 0;
  points = 0;
  ingredients = [];
  stackedIngredients = [];
  stackHeight = characterY + plateYOffset;
  // Reset character position to center
  characterX = width / 2 - character.width / 2;
  characterY = height - character.height - height / 30;
}