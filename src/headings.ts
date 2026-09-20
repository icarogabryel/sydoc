import * as vscode from 'vscode';

export interface SydocHeading {
  text: string;
  level: number;
  line: number;
  children: SydocHeading[];
}

export async function findHeadings(
  document: vscode.TextDocument,
): Promise<SydocHeading[]> {
  const roots: SydocHeading[] = [];
  const stack: SydocHeading[] = [];

  for (let line = 0; line < document.lineCount; line++) {
    const text = document.lineAt(line).text;
    const match = /^(#{1,6})\s+(.+?)\s*#*$/.exec(text);

    if (!match) {
      continue;
    }

    const heading: SydocHeading = {
      text: match[2],
      level: match[1].length,
      line,
      children: [],
    };

    while (
      stack.length > 0 &&
      stack[stack.length - 1].level >= heading.level
    ) {
      stack.pop();
    }

    if (stack.length === 0) {
      roots.push(heading);
    } else {
      stack[stack.length - 1].children.push(
        heading,
      );
    }

    stack.push(heading);
  }

  return roots;
}
