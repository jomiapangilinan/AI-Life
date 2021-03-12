/**
 * DESCRIPTION: This is a depiction of Mia's brain el oh el.
 * Or a deployment of minimal artificial life simulation. What gives.
 * 
 * Graphic 2D rendering (HTML5 Canvas) features that may be included:
 * 
 * a. Events
 *  function update(dt) - simulation updates
 *  function draw(ctx) - defines how the canvas renders
 *  function reset() - simulation restarts
 * 
 *  // additional callbacks
 *  function mouse(event, point, id){
 * 
 *      // event == "down" if touch began
 *      // event == "up" if touch ended
 *      // event == "move" if touch was dragged/moved
 *      // point - array of 2 coords [0,0] to [1,1]
 *      // id - identifies which button was pressed
 * 
 *      console.log(event, point, id);
 *  }
 * 
 *  function key(event, key) {
 *  
 *      // event == "down" if key is pressed
 *      // event == "up" if key is released
 *      // key - string of character pressed i.e. "a", "2", "=" or "Alt", "Backspace" etc
 *      console.log(event, key);
 * 
 *  }
 * 
 * b. Globals
 *  now - global variable, counter of seconds since script began
 *  random() - 0 and 1
 *  wrap() - Euclidean modulo or remainder after division, always positive
 *  shuffle(arr) - re-orders array 'arr' randomly, modifies in-place, and returns it
 * 
 * c. 2D Drawing
 *  draw2D - namespace used:
 *      1. draw2D.circle([center_x, center_y], diameter_x, diameter_y) 
 *          or varies where default center is 0,0 and default diameter is 1
 *      2. draw2D.rect
 *      3. draw2D.triangle
 *      4. draw2D.line([x1,y1], [x2,y2], thickness)
 *          where thickness is empty if = 1
 *          or otherwise: draw2D.lines([list of at least 2 [x,y] points], thickness=1)
 *      5. draw2D.shape([list of at least 3 [x,y] points])
 *          for arbitrary shapes
 * 
 *      6. draw2D.text(message, [x,y], size)
 *      7. draw2D.text(message, [x,y]) // size=0.02
 *      8. draw2D.text(message) // draws at [0,0], size=0.02
 * 
 * d. Colors
 *  
 *  can be ctx.fillStyle or
 *      1. draw2D.color("red")
 *      2. draw2D.color("#ff3399")
 *      3. draw2D.color(1, 1, 1, 0.5) // rgb+alpha
 *      4. draw2D.color(1, 1, 1) // rgb
 *      5. draw2D.color(1, 0.5) // greyscale+alpha
 *      6. draw2D.color(0.5);  // greyscale
 *      
 *      7. draw2D.hsl(0, 0.5, 0.5, 0.5) // hue, saturation, luma, alpha
 *      8. draw2D.hsl(0, 0.5, 0.5) // hue, saturation, luma
 *      9. draw2D.hsl(0, 0.5) // hue, alpha
 *      10. draw2D.hsl(0.5);  // hue
 * 
 * e. Transformations in coord spaces 
 *      draw2D.push();
 *          draw2D.translate(x,y);
 *          draw2D.rotate(angle_in_radians);
 *          draw2D.scale(sizex, sizey);
 * 
 *      draw2D.pop();
 * 
 * f. Images
 *      field.loadImage("<link>");
 *          automatically resized to fit the field, transparent PNGs supported
 *      
 *      // can add callback 
 *          field.loadImage("https://upload.wikimedia.org/wikipedia/commons/1/17/ArtificialFictionBrain.png", 
 *              function() {
 *                  write("image is loaded!");
 *                      });
 * 
 * g. 2-Component Vectors
 *      vec2 (x,y)
 *          .create()
 *          .clone()
 *          .random()
 *          .fromPolar(len, angle_in_radians) // or no len if length = 1
 *      
 *      v0.len()
 *          .angle()
 *          .distance(v1)
 *          .anglebetween(v1)
 *          .equals(v1)
 *          .dot(v1)
 *          
 *     //other setters
 *          .set(x,y)
 *          .set(v1)
 *          .len(n)
 *          .limit(n)
 *          .normalize()
 * 
 *          .negate()
 *          .angle(a)
 *          .rotate(a)
 *  
 *          .floor()
 *          .ceil()
 *          .round()
 * 
 * 
 * h. HashSpace 2D
 *     - detects neighbors
 *      let space = new hashspace2D();
 *
 *      space.clear(); // remove all objects from the space
 *
 *      // hashspace2D keeps track of objects that have a position and size
 *      // (with .pos and .size properties)
 *        let obj = {
 *            pos: [0.5, 0.5],
 *            size: 0.1,
 *        };
 *
 *      // add an object to the space:
 *      space.insert(obj);    
 * 
 *      // move an object in the space:
 *      space.update(obj);
 *
 *      // remove an object from the space:
 *      space.remove(obj);
 *
 *      // search for any other objects within 0.1 distance of "obj"
 *      // returns an array
 *      let near = space.search(obj, 0.1);
 *
 *      // search for any other objects within 0.1 distance of the world center
 *      // returns an array
 *      let near = space.search([0.5, 0.5], 0.1);
 * 
 *      vs iterating over all objects & computing the relative distances:
 *    
 *    for (let a of agents) {
 *      for (let n of agents) {
 *          // don't compare with self:
 *          if (a == n) continue;
 *          
 *          // get relative vector to neighbour:
 *          let rel = n.pos.clone().sub(a.pos);
 *          
 *          // to wrap around world boundaries:
 *          rel.relativewrap(1); 
 *          
 *          // turn `rel` into a's directional frame:
 *          rel.rotate(-a.dir);
 * 
 *          // detect overlap:
 *          if (rel.length < (a.size + n.size)) {
 *          // they are overlapping 
 *          }
 *      }
 *    }
 * 
 *  END OF DESCRIPTION
 */



