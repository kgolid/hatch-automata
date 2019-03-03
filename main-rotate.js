import * as dat from "dat.gui";
import generate from "isometric-automata";
import * as tome from "chromotome";

let sketch = function(p) {
  const print = false;

  const grid_size = print ? 700 : 500;
  const w = print ? 2100 : 1200;
  const h = print ? 2970 : 1200;

  let gui;
  let options;

  p.setup = function() {
    p.createCanvas(w, h);

    const seeds = get_seeds();

    options = {
      resolution: 14,
      h_seed_str: seeds[0],
      v_seed_str: seeds[1],
      d_seed_str: seeds[2],
      random_init: false,
      colorize: true,
      stroke: false,
      palette: tome.getRandom().name,
      symmetry: "rotate",
      combination: "simple",
      color_shift: true,
      partitions: "sixths",
      randomize: () => randomize()
    };

    gui = new dat.GUI();

    let f0 = gui.addFolder("Layout");
    f0.add(options, "resolution", 4, 100, 2)
      .name("Resolution")
      .onChange(run);
    f0.add(options, "colorize")
      .name("Toggle color")
      .onChange(run);
    f0.add(options, "stroke")
      .name("Toggle stroke")
      .onChange(run);
    f0.add(options, "palette", tome.getNames())
      .name("Color palette")
      .onChange(run);
    f0.add(options, "combination", ["simple", "strict", "regular"])
      .name("Color combination")
      .onChange(run);
    f0.add(options, "symmetry", ["rotate", "reflect"])
      .name("Symmetry type")
      .onChange(run);
    f0.add(options, "color_shift")
      .name("Color shift")
      .onChange(run);
    f0.add(options, "partitions", ["sixths", "thirds"])
      .name("Partitions")
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
    const bg = tome.get(options.palette).background;
    const strokeCol = tome.get(options.palette).stroke;

    p.push();
    p.translate(p.width / 2, p.height / 2);
    p.background(bg ? bg : "#d5cda1");
    if (options.colorize) {
      if (options.symmetry === "rotate") fill_hex(grid);
      else {
        fill_hex(grid);
        p.scale(1, -1);
        fill_hex(grid);
        p.scale(1, -1);
      }
    }
    if (options.stroke) {
      p.noFill();
      p.stroke(strokeCol ? strokeCol : "#3f273a");
      p.strokeWeight(options.strokeWidth);
      if (options.symmetry === "rotate") stroke_hex(grid);
      else {
        stroke_hex(grid);
        p.scale(1, -1);
        stroke_hex(grid);
        p.scale(1, -1);
      }

      draw_frame();
    }

    p.pop();

    if (!print) print_seed();
  }

  function setup_grid() {
    return generate({
      seeds: { h: options.h_seed_str, v: options.v_seed_str, d: options.d_seed_str },
      dim: { x: options.resolution, y: options.resolution },
      random_init: options.random_init,
      combo: options.combination,
      palette_size: 4,
      offset: 4
    });
  }

  function fill_hex(grid) {
    const n = options.partitions === "sixths" ? 6 : 3;
    for (var i = 0; i < n; i++) {
      fill_grid(grid);
      p.rotate((2 * p.PI) / n);
    }
  }

  function stroke_hex(grid) {
    const n = options.partitions === "sixths" ? 6 : 3;
    for (var i = 0; i < n; i++) {
      stroke_grid(grid);
      p.rotate((2 * p.PI) / n);
    }
  }

  function stroke_grid(grid) {
    const cell_size = grid_size / options.resolution;
    const sw_dir = [p.cos((2 * p.PI) / 3), p.sin((2 * p.PI) / 3)];
    const se_dir = [p.cos(p.PI / 3), p.sin(p.PI / 3)];
    const narrow = options.partitions === "sixths";
    const rotating = options.symmetry === "rotate";

    p.push();
    p.translate(-0.5, sw_dir[1] * -0.5);
    for (let i = 0; i < grid.length; i++) {
      let max = 0;
      if (rotating) max = narrow ? i : grid[i].length - 1;
      else max = narrow ? i / 2 : i;

      for (let j = 0; j <= max; j++) {
        p.push();
        p.translate(sw_dir[0] * i * cell_size, sw_dir[1] * i * cell_size);
        p.translate(j * cell_size, 0);
        let g = grid[i][j];
        if (g.h && (j < max || (!narrow && rotating))) p.line(0, 0, cell_size, 0);
        if (g.v) p.line(0, 0, sw_dir[0] * cell_size, sw_dir[1] * cell_size);
        if (g.d && (j < max || !narrow)) p.line(0, 0, se_dir[0] * cell_size, se_dir[1] * cell_size);
        p.pop();
      }
    }
    p.pop();
  }

  function fill_grid(grid) {
    const cell_size = grid_size / options.resolution;
    const sw_dir = [p.cos((2 * p.PI) / 3), p.sin((2 * p.PI) / 3)];
    const se_dir = [p.cos(p.PI / 3), p.sin(p.PI / 3)];
    const cols = tome.get(options.palette).colors;
    const narrow = options.partitions === "sixths";
    const rotating = options.symmetry === "rotate";

    p.push();
    p.noStroke();
    for (let i = 0; i < grid.length; i++) {
      let max = 0;
      if (rotating) max = narrow ? i : grid[i].length - 1;
      else max = narrow ? i / 2 : i;

      for (let j = 0; j <= max; j++) {
        p.push();
        p.translate(sw_dir[0] * i * cell_size, sw_dir[1] * i * cell_size);
        p.translate(j * cell_size, 0);
        let g = grid[i][j];

        if (j < max || (!narrow && rotating)) {
          p.fill(cols[g.tc]);
          p.beginShape();
          p.vertex(0, 0);
          p.vertex(cell_size, 0);
          p.vertex(se_dir[0] * cell_size, se_dir[1] * cell_size);
          p.vertex(sw_dir[0] * cell_size, sw_dir[1] * cell_size);
          p.endShape();
        }

        p.fill(cols[g.lc]);
        p.beginShape();
        p.vertex(0, -0.5);
        p.vertex(se_dir[0] * cell_size + 0.5, se_dir[1] * cell_size + 0.5);
        p.vertex(sw_dir[0] * cell_size - 0.5, sw_dir[1] * cell_size + 0.5);
        p.endShape();

        p.pop();
      }
    }
    p.pop();

    if (options.color_shift) {
      let c = cols.shift();
      cols.splice(2, 0, c);
    }
  }

  function draw_frame() {
    const sw_dir = [p.cos((2 * p.PI) / 3), p.sin((2 * p.PI) / 3)];
    const se_dir = [p.cos(p.PI / 3), p.sin(p.PI / 3)];

    p.translate(se_dir[0] * -grid_size, se_dir[1] * -grid_size);
    p.beginShape();
    p.vertex(0, 0);
    p.vertex(grid_size, 0);
    p.vertex(grid_size + se_dir[0] * grid_size, se_dir[1] * grid_size);
    p.vertex(grid_size, se_dir[1] * grid_size * 2);
    p.vertex(0, se_dir[1] * grid_size * 2);
    p.vertex(sw_dir[0] * grid_size, sw_dir[1] * grid_size);
    p.endShape(p.CLOSE);
  }

  function print_seed() {
    let seed = options.h_seed_str + "-" + options.v_seed_str + "-" + options.d_seed_str;
    p.textSize(12);
    p.textAlign(p.RIGHT);
    p.text(seed, 840, 1055);
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
