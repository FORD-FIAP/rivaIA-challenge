/**
 * Renderizador leve de markdown inline pras respostas da RIVA — o Gemini
 * devolve **negrito**, *itálico* e listas com "* item", mas <Text> puro do
 * RN não interpreta nada disso. Não é uma lib de markdown completa, só cobre
 * o que a IA realmente usa nas respostas.
 */
import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';

interface MarkdownTextProps {
  text: string;
  style: StyleProp<TextStyle>;
  boldStyle?: StyleProp<TextStyle>;
}

/** Quebra uma linha em pedaços alternando texto normal / **negrito** / *itálico*. */
function renderInline(line: string, boldStyle: StyleProp<TextStyle>) {
  const parts = line.split(/(\*\*.+?\*\*|\*.+?\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={i} style={boldStyle}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 1) {
      return (
        <Text key={i} style={{ fontStyle: 'italic' }}>
          {part.slice(1, -1)}
        </Text>
      );
    }
    return part;
  });
}

export function MarkdownText({ text, style, boldStyle }: MarkdownTextProps) {
  const resolvedBoldStyle = boldStyle ?? { fontWeight: '700' as const };
  const lines = text.split('\n');

  return (
    <Text style={style}>
      {lines.map((line, i) => {
        const isBullet = /^\s*[*-]\s+/.test(line);
        const content = isBullet ? line.replace(/^\s*[*-]\s+/, '• ') : line;
        return (
          <Text key={i}>
            {renderInline(content, resolvedBoldStyle)}
            {i < lines.length - 1 ? '\n' : ''}
          </Text>
        );
      })}
    </Text>
  );
}
