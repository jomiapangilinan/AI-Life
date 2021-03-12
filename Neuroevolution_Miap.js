/**
 * 
 * DESCRIPTION: The evolution of nature inspires computational systems - in machine learning, robotics, industrial design, and art.
 * This implementation deploys the use of evolutionary algorithms to simulate the replication of neural networks.
 * 
 * Here the features include:
 * a. genotype - configuration of the neural network (neuron_weights, neuron_biases)
 * b. phenotype - executable neural network dependent on the performance within the problem domain (fitness_function)
 * c. selection fit - determined by the neural network performance within a population
 * 
 * 
 */


function activation_function(x) { 
  //return x > 0 ? 1 : 0   // step
  return 1 / (1 + Math.exp(-x));  // sigmoid
  //return Math.max(0, Math.min(1, x))  // ReLU
}

// per-neuron activation:
// N inputs (a list)
// N+1 weights (including bias)
function neuron_activate(inputs, weights) {
  // output = sigmoid(in1*w1 + in2*w2 + in3*w3 + bias);
  let total = 0;
  for (let i=0; i<inputs.length; i++) {
    total += inputs[i] * weights[i];
  }
  // bias term:
  total += weights[weights.length-1];
  return activation_function(total);
}

// layer is a list of neurons (each being a list of weights)
function layer_activate(inputs, layer) {
  // map
  return layer.map((weights) => neuron_activate(inputs, weights))
}

function network_activate(network, activations) {
  for (let i=0; i<network.length; i++) {
    let inputs = activations[i]
    let layer = network[i]
    activations[i+1] = layer_activate(inputs, layer)
  }
  return activations[activations.length-1]
}

function create_neuron(N, MAX_WEIGHT) {
  let neuron = []
  for (let i=0; i<N+1; i++) {
    neuron[i] = random(MAX_WEIGHT) - random(MAX_WEIGHT)
  }
  return neuron
}

function create_layer(N, MAX_WEIGHT) {
  let layer = []
  for (let i=0; i<N; i++) {
    layer[i] = create_neuron(N, MAX_WEIGHT)
  }
  return layer
}

function create_network(L, N, MAX_WEIGHT) {
  let network = []
  for (let i=0; i<L; i++) {
    network[i] = create_layer(N, MAX_WEIGHT)
  }
  return network
}

function createActivations(L, N) {
  let activations = []
  for (let i=0; i<L+1; i++) {
    let layer = []
    for (let j=0; j<N; j++) {
      layer[j] = 0
    }
    activations[i] = layer
  }
  return activations
}

function drawNetwork(L, N, network, activations) {
  // draw layers as a grid:
  draw2D.push().scale(1/N).translate([0.5, 0.5])
  for (let x=0; x < activations.length; x++) {
    let layer = activations[x]
    for (let y=0; y<N; y++) {      
      let activation = layer[y]
      draw2D.hsl(0, 0.5, activation)
      let size = 0.2
      if (x == 0 || x == L) size = 0.4
      draw2D.circle([x,y], size)
      if (x > 0) {
        for (let i=0; i<N; i++) {
          let w = network[x-1][y][i] * activation
          draw2D.color(w)
          draw2D.line([x-1,i], [x,y])
        }
      }
    }
  }
  draw2D.pop()
}

//----------------------------------------------------//

let pop = []
let pop_size = 30
let MAXSPEED = 0.3

let active_players = 0
let frames = 0
let generations = 0
let MAX_FRAMES = 500

let N = 4
let L = 3
let MAX_WEIGHT = 10

function createPlayer() {
  let a = {
    // physical properties:
    // location in space
    head: new vec2(random(), random()),
    tail: new vec2(),
    size: 1/50,
    age: 0,
    // movement:
    vel: vec2.random(),
    // senses and motor actions:
    inputs: [0, 0, 0],
    outputs: [0, 0, 0],
    // neural network weights & biases:
    network: create_network(L, N, MAX_WEIGHT),
    // internal neuron states:
    activations: createActivations(L, N),
    // game state:
    points: 0,
    playing: true,
    // used to visualize the senses:
    rel: [0, 0],
    // used to visualize family inheritance:
    hue: random(),
  }
  return a
}

// if pop is not empty,
// we'll try to inherit from it:
function reset() {
  generations++;
  let newpop = []
  for (let i=0; i<pop_size; i++) {
    let a = createPlayer();
    // if we had a previous population:
    if (pop.length > 0) {
      let parent = pop[random(i)]
      
      
      // inheritance:
      a.hue = parent.hue;   
      // lazy deep copy:
      a.network = JSON.parse(JSON.stringify(parent.network));
      
      // variation:
      for (let j=0; j<i; j++) {
        a.network[random(L)][random(N)][random(N+1)] += random(5)-2;
      }
      a.hue += (random()-0.5)*0.1
    }
    newpop.push(a);
  }
  
  // replace old population:
  pop = newpop;
  active_players = pop.length
  frames = 0
}

