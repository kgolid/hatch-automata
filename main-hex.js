import * as dat from "dat.gui";
import generate from "isometric-automata";

let sketch = function(p) {
  const grid_size = 1000;

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
    const sw_dir = [p.cos((2 * p.PI) / 3), p.sin((2 * p.PI) / 3)];
    const se_dir = [p.cos(p.PI / 3), p.sin(p.PI / 3)];

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

  function randomInt(max) {
    return Math.floor(Math.random() * max);
  }
};
new p5(sketch);
