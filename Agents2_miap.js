/** Agents II implements multi-agent systems 
 *  This project deploys a population of agents vs single one
 * 
 * The features often included in a population of agents are:
 * a. Properties (location, mobility, external and internal features)
 * b. Affects (egocentric or allocentric)
 * c. Effects 
 * d. Processing (decision making, action selection)
 * e. Higher-level individuation/agency
 * 
 * Other features:
 * a. Environment (other agents, interactions, spatial dynamics i.e. death note = addition/removal, diffusion, limiting, stochastics, et al)
 * b. Initial conditions & limiting conditions
 */

let agents = [];
let sugar = new field2D(64);
let sugar_past = sugar.clone();

let centre = new vec2(0.5, 0.5);

let daddy = {
  pos: centre.clone()
};

function mountain(c, r) {
  let p = new vec2(c / sugar.width, r / sugar.height);
  let d = p.distance(centre);
  return 1 - d;
}

function cloudy(c, r) {
  return random();
}

// called at start, and whenever Enter key is pressed:
function reset() {
  //sugar.set(mountain)
  sugar.set(cloudy);
  //sugar.set(0.5)
  sugar.diffuse(sugar.clone(), sugar.width, 50);
  sugar.normalize();

  agents.length = 0;
  for (let i = 0; i < 10; i++) {
    agents.push({
      pos: new vec2(random(), random()),
      vel: new vec2().random(0.2),
      size: 1 / 30,
      sense: 0,
      memory: 0
    });
  }
}

function update(dt) {
  // add some sugar at the source:
  sugar.deposit(1, daddy.pos);
  // random walk the sugar source:
  daddy.pos.add(new vec2().random(0.01)).wrap(1);
  // decay over time:
  sugar.scale(0.997);
  // diffuse:
  let tmp = sugar_past;
  sugar_past = sugar;
  //sugar.add(0.002)
  sugar.diffuse(tmp, 0.003);
  sugar.map(function (v, c, r) {
    //v += 0.01*(random()-0.5)
    return Math.max(Math.min(v, 2), 0);
  });

  // -- iterate over population: --

  // for (let i=0; i<agents.length; i++) { let agent = agents[i]; .... }
  // for (let i in agents) { let agent = agents[i]; ...}
  // agents.forEach(agent => { .. })
  for (let agent of agents) {
    // get my antannae locations:
    let antennae = [
      new vec2(0.5, 0.5)
        .mul(agent.size)
        .rotate(agent.vel.angle())
        .add(agent.pos),
      
      new vec2(0.5, -0.5)
        .mul(agent.size)
        .rotate(agent.vel.angle())
        .add(agent.pos)
    ];
    // sample field at these locations:
    agent.senses = [
      sugar.sample(antennae[0]), 
      sugar.sample(antennae[1])
    ];
    // use intensity and gradient to drive my movement:
    let diff = agent.senses[0] - agent.senses[1];
    let sum = agent.senses[0] + agent.senses[1];
    agent.vel.rotate(diff).len((2 - sum) * 0.1);

    agent.pos.add(agent.vel.clone().mul(dt));
    agent.pos.wrap(1);
  }
}

// -- creation or insertion of agents --
function draw(ctx) {
  sugar.smooth = true;
  sugar.draw();

  for (let agent of agents) {
    draw2D
      .push()
      .translate(agent.pos)
      .rotate(agent.vel.angle())
      .scale(agent.size);
    {
      draw2D.circle();
      draw2D.hsl(agent.sense);
      draw2D.circle([0.3, +0.3], agent.senses[0] * 0.4);
      draw2D.circle([0.3, -0.3], agent.senses[1] * 0.4);
    }
    draw2D.pop();
  }
}

function mouse(kind, pt, id) {
  // add one unit of sugar at the location of the mouse:
  daddy.pos.set(pt[0], pt[1]);
}
