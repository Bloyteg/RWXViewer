using Microsoft.Practices.Unity;
using System.Web.Http;
using RWXViewer.Models;
using Unity.WebApi;

namespace RWXViewer
{
    public static class UnityConfig
    {
        public static void RegisterComponents()
        {
			var container = new UnityContainer();

            container.RegisterInstance<IModelLoader>(new ModelLoader());

            GlobalConfiguration.Configuration.DependencyResolver = new UnityDependencyResolver(container);
        }
    }
}