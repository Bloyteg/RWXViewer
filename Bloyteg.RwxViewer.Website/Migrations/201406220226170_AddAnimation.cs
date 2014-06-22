namespace Bloyteg.RwxViewer.Website.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddAnimation : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Animations",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        WorldId = c.Int(nullable: false),
                        Name = c.String(maxLength: 32),
                        FileName = c.String(maxLength: 32),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Worlds", t => t.WorldId, cascadeDelete: true)
                .Index(t => new { t.WorldId, t.Name }, unique: true, name: "IX_WorldAndName");
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Animations", "WorldId", "dbo.Worlds");
            DropIndex("dbo.Animations", "IX_WorldAndName");
            DropTable("dbo.Animations");
        }
    }
}
