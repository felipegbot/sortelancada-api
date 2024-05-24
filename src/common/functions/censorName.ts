export const censorName = (username: string): string => {
  const usernameArray = username.split(' ');
  let censoredArray: string[] = [];

  usernameArray?.forEach((word, index) => {
    if (index === 0) {
      censoredArray.push(word);
    } else {
      censoredArray.push(
        word
          .split('')
          .map((char, index) => {
            if (index === 0) return char;
            return '*';
          })
          .join(''),
      );
    }
  });
  return censoredArray.join(' ');
};
