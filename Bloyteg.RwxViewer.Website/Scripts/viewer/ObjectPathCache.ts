module ObjectPath {
    export interface Cache {
        getModel(worldId: number, name: string): JQueryPromise<RwxViewer.Model>;
        getTexture(worldId: number, name: string): JQueryPromise<HTMLImageElement>;
        getAnimation(worldId: number, name: string): JQueryPromise<RwxViewer.ModelAnimation>;

        storeModel(worldId: number, name: string, model: RwxViewer.Model): JQueryPromise<any>;
        storeTexture(worldId: number, name: string, image: HTMLImageElement): JQueryPromise<any>;
        storeAnimation(worldId: number, name: string, animation: RwxViewer.ModelAnimation): JQueryPromise<any>;
    }

    class IndexedDbCache implements Cache {
        private _database: IDBDatabase;

        getModel(worldId: number, name: string): JQueryPromise<RwxViewer.Model> {
            return null;
        }

        getTexture(worldId: number, name: string): JQueryPromise<HTMLImageElement> {
            return null;
        }

        getAnimation(worldId: number, name: string): JQueryPromise<RwxViewer.ModelAnimation> {
            return null;
        }

        storeModel(worldId: number, name: string, model: RwxViewer.Model): JQueryPromise<any> {
            return null;
        }

        storeTexture(worldId: number, name: string, image: HTMLImageElement): JQueryPromise<any> {
            return null;
        }

        storeAnimation(worldId: number, name: string, animation: RwxViewer.ModelAnimation): JQueryPromise<any> {
            return null;
        }
    }
}