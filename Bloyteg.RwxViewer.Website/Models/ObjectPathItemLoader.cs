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

using System.Threading.Tasks;

namespace Bloyteg.RwxViewer.Website.Models
{
    public class ObjectPathItemLoader : IObjectPathItemLoader
    {
        private readonly ModelLoader _modelLoader = new ModelLoader();
        private readonly TextureLoader _textureLoader = new TextureLoader();

        public async Task<MrByte.RWX.Model.Model> GetModelAsync(int worldId, string modelName)
        {
            return await _modelLoader.GetAsync(worldId, modelName);
        }

        public async Task<byte[]> GetTextureAsync(int worldId, string textureName)
        {
            return await _textureLoader.GetTextureAsync(worldId, textureName);
        }
    }
}