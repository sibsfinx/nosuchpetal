export const FLOWER_TYPES = {
  default: {
    name: 'Nosuch Petals',
    petalCount: 24,
    petalShape: 'cone', // cylinderGeometry with cone shape
    colors: ['#ff3366', '#ff6699', '#ff99cc'],
    centerColor: '#ffdd00',
    petalLength: 2,
    petalWidth: 0.5,
    radius: 2.5
  },
  iris: {
    name: 'Violet Iris',
    petalCount: 6,
    petalShape: 'wide', // wider petals
    colors: ['#6a0dad', '#8a2be2', '#9966cc'],
    centerColor: '#ffd700',
    petalLength: 2.5,
    petalWidth: 0.8,
    radius: 2.2
  },
  dandelion: {
    name: 'Dandelion',
    petalCount: 64,
    petalShape: 'thin', // very thin petals
    colors: ['#ffff00', '#ffd700', '#ffed4e'],
    centerColor: '#ff8c00',
    petalLength: 1.2,
    petalWidth: 0.1,
    radius: 1.8
  },
  daisy: {
    name: 'Daisy',
    petalCount: 16,
    petalShape: 'ellipse', // elongated oval petals
    colors: ['#ffffff', '#f8f8ff', '#fffafa'],
    centerColor: '#ffff00',
    petalLength: 1.8,
    petalWidth: 0.4,
    radius: 2.0
  }
} as const

export type FlowerType = keyof typeof FLOWER_TYPES
