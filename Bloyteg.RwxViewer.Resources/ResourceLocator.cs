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
    public class ResourceLocator<TIdentifier, TResult> : IResourceLocator<TIdentifier, TResult>
        where TResult : class
    {
        private readonly IResourceDownloader<TIdentifier, TResult> _resourceDownloader;
        private readonly ICacheKeyGenerator<TIdentifier> _cacheKeyGenerator;

        public ResourceLocator(IResourceDownloader<TIdentifier, TResult> resourceDownloader, ICacheKeyGenerator<TIdentifier> cacheKeyGenerator)
        {
            _resourceDownloader = resourceDownloader;
            _cacheKeyGenerator = cacheKeyGenerator;
        }

        public async Task<TResult> GetResourceAsync(TIdentifier identifier)
        {
            var resource = LoadFromCache(identifier);

            if (resource != null)
            {
                return resource;
            }

            resource = await _resourceDownloader.DownloadResourceAsync(identifier);

            if (resource != null)
            {
                AddToCache(identifier, resource);
            }

            return resource;
        }

        private TResult LoadFromCache(TIdentifier identifier)
        {
            var cache = MemoryCache.Default;
            var key = _cacheKeyGenerator.GetKey(identifier);
            return cache[key] as TResult;
        }

        private void AddToCache(TIdentifier identifier, TResult resource)
        {
            var cache = MemoryCache.Default;
            var key = _cacheKeyGenerator.GetKey(identifier);
            cache.Add(key, resource, DateTimeOffset.Now + TimeSpan.FromHours(24));
        }
    }
}