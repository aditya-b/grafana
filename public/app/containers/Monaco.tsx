import React from 'react';
import MonacoEditor from 'react-monaco-editor';

function setTheme(monaco) {
  monaco.editor.defineTheme('myTheme', {
    base: 'vs',
    inherit: true,
    rules: [{ background: 'EDF9FA' }],
    colors: {
      'editor.foreground': '#000000',
      'editor.background': '#EDF9FA',
      'editorCursor.foreground': '#8B0000',
      'editor.lineHighlightBackground': '#0000FF20',
      'editorLineNumber.foreground': '#008800',
      'editor.selectionBackground': '#88000030',
      'editor.inactiveSelectionBackground': '#88000015',
    },
  });
}

export default class Monaco extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      code: '// type your code...',
    };
  }
  editorDidMount = (editor, monaco) => {
    console.log('editorDidMount', editor);
    editor.focus();
  };
  onChange = (newValue, e) => {
    console.log('onChange', newValue, e);
  };
  render() {
    const code = this.state.code;
    const options = {
      selectOnLineNumbers: true,
    };
    return (
      <MonacoEditor
        width="800"
        height="600"
        language="javascript"
        theme="myTheme"
        value={code}
        options={options}
        onChange={this.onChange}
        editorDidMount={this.editorDidMount}
        editorWillMount={setTheme}
      />
    );
  }
}
