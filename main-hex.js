import * as dat from "dat.gui";

let sketch = function(p) {
  let THE_SEED;
  let grid;

  const sw_dir = [p.cos((2 * p.PI) / 3), p.sin((2 * p.PI) / 3)];
  const se_dir = [p.cos(p.PI / 3), p.sin(p.PI / 3)];

  const grid_size = 1000;
  let cell_size;

  let options;
  let gui;
  let h_seed, v_seed, d_seed;

  const cols = ["#ec6c26", "#613a53", "#e8ac52", "#639aa0"];

  p.setup = function() {
    p.createCanvas(1200, 1000);
    THE_SEED = p.floor(p.random(9999999));
    p.randomSeed(THE_SEED);
    p.frameRate(1);

    const seeds = get_seeds();

    options = {
      resolution: 40,
      h_seed_str: seeds[0],
      v_seed_str: seeds[1],
      d_seed_str: seeds[2],
      random_init: false,
      colorize: true,
      stroke: true,
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
    if (p.keyCode === 80) p.saveCanvas("sketch_" + THE_SEED, "jpeg");
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
    setup_grid();
    draw_grid();
  }

  function setup_grid() {
    h_seed = binaryArray(8, options.h_seed_str);
    v_seed = binaryArray(8, options.v_seed_str);
    d_seed = binaryArray(8, options.d_seed_str);
    cell_size = grid_size / options.resolution;

    grid = [];
    for (let i = 0; i < options.resolution + 1; i++) {
      let row = [];
      for (let j = 0; j < options.resolution + 1; j++) {
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
    grid = grid.slice(1).map(r => r.slice(1));
  }

  function draw_grid() {
    p.push();
    p.background("#d5cda1");
    p.translate(350, 70);
    if (options.colorize) {
      p.noStroke();
      for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
          if (-grid[i].length / 2 + i <= j && grid[i].length / 2 + i >= j) {
            p.push();
            let g = grid[i][j];
            p.translate(sw_dir[0] * i * cell_size, sw_dir[1] * i * cell_size);
            p.translate(j * cell_size, 0);

            if (grid[i].length / 2 + i !== j) {
              if (-grid[i].length / 2 + i !== j) {
                p.fill(cols[g.tc]);
                p.beginShape();
                p.vertex(0, 0);
                p.vertex(cell_size, 0);
                p.vertex(se_dir[0] * cell_size, se_dir[1] * cell_size);
                p.vertex(sw_dir[0] * cell_size, sw_dir[1] * cell_size);
                p.endShape();
              } else {
                p.fill(cols[g.tc]);
                p.beginShape();
                p.vertex(0, 0);
                p.vertex(cell_size, 0);
                p.vertex(se_dir[0] * cell_size, se_dir[1] * cell_size);
                p.endShape();
              }
            }

            if (-grid[i].length / 2 + i !== j) {
              p.fill(cols[g.lc]);
              p.beginShape();
              p.vertex(0, -0.5);
              p.vertex(se_dir[0] * cell_size + 0.5, se_dir[1] * cell_size + 0.5);
              p.vertex(sw_dir[0] * cell_size - 0.5, sw_dir[1] * cell_size + 0.5);
              p.endShape();
            }

            p.pop();
          }
        }
      }
    }

    if (options.stroke) {
      p.stroke("#3f273a");
      p.strokeWeight(1);
      p.noFill();
      p.translate(-0.5, sw_dir[1] * -0.5);
      for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
          if (-grid[i].length / 2 + i <= j && grid[i].length / 2 + i >= j) {
            p.push();
            p.translate(sw_dir[0] * i * cell_size, sw_dir[1] * i * cell_size);
            p.translate(j * cell_size, 0);
            let g = grid[i][j];
            if (grid[i].length / 2 + i !== j) {
              if (g.h) p.line(0, 0, cell_size, 0);
            }
            if (-grid[i].length / 2 + i !== j) {
              if (g.v) p.line(0, 0, sw_dir[0] * cell_size, sw_dir[1] * cell_size);
            }
            if (g.d) p.line(0, 0, se_dir[0] * cell_size, se_dir[1] * cell_size);
            p.pop();
          }
        }
      }
      p.translate(0.5, p.sin((2 * p.PI) / 3) * 0.5);
      p.beginShape();
      p.vertex(0, 0);
      p.vertex(grid_size / 2, 0);
      p.vertex(grid_size / 2 + (se_dir[0] * grid_size) / 2, (se_dir[1] * grid_size) / 2);
      p.vertex(grid_size / 2, se_dir[1] * grid_size);
      p.vertex(0, se_dir[1] * grid_size);
      p.vertex((sw_dir[0] * grid_size) / 2, (sw_dir[1] * grid_size) / 2);
      p.endShape(p.CLOSE);
    }

    p.pop();
    print_seed();
  }

  function print_seed() {
    let seed = options.h_seed_str + "-" + options.v_seed_str + "-" + options.d_seed_str;
    p.textSize(12);
    p.textAlign(p.RIGHT);
    p.text(seed, 840, 955);
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
