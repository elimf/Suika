import {
  Bodies,
  Engine,
  Render,
  Runner,
  World,
  Body,
  Sleeping,
  Events,
} from "matter-js";
import { FRUITS } from "./fruits";
const friction = {
  friction: 0.006,
  frictionStatic: 0.006,
  frictionAir: 0,
  restitution: 0.1,
};
const gameOptions = {
  width: 640,
  height: 960,
  elements: {
    canvas: document.getElementById("game-canvas"),
    ui: document.getElementById("game-ui"),
    score: document.getElementById("game-score"),
    end: document.getElementById("game-end-container"),
    endTitle: document.getElementById("game-end-title"),
    statusValue: document.getElementById("game-highscore-value"),
    nextFruitImg: document.getElementById("game-next-fruit"),
    previewBall: null,
  },
  score: 0,
  fruitsMerged: [],
};

const engine = Engine.create();
const runner = Runner.create();
const render = Render.create({
  engine,
  element: gameOptions.elements.canvas,
  options: {
    wireframes: false,
    background: "transparent",
    width: gameOptions.width,
    height: gameOptions.height,
  },
});

const world = engine.world;

const ground = Bodies.rectangle(310, 820, 620, 60, {
  isStatic: true,
  render: {
    fillStyle: "#E6B143",
    friction: friction,
  },
});
const leftWall = Bodies.rectangle(15, 395, 30, 790, {
  isStatic: true,
  render: {
    fillStyle: "#E6B143",
  },
  friction: friction,
});
const rightWall = Bodies.rectangle(605, 395, 30, 790, {
  isStatic: true,
  render: {
    fillStyle: "#E6B143",
    friction: friction,
  },
});
const topLine = Bodies.rectangle(310, 150, 620, 2, {
  isStatic: true,
  isSensor: true,
  render: { fillStyle: "#E6B143" },
  label: "topLine",
});

Render.run(render);
Runner.run(engine);

let currentBody = null;
let currentFruit = null;
let nextBody = null;
let nextFruit = null;
let interval = null;
let disableAction = false;

function addCurrentFruit() {
  if (nextBody) {
    currentBody = nextBody;
    currentFruit = nextFruit;
    World.add(world, nextBody);
    const nextRandomFruit = getRandomFruit();
    const secondBody = Bodies.circle(300, 50, nextRandomFruit.radius, {
      label: nextRandomFruit.label,
      isSleeping: true,
      render: {
        fillStyle: nextRandomFruit.color,
        sprite: { texture: `/${nextRandomFruit.label}.png` },
      },
      restitution: 0.2,
    });
    gameOptions.elements.nextFruitImg.src = `/${nextRandomFruit.label}.png`;
    nextBody = secondBody;
    nextFruit = nextRandomFruit;
  } else {
    const randomFruit = getRandomFruit();
    const body = Bodies.circle(300, 50, randomFruit.radius, {
      label: randomFruit.label,
      isSleeping: true,
      render: {
        fillStyle: randomFruit.color,
        sprite: { texture: `/${randomFruit.label}.png` },
      },
      restitution: 0.2,
    });
    currentBody = body;
    currentFruit = randomFruit;
    World.add(world, body);

    const nextRandomFruit = getRandomFruit();
    const secondBody = Bodies.circle(300, 50, nextRandomFruit.radius, {
      label: nextRandomFruit.label,
      isSleeping: true,
      render: {
        fillStyle: nextRandomFruit.color,
        sprite: { texture: `/${nextRandomFruit.label}.png` },
      },
      restitution: 0.2,
    });
    gameOptions.elements.nextFruitImg.src = `/${nextRandomFruit.label}.png`;
    nextBody = secondBody;
    nextFruit = nextRandomFruit;
  }
}

