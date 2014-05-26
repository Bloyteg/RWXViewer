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
using System.IO;
using System.Runtime.Caching;
using System.Web;
using MrByte.RWX;
using MrByte.RWX.Model;

namespace RWXViewer.Models
{
    public class ModelLoader : IModelLoader
    { 
        public Model GetModel(string group, string name)
        {
            var cache = MemoryCache.Default;
            var key = string.Format("{0}/{1}", group, name);
            var model = cache[key] as Model;

            if (model != null)
            {
                return model;
            }

            var path = Path.Combine(HttpContext.Current.Server.MapPath("~/App_Data/"), @group, name);

            if (!File.Exists(path))
            {
                return null;
            }

            var loader = new Loader();
            model = loader.LoadFromFile(path);
            cache.Add(key, model, DateTimeOffset.Now + TimeSpan.FromHours(24));

            return model;
        }
    }
}