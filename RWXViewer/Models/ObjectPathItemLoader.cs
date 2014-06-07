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
using System.ComponentModel;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Runtime.Caching;
using System.Threading.Tasks;
using MrByte.RWX;
using RWXViewer.Models.DAL;
using Model = RWXViewer.Models.DAL.Model;

namespace RWXViewer.Models
{
    public class ObjectPathItemLoader : IObjectPathItemLoader
    { 
        public async Task<MrByte.RWX.Model.Model> GetModelAsync(int worldId, string modelName)
        {
            var model = LoadFromCache(worldId, modelName);

            if (model != null)
            {
                return model;
            }

            model = await LoadModel(worldId, modelName);

            if (model != null)
            {
                AddToCache(worldId, modelName, model);
            }

            return model;
        }

        private static MrByte.RWX.Model.Model LoadFromCache(int worldId, string modelName)
        {
            var cache = MemoryCache.Default;
            var key = BuildCacheKey(worldId, modelName);
            var model = cache[key] as MrByte.RWX.Model.Model;
            return model;
        }

        private void AddToCache(int worldId, string modelName, MrByte.RWX.Model.Model model)
        {
            var cache = MemoryCache.Default;
            var key = BuildCacheKey(worldId, modelName);
            cache.Add(key, model, DateTimeOffset.Now + TimeSpan.FromHours(24));
        }

        private static string BuildCacheKey(int worldId, string modelName)
        {
            return string.Format("world-{0}/{1}", worldId, modelName);
        }

        private static async Task<MrByte.RWX.Model.Model> LoadModel(int worldId, string modelName)
        {
            using (var context = new ObjectPathContext())
            using (var webClient = new WebClient())
            {
                var pathObject = await context.Models.FindAsync(worldId, modelName);

                if (pathObject != null)
                {
                    try
                    {
                        var resultData = await webClient.DownloadDataTaskAsync(BuildDownloadUri(pathObject));
                        var archiveType = GetArchiveType(resultData);

                        if (archiveType != ArchiveType.Unknown)
                        {
                            using (var archiveStream = OpenArchiveStream(archiveType, resultData))
                            {
                                var loader = new Loader();
                                MrByte.RWX.Model.Model model = loader.LoadFromStream(archiveStream);

                                return model;
                            }
                        }
                    }
                    catch (WebException)
                    {
                        return null;
                    }
                }
            }

            return null;
        }

        private static Stream OpenArchiveStream(ArchiveType archiveType, byte[] streamData)
        {
            switch (archiveType)
            {
            case ArchiveType.Zip:
                return OpenZipArchive(streamData);

            case ArchiveType.Gzip:
                return OpenGzipArchive(streamData);

            default:
                throw new InvalidEnumArgumentException("archiveType");
            }
        }

        private static Stream OpenGzipArchive(byte[] streamData)
        {
            return new GZipStream(new MemoryStream(streamData), CompressionMode.Decompress);
        }

        private static Stream OpenZipArchive(byte[] streamData)
        {
            var zipArchive = new ZipArchive(new MemoryStream(streamData), ZipArchiveMode.Read);
            return zipArchive.Entries.First().Open();
        }

        private static ArchiveType GetArchiveType(byte[] resultData)
        {
            if (resultData.Length < 4)
            {
                return ArchiveType.Unknown;
            }

            if (resultData[0] == 0x50 && resultData[1] == 0x4B && resultData[2] == 0x03 && resultData[3] == 0x04)
            {
                return ArchiveType.Zip;
            }
                
            if (resultData[0] == 0x1F && resultData[2] == 0x8B)
            {
                return ArchiveType.Gzip;
            }

            return ArchiveType.Unknown;
        }

        private static Uri BuildDownloadUri(Model pathObject)
        {
            return new Uri(string.Format("{0}/{1}/{2}", pathObject.World.ObjectPathUrl, pathObject.Type.ToPathName(), pathObject.FileName));
        }
    }

    internal enum ArchiveType
    {
        Zip,
        Gzip,
        Unknown
    }
}