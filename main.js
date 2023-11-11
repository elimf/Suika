import { Bodies, Engine, Render, Runner, World } from "matter-js";

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

function addCurrentFruit() {
  const fruit = Bodies.circle(300, 50, 20, {
    isSleeping: true,
    render: {
      fillStyle: "black",
    },
    restitution: 1,
  });
  World.add(world, fruit);
}

addCurrentFruit();