package app

// import (
// 	"encoding/json"
// 	"strings"
//
// 	"github.com/gosimple/slug"
// 	"github.com/grafana/grafana/pkg/setting"
// )
//
// type AppPlugin struct {
// 	FrontendPluginBase
// 	Routes []*AppPluginRoute `json:"routes"`
// }
//
// func (app *AppPlugin) Load(decoder *json.Decoder, pluginDir string) error {
// 	if err := decoder.Decode(&app); err != nil {
// 		return err
// 	}
//
// 	if err := app.registerPlugin(pluginDir); err != nil {
// 		return err
// 	}
//
// 	Apps[app.Id] = app
// 	return nil
// }
//
// func (app *AppPlugin) initApp() {
// 	app.initFrontendPlugin()
//
// 	// check if we have child panels
// 	for _, panel := range Panels {
// 		if strings.HasPrefix(panel.PluginDir, app.PluginDir) {
// 			panel.setPathsBasedOnApp(app)
// 			app.FoundChildPlugins = append(app.FoundChildPlugins, &PluginInclude{
// 				Name: panel.Name,
// 				Id:   panel.Id,
// 				Type: panel.Type,
// 			})
// 		}
// 	}
//
// 	// check if we have child datasources
// 	for _, ds := range DataSources {
// 		if strings.HasPrefix(ds.PluginDir, app.PluginDir) {
// 			ds.setPathsBasedOnApp(app)
// 			app.FoundChildPlugins = append(app.FoundChildPlugins, &PluginInclude{
// 				Name: ds.Name,
// 				Id:   ds.Id,
// 				Type: ds.Type,
// 			})
// 		}
// 	}
//
// 	// slugify pages
// 	for _, include := range app.Includes {
// 		if include.Slug == "" {
// 			include.Slug = slug.Make(include.Name)
// 		}
// 		if include.Type == "page" && include.DefaultNav {
// 			app.DefaultNavUrl = setting.AppSubUrl + "/plugins/" + app.Id + "/page/" + include.Slug
// 		}
// 		if include.Type == "dashboard" && include.DefaultNav {
// 			app.DefaultNavUrl = setting.AppSubUrl + "/dashboard/db/" + include.Slug
// 		}
// 	}
// }
