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
using System;
using System.Data.Entity;
using System.Net;
using System.Runtime.Caching;
using System.Threading.Tasks;
using MrByte.RWX;
using MrByte.RWX.Model;

namespace RWXViewer.Models
{
    public class ObjectPathItemLoader : IObjectPathItemLoader
    { 
        public async Task<Model> GetModelAsync(int id)
        {
            var model = LoadFromCache(id);

            if (model != null)
            {
                return model;
            }

            model = await LoadFromObjectPath(id);

            if (model != null)
            {
                AddToCache(id, model);
            }

            return model;
        }

        private static Model LoadFromCache(int id)
        {
            var cache = MemoryCache.Default;
            var key = BuildCacheKey(id);
            var model = cache[key] as Model;
            return model;
        }

        private void AddToCache(int id, Model model)
        {
            var cache = MemoryCache.Default;
            var key = BuildCacheKey(id);
            cache.Add(key, model, DateTimeOffset.Now + TimeSpan.FromHours(24));
        }

        private static string BuildCacheKey(int id)
        {
            return string.Format("Model-{0}", id);
        }

        private static async Task<Model> LoadFromObjectPath(int id)
        {
            Model model = null;

            using (var context = new ObjectPathContext())
            using (var webClient = new WebClient())
            {
                var pathObject = await context.ObjectPathItem.FirstOrDefaultAsync(file => file.PathObjectId == id);

                if (pathObject != null)
                {
                    var resultData = await webClient.DownloadDataTaskAsync(new Uri(new Uri(pathObject.World.ObjectPathUrl), pathObject.FileName));

                    var loader = new Loader();
                    //model = loader.LoadFromFile(path);

                    return model;
                }
            }

            return null;
        }
    }
}