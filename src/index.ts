
import * as f from '@codemirror/commands';

import {
  selectSelectionMatches,
  selectNextOccurrence,
} from '@codemirror/search';

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { INotebookTracker } from '@jupyterlab/notebook';

import { CodeMirrorEditor } from '@jupyterlab/codemirror';

import { CodeEditor } from '@jupyterlab/codeeditor';

/**
 * Initialization data for the jupyterlab_more_shortcuts extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_more_shortcuts:plugin',
  description: 'Bring more Codemirror shortcuts to jupyterlab settings.',
  autoStart: true,
  requires: [INotebookTracker],
  // activate: (app: JupyterFrontEnd) => {
  activate: (app: JupyterFrontEnd, tracker: INotebookTracker) => {
    console.log('JupyterLab extension jupyterlab_more_shortcuts is activated!');

    var stack: CodeEditor.ITextSelection[][] = [];

    app.commands.addCommand('codemirror:selectSelectionMatches', {
      execute: () => {
        const cEditor = (tracker.activeCell?.editor as CodeMirrorEditor);
        var sel = cEditor.getSelections();
        stack.push(sel)
        if (sel.length == 1 && sel[0].start.column == sel[0].end.column)
          cEditor.execCommand(selectNextOccurrence)
        cEditor.execCommand(selectSelectionMatches)
      }
    });

    var aa: { [index: string]: any; } = {
      'selectLine': f.selectLine,
      // 'selectSelectionMatches': selectSelectionMatches,
      'selectNextOccurrence': selectNextOccurrence,

      // 'cursorMatchingBracket': f.cursorMatchingBracket,
      // 'selectMatchingBracket': f.selectMatchingBracket,

      'cursorSyntaxLeft': f.cursorSyntaxLeft,
      'cursorSyntaxRight': f.cursorSyntaxRight,
      'selectSyntaxLeft': f.selectSyntaxLeft,
      'selectSyntaxRight': f.selectSyntaxRight,

      'cursorSubwordBackward': f.cursorSubwordBackward,
      'cursorSubwordForward': f.cursorSubwordForward,
      'selectSubwordBackward': f.selectSubwordBackward,
      'selectSubwordForward': f.selectSubwordForward,

      'selectParentSyntax': f.selectParentSyntax,

      'deleteToLineStart': f.deleteToLineStart,
      'deleteToLineEnd': f.deleteToLineEnd,

      'insertNewlineAndIndent': f.insertNewlineAndIndent,
      'insertBlankLine': f.insertBlankLine,

    }
    for (let i in aa) {
      app.commands.addCommand('codemirror:' + i, {
        execute: () => {
          const cEditor = (tracker.activeCell?.editor as CodeMirrorEditor);
          stack.push(cEditor.getSelections())
          cEditor.execCommand(aa[i])
        }
      });
    }


    app.commands.addCommand('codemirror:add-cursor-up', {
      execute: () => {
        const cEditor = (tracker.activeCell?.editor as CodeMirrorEditor);
        var a = cEditor.getSelections();
        var b = a.at(0)
        if (!b) return
        var x = cEditor.getLine(b.end.line - 1)
        var bec = (!x || x?.length >= b.end.column) ? b.end.column : x?.length
        var bsc = (!x || x?.length >= b.start.column) ? b.start.column : x?.length
        var c = [{ end: { column: bec, line: b.end.line - 1 }, start: { column: bsc, line: b.start.line - 1 } }]
        cEditor.setSelections(c.concat(a))
      }
    });

    app.commands.addCommand('codemirror:add-cursor-down', {
      execute: () => {
        const cEditor = (tracker.activeCell?.editor as CodeMirrorEditor);
        var a = cEditor.getSelections();
        var b = a.at(-1)
        if (!b) return
        var x = cEditor.getLine(b.end.line + 1)
        var bec = (!x || x?.length >= b.end.column) ? b.end.column : x?.length
        var bsc = (!x || x?.length >= b.start.column) ? b.start.column : x?.length
        var c = [{ end: { column: bec, line: b.end.line + 1 }, start: { column: bsc, line: b.start.line + 1 } }]
        cEditor.setSelections(c.concat(a))
      }
    });

    app.commands.addCommand('codemirror:add-cursor-for-each-line', {
      execute: () => {
        const cEditor = (tracker.activeCell?.editor as CodeMirrorEditor);
        var a = cEditor.getSelection();
        var c = []
        for (let i = a.start.line; i <= a.end.line; i++)
          c.push({ end: { column: 0, line: i }, start: { column: 0, line: i } })
        cEditor.setSelections(c)
        cEditor.execCommand(f.selectLineBoundaryForward)
      }
    });

    // // wtf1: string
    app.commands.addCommand('codemirror:cursorMatchingBracket', {
      execute: () => {
        const cEditor = (tracker.activeCell?.editor as CodeMirrorEditor);
        let wtf = cEditor.doc
        let sel = cEditor.getSelection()
        let offset = cEditor.getOffsetAt(sel.start)
        var a = wtf.sliceString(offset, offset + 1)
        if (a == ')' || a == ']' || a == '}')
          cEditor.execCommand(f.cursorMatchingBracket)
        else {
          var hit = 1
          while (offset >= 1) {
            var a = wtf.sliceString(offset - 1, offset)
            if (a == '(' || a == '[' || a == '{') hit -= 1
            else if (a == ')' || a == ']' || a == '}') hit += 1
            if (hit == 0) break
            offset -= 1
            cEditor.execCommand(f.cursorCharLeft)
          }
          cEditor.execCommand(f.cursorMatchingBracket)
        }
      }
    });
    app.commands.addCommand('codemirror:selectMatchingBracket', {
      execute: () => {
        const cEditor = (tracker.activeCell?.editor as CodeMirrorEditor);
        let doc = cEditor.doc
        let sel = cEditor.getSelection()
        stack.push([sel])
        let offset = cEditor.getOffsetAt(sel.start)
        if (sel.start.column != sel.end.column && offset >= 1)
          offset -= 1
        var hit = 1
        while (offset >= 1) {
          var a = doc.sliceString(offset - 1, offset)
          if (a == '(' || a == '[' || a == '{') hit -= 1
          else if (a == ')' || a == ']' || a == '}') hit += 1
          if (hit == 0) break
          offset -= 1
        }
        cEditor.setCursorPosition(cEditor.getPositionAt(offset))
        cEditor.execCommand(f.selectMatchingBracket)
      }
    });
    app.commands.addCommand('codemirror:selectString', {
      execute: () => {
        const cEditor = (tracker.activeCell?.editor as CodeMirrorEditor);
        let doc = cEditor.doc
        let sel = cEditor.getSelection()
        stack.push([sel])
        let offset = cEditor.getOffsetAt(sel.start)
        while (offset >= 1) {
          var a = doc.sliceString(offset - 1, offset)
          if (a == '"' || a == "'") break
          offset -= 1
        }
        let offset2 = cEditor.getOffsetAt(sel.start) + 1
        while (offset2 < doc.length) {
          var a = doc.sliceString(offset2 - 1, offset2)
          if (a == '"' || a == "'") break
          offset2 += 1
        }
        cEditor.setSelections([{ start: cEditor.getPositionAt(offset), end: cEditor.getPositionAt(offset2 - 1) }])
      }
    });

    // wtf: undo bracket selection
    // TODO: add another redo stack
    app.commands.addCommand('codemirror:undoSelection', {
      execute: () => {
        const cEditor = (tracker.activeCell?.editor as CodeMirrorEditor);
        // while (true) {
        var poped = stack.pop()
        if (!poped) return
        // var cur = cEditor.getSelections()
        // if (cur.length!=poped.length )
        // if (poped.start.column != cur.start.column || poped.end.column != cur.end.column) {
        cEditor.setSelections(poped)
        // break
        // }
        // }
      }
    });

    app.commands.addCommand('codemirror:deleteSubwordLeft', {
      execute: () => {
        const cEditor = (tracker.activeCell?.editor as CodeMirrorEditor);
        cEditor.execCommand(f.selectSubwordBackward)
        cEditor.execCommand(f.deleteCharBackward)
      }
    });

    app.commands.addCommand('codemirror:deleteSubwordRight', {
      execute: () => {
        const cEditor = (tracker.activeCell?.editor as CodeMirrorEditor);
        cEditor.execCommand(f.selectSubwordForward)
        cEditor.execCommand(f.deleteCharBackward)
      }
    });




  }
};

export default plugin;