function getRandomFruit() {
  const randomIndex = Math.floor(Math.random() * 5);
  const fruit = FRUITS[randomIndex];

  if (currentFruit && currentFruit.label === fruit.label)
    return getRandomFruit();

  return fruit;
}
function startGame() {
  gameOptions.fruitsMerged = Array.apply(null, Array(FRUITS.length)).map(
    () => 0
  );
  World.add(world, [ground, leftWall, rightWall, topLine]);
  calculateScore();
  gameOptions.elements.endTitle.innerText = "Game Over!";
  gameOptions.elements.ui.style.display = "block";
  gameOptions.elements.end.style.display = "none";
  addCurrentFruit();
  Events.on(engine, "collisionStart", (event) => {
    event.pairs.forEach((collision) => {
      if (collision.bodyA.label === collision.bodyB.label) {
        World.remove(world, [collision.bodyA, collision.bodyB]);

        const index = FRUITS.findIndex(
          (fruit) => fruit.label === collision.bodyA.label
        );

        if (index === FRUITS.length - 1) {
          calculateScore();
          return;
        }

        const newFruit = FRUITS[index + 1];
        const body = Bodies.circle(
          collision.collision.supports[0].x,
          collision.collision.supports[0].y,
          newFruit.radius,
          {
            render: {
              fillStyle: newFruit.color,
              sprite: { texture: `/${newFruit.label}.png` },
            },
            label: newFruit.label,
          }
        );
        gameOptions.fruitsMerged[index] += 1;
        World.add(world, body);
        calculateScore();
      }
      if (
        (collision.bodyA.label === "topLine" ||
          collision.bodyB.label === "topLine") &&
        !disableAction
      ) {
        loseGame();
      }
    });
  });
}
function loseGame() {
  gameOptions.elements.end.style.display = "flex";
  runner.enabled = false;
}
function calculateScore() {
  const score = gameOptions.fruitsMerged.reduce((total, count, sizeIndex) => {
    const value = FRUITS[sizeIndex].value * count;
    return total + value;
  }, 0);

  gameOptions.score = score;
  gameOptions.elements.score.innerText = gameOptions.score;
}

window.onkeydown = (event) => {
  if (disableAction) return;
  switch (event.code) {
    case "ArrowLeft":
      if (interval) return;
      interval = setInterval(() => {
        if (currentBody.position.x - 20 > 30)
          Body.setPosition(currentBody, {
            x: currentBody.position.x - 1,
            y: currentBody.position.y,
          });
      }, 5);
    case "ArrowRight":
      if (interval) return;
      interval = setInterval(() => {
        if (currentBody.position.x + 20 < 590)
          Body.setPosition(currentBody, {
            x: currentBody.position.x + 1,
            y: currentBody.position.y,
          });
      }, 5);
      break;
    case "Space":
      disableAction = true;
      Sleeping.set(currentBody, false);
      setTimeout(() => {
        addCurrentFruit();
        disableAction = false;
      }, 1000);
  }
};
window.onkeyup = (event) => {
  switch (event.code) {
    case "ArrowLeft":
    case "ArrowRight":
      clearInterval(interval);
      interval = null;
  }
};

startGame();
const resizeCanvas = () => {
  const screenWidth = document.body.clientWidth;
  const screenHeight = document.body.clientHeight;

  let newWidth = gameOptions.width;
  let newHeight = gameOptions.height;
  let scaleUI = 1;

  if (screenWidth * 1.5 > screenHeight) {
    newHeight = Math.min(gameOptions.height, screenHeight);
    newWidth = newHeight / 1.5;
    scaleUI = newHeight / gameOptions.height;
  } else {
    newWidth = Math.min(gameOptions.width, screenWidth);
    newHeight = newWidth * 1.5;
    scaleUI = newWidth / gameOptions.width;
  }

  render.canvas.style.width = `${newWidth}px`;
  render.canvas.style.height = `${newHeight}px`;

  document.getElementById("game-ui").style.width = `${gameOptions.width}px`;
  document.getElementById("game-ui").height = `${gameOptions.height}px`;
  document.getElementById("game-ui").style.transform = `scale(${scaleUI})`;
};
const imageContainer = document.getElementById("image-container");
FRUITS.forEach((fruit) => {
  const img = document.createElement("img");
  img.src = `/${fruit.label}.png`;
  img.classList.add("circle-image");
  imageContainer.appendChild(img);
});
document.body.onload = resizeCanvas;
document.body.onresize = resizeCanvas;
