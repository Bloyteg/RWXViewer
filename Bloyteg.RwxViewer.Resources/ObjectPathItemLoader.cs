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
using Bloyteg.AW.Animation.Seq;
using MrByte.RWX.Model;


namespace Bloyteg.RwxViewer.Resources
{
    public class ObjectPathItemLoader : IObjectPathItemLoader
    {
        private readonly IResourceLocator<Model> _modelLoader;
        private readonly IResourceLocator<byte[]> _textureLoader;
        private readonly IResourceLocator<Animation> _animationLocator;

        public ObjectPathItemLoader(IResourceLocator<Model> modelLoader, IResourceLocator<byte[]> textureLoader, IResourceLocator<Animation> animationLocator)
        {
            _textureLoader = textureLoader;
            _modelLoader = modelLoader;
            _animationLocator = animationLocator;
        }

        public async Task<Model> GetModelAsync(int worldId, string modelName)
        {
            return await _modelLoader.GetResourceAsync(worldId, modelName);
        }

        public async Task<byte[]> GetTextureAsync(int worldId, string textureName)
        {
            return await _textureLoader.GetResourceAsync(worldId, textureName);
        }

        public async Task<Animation> GetAnimationAsync(int id, string animationName)
        {
            return await _animationLocator.GetResourceAsync(id, animationName);
        }
    }
}