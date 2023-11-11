import {
  Bodies,
  Engine,
  Render,
  Runner,
  World,
  Body,
  Sleeping,
} from "matter-js";

const engine = Engine.create();
const render = Render.create({
  engine,
  element: document.body,
  options: {
    wireframes: false,
    background: "#F7F4C8",
    width: 620,
    height: 850,
  },
});

const world = engine.world;

const ground = Bodies.rectangle(310, 820, 620, 60, {
  isStatic: true,
  render: {
    fillStyle: "#E6B143",
  },
});
const leftWall = Bodies.rectangle(15, 395, 30, 790, {
  isStatic: true,
  render: {
    fillStyle: "#E6B143",
  },
});
const rightWall = Bodies.rectangle(605, 395, 30, 790, {
  isStatic: true,
  render: {
    fillStyle: "#E6B143",
  },
});

const box = Bodies.circle(50, 50, 50, {
  restitution: 1,
});

World.add(world, [ground, leftWall, rightWall]);
Render.run(render);
Runner.run(engine);

let currentFuit = null;
let currentFruitInterval = null;
let disableAction = false;
function addCurrentFruit() {
  const fruit = Bodies.circle(300, 50, 20, {
    isSleeping: true,
    render: {
      fillStyle: "black",
    },
    restitution: 1,
  });
  currentFuit = fruit;
  World.add(world, fruit);
}
window.onkeydown = (event) => {
  switch (event.code) {
    case "ArrowLeft":
      if (currentFruitInterval) return;
      currentFruitInterval = setInterval(() => {
        if (currentFuit.position.x - 20 < 30)
          Body.setPosition(currentFuit, {
            x: currentFuit.position.x - 1,
            y: currentFuit.position.y,
          });
      }, 5);
      break;
    case "ArrowRight":
      if (currentFruitInterval) return;
      currentFruitInterval = setInterval(() => {
        if (currentFuit.position.x + 20 < 590)
          Body.setPosition(currentFuit, {
            x: currentFuit.position.x + 1,
            y: currentFuit.position.y,
          });
      }, 5);
      break;
    case "Space":
      if(disableAction) return;
      disableAction = true;
      Sleeping.set(currentFuit, false);
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
      clearInterval(currentFruitInterval);
      currentFruitInterval = null;
  }
};
addCurrentFruit();
