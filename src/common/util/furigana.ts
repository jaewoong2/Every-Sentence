import * as kuromoji from 'kuromoji';

export function katakanaToHiragana(katakana: string) {
  return katakana.replace(/[\u30a1-\u30f6]/g, (match) =>
    String.fromCharCode(match.charCodeAt(0) - 0x60),
  );
}

export function furigana(
  sentence: string,
  type: 'katakana' | 'hiragana' = 'hiragana',
): Promise<string> {
  return new Promise((resolve) => {
    kuromoji
      .builder({ dicPath: 'node_modules/kuromoji/dict' })
      .build((err, tokenizer) => {
        // 오류 처리
        if (err) {
          throw err;
        }

        // 텍스트 분석
        const tokens = tokenizer.tokenize(sentence);

        // 각 토큰(단어)의 히라가나 읽기 추출
        const readings = tokens.map(
          (token) => token.reading || token.surface_form,
        );

        // 결과 출력
        if (type === 'hiragana') {
          resolve(katakanaToHiragana(readings.join(' ')));
        } else {
          resolve(readings.join(' '));
        }
      });
  });
}
