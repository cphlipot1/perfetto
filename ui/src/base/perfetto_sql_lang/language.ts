// Copyright (C) 2025 The Android Open Source Project
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {
  LRLanguage,
  LanguageSupport,
  delimitedIndent,
  foldInside,
  foldNodeProp,
  indentNodeProp,
} from '@codemirror/language';
import {styleTags, tags as t} from '@lezer/highlight';
import {parser} from './perfetto_sql.grammar'; // Generated by Lezer
import {TreeCursor} from '@lezer/common';

export const language = LRLanguage.define({
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        Application: delimitedIndent({closing: ')', align: false}),
      }),
      foldNodeProp.add({
        Application: foldInside,
      }),
      styleTags({
        'Keyword': t.keyword,
        'Boolean': t.bool,
        'Null': t.null,
        'String': t.string,
        'Number': t.number,
        'LineComment': t.lineComment,
        'Macro': t.macroName,
        'MacroVariable': t.variableName,
        'Function': t.function(t.variableName),
        '( )': t.paren,
      }),
    ],
  }),
  languageData: {
    commentTokens: {line: '--'},
  },
});

export function perfettoSql() {
  return new LanguageSupport(language);
}

export function parseAndPrintTree(code: string) {
  const tree = language.parser.parse(code);
  const cursor = tree.cursor();
  printCST(cursor, code);
}

// Helper function to pretty-print the CST
function printCST(cursor: TreeCursor, source: string, indent = 0) {
  const nodeName = cursor.name;
  const nodeText = source.substring(cursor.from, cursor.to);

  console.log(`${'  '.repeat(indent)}${nodeName}: "${nodeText}"`);

  if (cursor.firstChild()) {
    do {
      printCST(cursor, source, indent + 1);
    } while (cursor.nextSibling());
    cursor.parent(); // Important: Move back up to the parent
  }
}
