import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ICommandPalette } from '@jupyterlab/apputils';
import { MainAreaWidget } from '@jupyterlab/apputils';
import { ILauncher } from '@jupyterlab/launcher';
import { DALWidget } from './components/DALWidget';
import { brainIcon } from './icon';

/**
 * Initialization data for the jupyterlab-dal-extension extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-dal-extension:plugin',
  autoStart: true,
  requires: [ICommandPalette],
  optional: [ILauncher],
  activate: (app: JupyterFrontEnd, palette: ICommandPalette, launcher: ILauncher | null) => {
    console.log('JupyterLab extension jupyterlab-dal-extension is activated!');

    // Add command to open the DAL panel
    const command = 'dal:open';
    app.commands.addCommand(command, {
      label: 'DAL Model Management',
      caption: 'Open DAL Decentralized Active Learning Interface',
      icon: brainIcon,
      execute: () => {
        // Create a new widget each time (or reuse existing one)
        const content = new DALWidget();
        const widget = new MainAreaWidget({ content });
        widget.id = 'dal-jupyterlab-widget-' + Date.now(); // Unique ID for each instance
        widget.title.label = 'DAL Model Management';
        widget.title.icon = brainIcon;
        widget.title.closable = true;

        // Add the widget to the main area (where notebooks open)
        app.shell.add(widget, 'main');
        
        // Activate the widget
        app.shell.activateById(widget.id);
      }
    });

    // Add the command to the palette
    palette.addItem({ command, category: 'DAL' });

    // Add to launcher if available
    if (launcher) {
      launcher.add({
        command,
        category: 'DAL Framework',
        rank: 1
      });
    }
  }
};

export default plugin; 