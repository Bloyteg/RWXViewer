define(["require", "exports", "jquery", "./viewer/Renderer", './viewer/ModelLoader'], function(require, exports, $, Renderer, ModelLoader) {
    var renderer;

    $(function () {
        renderer = new Renderer.Renderer($('#viewport')[0]);
        renderer.draw();

        ModelLoader.loadModel("test.rwx", function (model) {
            renderer.setCurrentModel(model);
        });
    });
});
//# sourceMappingURL=RWXViewer.js.map
