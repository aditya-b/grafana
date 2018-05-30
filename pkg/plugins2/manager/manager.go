package manager

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"reflect"
	"strings"

	"github.com/grafana/grafana/pkg/log"
	"github.com/grafana/grafana/pkg/plugins2"
	"github.com/grafana/grafana/pkg/registry"
	"github.com/grafana/grafana/pkg/setting"
	"github.com/grafana/grafana/pkg/util"
)

type PluginManager struct {
	log     log.Logger
	plugins map[string]plugins2.Plugin
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

	// init plugins
	for _, plugin := range pm.plugins {
		plugin.Init()
	}

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
	pluginDir := filepath.Dir(pluginJsonFilePath)
	reader, err := os.Open(pluginJsonFilePath)
	if err != nil {
		return err
	}

	defer reader.Close()

	jsonParser := json.NewDecoder(reader)
	pluginCommon := plugins2.PluginBase{}
	if err := jsonParser.Decode(&pluginCommon); err != nil {
		return err
	}

	if pluginCommon.Id == "" || pluginCommon.Type == "" {
		return errors.New("Did not find type and id property in plugin.json")
	}

	typeDescriptor, exists := plugins2.PluginTypes[pluginCommon.Type]
	if !exists {
		// return errors.New("Unknown plugin type " + pluginCommon.Type)
		return nil
	}

	pluginObj := reflect.New(reflect.TypeOf(typeDescriptor.Type)).Interface()

	reader.Seek(0, 0)

	if err := jsonParser.Decode(&pluginObj); err != nil {
		return fmt.Errorf("Failed to unmarshal plugin json, %v %v", pluginCommon.Type, err)
	}

	if err := pm.registerPlugin(pluginObj, pluginDir); err != nil {
		return err
	}

	return nil
}

func (pm *PluginManager) registerPlugin(plugin plugins2.Plugin, pluginDir string) error {
	if _, exists := pm.plugins[pb.Id]; exists {
		return fmt.Errorf("Plugin with same id already exists: %v", pb.Id)
	}

	if !strings.HasPrefix(pluginDir, setting.StaticRootPath) {
		plog.Info("Registering plugin", "name", pb.Name)
	}

	if len(pb.Dependencies.Plugins) == 0 {
		pb.Dependencies.Plugins = []PluginDependencyItem{}
	}

	if pb.Dependencies.GrafanaVersion == "" {
		pb.Dependencies.GrafanaVersion = "*"
	}

	for _, include := range pb.Includes {
		if include.Role == "" {
			include.Role = m.ROLE_VIEWER
		}
	}

	pb.PluginDir = pluginDir
	Plugins[pb.Id] = pb
	return nil
}
