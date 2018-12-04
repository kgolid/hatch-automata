import * as dat from "dat.gui";

let sketch = function(p) {
  let THE_SEED;
  let grid;

  let grid_size = 800;
  let cell_size;

  let options;
  let gui;
  let h_seed, v_seed, d_seed;

  const cols = ["#ec6c26", "#613a53", "#e8ac52", "#639aa0"];

  p.setup = function() {
    p.createCanvas(1000, 1000);
    THE_SEED = p.floor(p.random(9999999));
    p.randomSeed(THE_SEED);
    p.frameRate(1);

    options = {
      resolution: 40,
      h_seed_string: randomInt(Math.pow(2, 8)),
      v_seed_string: randomInt(Math.pow(2, 8)),
      d_seed_string: randomInt(Math.pow(2, 8)),
      random_init: false,
      randomize: () => {}
    };

    gui = new dat.GUI();

    let f0 = gui.addFolder("Dimensions");
    f0.add(options, "resolution", 10, 100, 2).onChange(run);
    let f1 = gui.addFolder("Seeds");
    f1.add(options, "h_seed_string").onChange(run);
    f1.add(options, "v_seed_string").onChange(run);
    f1.add(options, "d_seed_string").onChange(run);
    f1.add(options, "randomize").onChange(randomize);
    let f2 = gui.addFolder("Random elements");
    f2.add(options, "random_init").onChange(run);
    run();
  };

  p.keyPressed = function() {
    if (p.keyCode === 80) p.saveCanvas("sketch_" + THE_SEED, "jpeg");
  };

  function randomize() {
    options.h_seed_string = randomInt(Math.pow(2, 8));
    options.v_seed_string = randomInt(Math.pow(2, 8));
    options.d_seed_string = randomInt(Math.pow(2, 8));
    gui.updateDisplay();
    run();
  }

  function run() {
    setup_grid();
    draw_grid();
  }

  function setup_grid() {
    h_seed = binaryArray(8, options.h_seed_string);
    v_seed = binaryArray(8, options.v_seed_string);
    d_seed = binaryArray(8, options.d_seed_string);
    cell_size = grid_size / options.resolution;

    grid = [];
    for (let i = 0; i < options.resolution; i++) {
      let row = [];
      for (let j = 0; j < options.resolution; j++) {
        let px = { h: false, v: false, d: false };
        if (i == 0) px.h = true;
        if (j == 0) px.v = true;
        if (options.random_init && (i == 0 || j == 0)) px = { h: flip(), v: flip(), d: flip() };
        row.push(px);
      }
      grid.push(row);
    }

    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        const px = grid[i][j];
        if (i > 0 && j > 0) {
          px.h = resolve(grid[i][j - 1].h, grid[i - 1][j].v, grid[i - 1][j - 1].d, h_seed);
          px.v = resolve(grid[i][j - 1].h, grid[i - 1][j].v, grid[i - 1][j - 1].d, v_seed);
          px.d = resolve(grid[i][j - 1].h, grid[i - 1][j].v, grid[i - 1][j - 1].d, d_seed);
        }
        colorize(j, i);
      }
    }
  }

  function draw_grid() {
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

  function resolve(b1, b2, b3, seed) {
    const i = (b1 ? 4 : 0) + (b2 ? 2 : 0) + (b3 ? 1 : 0);
    return seed[i];
  }

  function binaryArray(num, seed) {
    return seed
      .toString(2)
      .padStart(num, "0")
      .split("")
      .map(x => !!+x);
  }

  function flip() {
    return Math.random() > 0.5;
  }

  function randomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function colorize(x, y) {
    const cell = grid[y][x];
    const topcol = grid[y - 1] ? grid[y - 1][x].lc : options.random_init ? randomInt(4) : 3;
    const leftcol = grid[y][x - 1] ? grid[y][x - 1].tc : options.random_init ? randomInt(4) : 3;

    if (!cell.h) cell.tc = topcol;
    if (!cell.v) cell.lc = leftcol;
    if (!cell.d) {
      if (cell.h && !cell.v) cell.tc = cell.lc;
      if (!cell.h && cell.v) cell.lc = cell.tc;
      if (cell.h && cell.v) cell.tc = cell.lc = new_col(topcol, leftcol);
    }
    if (cell.d) {
      if (cell.h) cell.tc = new_col(topcol, cell.lc ? cell.lc : null);
      if (cell.v) cell.lc = new_col(leftcol, cell.tc);
    }
  }

  function new_col(a, b) {
    if (b === null) {
      if (a === 0) return 1;
      if (a === 1) return 2;
      if (a === 2) return 3;
      return 0;
    }

    if (a != 0 && b != 0) return 0;
    if (a != 1 && b != 1) return 1;
    if (a != 2 && b != 2) return 2;
    return 3;
  }
};
new p5(sketch);
