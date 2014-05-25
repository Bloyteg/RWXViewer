define(["require", "exports", "jquery", "./viewer/Renderer", './viewer/ModelLoader'], function(require, exports, $, Renderer, ModelLoader) {
    var renderer;

    $(function () {
        renderer = new Renderer.Renderer($('#viewport')[0]);

        ModelLoader.loadModel("test.rwx", function (model) {
            renderer.setCurrentModel(model);
        });

        (function tick() {
            renderer.draw();

            window.requestAnimationFrame(tick);
        })();
    });
});
//# sourceMappingURL=RWXViewer.js.map
