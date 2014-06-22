namespace Bloyteg.RwxViewer.Website.Migrations
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Migrations;
    using System.Linq;

    internal sealed class Configuration : DbMigrationsConfiguration<Bloyteg.RwxViewer.Website.Models.DAL.ObjectPathContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = true;
        }

        protected override void Seed(Bloyteg.RwxViewer.Website.Models.DAL.ObjectPathContext context)
        {

        }
    }
}
