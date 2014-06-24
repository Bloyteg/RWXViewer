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
using System.Runtime.Caching;
using System.Threading.Tasks;

namespace Bloyteg.RwxViewer.Resources
{
    public class ResourceLocator<T> : IResourceLocator<T>
        where T : class
    {
        private readonly IResourceDownloader<T> _resourceDownloader;

        public ResourceLocator(IResourceDownloader<T> resourceDownloader)
        {
            _resourceDownloader = resourceDownloader;
        }

        public async Task<T> GetResourceAsync(int id, string resourceName)
        {
            var resource = LoadFromCache(id, resourceName);

            if (resource != null)
            {
                return resource;
            }

            resource = await _resourceDownloader.DownloadResourceAsync(id, resourceName);

            if (resource != null)
            {
                AddToCache(id, resourceName, resource);
            }

            return resource;
        }

        private T LoadFromCache(int worldId, string resourceName)
        {
            var cache = MemoryCache.Default;
            var key = BuildCacheKey(worldId, resourceName);
            return cache[key] as T;
        }

        private void AddToCache(int worldId, string resourceName, T resource)
        {
            var cache = MemoryCache.Default;
            var key = BuildCacheKey(worldId, resourceName);
            cache.Add(key, resource, DateTimeOffset.Now + TimeSpan.FromHours(24));
        }

        private string BuildCacheKey(int worldId, string resourceName)
        {
            return string.Format("{0}-{1}/{2}", typeof(T).Name, worldId, resourceName);
        }
    }
}