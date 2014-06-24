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
using System.IO;
using System.Net;
using System.Threading.Tasks;
using Bloyteg.AW.Animation.Seq;
using Bloyteg.RwxViewer.Resources.DAL;
using Animation = Bloyteg.AW.Animation.Seq.Animation;

namespace Bloyteg.RwxViewer.Resources
{
    public interface IResourceDownloader<T>
    {
        Task<T> DownloadResourceAsync(int worldId, string animationName);
    }

    public class AnimationDownloader : IResourceDownloader<Animation>
    {
        public async Task<Animation> DownloadResourceAsync(int worldId, string animationName)
        {
            using (var context = new ObjectPathContext())
            using (var webClient = new WebClient())
            {
                var animation = await context.Animations.SingleOrDefaultAsync(entity => entity.WorldId == worldId && entity.Name == animationName);

                if (animation == null)
                {
                    return null;
                }

                try
                {
                    var resultData = await webClient.DownloadDataTaskAsync(BuildDownloadUri(animation));

                    using (var inputStream = OpenTextureStream(resultData))
                    {
                        return new Loader().LoadFromStream(inputStream);
                    }

                }
                catch (WebException)
                {
                    return null;
                }
            }
        }

        private Stream OpenTextureStream(byte[] resultData)
        {
            return ArchiveFile.OpenArchiveStream(resultData);
        }

        private static Uri BuildDownloadUri(DAL.Animation animation)
        {
            return new Uri(string.Format("{0}/seqs/{1}", animation.World.ObjectPathUrl, animation.FileName));
        }
    }
}