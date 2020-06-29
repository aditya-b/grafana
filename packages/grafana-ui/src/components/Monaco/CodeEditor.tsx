import React from 'react';
import { withTheme } from '../../themes';
import { Themeable } from '../../types';
//import { KeyCode, editor, KeyMod } from 'monaco-editor/esm/vs/editor/editor.api';
import ReactMonaco from 'react-monaco-editor';

import * as monaco from 'monaco-editor';

// @ts-ignore
self.MonacoEnvironment = {
  getWorkerUrl: (moduleId: string, label: string) => {
    console.log('XGET WORKER URL', moduleId, label);
    if (label === 'json') {
      return './json.worker.bundle.js';
    }
    if (label === 'css') {
      return './css.worker.bundle.js';
    }
    if (label === 'html') {
      const v = './public/lib/monaco/min/vs/language/html/htmlWorker.js';
      console.log('HTML', v);
      return v;
    }
    if (label === 'typescript' || label === 'javascript') {
      return './ts.worker.bundle.js';
    }
    return './editor.worker.bundle.js';
  },
};

export interface CodeEditorProps {
  value: string;
  language: string;
  width?: number | string;
  height?: number | string;

  readOnly?: boolean;
  showMiniMap?: boolean;

  /**
   * Callback after the editor has mounted that gives you raw access to monaco
   *
   * @experimental
   */
  onEditorDidMount?: (editor: monaco.editor.IStandaloneCodeEditor) => void;

  /** Handler to be performed when editor is blurred */
  onBlur?: CodeEditorChangeHandler;

  /** Handler to be performed when Cmd/Ctrl+S is pressed */
  onSave?: CodeEditorChangeHandler;
}

type Props = CodeEditorProps & Themeable;

class UnthemedCodeEditor extends React.PureComponent<Props> {
  getEditorValue = () => '';

  onBlur = () => {
    const { onBlur } = this.props;
    if (onBlur) {
      onBlur(this.getEditorValue());
    }
  };

  editorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    const { onSave, onEditorDidMount } = this.props;

    this.getEditorValue = () => editor.getValue();

    if (onSave) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
        onSave(this.getEditorValue());
      });
    }

    if (onEditorDidMount) {
      onEditorDidMount(editor);
    }
  };

  render() {
    const { theme, language, width, height, showMiniMap, readOnly } = this.props;
    const value = this.props.value ?? '';
    const longText = value.length > 100;

    return (
      <div onBlur={this.onBlur}>
        <ReactMonaco
          width={width}
          height={height}
          language={language}
          theme={theme.isDark ? 'vs-dark' : 'vs-light'}
          value={value}
          options={{
            wordWrap: 'off',
            codeLens: false, // not included in the bundle
            minimap: {
              enabled: longText && showMiniMap,
              renderCharacters: false,
            },
            readOnly,
            lineNumbersMinChars: 4,
            lineDecorationsWidth: 0,
            overviewRulerBorder: false,
            automaticLayout: true,
          }}
          editorDidMount={this.editorDidMount}
        />
      </div>
    );
  }
}

export type CodeEditorChangeHandler = (value: string) => void;
export default withTheme(UnthemedCodeEditor);
