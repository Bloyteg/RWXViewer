// Copyright 2014 Joshua R. Rodgers
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//    http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

module ObjectPathItemLoader {
    export interface IObjectPathWorld {
        worldId: number;
        name: string;
    }

    export interface IObjectPathModel {
        worldId: number;
        name: string;
        fileName: string;
        type: number;
    }

    export interface IObjectPathAnimation {
        worldId: number;
        name: string;
        fileName: string;
    }

    export function loadModel(worldId: number, modelName: string) {
        var deferred = $.Deferred<RwxViewer.Model>();

        $.getJSON("/api/ObjectPath/Worlds/" + worldId + "/Models/" + modelName)
            .done(data => deferred.resolve(data))
            .fail(() => deferred.reject());

        return deferred.promise();
    }

    export function loadAnimation(worldId: number, animationName: string) {
        var deferred = $.Deferred<RwxViewer.ModelAnimation>();

        $.getJSON("/api/ObjectPath/Worlds/" + worldId + "/Animations/" + animationName)
            .done(data => deferred.resolve(data))
            .fail(() => deferred.reject());

        return deferred.promise();  
    }


    function loadTexture(worldId: number, textureName: string) {
        var deferred = $.Deferred<{ image: HTMLImageElement; textureName: string }>();

        var image = new Image();
        image.onload = () => {
            deferred.resolve({ image: image, textureName: textureName });
        };

        image.onerror = () => { deferred.reject(); };

        image.src = "/api/ObjectPath/Worlds/" + worldId + "/Textures/" + textureName;

        return deferred.promise();
    }

    export function loadTextures(worldId: number, materials: RwxViewer.Material[]): JQueryPromise<HTMLImageElement[]> {
        var deferred = $.Deferred();

        var images = materials.map(material => material.Texture)
            .concat(materials.map(material => material.Mask))
            .filter((textureName, index, self) => textureName !== null && self.indexOf(textureName) == index)
            .map(textureName => loadTexture(worldId, textureName));

        $.when.apply($, images).done(() => {
            var textures = {};
            var length = arguments.length;

            for (var index = 0; index < length; ++index) {
                var item = arguments[index];
                textures[item.textureName] = item.image;
            }

            deferred.resolve(textures);
        }).fail(() => deferred.reject());

        return deferred.promise();
    }

    export function getWorlds() {
        var deferred = $.Deferred<IObjectPathWorld>();

        $.getJSON("/api/ObjectPath/Worlds")
            .done(data => deferred.resolve(data))
            .fail(() => deferred.reject());

        return deferred.promise();
    }

    export function getModels(worldId: number) {
        var deferred = $.Deferred<IObjectPathModel>();

        $.getJSON("/api/ObjectPath/Worlds/" + worldId + "/Models")
            .done(data => deferred.resolve(data))
            .fail(() => deferred.reject());

        return deferred.promise();
    }

    export function getAnimations(worldId: number) {
        var deferred = $.Deferred<IObjectPathModel>();

        $.getJSON("/api/ObjectPath/Worlds/" + worldId + "/Animations")
            .done(data => deferred.resolve(data))
            .fail(() => deferred.reject());

        return deferred.promise();       
    }
}
