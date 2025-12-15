declare module './cartela.js' {
  const bingoCards: {
    [key: number]: (number | string)[][];
  };
  
  export = {
    bingoCards: typeof bingoCards;
  };
}