let dim = 400;
let field = new field2D(dim)
let future = new field2D(dim)



function initialize_field(c, r){
  //Simple Fractal

  if(c%7==0){
    return 1;
  }

  
  
}
function update_field(x,y){
  let C = field.get(x, y);
    
    let N = field.get(x, y-1);
    let NE = field.get(x+1, y-1);
    let E = field.get(x+1, y);
    let SE = field.get(x+1, y+1);
    let S = field.get(x, y+1);
    let SW = field.get(x-1, y+1);
    let W = field.get(x-1, y);
    let NW = field.get(x-1, y-1);
    let total = N+NE+E+SE+S+SW+W+NW;
    
  if( C==1){
    if (total < 2){
      return 0;
    } else if (total >3){
      return 0;
    }
  }else if (C == 0){
   if (total == 3){
     return 1;
    }
    
   }
    return C;
  }
  
// global declarations here

// called at start, and whenever Enter key is pressed:
function reset() {
    // (re)initialization here
  field.set(initialize_field);
  
  
}

// called before rendering each frame
// dt is the time in seconds since the last update()
// (the global variable `now` gives the time since start in seconds)
// updates can be 'paused' using the spacebar
function update(dt) {
    // simulation code here
  future.set(update_field)
  
  let temp = field;
  field = future;
  
  future = temp;
}

// called to render graphics
// ctx is  an HTML5 canvas 2D rendering context
// Escape key will toggle fullscreen
function draw(ctx) {
    // rendering code here
  field.draw();
}


// called when any mouse (or touch) events happen
// kind is the event type (down, up, move, etc.)
// pt is a normalized mouse coordinate
// id refers to any button pressed/released
function mouse(kind, pt, id) {
  
    var FieldPos = [Math.round(pt[0]*dim),Math.round(pt[1]*dim)];
  
  
  //Make Glider
  if(kind == 'down'){
  var x = FieldPos[0];
  var y = FieldPos[1];
    console.log("PointSet");
    
    //Glider Gun Preset
    field.set(1,x, y-1); //N
    field.set(0,x+1, y-1); //NE
    field.set(1,x+1, y); //E
    field.set(1,x+1, y+1); //SE
    field.set(1,x, y+1); //S
    field.set(1,x-1, y+1);//SW
    field.set(0,x-1, y);//W
    field.set(0,x-1, y-1);//NW
  }

}

// called when any key events happen
// kind is the event type (down, up, etc.)
// key is the key (or keycode) pressed/released
function key(kind, key) {
  
}