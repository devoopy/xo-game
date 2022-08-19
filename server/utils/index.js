function random(min, max) {
  if (min > max) [min, max] = [max, min];
  const randomNumber = min + Math.random() * (max + 1 - min);
  return Math.floor(randomNumber);
}

exports.random = random;