function update(dt) {
  // count frames since last reset()
  frames++
  
  // count number of active players:
  active_players = 0
  for (let a of pop) {
    if (!a.playing) continue;
    active_players++
    a.age++;
    a.points++;
    
    // THINK:
    // apply neural network between a.inputs and a.outputs
    a.activations[0] = a.inputs
    a.outputs = network_activate(a.network, a.activations)
  
    // MOVEMENT:
    // turn:
    let turn = a.outputs[2] - a.outputs[1]
    a.vel.rotate(turn)
    // move:
    let move = a.vel.clone().mul(a.outputs[0] * MAXSPEED * dt)
    a.head.add(move).wrap(1)
  
    // UPDATE TAIL POSITION:
    a.tail = a.tail.clone().sub(a.head).len(a.size).add(a.head);
  }
  
  // COLLISION CHECK:
  // separate loop so that everyone gets a chance to move first:
  for (let a of pop) {
    if (!a.playing) continue;
    
    for (let n of pop) {
      // don't check self
      // don't check non-active players:
      if (!n.playing || a == n) continue;
      
      // check distance from our head to their tail:
      let rel = a.head.clone().sub(n.tail)
      if (rel.len() < a.size) {
        // we got them!
        n.playing = false;
        a.points += n.age;
      }
    } 
  }
  
  // SENSING:
  for (let a of pop) {
    if (!a.playing) continue;
    
    // find our nearest active player:
    let nearest = null
    let nearest_dist = 2
    for (let n of pop) {
      // don't check self
      // don't check non-active players:
      if (!n.playing || a == n) continue;
      
      // chance of not noticing slow neighbours:
      //if (random() > n.outputs[0]) continue;
      
      // are they the nearest neighbour?
      // get relative vector:
      let rel = n.tail.clone().sub(a.head).relativewrap(1).rotate(-a.vel.angle())
      let dist = rel.len()
      if (dist < nearest_dist) {
        // this one is nearer, use it:
        nearest_dist = dist
        nearest = n
        // store this for visualization purposes
        a.rel = rel
      }
    }
    
    // set sensor inputs:
    let invdist2 = 0.5 / (0.5 + a.rel.len())  // 1 when neighbour is next to me, 0 when very very far away
    let reln = a.rel.clone().len(0.5).add(0.5) // x and y now range from 0..1
    //let angle = Math.cos(a.rel.angle())*0.5+0.5  // 1 when in front
    a.inputs = [
      invdist2, 
      reln[0], // forward component
      reln[1],  // side component
      // memory, by feeding previous output into next frame's input:
      a.outputs[3]
    ]
  }
  
  // RANK PLAYERS:
  pop.sort((a, b) => b.points - a.points)
  
  // PRINT THEM OUT:
  write("Generation:", generations, "Players:", active_players, "Frames:", frames)
  // for (let a of pop) {
  //   write(a.points, a.hue, a.network) 
  // }
  
  // END OF GAME:
  if (active_players < 2 || frames > MAX_FRAMES) {
    // create a new generation:
    reset(pop)
  }
}

function draw() {
  // best candidate:
  let best = pop.filter(a => a.playing)[0]
  
  drawNetwork(L, N, best.network, best.activations)
  draw2D.color(0, 0.8)
  draw2D.rect([0.5, 0.5])
  
  for (let a of pop) {    
    if (!a.playing) continue;
    
    // spotlight best candidate:
    if (a == best) {
      draw2D.color(1, 0.8)
      draw2D.circle(a.head, a.size*2)
    }
    
    // draw line from head to nearest sensed player:
    draw2D.push().translate(a.head).rotate(a.vel)
    draw2D.color(1, 0.2)
    draw2D.line(a.rel)
    draw2D.pop()
    
    // draw head:
    draw2D.push().translate(a.head).rotate(a.vel).scale(a.size)
    draw2D.hsl(a.hue)
    draw2D.circle()
    draw2D.color(0)
    draw2D.circle([0.2, 0.2], 0.3)
    draw2D.circle([0.2, -0.2], 0.3)
    draw2D.pop()
    
    // draw tail:
    draw2D.push().translate(a.tail).rotate(a.vel).scale(a.size)
    draw2D.color(0.3)
    draw2D.circle()
    // show points in thorax:
    draw2D.color(0.9)
    draw2D.circle(a.points/(pop_size*MAX_FRAMES))
    draw2D.pop()
  } 
}