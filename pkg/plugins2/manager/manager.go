package manager

import (
	"context"
	"encoding/json"
	"errors"
	"os"
	"path"
	"path/filepath"
	"reflect"
	"strings"

	"github.com/grafana/grafana/pkg/log"
	"github.com/grafana/grafana/pkg/plugins"
	"github.com/grafana/grafana/pkg/plugins2"
	"github.com/grafana/grafana/pkg/registry"
	"github.com/grafana/grafana/pkg/setting"
	"github.com/grafana/grafana/pkg/util"
)

type PluginManager struct {
	log log.Logger
	plugins
}

func init() {
	registry.RegisterService(&PluginManager{})
}

func (pm *PluginManager) Init() error {
	pm.log = log.New("plugins")

	pm.log.Info("Starting plugin search v2")
	pm.scanForPlugins(path.Join(setting.StaticRootPath, "app/plugins"))

	// check if plugins dir exists
	if _, err := os.Stat(setting.PluginsPath); os.IsNotExist(err) {
		if err = os.MkdirAll(setting.PluginsPath, os.ModePerm); err != nil {
			pm.log.Error("Failed to create plugin dir", "dir", setting.PluginsPath, "error", err)
		} else {
			pm.log.Info("Plugin dir created", "dir", setting.PluginsPath)
			pm.scanForPlugins(setting.PluginsPath)
		}
	} else {
		pm.scanForPlugins(setting.PluginsPath)
	}

	pm.scanSpecificPluginPaths()
	return nil
}

func (pm *PluginManager) Run(ctx context.Context) error {
	<-ctx.Done()
	return nil
}

func (pm *PluginManager) scanSpecificPluginPaths() error {
	for _, section := range setting.Raw.Sections() {
		if strings.HasPrefix(section.Name(), "plugin.") {
			path := section.Key("path").String()
			if path != "" {
				pm.scanForPlugins(path)
			}
		}
	}
	return nil
}

func (pm *PluginManager) scanForPlugins(pluginDir string) {
	if err := util.Walk(pluginDir, true, true, pm.walker); err != nil {
		if pluginDir != "data/plugins" {
			pm.log.Warn("Could not scan dir \"%v\" error: %s", pluginDir, err)
		}
	}
}

func (pm *PluginManager) walker(currentPath string, f os.FileInfo, err error) error {
	if err != nil {
		return err
	}

	if f.Name() == "node_modules" {
		return util.WalkSkipDir
	}

	if f.IsDir() {
		return nil
	}

	if f.Name() == "plugin.json" {
		err := pm.loadPluginJson(currentPath)
		if err != nil {
			pm.log.Error("Error loading plugin.json", "file", currentPath, "error", err)
		}
	}

	return nil
}

func (pm *PluginManager) loadPluginJson(pluginJsonFilePath string) error {
	currentDir := filepath.Dir(pluginJsonFilePath)
	reader, err := os.Open(pluginJsonFilePath)
	if err != nil {
		return err
	}

	defer reader.Close()

	jsonParser := json.NewDecoder(reader)
	pluginCommon := plugins.PluginBase{}
	if err := jsonParser.Decode(&pluginCommon); err != nil {
		return err
	}

	if pluginCommon.Id == "" || pluginCommon.Type == "" {
		return errors.New("Did not find type and id property in plugin.json")
	}

	var loader plugins2.MetaLoader
	typeDescriptor, exists := plugins2.PluginTypes[pluginCommon.Type]
	if !exists {
		return errors.New("Unknown plugin type " + pluginCommon.Type)
	}

	loader = reflect.New(reflect.TypeOf(typeDescriptor.Meta)).Interface().(plugins2.MetaLoader)

	reader.Seek(0, 0)

	return loader.Load(jsonParser, currentDir)
}
