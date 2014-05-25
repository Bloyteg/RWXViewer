import $ = require("jquery");
import Renderer = require("./viewer/Renderer");
import ModelLoader = require('./viewer/ModelLoader');

var renderer: Renderer.Renderer;

$(() => {
    renderer = new Renderer.Renderer(<HTMLCanvasElement>$('#viewport')[0]);

    ModelLoader.loadModel("test.rwx", model => {
        renderer.setCurrentModel(model);
    });

    (function tick() {
        renderer.draw();

        window.requestAnimationFrame(tick);
    })();
});