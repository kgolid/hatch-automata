import * as dat from "dat.gui";
import generate from "isometric-automata";

let sketch = function(p) {
  const grid_size = 800;

  let gui;
  let options;

  const cols = ["#ec6c26", "#613a53", "#e8ac52", "#639aa0"];

  p.setup = function() {
    p.createCanvas(1200, 1000);

    const seeds = get_seeds();

    options = {
      resolution: 40,
      h_seed_str: seeds[0],
      v_seed_str: seeds[1],
      d_seed_str: seeds[2],
      random_init: false,
      colorize: true,
      stroke: true,
      combination: "simple",
      randomize: () => randomize()
    };

    gui = new dat.GUI();

    let f0 = gui.addFolder("Layout");
    f0.add(options, "resolution", 10, 100, 2)
      .name("Resolution")
      .onChange(run);
    f0.add(options, "colorize")
      .name("Toggle color")
      .onChange(run);
    f0.add(options, "stroke")
      .name("Toggle stroke")
      .onChange(run);
    f0.add(options, "combination", ["simple", "strict", "regular"])
      .name("Color combination")
      .onChange(run);
    let f1 = gui.addFolder("Seeds");
    f1.add(options, "h_seed_str")
      .name("H seed")
      .onChange(run);
    f1.add(options, "v_seed_str")
      .name("V seed")
      .onChange(run);
    f1.add(options, "d_seed_str")
      .name("D seed")
      .onChange(run);
    f1.add(options, "randomize").name("Randomize");
    f1.open();
    let f2 = gui.addFolder("Random elements");
    f2.add(options, "random_init")
      .name("Random init vals")
      .onChange(run);

    run();
  };

  p.keyPressed = function() {
    if (p.keyCode === 80)
      p.saveCanvas(
        "sketch_" + options.h_seed_str + "_" + options.v_seed_str + "_" + options.d_seed_str,
        "jpeg"
      );
  };

  function randomize() {
    options.h_seed_str = randomInt(Math.pow(2, 8));
    options.v_seed_str = randomInt(Math.pow(2, 8));
    options.d_seed_str = randomInt(Math.pow(2, 8));
    gui.updateDisplay();
    run();
  }

  function run() {
    update_url();

    const grid = setup_grid();
    draw_grid(grid);
  }

  function setup_grid() {
    return generate({
      seeds: { h: options.h_seed_str, v: options.v_seed_str, d: options.d_seed_str },
      dim: { x: options.resolution, y: options.resolution },
      random_init: options.random_init,
      combo: options.combination
    });
  }
  function draw_grid(grid) {
    const cell_size = grid_size / options.resolution;
    p.push();
    p.background("#d5cda1");
    p.translate(100, 100);
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        p.push();
        p.translate(j * cell_size, i * cell_size);
        let g = grid[i][j];

        p.fill(cols[g.tc]);
        p.noStroke();
        p.beginShape();
        p.vertex(0, 0);
        p.vertex(cell_size, 0);
        p.vertex(cell_size, cell_size);
        p.vertex(0, cell_size);
        p.endShape();

        p.fill(cols[g.lc]);
        p.noStroke();
        p.beginShape();
        p.vertex(0, 0);
        p.vertex(0, cell_size);
        p.vertex(cell_size, cell_size);
        p.endShape();

        p.pop();
      }
    }

    p.stroke("#3f273a");
    p.noFill();
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        p.push();
        p.translate(j * cell_size, i * cell_size);
        let g = grid[i][j];

        if (g.h) p.line(0, 0, cell_size, 0);
        if (g.v) p.line(0, 0, 0, cell_size);
        if (g.d) p.line(0, 0, cell_size, cell_size);
        p.pop();
      }
    }
    p.rect(0, 0, grid_size, grid_size);

    p.pop();
    print_seed();
  }

  function print_seed() {
    let seed = options.h_seed_string + "-" + options.v_seed_string + "-" + options.d_seed_string;
    p.textAlign(p.RIGHT);
    p.text(seed, grid_size + 100, grid_size + 100 + 20);
  }

  function get_seeds() {
    const url = window.location.href.split("#");
    if (url.length === 1) return [1, 2, 3].map(_ => randomInt(Math.pow(2, 8)));
    return url[1].split(":").map(x => +x);
  }

  function update_url() {
    window.history.pushState(
      null,
      null,
      "#" + options.h_seed_str + ":" + options.v_seed_str + ":" + options.d_seed_str
    );
  }

  function randomInt(max) {
    return Math.floor(Math.random() * max);
  }
};
new p5(sketch);
