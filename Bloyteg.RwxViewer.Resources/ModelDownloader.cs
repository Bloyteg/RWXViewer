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
using System.Data.Entity;
using System.Net;
using System.Threading.Tasks;
using Bloyteg.RwxViewer.Resources.DAL;
using MrByte.RWX;
using Model = MrByte.RWX.Model.Model;

namespace Bloyteg.RwxViewer.Resources
{
    public class ModelDownloader : IResourceDownloader<DAL.Model, Model>
    {
        public async Task<Model> DownloadResourceAsync(DAL.Model model)
        {
            using (var webClient = new WebClient())
            {
                if (model == null)
                {
                    return null;
                }

                try
                {
                    var resultData = await webClient.DownloadDataTaskAsync(BuildDownloadUri(model));

                    using (var archiveStream = ArchiveFile.OpenArchiveStream(resultData))
                    {
                        var loader = new Loader();
                        var modelResult = loader.LoadFromStream(archiveStream);

                        return modelResult;
                    }
                }
                catch (WebException)
                {
                    return null;
                }
                catch (InvalidEnumArgumentException)
                {
                    return null;
                }
            }
        }

        private static Uri BuildDownloadUri(DAL.Model pathObject)
        {
            return new Uri(String.Format("{0}/{1}/{2}", pathObject.World.ObjectPathUrl, pathObject.Type.ToPathName(), pathObject.FileName));
        }
    }
}