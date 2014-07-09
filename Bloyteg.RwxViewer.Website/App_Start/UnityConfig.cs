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

using System.Web.Http;
using Bloyteg.AW.Animation.Seq;
using Bloyteg.RwxViewer.Resources;
using Microsoft.Practices.Unity;
using Bloyteg.AW.Model.RWX.Data;
using Unity.WebApi;

namespace Bloyteg.RwxViewer.Website
{
    public static class UnityConfig
    {
        public static void RegisterComponents()
        {
			var container = new UnityContainer();

            container.RegisterType<ICacheKeyGenerator<Resources.DAL.Model>, ModelCacheKeyGenerator>();
            container.RegisterType<ICacheKeyGenerator<Resources.DAL.Texture>, TextureCacheKeyGenerator>();
            container.RegisterType<ICacheKeyGenerator<Resources.DAL.Animation>, AnimationCacheKeyGenerator>();

            container.RegisterType<IResourceDownloader<Resources.DAL.Model, Model>, ModelDownloader>();
            container.RegisterType<IResourceDownloader<Resources.DAL.Texture, byte[]>, TextureDownloader>();
            container.RegisterType<IResourceDownloader<Resources.DAL.Animation, Animation>, AnimationDownloader>();

            container.RegisterType<IResourceLocator<Resources.DAL.Model, Model>, ResourceLocator<Resources.DAL.Model, Model>>();
            container.RegisterType<IResourceLocator<Resources.DAL.Texture, byte[]>, ResourceLocator<Resources.DAL.Texture, byte[]>>();
            container.RegisterType<IResourceLocator<Resources.DAL.Animation, Animation>, ResourceLocator<Resources.DAL.Animation, Animation>>();

            container.RegisterType<IObjectPathItemLoader, ObjectPathItemLoader>(new ContainerControlledLifetimeManager());

            GlobalConfiguration.Configuration.DependencyResolver = new UnityDependencyResolver(container);
        }
    }
}